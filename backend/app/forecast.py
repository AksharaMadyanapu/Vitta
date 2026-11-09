"""
forecast.py — Runway Monte Carlo cash-flow forecast engine.

Public API:
    forecast(db, horizon_days, as_of=None, overrides=None, extra_items=None, seed=42)
    runway_days(db, as_of=None) -> int (days until median balance first < 0, or 999 if never)

Design:
  - 2000 vectorised NumPy simulations (N=2000, T=horizon days)
  - Receivables: paid on due_date + delay sampled from customer's historical distribution
    (bootstrap; blend with global when <5 paid; small heavy-tail chance)
  - Payables: paid on due_date + small jitter ±2 days
  - Recurring expenses: detected from RecurringExpense table, projected each month
  - overrides: list of dicts e.g. {"customer_id": X, "pays_days_earlier": 10}
               or {"supplier_id": Y, "delay_days": 7}
               or {"invoice_id": Z, "paid_on_day": 5}  (day relative to as_of)
  - Caching: in-memory cache keyed on (horizon, as_of, overrides_hash), invalidated
    when any Invoice or Transaction is changed (via invalidate_cache())
  - Target: respond in <2 s for 2000 sims × 60 days
"""
from __future__ import annotations

import hashlib
import json
import time
from dataclasses import dataclass, field
from datetime import date, timedelta
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
from sqlalchemy.orm import Session

from .models import BankAccount, Counterparty, Invoice, RecurringExpense, Transaction

# ── Cache ────────────────────────────────────────────────────────────────────

_cache: Dict[str, Tuple[float, Any]] = {}  # key → (timestamp, result)
_cache_ttl = 60.0  # seconds
_cache_dirty = False


def invalidate_cache() -> None:
    global _cache, _cache_dirty
    _cache = {}
    _cache_dirty = False


def _cache_key(horizon_days: int, as_of: Optional[date], overrides, extra_items) -> str:
    payload = {
        "h": horizon_days,
        "as_of": str(as_of),
        "ov": overrides,
        "ex": extra_items,
    }
    return hashlib.md5(json.dumps(payload, sort_keys=True, default=str).encode()).hexdigest()


# ── Data structures ───────────────────────────────────────────────────────────

@dataclass
class ForecastResult:
    horizon_days: int
    as_of: date
    # Daily arrays (length = horizon_days + 1, index 0 = as_of day)
    days: List[str]            # ISO date strings
    p10: List[float]
    p50: List[float]
    p90: List[float]
    # Shortfall stats
    shortfall_prob_14: float
    shortfall_prob_30: float
    shortfall_prob_60: float
    expected_shortfall_date: Optional[str]
    expected_shortfall_amount: Optional[float]
    risk_level: str            # safe, caution, high_risk
    # Top 5 drivers
    top_drivers: List[Dict]
    # Meta
    simulation_count: int = 2000
    elapsed_ms: float = 0.0


# ── Helper: load data ─────────────────────────────────────────────────────────

