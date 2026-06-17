from pydantic_settings import BaseSettings
from typing import Optional, List
import os


class Settings(BaseSettings):
    # Project
    PROJECT_NAME: str = "码上未来"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api"

    # Database
    DATABASE_URL: str = "sqlite:///./wxskill.db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT
    SECRET_KEY: str  # 必须从 .env 或环境变量提供，无默认值
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001", "https://frontend-sigma-gilt-16.vercel.app"]

    # AI API Keys
    OPENAI_API_KEY: Optional[str] = None
    TENCENT_CLOUD_SECRET_ID: Optional[str] = None
    TENCENT_CLOUD_SECRET_KEY: Optional[str] = None
    ZHIPUAI_API_KEY: Optional[str] = None

    # File Storage
    UPLOAD_DIR: str = "./uploads"
    TEMPLATES_DIR: str = "./templates"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"


settings = Settings()
