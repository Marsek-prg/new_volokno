from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import SiteContent
from ..schemas import SiteContentPayload
from ..security import get_current_admin

router = APIRouter(prefix="/api/content", tags=["content"])


@router.get("", response_model=SiteContentPayload)
async def get_content(db: AsyncSession = Depends(get_db)) -> SiteContentPayload:
    row = await db.get(SiteContent, "main")
    return SiteContentPayload.model_validate(row.content)


@router.put("", response_model=SiteContentPayload)
async def update_content(payload: SiteContentPayload, db: AsyncSession = Depends(get_db), _admin=Depends(get_current_admin)) -> SiteContentPayload:
    row = await db.get(SiteContent, "main")
    row.content = payload.model_dump(by_alias=True)
    await db.commit()
    await db.refresh(row)
    return SiteContentPayload.model_validate(row.content)
