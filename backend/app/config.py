import os
from typing import List

class Settings:
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    CORS_ORIGINS: List[str] = [
        origin.strip() 
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
        if origin.strip()
    ]
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./runway.db")
    COMPANY_NAME: str = os.getenv("COMPANY_NAME", "Deccan Precision Components Pvt Ltd")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

settings = Settings()
