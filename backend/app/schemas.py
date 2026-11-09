from datetime import datetime, date
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


# ── Health ─────────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    service: str
    company: str
    timestamp: datetime
    database: str


# ── Company ───────────────────────────────────────────────────────────────────

class CompanySchema(BaseModel):
    id: int
    name: str
    owner_name: str
    location: str
    industry: str

    class Config:
        from_attributes = True


# ── Bank Account ──────────────────────────────────────────────────────────────

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


class BankAccountCreate(BaseModel):
    account_number: str
    bank_name: str
    account_type: str = "Current"
    current_balance: float = 0.0


# ── Counterparty ──────────────────────────────────────────────────────────────

class CounterpartySchema(BaseModel):
    id: int
    name: str
    party_type: str
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    payment_terms_days: int
    delay_profile: Optional[List[float]] = None
    avg_delay_days: float
    risk_level: str
    created_at: datetime

    class Config:
        from_attributes = True


class CounterpartyCreate(BaseModel):
    name: str
    party_type: str  # customer or supplier
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    payment_terms_days: int = 30
    risk_level: str = "safe"


class CounterpartyUpdate(BaseModel):
    name: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    payment_terms_days: Optional[int] = None
    risk_level: Optional[str] = None


# ── Invoice ───────────────────────────────────────────────────────────────────

class InvoiceSchema(BaseModel):
    id: int
    invoice_number: str
    counterparty_id: int
    counterparty_name: Optional[str] = None
    invoice_type: str
    amount: float
    issue_date: date
    due_date: date
    paid_date: Optional[date] = None
    status: str
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class InvoiceCreate(BaseModel):
    invoice_number: str
    counterparty_id: int
    invoice_type: str
    amount: float
    issue_date: date
    due_date: date
    notes: Optional[str] = None


class InvoiceUpdate(BaseModel):
    amount: Optional[float] = None
    due_date: Optional[date] = None
    paid_date: Optional[date] = None
    status: Optional[str] = None
    notes: Optional[str] = None


# ── Transaction ───────────────────────────────────────────────────────────────

class TransactionSchema(BaseModel):
    id: int
    bank_account_id: int
    bank_name: Optional[str] = None
    transaction_date: date
    description: str
    amount: float
    category: Optional[str] = None
    source: str
    reference_id: Optional[str] = None

    class Config:
        from_attributes = True


class TransactionCreate(BaseModel):
    bank_account_id: int
    transaction_date: date
    description: str
    amount: float
    category: Optional[str] = None
    source: str = "manual"
    reference_id: Optional[str] = None


# ── Summary / Dashboard ───────────────────────────────────────────────────────

class AttentionItem(BaseModel):
    id: str
    title: str
    amount: float
    amount_formatted: str
    link_text: str
    route: str
    due_label: str
    urgent: bool
    severity: str  # safe, caution, high_risk


class DashboardSummary(BaseModel):
    total_bank_balance: float
    total_receivables_30d: float
    total_payables_30d: float
    overdue_receivables: float
    overdue_receivables_count: int
    attention_items: List[AttentionItem]
    # Accounts breakdown
    accounts: List[BankAccountSchema]


# ── Forecast ──────────────────────────────────────────────────────────────────

class ForecastRequest(BaseModel):
    horizon_days: int = 30
    as_of: Optional[date] = None
    overrides: Optional[List[Dict[str, Any]]] = None
    extra_items: Optional[List[Dict[str, Any]]] = None


class ForecastResponse(BaseModel):
    horizon_days: int
    as_of: str
    days: List[str]
    p10: List[float]
    p50: List[float]
    p90: List[float]
    shortfall_prob_14: float
    shortfall_prob_30: float
    shortfall_prob_60: float
    expected_shortfall_date: Optional[str]
    expected_shortfall_amount: Optional[float]
    risk_level: str
    top_drivers: List[Dict[str, Any]]
    simulation_count: int
    elapsed_ms: float


# ── Runway ─────────────────────────────────────────────────────────────────────

class RunwayResponse(BaseModel):
    runway_days: int
    runway_label: str          # "23 days", "60+ days"
    status: str                # Healthy, Watch, Urgent
    status_key: str            # safe, caution, high_risk
    expected_shortfall_date: Optional[str]
    expected_shortfall_amount: Optional[float]
    total_bank_balance: float
    shortfall_prob_30: float
    one_line_reason: str


# ── Risk Alerts ───────────────────────────────────────────────────────────────

class RiskAlertSchema(BaseModel):
    id: int
    title: str
    message: str
    severity: str
    action_recommendation: Optional[str] = None
    target_date: Optional[date] = None
    is_dismissed: bool
    created_at: datetime

    class Config:
        from_attributes = True
