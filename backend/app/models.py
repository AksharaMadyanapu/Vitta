from datetime import datetime, date
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Date, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from .database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), default="Deccan Precision Components Pvt Ltd")
    owner_name = Column(String(255), default="Rakesh Reddy")
    location = Column(String(255), default="Hyderabad, Telangana")
    industry = Column(String(255), default="Automotive Parts Manufacturing")
    created_at = Column(DateTime, default=datetime.utcnow)


class BankAccount(Base):
    __tablename__ = "bank_accounts"

    id = Column(Integer, primary_key=True, index=True)
    account_number = Column(String(50), nullable=False)
    bank_name = Column(String(100), nullable=False)
    account_type = Column(String(50), default="Current")  # Current, Overdraft, Cash Credit
    current_balance = Column(Float, default=0.0)
    is_connected = Column(Boolean, default=True)
    last_synced_at = Column(DateTime, default=datetime.utcnow)

    transactions = relationship("Transaction", back_populates="bank_account", cascade="all, delete-orphan")


class Counterparty(Base):
    __tablename__ = "counterparties"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    party_type = Column(String(20), nullable=False, index=True)  # "customer" or "supplier"
    contact_person = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    city = Column(String(100), nullable=True)
    payment_terms_days = Column(Integer, default=30)
    # Delay profile: JSON list of historical delay days (computed from paid invoices)
    delay_profile = Column(JSON, default=list)
    avg_delay_days = Column(Float, default=0.0)
    risk_level = Column(String(20), default="safe")  # safe, caution, high_risk
    created_at = Column(DateTime, default=datetime.utcnow)

    invoices = relationship("Invoice", back_populates="counterparty", cascade="all, delete-orphan")


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String(100), unique=True, nullable=False, index=True)
    counterparty_id = Column(Integer, ForeignKey("counterparties.id"), nullable=False, index=True)
    invoice_type = Column(String(20), nullable=False, index=True)  # "receivable" or "payable"
    amount = Column(Float, nullable=False)
    issue_date = Column(Date, nullable=False, index=True)
    due_date = Column(Date, nullable=False, index=True)
    paid_date = Column(Date, nullable=True, index=True)
    status = Column(String(30), default="unpaid", index=True)  # unpaid, paid, overdue, partially_paid
    notes = Column(Text, nullable=True)
    file_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    counterparty = relationship("Counterparty", back_populates="invoices")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    bank_account_id = Column(Integer, ForeignKey("bank_accounts.id"), nullable=False, index=True)
    transaction_date = Column(Date, nullable=False, index=True)
    description = Column(String(500), nullable=False)
    amount = Column(Float, nullable=False)  # positive=credit, negative=debit
    category = Column(String(100), nullable=True, index=True)
    source = Column(String(50), default="simulated")  # manual, csv, simulated
    reference_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    bank_account = relationship("BankAccount", back_populates="transactions")


class RecurringExpense(Base):
    __tablename__ = "recurring_expenses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    amount = Column(Float, nullable=False)
    day_of_month = Column(Integer, default=1)
    category = Column(String(100), default="operational")
    is_active = Column(Boolean, default=True)


class RiskAlert(Base):
    __tablename__ = "risk_alerts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(20), default="caution")  # safe, caution, high_risk
    action_recommendation = Column(Text, nullable=True)
    target_date = Column(Date, nullable=True)
    is_dismissed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
