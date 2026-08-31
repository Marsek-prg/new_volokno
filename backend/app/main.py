from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from sqlalchemy import text

from .database import SessionLocal
from .models import SiteContent
from .routers import auth, content, uploads
from .schemas import HealthOut

DEFAULT_CONTENT = {
    "hero": {"title": "Связь должна работать. Мы знаем, как её восстановить.", "lead": "Монтаж, диагностика и ремонт волоконно-оптических линий для домов, предприятий и инфраструктурных объектов.", "note": "Работаем по согласованному плану, без лишних этапов", "caption": "Точная работа с каждой жилой", "image": "/public/hero-fiber.png", "imageAlt": "Подготовка волоконно-оптического кабеля к сварке"},
    "services": {"title": "От первого сигнала до готовой линии", "summary": "Подключаем, проверяем и возвращаем в работу оптические линии. Вы получаете понятный результат и рекомендации по дальнейшей эксплуатации.", "items": [{"name": "Монтаж ВОЛС", "description": "Прокладка кабеля, подготовка трассы, монтаж муфт и коммутационных элементов.", "price": "Срок зависит от объекта"}, {"name": "Диагностика и измерения", "description": "Поиск повреждений и потерь с помощью рефлектометра и измерительного оборудования.", "price": "Выезд по запросу"}, {"name": "Сварка оптических волокон", "description": "Точная сварка, укладка в кассеты и проверка качества соединений.", "price": "От одного соединения"}, {"name": "Ремонт и восстановление", "description": "Локализуем неисправность, восстанавливаем линию и фиксируем причину сбоя.", "price": "Срочный выезд возможен"}]},
    "approach": {"title": "Сначала понимаем объект. Потом делаем работу.", "text": "Оптика не любит догадок. Перед началом уточняем схему, состояние линии и ограничения площадки. После работ передаём результат и рекомендации простым языком."},
    "contact": {"title": "Опишите задачу. Мы ответим по делу.", "text": "Контактные данные сейчас временные. Перед публикацией заменим их на подтверждённые реквизиты компании.", "items": [{"label": "Телефон", "value": "+7 999 000-00-00", "href": "tel:+79990000000"}, {"label": "Email", "value": "hello@volokno.example", "href": "mailto:hello@volokno.example"}, {"label": "Telegram", "value": "@volokno_example", "href": "https://t.me/volokno_example"}]}
}


@asynccontextmanager
async def lifespan(_app: FastAPI):
    async with SessionLocal() as db:
        if await db.get(SiteContent, "main") is None:
            db.add(SiteContent(id="main", content=DEFAULT_CONTENT))
            await db.commit()
    yield


app = FastAPI(title="Volokno API", lifespan=lifespan)
app.include_router(auth.router)
app.include_router(content.router)
app.include_router(uploads.router)


@app.get("/api/health", response_model=HealthOut)
async def health() -> HealthOut:
    try:
        async with SessionLocal() as db:
            await db.execute(text("SELECT 1"))
    except Exception as error:
        raise HTTPException(status_code=503, detail="Database unavailable") from error
    return HealthOut(status="ok", database="ok")
