"""Summary / Dashboard endpoint and Risk Alerts."""
from datetime import date, timedelta
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import BankAccount, Invoice, Counterparty, RiskAlert
from ..schemas import DashboardSummary, AttentionItem, BankAccountSchema, RiskAlertSchema

router = APIRouter(prefix="/api", tags=["summary"])


def _fmt_inr_compact(amount: float) -> str:
    if abs(amount) >= 10_000_000:
        return f"₹{amount/10_000_000:.1f}Cr"
    elif abs(amount) >= 100_000:
        return f"₹{amount/100_000:.1f}L"
    elif abs(amount) >= 1000:
        return f"₹{amount/1000:.0f}K"
    return f"₹{amount:,.0f}"


def _fmt_inr(amount: float) -> str:
    """Format as full Indian number e.g. ₹9,00,000."""
    # Indian numbering: last 3 digits, then groups of 2
    abs_amt = abs(amount)
    s = f"{abs_amt:,.0f}"
    # Convert to Indian format
    parts = s.split(",")
    if len(parts) <= 1:
        return f"₹{s}"
    # Rejoin in Indian format: last group of 3, rest in groups of 2
    last = parts[-1]
    rest = parts[:-1]
    # Flatten
    flat = "".join(rest) + last
    if len(flat) <= 3:
        formatted = flat
    elif len(flat) <= 5:
        formatted = flat[:-3] + "," + flat[-3:]
    elif len(flat) <= 7:
        formatted = flat[:-5] + "," + flat[-5:-3] + "," + flat[-3:]
    elif len(flat) <= 9:
        formatted = flat[:-7] + "," + flat[-7:-5] + "," + flat[-5:-3] + "," + flat[-3:]
    else:
        formatted = flat[:-9] + "," + flat[-9:-7] + "," + flat[-7:-5] + "," + flat[-5:-3] + "," + flat[-3:]
    prefix = "-₹" if amount < 0 else "₹"
    return prefix + formatted


@router.get("/summary", response_model=DashboardSummary)
def get_summary(db: Session = Depends(get_db)):
    today = date.today()
    horizon_30 = today + timedelta(days=30)

    # Bank accounts
    accounts = db.query(BankAccount).all()
    total_balance = sum(a.current_balance for a in accounts)

    # Open receivables
    open_recv = db.query(Invoice).filter(
        Invoice.invoice_type == "receivable",
        Invoice.paid_date == None,
        Invoice.status.in_(["unpaid", "overdue"]),
    ).all()

    # Receivables due in next 30 days
    recv_30d = sum(
        inv.amount for inv in open_recv
        if inv.due_date <= horizon_30
    )

    # Overdue receivables
    overdue_recv = [inv for inv in open_recv if inv.due_date < today]
    overdue_amount = sum(inv.amount for inv in overdue_recv)

    # Open payables due in next 30 days
    open_pay = db.query(Invoice).filter(
        Invoice.invoice_type == "payable",
        Invoice.paid_date == None,
        Invoice.status.in_(["unpaid", "overdue"]),
        Invoice.due_date <= horizon_30,
    ).all()
    payables_30d = sum(inv.amount for inv in open_pay)

    # Attention items (top 5)
    attention_items: List[AttentionItem] = []
    item_id = 0

    # Overdue receivables first
    for inv in sorted(overdue_recv, key=lambda x: x.amount, reverse=True)[:2]:
        cp = db.query(Counterparty).get(inv.counterparty_id)
        days_overdue = (today - inv.due_date).days
        item_id += 1
        attention_items.append(AttentionItem(
            id=str(item_id),
            title=f"{cp.name if cp else 'Customer'} payment is {days_overdue} days overdue",
            amount=inv.amount,
            amount_formatted=_fmt_inr(inv.amount),
            link_text="Follow up",
            route="/invoices",
            due_label=f"Was due {inv.due_date.strftime('%-d %b')}",
            urgent=True,
            severity="high_risk",
        ))

    # Large payables due soon
    for inv in sorted(open_pay, key=lambda x: x.due_date)[:2]:
        if inv.due_date >= today:
            cp = db.query(Counterparty).get(inv.counterparty_id)
            days_until = (inv.due_date - today).days
            item_id += 1
            attention_items.append(AttentionItem(
                id=str(item_id),
                title=f"{cp.name if cp else 'Supplier'} bill due in {days_until} days",
                amount=inv.amount,
                amount_formatted=_fmt_inr(inv.amount),
                link_text="Check cash impact",
                route="/pre-transaction",
                due_label=f"Due {inv.due_date.strftime('%-d %b')}",
                urgent=days_until <= 7,
                severity="caution" if days_until > 7 else "high_risk",
            ))

    # Upcoming receivables
    upcoming_recv = sorted(
        [inv for inv in open_recv if today <= inv.due_date <= horizon_30],
        key=lambda x: x.due_date,
    )[:2]
    for inv in upcoming_recv:
        if len(attention_items) >= 5:
            break
        cp = db.query(Counterparty).get(inv.counterparty_id)
        days_until = (inv.due_date - today).days
        item_id += 1
        attention_items.append(AttentionItem(
            id=str(item_id),
            title=f"{cp.name if cp else 'Customer'} payment due in {days_until} days",
            amount=inv.amount,
            amount_formatted=_fmt_inr(inv.amount),
            link_text="Send reminder",
            route="/reminders",
            due_label=f"Due {inv.due_date.strftime('%-d %b')}",
            urgent=False,
            severity="safe",
        ))

    # Borrowing cost from late payments this quarter (assumes 12% annual interest on working capital credit line)
    quarter_start = today - timedelta(days=90)
    paid_recent = (
        db.query(Invoice)
        .filter(
            Invoice.invoice_type == "receivable",
            Invoice.paid_date != None,
            Invoice.paid_date >= quarter_start,
            Invoice.due_date != None,
        )
        .all()
    )
    total_interest_cost = 0.0
    for inv in paid_recent:
        delay = (inv.paid_date - inv.due_date).days
        if delay > 0:
            total_interest_cost += inv.amount * (delay / 365.0) * 0.12

    for inv in overdue_recv:
        days_late = (today - inv.due_date).days
        if days_late > 0:
            total_interest_cost += inv.amount * (days_late / 365.0) * 0.12

    return DashboardSummary(
        total_bank_balance=total_balance,
        total_receivables_30d=recv_30d,
        total_payables_30d=payables_30d,
        overdue_receivables=overdue_amount,
        overdue_receivables_count=len(overdue_recv),
        late_payment_borrowing_cost=round(total_interest_cost, 0),
        borrowing_rate_annual=0.12,
        attention_items=attention_items[:5],
        accounts=[BankAccountSchema.model_validate(a) for a in accounts],
    )


@router.get("/alerts", response_model=List[RiskAlertSchema])
def get_alerts(db: Session = Depends(get_db)):
    return db.query(RiskAlert).filter(
        RiskAlert.is_dismissed == False
    ).order_by(RiskAlert.created_at.desc()).all()


@router.post("/alerts/{alert_id}/dismiss")
def dismiss_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(RiskAlert).get(alert_id)
    if alert:
        alert.is_dismissed = True
        db.commit()
    return {"ok": True}


@router.post("/admin/reseed")
def reseed(db: Session = Depends(get_db)):
    """Reset and reseed the database with fresh demo data."""
    from ..forecast import invalidate_cache
    from ..seed import reset_and_reseed
    invalidate_cache()
    reset_and_reseed(db)
    return {"ok": True, "message": "Database reseeded with fresh demo data."}

