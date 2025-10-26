"""
Application configuration using Pydantic Settings
"""
import os
from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # Application
    app_name: str = "AstraFund API"
    app_version: str = "1.0.0"
    debug: bool = False
    environment: str = "development"
    
    # Database
    database_url: str = "sqlite:///./astrafund.db"
    
    # API Keys
    gemini_api_key: Optional[str] = None
    
    # CORS - Allow frontend from various sources
    cors_origins: list = [
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Frontend container/production
        "http://127.0.0.1:5173",  # Alternative localhost
        "http://127.0.0.1:3000",  # Alternative localhost
        "http://frontend:80",     # Docker internal network
    ]
    
    # Logging
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
