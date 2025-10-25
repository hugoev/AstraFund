"""
Logging configuration
"""
import logging
import sys
from typing import Optional

from app.core.config import settings


def setup_logging(log_level: Optional[str] = None) -> None:
    """Setup application logging"""
    level = log_level or settings.log_level
    
    logging.basicConfig(
        level=getattr(logging, level.upper()),
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    # Set specific loggers
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("fastapi").setLevel(logging.INFO)


def get_logger(name: str) -> logging.Logger:
    """Get logger instance"""
    return logging.getLogger(name)
