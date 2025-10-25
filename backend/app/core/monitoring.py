"""
Application monitoring and metrics
"""
import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from app.core.logging import get_logger

logger = get_logger(__name__)


class MonitoringMiddleware(BaseHTTPMiddleware):
    """Middleware for monitoring requests"""
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Log request
        logger.info(f"Request: {request.method} {request.url}")
        
        # Process request
        response = await call_next(request)
        
        # Calculate processing time
        process_time = time.time() - start_time
        
        # Log response
        logger.info(
            f"Response: {response.status_code} - "
            f"Process time: {process_time:.4f}s - "
            f"Path: {request.url.path}"
        )
        
        # Add headers
        response.headers["X-Process-Time"] = str(process_time)
        
        return response


def setup_monitoring(app):
    """Setup monitoring middleware"""
    app.add_middleware(MonitoringMiddleware)
