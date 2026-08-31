import time
from collections import defaultdict, deque

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import get_settings
from ..database import get_db
from ..models import Admin
from ..schemas import AdminOut, LoginPayload
from ..security import SESSION_COOKIE, create_session, delete_session, ensure_same_origin, get_current_admin, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])
settings = get_settings()
LOGIN_WINDOW_SECONDS = 300
LOGIN_BLOCK_SECONDS = 900
LOGIN_MAX_FAILURES = 5
failed_logins: dict[str, deque[float]] = defaultdict(deque)


def client_key(request: Request, username: str) -> str:
    address = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown").split(",")[0].strip()
    return f"{address}:{username.casefold()}"


def check_login_rate_limit(key: str) -> None:
    now = time.monotonic()
    attempts = failed_logins[key]
    while attempts and now - attempts[0] > LOGIN_BLOCK_SECONDS:
        attempts.popleft()
    recent = [attempt for attempt in attempts if now - attempt <= LOGIN_WINDOW_SECONDS]
    if len(recent) >= LOGIN_MAX_FAILURES:
        raise HTTPException(status_code=429, detail="Слишком много попыток. Попробуйте позже.", headers={"Retry-After": str(LOGIN_BLOCK_SECONDS)})


def record_login_failure(key: str) -> None:
    failed_logins[key].append(time.monotonic())


def clear_login_failures(key: str) -> None:
    failed_logins.pop(key, None)


@router.post("/login", response_model=AdminOut)
async def login(payload: LoginPayload, request: Request, response: Response, db: AsyncSession = Depends(get_db)) -> AdminOut:
    ensure_same_origin(request)
    key = client_key(request, payload.username)
    check_login_rate_limit(key)
    admin = await db.scalar(select(Admin).where(Admin.username == payload.username))
    if not admin or not verify_password(payload.password, admin.password_hash):
        record_login_failure(key)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверные данные для входа")
    clear_login_failures(key)
    token = await create_session(db, admin)
    response.set_cookie(SESSION_COOKIE, token, httponly=True, secure=settings.is_production, samesite="lax", max_age=settings.session_ttl_hours * 3600, path="/")
    return AdminOut(username=admin.username)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(request: Request, response: Response, db: AsyncSession = Depends(get_db)) -> None:
    ensure_same_origin(request)
    await delete_session(request, db)
    response.delete_cookie(SESSION_COOKIE, path="/")


@router.get("/me", response_model=AdminOut)
async def me(admin=Depends(get_current_admin)) -> AdminOut:
    return AdminOut(username=admin.username)
