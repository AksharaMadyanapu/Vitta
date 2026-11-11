from datetime import datetime
import threading
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from .config import settings
from .database import engine, Base, get_db, SessionLocal
from . import models  # Registers all models with Base.metadata
from .schemas import HealthResponse

# Create database tables
Base.metadata.create_all(bind=engine)

# Seeding status flag
_is_seeding = False

# Auto-seed on startup (strictly only if empty)
def _auto_seed_and_warmup():
    global _is_seeding
    from .seed import run_seed, already_seeded
    db = SessionLocal()
    try:
        if not already_seeded(db):
            _is_seeding = True
            run_seed(db)
            _is_seeding = False

        # Pre-warm default 14, 30 and 60 day forecasts so the first visitor does not wait
        from .forecast import forecast as run_forecast
        run_forecast(db, horizon_days=14)
        run_forecast(db, horizon_days=30)
        run_forecast(db, horizon_days=60)
    except Exception as e:
        print(f"Startup task error: {e}")
    finally:
        _is_seeding = False
        db.close()

# Start background warm-up / seeding thread
threading.Thread(target=_auto_seed_and_warmup, daemon=True).start()

app = FastAPI(
    title="Runway Cash-Flow Intelligence API",
    description="SaaS cash-flow intelligence platform for Indian MSME manufacturers",
    version="2.0.0",
)

# Enable GZip compression for responses > 1000 bytes
app.add_middleware(GZipMiddleware, minimum_size=1000)

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
from .routers.recommendations import router as recommendations_router
from .routers.copilot import router as copilot_router
from .routers.risk_assessment import router as risk_router
from .routers.reminders_router import router as reminders_router

app.include_router(parties_router)
app.include_router(invoices_router)
app.include_router(transactions_router)
app.include_router(accounts_router)
app.include_router(forecast_router)
app.include_router(summary_router)
app.include_router(recommendations_router)
app.include_router(copilot_router)
app.include_router(risk_router)
app.include_router(reminders_router)


@app.get("/api/health", response_model=HealthResponse)
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint with demo-ready status."""
    db_status = "connected"
    if _is_seeding:
        db_status = "seeding"
    else:
        try:
            db.execute(text("SELECT 1"))
        except Exception as e:
            db_status = f"error: {str(e)}"
    return HealthResponse(
        status="warming_up" if _is_seeding else "ok",
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