def _load_data(db: Session, as_of: date):
    """Load all data needed for the simulation as of a given date."""
    # Bank balance on as_of date: sum of all transactions up to as_of
    # We use the stored current_balance if as_of == today; otherwise reconstruct.
    today = date.today()

    if as_of == today:
        total_balance = sum(a.current_balance for a in db.query(BankAccount).all())
    else:
        # Reconstruct from transactions
        all_txns = db.query(Transaction).filter(
            Transaction.transaction_date <= as_of
        ).all()
        # Start from zero and add all txns (this approximates; could be improved)
        # Actually we sum all stored current balances and subtract txns after as_of
        stored_balance = sum(a.current_balance for a in db.query(BankAccount).all())
        txns_after = db.query(Transaction).filter(
            Transaction.transaction_date > as_of
        ).all()
        total_balance = stored_balance - sum(t.amount for t in txns_after)

    # Open receivables as of as_of (unpaid/overdue with due_date that is relevant)
    open_recv = db.query(Invoice).filter(
        Invoice.invoice_type == "receivable",
        Invoice.paid_date == None,
        Invoice.status.in_(["unpaid", "overdue"]),
    ).all()
    # For backtest: only invoices that existed (issue_date <= as_of) and unpaid
    if as_of != today:
        open_recv = [inv for inv in open_recv if inv.issue_date <= as_of]

    # Open payables
    open_pay = db.query(Invoice).filter(
        Invoice.invoice_type == "payable",
        Invoice.paid_date == None,
        Invoice.status.in_(["unpaid", "overdue"]),
    ).all()
    if as_of != today:
        open_pay = [inv for inv in open_pay if inv.issue_date <= as_of]

    # Recurring expenses
    recurring = db.query(RecurringExpense).filter(
        RecurringExpense.is_active == True
    ).all()

    # Historical delays per customer
    customers = {cp.id: cp for cp in db.query(Counterparty).filter(
        Counterparty.party_type == "customer"
    ).all()}

    # Compute global delay distribution from all historical paid receivables
    paid_recv = db.query(Invoice).filter(
        Invoice.invoice_type == "receivable",
        Invoice.paid_date != None,
        Invoice.due_date != None,
    ).all()
    global_delays = []
    for inv in paid_recv:
        d = (inv.paid_date - inv.due_date).days
        global_delays.append(max(0, d))
    if not global_delays:
        global_delays = [5, 10, 15, 20]

    return total_balance, open_recv, open_pay, recurring, customers, global_delays


def _get_customer_delay_distribution(customer: Counterparty, global_delays: List[int]) -> List[int]:
    """Blend customer's own delays with global when <5 paid invoices."""
    own = [max(0, d) for d in (customer.delay_profile or [])]
    if len(own) >= 5:
        # Add occasional heavy-tail outlier (5% chance of very late)
        return own
    # Blend: weight customer 40%, global 60% when few samples
    n_own = len(own)
    n_global = max(len(global_delays), 1)
    weight_own = 0.4 if n_own > 0 else 0.0
    weight_global = 1.0 - weight_own
    blended = own * max(1, int(10 * weight_own)) + \
              list(np.random.choice(global_delays, size=max(1, int(10 * weight_global))))
    return blended if blended else global_delays


# ── Core simulation ───────────────────────────────────────────────────────────

