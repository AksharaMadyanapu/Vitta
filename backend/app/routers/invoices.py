"""Invoices CRUD router."""
from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Invoice, Counterparty
from ..schemas import InvoiceSchema, InvoiceCreate, InvoiceUpdate
from ..forecast import invalidate_cache

router = APIRouter(prefix="/api/invoices", tags=["invoices"])


def _enrich(inv: Invoice, db: Session) -> dict:
    cp = db.query(Counterparty).get(inv.counterparty_id)
    return {
        "id": inv.id,
        "invoice_number": inv.invoice_number,
        "counterparty_id": inv.counterparty_id,
        "counterparty_name": cp.name if cp else None,
        "invoice_type": inv.invoice_type,
        "amount": inv.amount,
        "issue_date": inv.issue_date.isoformat(),
        "due_date": inv.due_date.isoformat(),
        "paid_date": inv.paid_date.isoformat() if inv.paid_date else None,
        "status": inv.status,
        "notes": inv.notes,
    }


@router.get("")
def list_invoices(
    invoice_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
    offset: int = 0,
    db: Session = Depends(get_db),
):
    q = db.query(Invoice)
    if invoice_type:
        q = q.filter(Invoice.invoice_type == invoice_type)
    if status:
        q = q.filter(Invoice.status == status)
    total = q.count()
    invoices = q.order_by(Invoice.due_date.desc()).offset(offset).limit(limit).all()
    return {
        "total": total,
        "items": [_enrich(inv, db) for inv in invoices],
    }


@router.get("/open")
def list_open_invoices(db: Session = Depends(get_db)):
    """Return all open (unpaid/overdue) invoices."""
    invoices = db.query(Invoice).filter(
        Invoice.status.in_(["unpaid", "overdue", "partially_paid"]),
        Invoice.paid_date == None,
    ).order_by(Invoice.due_date).all()
    return [_enrich(inv, db) for inv in invoices]


@router.get("/{invoice_id}")
def get_invoice(invoice_id: int, db: Session = Depends(get_db)):
    inv = db.query(Invoice).get(invoice_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return _enrich(inv, db)


@router.post("", status_code=201)
def create_invoice(payload: InvoiceCreate, db: Session = Depends(get_db)):
    # Validate counterparty exists
    cp = db.query(Counterparty).get(payload.counterparty_id)
    if not cp:
        raise HTTPException(status_code=404, detail="Counterparty not found")
    today = date.today()
    status = "overdue" if payload.due_date < today else "unpaid"
    inv = Invoice(**payload.model_dump(), status=status)
    db.add(inv)
    db.commit()
    db.refresh(inv)
    invalidate_cache()
    return _enrich(inv, db)


@router.patch("/{invoice_id}")
def update_invoice(invoice_id: int, payload: InvoiceUpdate, db: Session = Depends(get_db)):
    inv = db.query(Invoice).get(invoice_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    updates = payload.model_dump(exclude_none=True)
    for k, v in updates.items():
        setattr(inv, k, v)
    # Auto-compute status
    if inv.paid_date:
        inv.status = "paid"
    elif inv.due_date < date.today():
        inv.status = "overdue"
    db.commit()
    db.refresh(inv)
    invalidate_cache()
    return _enrich(inv, db)


@router.delete("/{invoice_id}", status_code=204)
def delete_invoice(invoice_id: int, db: Session = Depends(get_db)):
    inv = db.query(Invoice).get(invoice_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    db.delete(inv)
    db.commit()
    invalidate_cache()


@router.post("/{invoice_id}/mark-paid")
def mark_paid(invoice_id: int, paid_date: Optional[date] = None, db: Session = Depends(get_db)):
    inv = db.query(Invoice).get(invoice_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    inv.paid_date = paid_date or date.today()
    inv.status = "paid"
    # Update customer delay profile
    cp = db.query(Counterparty).get(inv.counterparty_id)
    if cp and inv.invoice_type == "receivable" and inv.due_date:
        delay = max(0, (inv.paid_date - inv.due_date).days)
        profile = list(cp.delay_profile or [])
        profile.append(delay)
        cp.delay_profile = profile[-20:]  # keep last 20
        cp.avg_delay_days = sum(profile) / len(profile)
    db.commit()
    invalidate_cache()
    return _enrich(inv, db)

