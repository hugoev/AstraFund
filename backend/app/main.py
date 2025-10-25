"""
AstraFund API - Main application
"""
from app.api.v1 import approvals, compliance, expenses, grants, users
from app.core.config import settings
from app.core.database import Base, engine
from app.core.exceptions import setup_exception_handlers
from app.core.logging import setup_logging
from app.core.monitoring import setup_monitoring
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Setup logging
setup_logging()

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Financial Compliance Co-Pilot for Non-Profits",
    debug=settings.debug
)

# Setup middleware and handlers
setup_exception_handlers(app)
setup_monitoring(app)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(grants.router, prefix="/grants", tags=["grants"])
app.include_router(expenses.router, prefix="/expenses", tags=["expenses"])
app.include_router(compliance.router, prefix="/compliance", tags=["compliance"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(approvals.router, prefix="/approvals", tags=["approvals"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": settings.app_name,
        "version": settings.app_version
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}