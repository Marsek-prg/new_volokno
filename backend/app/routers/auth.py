from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import get_settings
from ..database import get_db
from ..models import Admin
from ..schemas import AdminOut, LoginPayload
from ..security import SESSION_COOKIE, create_session, delete_session, get_current_admin, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])
settings = get_settings()


@router.post("/login", response_model=AdminOut)
async def login(payload: LoginPayload, response: Response, db: AsyncSession = Depends(get_db)) -> AdminOut:
    admin = await db.scalar(select(Admin).where(Admin.username == payload.username))
    if not admin or not verify_password(payload.password, admin.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверные данные для входа")
    token = await create_session(db, admin)
    response.set_cookie(SESSION_COOKIE, token, httponly=True, secure=settings.is_production, samesite="lax", max_age=settings.session_ttl_hours * 3600, path="/")
    return AdminOut(username=admin.username)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(request: Request, response: Response, db: AsyncSession = Depends(get_db)) -> None:
    await delete_session(request, db)
    response.delete_cookie(SESSION_COOKIE, path="/")


@router.get("/me", response_model=AdminOut)
async def me(admin=Depends(get_current_admin)) -> AdminOut:
    return AdminOut(username=admin.username)
