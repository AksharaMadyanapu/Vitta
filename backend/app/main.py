from datetime import datetime
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from .config import settings
from .database import engine, Base, get_db
from .schemas import HealthResponse

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Runway Cash-Flow Intelligence API",
    description="SaaS cash-flow intelligence platform for Indian MSME manufacturers",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health", response_model=HealthResponse)
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint confirming backend and database status."""
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
        database=db_status
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
            "sector": "Automotive Parts Manufacturing"
        },
        "version": "1.0.0",
        "currency": "INR",
        "currency_symbol": "₹"
    }

