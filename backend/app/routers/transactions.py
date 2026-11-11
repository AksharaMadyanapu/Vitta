"""Transactions CRUD router."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..database import get_db
from ..models import Transaction, BankAccount
from ..schemas import TransactionSchema, TransactionCreate
from ..forecast import invalidate_cache

router = APIRouter(prefix="/api/transactions", tags=["transactions"])


def _enrich(txn: Transaction, db: Session) -> dict:
    acc = db.query(BankAccount).get(txn.bank_account_id)
    return {
        "id": txn.id,
        "bank_account_id": txn.bank_account_id,
        "bank_name": f"{acc.bank_name} ({acc.account_number})" if acc else None,
        "transaction_date": txn.transaction_date.isoformat(),
        "description": txn.description,
        "amount": txn.amount,
        "category": txn.category,
        "source": txn.source,
        "reference_id": txn.reference_id,
    }


@router.get("")
def list_transactions(
    limit: int = Query(50, le=200),
    offset: int = 0,
    category: Optional[str] = None,
    account_id: Optional[int] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db),
):
    from sqlalchemy.orm import joinedload
    query = db.query(Transaction).options(joinedload(Transaction.bank_account))
    if category:
        query = query.filter(Transaction.category == category)
    if account_id:
        query = query.filter(Transaction.bank_account_id == account_id)
    if q:
        query = query.filter(Transaction.description.ilike(f"%{q}%"))
    total = query.count()
    items = query.order_by(Transaction.transaction_date.desc()).offset(offset).limit(limit).all()
    return {
        "total": total,
        "items": [
            {
                "id": t.id,
                "bank_account_id": t.bank_account_id,
                "bank_name": f"{t.bank_account.bank_name} ({t.bank_account.account_number})" if t.bank_account else None,
                "transaction_date": t.transaction_date.isoformat(),
                "description": t.description,
                "amount": t.amount,
                "category": t.category,
                "source": t.source,
                "reference_id": t.reference_id,
            }
            for t in items
        ],
    }


@router.post("", status_code=201)
def create_transaction(payload: TransactionCreate, db: Session = Depends(get_db)):
    acc = db.query(BankAccount).get(payload.bank_account_id)
    if not acc:
        raise HTTPException(status_code=404, detail="Bank account not found")
    txn = Transaction(**payload.model_dump())
    db.add(txn)
    # Update account balance
    acc.current_balance += payload.amount
    db.commit()
    db.refresh(txn)
    invalidate_cache()
    return _enrich(txn, db)


@router.delete("/{txn_id}", status_code=204)
def delete_transaction(txn_id: int, db: Session = Depends(get_db)):
    txn = db.query(Transaction).get(txn_id)
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    # Reverse balance effect
    acc = db.query(BankAccount).get(txn.bank_account_id)
    if acc:
        acc.current_balance -= txn.amount
    db.delete(txn)
    db.commit()
    invalidate_cache()

