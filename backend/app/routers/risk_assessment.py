"""Pre-Transaction Risk Assessment Router
Checks proposed transactions against cash-flow risk before confirmation.
Auto-simulates safer alternatives and saves confirmed decisions.
"""
from datetime import date, datetime, timedelta
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Invoice, Counterparty, BankAccount, Transaction
from ..forecast import forecast as run_forecast, invalidate_cache

router = APIRouter(prefix="/api/risk", tags=["risk"])


class AssessRequest(BaseModel):
    type: str  # purchase, sale, expense
    party: str
    amount: float
    date: str  # YYYY-MM-DD
    payment_terms: int = 30


class AlternativeOption(BaseModel):
    id: str
    title: str
    description: str
    shortfall_prob: float
    lowest_balance: float
    verdict: str  # safe, caution, high_risk
    extra_items: List[Dict[str, Any]]


class AssessResponse(BaseModel):
    verdict: str  # safe, caution, high_risk
    explanation: str
    before_prob: float
    after_prob: float
    before_lowest: float
    after_lowest: float
    lowest_date: str
    days: List[str]
    before_curve: List[float]
    after_curve: List[float]
    alternatives: List[AlternativeOption]


class ConfirmRequest(BaseModel):
    type: str
    party: str
    amount: float
    date: str
    notes: Optional[str] = None
    alternative_id: Optional[str] = None


@router.post("/assess", response_model=AssessResponse)
def assess_transaction(payload: AssessRequest, db: Session = Depends(get_db)):
    today = date.today()
    try:
        target_date = datetime.strptime(payload.date, "%Y-%m-%d").date()
    except Exception:
        target_date = today + timedelta(days=14)

    # Days from today when payment actually hits (accounting for terms)
    days_offset = max(1, (target_date - today).days)
    if payload.type == "purchase" and payload.payment_terms > 0:
        actual_payment_day = days_offset + payload.payment_terms
    else:
        actual_payment_day = days_offset

    # Run baseline forecast (60 days to see the full impact, 2000 sims for high accuracy purchase check)
    base_res = run_forecast(db=db, horizon_days=60, as_of=today, seed=42, num_simulations=2000)
    base_prob = base_res.shortfall_prob_30
    before_curve = [round(b, 0) for b in base_res.p50]
    before_lowest = min(before_curve)

    # Multiplier: outflow is negative, sale inflow is positive
    signed_amount = payload.amount if payload.type == "sale" else -payload.amount

    # Simulation with proposed transaction
    proposed_extra = [{"day": actual_payment_day, "amount": signed_amount, "label": payload.party}]
    after_res = run_forecast(
        db=db, horizon_days=60, as_of=today, extra_items=proposed_extra, seed=42, num_simulations=2000
    )
    after_prob = after_res.shortfall_prob_30
    after_curve = [round(b, 0) for b in after_res.p50]
    after_lowest = min(after_curve)

    # Determine verdict
    if after_prob > 0.5 or after_lowest < 0:
        verdict = "high_risk"
        explanation = (
            f"This payment of ₹{payload.amount:,.0f} scheduled for {target_date.strftime('%d %b %Y')} "
            f"will push your bank balance negative to ₹{after_lowest:,.0f} due to upcoming payroll and GST bills. "
            f"Shortfall probability rises to {after_prob:.0%}."
        )
    elif after_prob > 0.2:
        verdict = "caution"
        explanation = (
            f"This payment leaves your cash buffer thin (lowest projected balance: ₹{after_lowest:,.0f}). "
            f"Proceed with caution or choose an instalment plan."
        )
    else:
        verdict = "safe"
        explanation = (
            f"This transaction is safe to proceed. Your minimum cash balance will remain above "
            f"₹{after_lowest:,.0f} throughout the next 30 days."
        )

    # Find date of lowest balance
    lowest_idx = after_curve.index(after_lowest)
    lowest_date_obj = today + timedelta(days=lowest_idx)
    lowest_date = lowest_date_obj.strftime("%d %b %Y")

    # ── Auto-simulate 3 Safer Alternatives ──────────────────────────────────
    alternatives: List[AlternativeOption] = []

    # Alternative 1: Delay payment by 14 days
    alt1_day = actual_payment_day + 14
    alt1_extra = [{"day": alt1_day, "amount": signed_amount, "label": f"{payload.party} (+14d)"}]
    alt1_res = run_forecast(db=db, horizon_days=60, as_of=today, extra_items=alt1_extra, seed=42)
    alt1_lowest = min(alt1_res.p50)
    alternatives.append(
        AlternativeOption(
            id="alt-delay-14",
            title="Delay payment by 14 days",
            description=f"Pay ₹{payload.amount:,.0f} on {(target_date + timedelta(days=14)).strftime('%d %b %Y')} after customer receipts arrive.",
            shortfall_prob=alt1_res.shortfall_prob_30,
            lowest_balance=alt1_lowest,
            verdict="safe" if alt1_res.shortfall_prob_30 < 0.25 else "caution",
            extra_items=alt1_extra,
        )
    )

    # Alternative 2: Split into 2 equal instalments (50% now, 50% in 30 days)
    half_amount = signed_amount / 2
    alt2_extra = [
        {"day": actual_payment_day, "amount": half_amount, "label": f"{payload.party} (Instalment 1)"},
        {"day": actual_payment_day + 30, "amount": half_amount, "label": f"{payload.party} (Instalment 2)"},
    ]
    alt2_res = run_forecast(db=db, horizon_days=60, as_of=today, extra_items=alt2_extra, seed=42)
    alt2_lowest = min(alt2_res.p50)
    alternatives.append(
        AlternativeOption(
            id="alt-split-2",
            title="Pay in 2 instalments of 50%",
            description=f"Pay ₹{abs(half_amount):,.0f} on {target_date.strftime('%d %b')} and ₹{abs(half_amount):,.0f} 30 days later.",
            shortfall_prob=alt2_res.shortfall_prob_30,
            lowest_balance=alt2_lowest,
            verdict="safe" if alt2_res.shortfall_prob_30 < 0.3 else "caution",
            extra_items=alt2_extra,
        )
    )

    # Alternative 3: Negotiate 45-day credit terms
    alt3_day = days_offset + 45
    alt3_extra = [{"day": alt3_day, "amount": signed_amount, "label": f"{payload.party} (45d terms)"}]
    alt3_res = run_forecast(db=db, horizon_days=60, as_of=today, extra_items=alt3_extra, seed=42)
    alt3_lowest = min(alt3_res.p50)
    alternatives.append(
        AlternativeOption(
            id="alt-terms-45",
            title="Negotiate 45-day credit terms",
            description=f"Request 45-day credit terms, pushing the full payment out to {(target_date + timedelta(days=45)).strftime('%d %b %Y')}.",
            shortfall_prob=alt3_res.shortfall_prob_30,
            lowest_balance=alt3_lowest,
            verdict="safe" if alt3_res.shortfall_prob_30 < 0.25 else "caution",
            extra_items=alt3_extra,
        )
    )

    return AssessResponse(
        verdict=verdict,
        explanation=explanation,
        before_prob=base_prob,
        after_prob=after_prob,
        before_lowest=before_lowest,
        after_lowest=after_lowest,
        lowest_date=lowest_date,
        days=base_res.days,
        before_curve=before_curve,
        after_curve=after_curve,
        alternatives=alternatives,
    )