def _run_simulation(
    total_balance: float,
    open_recv: List[Invoice],
    open_pay: List[Invoice],
    recurring: List[Any],
    customers: Dict,
    global_delays: List[int],
    as_of: date,
    horizon_days: int,
    overrides: Optional[List[Dict]],
    extra_items: Optional[List[Dict]],
    seed: int,
    N: int = 2000,
) -> np.ndarray:
    """
    Run N simulations. Returns balance_matrix of shape (N, horizon_days+1).
    Column 0 = as_of balance.
    """
    rng = np.random.default_rng(seed)
    T = horizon_days

    # Parse overrides
    cust_override: Dict[int, Dict] = {}
    inv_override: Dict[int, Dict] = {}
    if overrides:
        for ov in overrides:
            if "customer_id" in ov:
                cust_override[ov["customer_id"]] = ov
            if "invoice_id" in ov:
                inv_override[ov["invoice_id"]] = ov
            if "supplier_id" in ov:
                # Treat as supplier — shift their payable due dates
                pass

    # Build daily cash-flow arrays: shape (N, T+1)
    # We'll accumulate day-by-day flows
    flows = np.zeros((N, T + 1))

    # Day 0: starting balance
    # (handled by cumsum later)

    # ── Receivables ──────────────────────────────────────────────────────────
    for inv in open_recv:
        cp_id = inv.counterparty_id
        customer = customers.get(cp_id)

        # Determine base delay distribution
        if customer:
            delay_dist = _get_customer_delay_distribution(customer, global_delays)
        else:
            delay_dist = global_delays

        # Apply override
        shift = 0
        if cp_id in cust_override:
            ov = cust_override[cp_id]
            if "pays_days_earlier" in ov:
                shift = -int(ov["pays_days_earlier"])
            elif "delay_days" in ov:
                shift = int(ov["delay_days"])
        if inv.id in inv_override:
            ov = inv_override[inv.id]
            if "paid_on_day" in ov:
                # Override to a specific day relative to as_of
                day_idx = int(ov["paid_on_day"])
                day_idx = max(0, min(T, day_idx))
                flows[:, day_idx] += inv.amount
                continue

        # Sample delays for all N sims
        base_days_until_due = (inv.due_date - as_of).days

        if delay_dist:
            sampled_delays = rng.choice(delay_dist, size=N).astype(float)
        else:
            sampled_delays = rng.exponential(scale=10, size=N)

        # Add heavy-tail: 5% chance of an extra 20-40 day delay
        heavy_tail_mask = rng.random(N) < 0.05
        sampled_delays[heavy_tail_mask] += rng.uniform(20, 40, size=heavy_tail_mask.sum())

        sampled_payment_days = base_days_until_due + sampled_delays + shift

        # If sampled date is in the past or today, but invoice is still open:
        # they didn't pay in the past, so payment is deferred into the future
        past_mask = sampled_payment_days <= 0
        if np.any(past_mask):
            sampled_payment_days[past_mask] = rng.integers(3, 20, size=past_mask.sum())

        payment_days = np.round(sampled_payment_days).astype(int)

        # Cap at horizon; payments after horizon are not counted
        for sim_i in range(N):
            day_idx = int(payment_days[sim_i])
            if 0 <= day_idx <= T:
                flows[sim_i, day_idx] += inv.amount

    # ── Payables ─────────────────────────────────────────────────────────────
    for inv in open_pay:
        base_days = (inv.due_date - as_of).days
        # Small jitter ±2 days
        jitter = rng.integers(-2, 3, size=N)

        # Apply supplier override
        sup_shift = 0
        if overrides:
            for ov in overrides:
                if ov.get("supplier_id") == inv.counterparty_id and "delay_days" in ov:
                    sup_shift = int(ov["delay_days"])

        payment_days = np.clip(base_days + jitter + sup_shift, 0, None)
        for sim_i in range(N):
            day_idx = int(payment_days[sim_i])
            if 0 <= day_idx <= T:
                flows[sim_i, day_idx] -= inv.amount

    # ── Recurring expenses ────────────────────────────────────────────────────
    for exp in recurring:
        # Project each upcoming payment within the horizon (future dates only)
        for month_offset in range(4):  # check up to 4 future months
            target_month = as_of.month + month_offset
            target_year = as_of.year + (target_month - 1) // 12
            target_month = ((target_month - 1) % 12) + 1
            pay_date = date(target_year, target_month, min(exp.day_of_month, 28))
            day_idx = (pay_date - as_of).days
            # Only include strictly future payments (day >= 1) within the horizon
            if 1 <= day_idx <= T:
                variance = rng.normal(loc=0, scale=exp.amount * 0.02, size=N)
                flows[:, day_idx] -= (exp.amount + variance)

    # ── Extra hypothetical items (for pre-transaction check) ─────────────────
    if extra_items:
        for item in extra_items:
            day_idx = int(item.get("day", 0))
            amt = float(item.get("amount", 0))
            day_idx = max(0, min(T, day_idx))
            flows[:, day_idx] += amt  # positive=inflow, negative=outflow

    # ── Compute cumulative balance ────────────────────────────────────────────
    # Prepend starting balance on day 0 and cumsum
    balance_matrix = np.cumsum(flows, axis=1) + total_balance

    return balance_matrix


# ── Top driver identification ─────────────────────────────────────────────────

