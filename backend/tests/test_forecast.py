import time
from datetime import date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models import Company, BankAccount, Counterparty, Invoice
from app.seed import run_seed
from app.forecast import forecast, runway_days, invalidate_cache


def create_test_db():
    # In-memory or file sqlite for testing
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSession()
    run_seed(db)
    yield db
    db.close()


def test_seed_data_counts(test_db):
    """Seed data has expected entities for Deccan Precision Components."""
    accounts = test_db.query(BankAccount).all()
    assert len(accounts) == 3
    total_balance = sum(a.current_balance for a in accounts)
    assert 1_800_000 <= total_balance <= 2_200_000

    customers = test_db.query(Counterparty).filter_by(party_type="customer").all()
    assert len(customers) == 12

    suppliers = test_db.query(Counterparty).filter_by(party_type="supplier").all()
    assert len(suppliers) == 8

    open_recv = test_db.query(Invoice).filter_by(invoice_type="receivable").filter(Invoice.paid_date == None).all()
    assert len(open_recv) >= 15

    open_pay = test_db.query(Invoice).filter_by(invoice_type="payable").filter(Invoice.paid_date == None).all()
    assert len(open_pay) >= 8


def test_forecast_story_probabilities(test_db):
    """Planted story: 14-day view is safe (<15% shortfall), 30-day shows high shortfall (60-85%)."""
    invalidate_cache()
    r14 = forecast(test_db, horizon_days=14, seed=42)
    assert r14.shortfall_prob_14 < 0.15, f"14-day shortfall prob was {r14.shortfall_prob_14:.1%}, expected <15%"
    assert r14.risk_level in ["safe", "caution"]

    r30 = forecast(test_db, horizon_days=30, seed=42)
    assert 0.60 <= r30.shortfall_prob_30 <= 0.85, f"30-day shortfall prob was {r30.shortfall_prob_30:.1%}, expected 60-85%"
    assert r30.risk_level == "high_risk"
    assert r30.expected_shortfall_date is not None


def test_runway_metric(test_db):
    """Runway returns number of days until median balance first dips below zero."""
    invalidate_cache()
    days = runway_days(test_db)
    assert 20 <= days <= 35, f"Runway days was {days}, expected 20-35 days"


def test_forecast_overrides_prevent_shortfall(test_db):
    """Overrides (Sai Auto paying earlier and/or Tata Steel delayed) significantly drop shortfall probability."""
    invalidate_cache()
    sai = test_db.query(Counterparty).filter_by(name="Sai Auto Parts Pvt Ltd").first()
    tata = test_db.query(Counterparty).filter_by(name="Tata Steel BSL Ltd").first()

    base = forecast(test_db, horizon_days=30, seed=42)
    with_override = forecast(
        test_db,
        horizon_days=30,
        overrides=[
            {"customer_id": sai.id, "pays_days_earlier": 15},
            {"supplier_id": tata.id, "delay_days": 10},
        ],
        seed=42,
    )
    assert with_override.shortfall_prob_30 < base.shortfall_prob_30
    assert with_override.shortfall_prob_30 < 0.20, f"Overridden shortfall was {with_override.shortfall_prob_30:.1%}"


def test_forecast_performance(test_db):
    """Forecast must respond in under 2 seconds for 2000 simulations."""
    invalidate_cache()
    t0 = time.perf_counter()
    r = forecast(test_db, horizon_days=30, seed=42)
    elapsed = time.perf_counter() - t0
    assert elapsed < 2.0, f"Forecast took {elapsed:.2f}s, expected <2.0s"
    assert r.simulation_count == 2000
    assert len(r.days) == 31
    assert len(r.p10) == 31
    assert len(r.p50) == 31
    assert len(r.p90) == 31


def test_top_drivers_identified(test_db):
    """Top 5 contributing transactions are ranked with plain English explanations."""
    invalidate_cache()
    r = forecast(test_db, horizon_days=30, seed=42)
    assert len(r.top_drivers) == 5
    for driver in r.top_drivers:
        assert "rank" in driver
        assert "amount" in driver
        assert "impact" in driver
        assert "plain_reason" in driver
        assert len(driver["plain_reason"]) > 10
