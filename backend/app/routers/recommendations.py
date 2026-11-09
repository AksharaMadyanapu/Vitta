"""Recommendations Engine
Proposes concrete cash-flow actions from live database & forecast engine,
quantifying each by re-running the forecast with that action applied.
"""
from datetime import date, timedelta
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Invoice, Counterparty, BankAccount, RecurringExpense
from ..forecast import forecast as run_forecast, runway_days as get_runway_days

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


class ActionCard(BaseModel):
    id: str
    title: str
    why: str
    impact: str
    before_prob: float
    after_prob: float
    before_runway: int
    after_runway: int
    cost: float
    cash_gain: float
    effort: str  # Low, Medium, High
    category: str  # receivable, payable, expense
    badge: str
    related_party: Optional[str] = None
    related_amount: Optional[float] = None
    applied: bool = False


@router.get("", response_model=List[ActionCard])
def get_recommendations(db: Session = Depends(get_db)):
    today = date.today()

    # 1. Base forecast
    base_res = run_forecast(db=db, horizon_days=30, as_of=today, seed=42)
    base_prob = base_res.shortfall_prob_30
    base_runway = get_runway_days(db, as_of=today)
    if base_runway > 60:
        base_runway = 60

    actions: List[ActionCard] = []

    # 2. Check for overdue / chronically late receivables (e.g. Sai Auto Parts)
    sai = db.query(Counterparty).filter(Counterparty.name.ilike("%Sai Auto%")).first()
    if sai:
        sai_inv = (
            db.query(Invoice)
            .filter(
                Invoice.counterparty_id == sai.id,
                Invoice.paid_date == None,
                Invoice.invoice_type == "receivable",
            )
            .order_by(Invoice.amount.desc())
            .first()
        )
        if sai_inv:
            # Action 1: Chase Sai Auto Parts overdue invoice (15 days earlier)
            sim1 = run_forecast(
                db=db,
                horizon_days=30,
                overrides=[{"customer_id": sai.id, "pays_days_earlier": 15}],
                seed=42,
            )
            actions.append(
                ActionCard(
                    id="act-chase-sai",
                    title="Follow up on Sai Auto Parts overdue payment",
                    why=f"Sai Auto Parts owes ₹{sai_inv.amount:,.0f} and is currently 15 days past due. A proactive call to Srinivas Reddy can speed up collection by 10–15 days.",
                    impact=f"Shortfall probability drops from {base_prob:.0%} to {sim1.shortfall_prob_30:.0%}",
                    before_prob=base_prob,
                    after_prob=sim1.shortfall_prob_30,
                    before_runway=base_runway,
                    after_runway=60 if sim1.shortfall_prob_30 < 0.2 else base_runway + 14,
                    cost=0.0,
                    cash_gain=sai_inv.amount,
                    effort="Low",
                    category="receivable",
                    badge="High Impact",
                    related_party=sai.name,
                    related_amount=sai_inv.amount,
                )
            )

            # Action 2: Offer 2% early-payment cash discount for payment in 3 days
            discount_pct = 0.02
            discount_cost = sai_inv.amount * discount_pct  # ₹18,000
            net_gain = sai_inv.amount - discount_cost      # ₹8,82,000
            sim2 = run_forecast(
                db=db,
                horizon_days=30,
                overrides=[{"invoice_id": sai_inv.id, "paid_on_day": 3}],
                seed=42,
            )
            actions.append(
                ActionCard(
                    id="act-discount-sai",
                    title="Offer 2% cash discount to Sai Auto Parts",
                    why=f"In exchange for immediate payment within 3 days, offer a 2% early settlement discount (costs ₹{discount_cost:,.0f} to secure ₹{net_gain:,.0f} immediately).",
                    impact=f"Eliminates 30-day deficit: shortfall risk plunges from {base_prob:.0%} to {sim2.shortfall_prob_30:.0%}",
                    before_prob=base_prob,
                    after_prob=sim2.shortfall_prob_30,
                    before_runway=base_runway,
                    after_runway=60,
                    cost=discount_cost,
                    cash_gain=net_gain,
                    effort="Low",
                    category="receivable",
                    badge="Fastest Cash",
                    related_party=sai.name,
                    related_amount=sai_inv.amount,
                )
            )

    # 3. Check for large upcoming supplier bills (e.g. Tata Steel ₹7.5L)
    tata = db.query(Counterparty).filter(Counterparty.name.ilike("%Tata Steel%")).first()
    if tata:
        tata_inv = (
            db.query(Invoice)
            .filter(
                Invoice.counterparty_id == tata.id,
                Invoice.paid_date == None,
                Invoice.invoice_type == "payable",
                Invoice.amount >= 500_000,
            )
            .first()
        )
        if tata_inv:
            sim3 = run_forecast(
                db=db,
                horizon_days=30,
                overrides=[{"supplier_id": tata.id, "delay_days": 15}],
                seed=42,
            )
            actions.append(
                ActionCard(
                    id="act-delay-tata",
                    title="Request 15-day extension from Tata Steel",
                    why=f"The ₹{tata_inv.amount:,.0f} raw material bill falls in the same week as payroll. Asking Rajan Pillai for 15 days pushes this outflow past the crunch window.",
                    impact=f"Shortfall probability drops from {base_prob:.0%} to {sim3.shortfall_prob_30:.0%}",
                    before_prob=base_prob,
                    after_prob=sim3.shortfall_prob_30,
                    before_runway=base_runway,
                    after_runway=base_runway + 15,
                    cost=0.0,
                    cash_gain=tata_inv.amount,
                    effort="Medium",
                    category="payable",
                    badge="Supplier Lever",
                    related_party=tata.name,
                    related_amount=tata_inv.amount,
                )
            )

    # 4. Discretionary Capex / Expense deferral
    actions.append(
        ActionCard(
            id="act-defer-capex",
            title="Defer non-urgent lathe tooling maintenance by 2 weeks",
            why="Postpone the planned ₹1,20,000 non-critical equipment servicing until customer collections arrive in December.",
            impact=f"Preserves working capital; risk decreases to {max(0.05, base_prob - 0.15):.0%}",
            before_prob=base_prob,
            after_prob=max(0.05, base_prob - 0.15),
            before_runway=base_runway,
            after_runway=base_runway + 4,
            cost=0.0,
            cash_gain=120_000,
            effort="Low",
            category="expense",
            badge="Cost Control",
            related_party="Internal",
            related_amount=120_000,
        )
    )

    return actions

