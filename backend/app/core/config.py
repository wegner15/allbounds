import os
from typing import List, Optional, Union, Any
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

class Settings(BaseSettings):
    # API settings
    API_V1_STR: str = "/api/v1"
    
    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://allbounds:allbounds@localhost:5432/allbounds")
    
    # JWT settings
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "dev_secret_key_change_in_production")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "43200"))
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRE_DAYS", "30"))
    
    # Meilisearch settings
    MEILISEARCH_URL: str = os.getenv("MEILISEARCH_URL", "http://localhost:7700")
    MEILISEARCH_MASTER_KEY: Optional[str] = os.getenv("MEILISEARCH_MASTER_KEY")

    # Cloudflare Images settings
    CLOUDFLARE_IMAGES_DELIVERY_URL: Optional[str] = os.getenv("CLOUDFLARE_IMAGES_DELIVERY_URL")
    
    # Cloudflare R2 settings
    R2_ENDPOINT: Optional[str] = os.getenv("R2_ENDPOINT")
    R2_ACCESS_KEY: Optional[str] = os.getenv("R2_ACCESS_KEY")
    R2_SECRET_KEY: Optional[str] = os.getenv("R2_SECRET_KEY")
    R2_BUCKET_NAME: str = os.getenv("R2_BUCKET_NAME", "allbounds")
    
    # Logging settings
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # Project settings
    PROJECT_NAME: str = "Allbounds API"
    
    # Observability settings
    ENABLE_TRACING: bool = os.getenv("ENABLE_TRACING", "false").lower() == "true"
    OTLP_ENDPOINT: Optional[str] = os.getenv("OTLP_ENDPOINT")
    PROMETHEUS_ENABLED: bool = os.getenv("PROMETHEUS_ENABLED", "true").lower() == "true"
    BACKEND_CORS_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:8000").split(",")
    ]

    class Config:
        case_sensitive = True

settings = Settings()
