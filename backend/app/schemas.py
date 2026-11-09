from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, Field

class HealthResponse(BaseModel):
    status: str
    service: str
    company: str
    timestamp: datetime
    database: str

class CompanySchema(BaseModel):
    id: int
    name: str
    owner_name: str
    location: str
    industry: str

    class Config:
        from_attributes = True

class BankAccountSchema(BaseModel):
    id: int
    account_number: str
    bank_name: str
    account_type: str
    current_balance: float
    is_connected: bool
    last_synced_at: datetime

    class Config:
        from_attributes = True

class TransactionSchema(BaseModel):
    id: int
    bank_account_id: int
    transaction_date: date
    description: str
    amount: float
    category: Optional[str] = None
    source: str
    reference_id: Optional[str] = None

    class Config:
        from_attributes = True