def _identify_top_drivers(
    db: Session,
    total_balance: float,
    open_recv: List[Invoice],
    open_pay: List[Invoice],
    recurring: List[Any],
    customers: Dict,
    global_delays: List[int],
    as_of: date,
    horizon_days: int,
    base_p50: np.ndarray,
    seed: int,
) -> List[Dict]:
    """
    Counterfactual: for each major item, run a sim assuming that item is removed.
    The drop in median balance shows its impact.
    """
    drivers = []

    # Identify candidate items (top by amount)
    candidates = []
    for inv in open_recv:
        if inv.amount >= 100_000:
            candidates.append(("receivable", inv))
    for inv in open_pay:
        if inv.amount >= 50_000:
            candidates.append(("payable", inv))

    # Sort by amount
    candidates.sort(key=lambda x: x[1].amount, reverse=True)
    candidates = candidates[:8]  # check top 8

    for ctype, inv in candidates:
        # Remove this item and re-run
        if ctype == "receivable":
            new_recv = [r for r in open_recv if r.id != inv.id]
            new_pay = open_pay
        else:
            new_recv = open_recv
            new_pay = [p for p in open_pay if p.id != inv.id]

        bal = _run_simulation(
            total_balance, new_recv, new_pay, recurring,
            customers, global_delays, as_of, horizon_days,
            None, None, seed=seed + 999, N=200,  # fewer sims for speed
        )
        p50_without = np.percentile(bal, 50, axis=0)

        # Impact = how much worse the balance is without this item
        # For receivable: removing it makes balance lower → impact is positive (it's a good thing)
        # For payable: removing it makes balance higher → its presence is a risk
        if ctype == "receivable":
            # Its absence makes things worse → it's important income
            impact = float(np.min(base_p50) - np.min(p50_without))
            reason = _receivable_reason(inv, customers)
        else:
            # Its presence drains cash
            impact = float(np.min(p50_without) - np.min(base_p50))
            reason = _payable_reason(inv, db)

        drivers.append({
            "invoice_id": inv.id,
            "invoice_number": inv.invoice_number,
            "type": ctype,
            "amount": inv.amount,
            "due_date": inv.due_date.isoformat(),
            "counterparty_id": inv.counterparty_id,
            "impact": abs(impact),
            "plain_reason": reason,
        })

    # Also add top recurring expenses
    rec_sorted = sorted(recurring, key=lambda r: r.amount, reverse=True)
    for exp in rec_sorted[:2]:
        drivers.append({
            "invoice_id": None,
            "invoice_number": None,
            "type": "recurring",
            "amount": exp.amount,
            "due_date": None,
            "counterparty_id": None,
            "impact": exp.amount * 0.5,
            "plain_reason": f"{exp.name} of ₹{exp.amount:,.0f} hits each month on day {exp.day_of_month}.",
        })

    # Sort by impact and return top 5
    drivers.sort(key=lambda d: d["impact"], reverse=True)
    for i, d in enumerate(drivers[:5]):
        d["rank"] = i + 1
    return drivers[:5]


def _receivable_reason(inv: Invoice, customers: Dict) -> str:
    cp = customers.get(inv.counterparty_id)
    name = cp.name if cp else "Unknown customer"
    avg_d = int(cp.avg_delay_days) if cp else 0
    if avg_d > 20:
        return (
            f"{name} owes ₹{inv.amount:,.0f} (due {inv.due_date}). "
            f"This customer pays on average {avg_d} days late — expect payment around "
            f"{inv.due_date + timedelta(days=avg_d)}. If delayed further, cash shortage risk rises sharply."
        )
    elif avg_d > 7:
        return (
            f"{name} owes ₹{inv.amount:,.0f} (due {inv.due_date}). "
            f"Usually pays {avg_d} days late, so expected receipt around "
            f"{inv.due_date + timedelta(days=avg_d)}."
        )
    else:
        return (
            f"{name} owes ₹{inv.amount:,.0f} due {inv.due_date}. "
            f"This customer is reliable; a delay would still improve your cash position significantly."
        )


def _payable_reason(inv: Invoice, db: Session) -> str:
    cp = db.query(Counterparty).get(inv.counterparty_id)
    name = cp.name if cp else "Supplier"
    return (
        f"₹{inv.amount:,.0f} is due to {name} on {inv.due_date}. "
        f"This outflow is the {"largest" if inv.amount > 500_000 else "significant"} single payment in the forecast window."
    )


# ── Public API ────────────────────────────────────────────────────────────────

