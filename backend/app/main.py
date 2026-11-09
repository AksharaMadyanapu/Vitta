from datetime import datetime
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from .config import settings
from .database import engine, Base, get_db, SessionLocal
from . import models  # Registers all models with Base.metadata
from .schemas import HealthResponse

# Create database tables
Base.metadata.create_all(bind=engine)

# Auto-seed on startup
def _auto_seed():
    from .seed import run_seed
    db = SessionLocal()
    try:
        run_seed(db)
    finally:
        db.close()

_auto_seed()

app = FastAPI(
    title="Runway Cash-Flow Intelligence API",
    description="SaaS cash-flow intelligence platform for Indian MSME manufacturers",
    version="2.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
from .routers.parties import router as parties_router
from .routers.invoices import router as invoices_router
from .routers.transactions import router as transactions_router
from .routers.accounts import router as accounts_router
from .routers.forecast_router import router as forecast_router
from .routers.summary import router as summary_router

app.include_router(parties_router)
app.include_router(invoices_router)
app.include_router(transactions_router)
app.include_router(accounts_router)
app.include_router(forecast_router)
app.include_router(summary_router)


@app.get("/api/health", response_model=HealthResponse)
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint."""
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"error: {str(e)}"
    return HealthResponse(
        status="ok",
        service="Runway Cash-flow Intelligence Backend",
        company=settings.COMPANY_NAME,
        timestamp=datetime.utcnow(),
        database=db_status,
    )


@app.get("/api/info")
def app_info():
    return {
        "app_name": "Runway",
        "description": "Cash-flow intelligence platform for Indian MSMEs",
        "demo_company": {
            "name": settings.COMPANY_NAME,
            "owner": "Rakesh Reddy",
            "location": "Hyderabad, Telangana",
            "sector": "Automotive Parts Manufacturing",
        },
        "version": "2.0.0",
        "currency": "INR",
        "currency_symbol": "₹",
    }
