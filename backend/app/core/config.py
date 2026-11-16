from pathlib import Path
import secrets
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
class Settings(BaseSettings):
    DATABASE_URL: str = 'sqlite:///./foodstore.db'
    SECRET_KEY: str = Field(default_factory=lambda: secrets.token_urlsafe(48), min_length=32)
    ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, ge=1)
    FRONTEND_ORIGIN: str = 'http://localhost:5173'
    COOKIE_SECURE: bool = False
    model_config = SettingsConfigDict(env_file=Path(__file__).resolve().parents[2]/'.env', extra='ignore')
