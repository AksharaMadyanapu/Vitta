"""Accounts CRUD router."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import BankAccount
from ..schemas import BankAccountSchema, BankAccountCreate

router = APIRouter(prefix="/api/accounts", tags=["accounts"])


@router.get("", response_model=List[BankAccountSchema])
def list_accounts(db: Session = Depends(get_db)):
    return db.query(BankAccount).all()


@router.get("/total-balance")
def total_balance(db: Session = Depends(get_db)):
    accounts = db.query(BankAccount).all()
    total = sum(a.current_balance for a in accounts)
    return {
        "total": total,
        "accounts": [
            {"id": a.id, "name": f"{a.bank_name} ({a.account_number})", "balance": a.current_balance}
            for a in accounts
        ],
    }


@router.get("/{account_id}", response_model=BankAccountSchema)
def get_account(account_id: int, db: Session = Depends(get_db)):
    acc = db.query(BankAccount).get(account_id)
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    return acc


@router.post("", response_model=BankAccountSchema, status_code=201)
def create_account(payload: BankAccountCreate, db: Session = Depends(get_db)):
    acc = BankAccount(**payload.model_dump())
    db.add(acc)
    db.commit()
    db.refresh(acc)
    return acc


@router.delete("/{account_id}", status_code=204)
def delete_account(account_id: int, db: Session = Depends(get_db)):
    acc = db.query(BankAccount).get(account_id)
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    db.delete(acc)
    db.commit()

