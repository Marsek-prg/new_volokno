from typing import Literal
from urllib.parse import urlparse

from pydantic import BaseModel, ConfigDict, Field, field_validator
import re


class Service(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str = Field(default="Новая услуга", max_length=180)
    description: str = Field(default="", max_length=1200)
    price: str = Field(default="По запросу", max_length=160)


class Services(BaseModel):
    model_config = ConfigDict(extra="ignore")
    title: str = Field(default="От первого сигнала до готовой линии", max_length=240)
    summary: str = Field(default="", max_length=1200)
    items: list[Service] = Field(default_factory=list, max_length=50)


class Hero(BaseModel):
    model_config = ConfigDict(extra="ignore")
    title: str = Field(default="", max_length=300)
    lead: str = Field(default="", max_length=1200)
    note: str = Field(default="", max_length=300)
    caption: str = Field(default="", max_length=300)
    image: str = Field(default="", max_length=1000)
    imageAlt: str = Field(default="", max_length=300)

    @field_validator("image")
    @classmethod
    def validate_image(cls, value: str) -> str:
        if value == "" or (".." not in value and re.fullmatch(r"/?(?:public|uploads)/[A-Za-z0-9._/-]+\.(?:png|jpe?g|webp)", value)):
            return value
        raise ValueError("Недопустимый путь изображения")


class Approach(BaseModel):
    model_config = ConfigDict(extra="ignore")
    title: str = Field(default="", max_length=240)
    text: str = Field(default="", max_length=1200)


class ContactItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    label: str = Field(default="Контакт", max_length=100)
    value: str = Field(default="", max_length=300)
    href: str = Field(default="#", max_length=1000)

    @field_validator("href")
    @classmethod
    def validate_href(cls, value: str) -> str:
        candidate = value.strip()[:1000]
        if candidate == "#":
            return candidate
        if "\r" in candidate or "\n" in candidate:
            raise ValueError("Недопустимая ссылка")
        parsed = urlparse(candidate)
        if parsed.scheme in {"mailto", "tel", "tg"} and parsed.netloc == "":
            return candidate
        allowed_hosts = {"t.me", "telegram.me", "wa.me", "whatsapp.com", "www.whatsapp.com", "vk.com", "m.vk.com", "ok.ru", "m.ok.ru", "max.ru"}
        if parsed.scheme == "https" and parsed.hostname in allowed_hosts and parsed.username is None and parsed.password is None:
            return candidate
        raise ValueError("Недопустимая ссылка")


class Contact(BaseModel):
    model_config = ConfigDict(extra="ignore")
    title: str = Field(default="", max_length=240)
    text: str = Field(default="", max_length=1200)
    items: list[ContactItem] = Field(default_factory=list, max_length=30)


class SiteContentPayload(BaseModel):
    model_config = ConfigDict(extra="ignore")
    hero: Hero
    services: Services
    approach: Approach
    contact: Contact


class LoginPayload(BaseModel):
    username: str = Field(min_length=1, max_length=120)
    password: str = Field(min_length=1, max_length=256)


class AdminOut(BaseModel):
    username: str


class HealthOut(BaseModel):
    status: Literal["ok"]
    database: Literal["ok"]
