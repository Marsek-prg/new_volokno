import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError
from fastapi import Depends, HTTPException, Request, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from .config import get_settings
from .database import get_db
from .models import Admin, AdminSession

password_hasher = PasswordHasher()
settings = get_settings()
SESSION_COOKIE = "volokno_admin_session"


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return password_hasher.verify(password_hash, password)
    except (VerifyMismatchError, InvalidHashError):
        return False


def hash_session_token(token: str) -> str:
    return hmac.new(settings.session_secret.encode(), token.encode(), hashlib.sha256).hexdigest()


async def create_session(db: AsyncSession, admin: Admin) -> str:
    raw_token = secrets.token_urlsafe(48)
    session = AdminSession(admin_id=admin.id, token_hash=hash_session_token(raw_token), expires_at=datetime.now(timezone.utc) + timedelta(hours=settings.session_ttl_hours))
    db.add(session)
    await db.commit()
    return raw_token


async def get_current_admin(request: Request, db: AsyncSession = Depends(get_db)) -> Admin:
    raw_token = request.cookies.get(SESSION_COOKIE)
    if not raw_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Требуется вход")
    result = await db.execute(select(AdminSession).where(AdminSession.token_hash == hash_session_token(raw_token)))
    session = result.scalar_one_or_none()
    now = datetime.now(timezone.utc)
    if not session or session.expires_at <= now:
        if session:
            await db.delete(session)
            await db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Сессия истекла")
    return session.admin


async def delete_session(request: Request, db: AsyncSession) -> None:
    raw_token = request.cookies.get(SESSION_COOKIE)
    if raw_token:
        await db.execute(delete(AdminSession).where(AdminSession.token_hash == hash_session_token(raw_token)))
        await db.commit()
