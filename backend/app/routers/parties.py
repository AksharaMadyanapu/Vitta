"""Parties (customers & suppliers) CRUD router."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Counterparty, Invoice
from ..schemas import CounterpartySchema, CounterpartyCreate, CounterpartyUpdate
from ..forecast import invalidate_cache

router = APIRouter(prefix="/api/parties", tags=["parties"])


@router.get("", response_model=List[CounterpartySchema])
def list_parties(
    party_type: Optional[str] = Query(None, description="'customer' or 'supplier'"),
    db: Session = Depends(get_db),
):
    q = db.query(Counterparty)
    if party_type:
        q = q.filter(Counterparty.party_type == party_type)
    return q.order_by(Counterparty.name).all()


@router.get("/{party_id}", response_model=CounterpartySchema)
def get_party(party_id: int, db: Session = Depends(get_db)):
    cp = db.query(Counterparty).get(party_id)
    if not cp:
        raise HTTPException(status_code=404, detail="Party not found")
    return cp


@router.post("", response_model=CounterpartySchema, status_code=201)
def create_party(payload: CounterpartyCreate, db: Session = Depends(get_db)):
    cp = Counterparty(**payload.model_dump())
    db.add(cp)
    db.commit()
    db.refresh(cp)
    return cp


@router.patch("/{party_id}", response_model=CounterpartySchema)
def update_party(party_id: int, payload: CounterpartyUpdate, db: Session = Depends(get_db)):
    cp = db.query(Counterparty).get(party_id)
    if not cp:
        raise HTTPException(status_code=404, detail="Party not found")
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(cp, k, v)
    db.commit()
    db.refresh(cp)
    return cp


@router.delete("/{party_id}", status_code=204)
def delete_party(party_id: int, db: Session = Depends(get_db)):
    cp = db.query(Counterparty).get(party_id)
    if not cp:
        raise HTTPException(status_code=404, detail="Party not found")
    db.delete(cp)
    db.commit()


@router.get("/{party_id}/invoices")
def party_invoices(party_id: int, db: Session = Depends(get_db)):
    """Return all invoices for a party, with payment delay stats."""
    cp = db.query(Counterparty).get(party_id)
    if not cp:
        raise HTTPException(status_code=404, detail="Party not found")
    invoices = db.query(Invoice).filter(Invoice.counterparty_id == party_id).order_by(Invoice.due_date.desc()).all()
    result = []
    for inv in invoices:
        delay = None
        if inv.paid_date and inv.due_date:
            delay = (inv.paid_date - inv.due_date).days
        result.append({
            "id": inv.id,
            "invoice_number": inv.invoice_number,
            "amount": inv.amount,
            "issue_date": inv.issue_date.isoformat(),
            "due_date": inv.due_date.isoformat(),
            "paid_date": inv.paid_date.isoformat() if inv.paid_date else None,
            "status": inv.status,
            "delay_days": delay,
        })
    return result

