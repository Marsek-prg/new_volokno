import io
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from PIL import Image, UnidentifiedImageError

from ..config import get_settings
from ..security import get_current_admin

router = APIRouter(prefix="/api/uploads", tags=["uploads"])
settings = get_settings()
ALLOWED_TYPES = {"image/jpeg": {".jpg", ".jpeg"}, "image/png": {".png"}, "image/webp": {".webp"}}


@router.post("")
async def upload_image(file: UploadFile = File(...), _admin=Depends(get_current_admin)) -> dict[str, str]:
    extension = Path(file.filename or "").suffix.lower()
    if file.content_type not in ALLOWED_TYPES or extension not in ALLOWED_TYPES[file.content_type]:
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Разрешены только JPEG, PNG и WebP")
    data = await file.read(settings.max_upload_bytes + 1)
    if len(data) > settings.max_upload_bytes:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Файл больше 5 МБ")
    try:
        with Image.open(io.BytesIO(data)) as image:
            if image.format not in {"JPEG", "PNG", "WEBP"} or image.width > 8000 or image.height > 8000:
                raise ValueError("unsupported image")
            image.verify()
    except (UnidentifiedImageError, OSError, ValueError):
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Файл не является корректным изображением") from None
    upload_dir = Path(settings.upload_dir).resolve()
    upload_dir.mkdir(parents=True, exist_ok=True)
    suffix = ".jpg" if file.content_type == "image/jpeg" else extension
    filename = f"{uuid.uuid4().hex}{suffix}"
    destination = (upload_dir / filename).resolve()
    if upload_dir not in destination.parents:
        raise HTTPException(status_code=400, detail="Недопустимое имя файла")
    destination.write_bytes(data)
    return {"url": f"/uploads/{filename}"}
