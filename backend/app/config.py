from functools import lru_cache
from urllib.parse import quote

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    postgres_db: str
    postgres_user: str
    postgres_password: str
    postgres_host: str = "db"
    session_secret: str
    environment: str = "development"
    upload_dir: str = "/data/uploads"
    session_ttl_hours: int = 24
    max_upload_bytes: int = 5 * 1024 * 1024

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"

    @property
    def database_url(self) -> str:
        user = quote(self.postgres_user, safe="")
        password = quote(self.postgres_password, safe="")
        database = quote(self.postgres_db, safe="")
        return f"postgresql+asyncpg://{user}:{password}@{self.postgres_host}:5432/{database}"


@lru_cache
def get_settings() -> Settings:
    return Settings()