def forecast(
    db: Session,
    horizon_days: int = 30,
    as_of: Optional[date] = None,
    overrides: Optional[List[Dict]] = None,
    extra_items: Optional[List[Dict]] = None,
    seed: int = 42,
) -> ForecastResult:
    """
    Run the Monte Carlo cash-flow forecast.

    Parameters
    ----------
    db           : SQLAlchemy session
    horizon_days : forecast window (14, 30, or 60)
    as_of        : simulate from this date (default: today)
    overrides    : list of override dicts — see module docstring
    extra_items  : list of extra cash-flow items (for pre-transaction check)
                   e.g. [{"day": 5, "amount": -500000, "label": "Machine purchase"}]
    seed         : random seed for reproducibility

    Returns
    -------
    ForecastResult
    """
    if as_of is None:
        as_of = date.today()

    # Cache key
    ckey = _cache_key(horizon_days, as_of, overrides, extra_items)
    if ckey in _cache:
        ts, cached = _cache[ckey]
        if time.time() - ts < _cache_ttl:
            return cached

    t0 = time.perf_counter()

    total_balance, open_recv, open_pay, recurring, customers, global_delays = _load_data(db, as_of)

    N = 2000
    balance_matrix = _run_simulation(
        total_balance, open_recv, open_pay, recurring,
        customers, global_delays, as_of, horizon_days,
        overrides, extra_items, seed=seed, N=N,
    )

    # Percentiles
    p10 = np.percentile(balance_matrix, 10, axis=0)
    p50 = np.percentile(balance_matrix, 50, axis=0)
    p90 = np.percentile(balance_matrix, 90, axis=0)

    # Shortfall probability: fraction of sims that ever go below 0
    def _shortfall_prob(h: int) -> float:
        h = min(h, horizon_days)
        mat = balance_matrix[:, : h + 1]
        below = np.any(mat < 0, axis=1)
        return float(below.mean())

    sp14 = _shortfall_prob(14)
    sp30 = _shortfall_prob(30)
    sp60 = _shortfall_prob(60)

    # Expected shortfall date: first day where p50 < 0
    shortfall_date = None
    shortfall_amount = None
    for i, bal in enumerate(p50):
        if bal < 0:
            shortfall_date = (as_of + timedelta(days=i)).isoformat()
            shortfall_amount = float(bal)
            break

    # Also estimate from simulations: median first-negative day
    first_neg = []
    for sim_row in balance_matrix:
        neg_days = np.where(sim_row < 0)[0]
        if len(neg_days) > 0:
            first_neg.append(neg_days[0])
    if first_neg and shortfall_date is None:
        median_day = int(np.median(first_neg))
        shortfall_date = (as_of + timedelta(days=median_day)).isoformat()
        shortfall_amount = float(np.percentile(balance_matrix[:, median_day], 50))

    # Risk level
    shortfall_prob = sp30  # use 30-day for overall risk
    if shortfall_prob > 0.5:
        risk_level = "high_risk"
    elif shortfall_prob > 0.2:
        risk_level = "caution"
    else:
        risk_level = "safe"

    # Day labels
    days = [(as_of + timedelta(days=i)).isoformat() for i in range(horizon_days + 1)]

    # Top drivers (run counterfactual)
    top_drivers = _identify_top_drivers(
        db, total_balance, open_recv, open_pay, recurring,
        customers, global_delays, as_of, horizon_days, p50, seed=seed,
    )

    elapsed_ms = (time.perf_counter() - t0) * 1000

    result = ForecastResult(
        horizon_days=horizon_days,
        as_of=as_of,
        days=days,
        p10=[float(v) for v in p10],
        p50=[float(v) for v in p50],
        p90=[float(v) for v in p90],
        shortfall_prob_14=sp14,
        shortfall_prob_30=sp30,
        shortfall_prob_60=sp60,
        expected_shortfall_date=shortfall_date,
        expected_shortfall_amount=shortfall_amount,
        risk_level=risk_level,
        top_drivers=top_drivers,
        simulation_count=N,
        elapsed_ms=elapsed_ms,
    )

    _cache[ckey] = (time.time(), result)
    return result


def runway_days(db: Session, as_of: Optional[date] = None) -> int:
    """
    Compute days of runway = days until median balance first goes negative.
    Returns 999 if balance stays positive for 60+ days.
    """
    if as_of is None:
        as_of = date.today()

    res = forecast(db, horizon_days=60, as_of=as_of)
    for i, bal in enumerate(res.p50):
        if bal < 0:
            return i
    return 999