@router.post("/confirm")
def confirm_transaction(payload: ConfirmRequest, db: Session = Depends(get_db)):
    """Confirm a transaction and record it as a planned invoice / transaction."""
    today = date.today()
    try:
        due = datetime.strptime(payload.date, "%Y-%m-%d").date()
    except Exception:
        due = today + timedelta(days=14)

    # Find or create counterparty
    cp = db.query(Counterparty).filter(Counterparty.name.ilike(f"%{payload.party[:6]}%")).first()
    if not cp:
        cp = Counterparty(
            name=payload.party,
            party_type="supplier" if payload.type in ["purchase", "expense"] else "customer",
            payment_terms_days=30,
        )
        db.add(cp)
        db.flush()

    itype = "receivable" if payload.type == "sale" else "payable"
    inv_number = f"PLN-{datetime.now().strftime('%y%m%d%H%M')}"

    inv = Invoice(
        invoice_number=inv_number,
        counterparty_id=cp.id,
        invoice_type=itype,
        amount=payload.amount,
        issue_date=today,
        due_date=due,
        status="unpaid",
        notes=payload.notes or f"Created via Check a purchase tool ({payload.alternative_id or 'direct'})",
    )
    db.add(inv)
    db.commit()

    # Invalidate forecast cache so changes appear immediately everywhere
    invalidate_cache()

    return {
        "ok": True,
        "message": f"Recorded {payload.party} ₹{payload.amount:,.0f} for {due.strftime('%d %b %Y')}. Forecast updated.",
        "invoice_number": inv_number,
        "counterparty": cp.name,
        "amount": payload.amount,
        "due_date": due.isoformat(),
    }

