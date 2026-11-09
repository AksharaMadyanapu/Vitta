"""
Seed script for Deccan Precision Components Pvt Ltd.

Planted story:
- Sai Auto Parts (customer id=11): owes ~₹9L, chronically 25-35 days late
- Tata Steel BSL (supplier id=4): ₹7.5L steel payment due ~25 days from now
- Payroll: ₹4.2L due ~27 days from now — same week as steel payment
  → 30-day forecast: ~75% shortfall probability
  → 14-day forecast: ~8% (looks safe)
- Past cash crunch: ~5 weeks ago (around Oct 1-5), detectable 21 days prior
"""
import random
from datetime import date, timedelta
from sqlalchemy.orm import Session
from .models import (
    Company, BankAccount, Counterparty, Invoice, Transaction, RecurringExpense, RiskAlert
)

TODAY = date.today()


def _d(offset_days: int) -> date:
    return TODAY + timedelta(days=offset_days)


def already_seeded(db: Session) -> bool:
    return db.query(Company).count() > 0


def run_seed(db: Session) -> None:
    if already_seeded(db):
        return
    _seed_all(db)


def reset_and_reseed(db: Session) -> None:
    """Drop all data and reseed. Called by /api/admin/reseed."""
    # Order matters for FK constraints
    db.query(Transaction).delete()
    db.query(Invoice).delete()
    db.query(Counterparty).delete()
    db.query(BankAccount).delete()
    db.query(RecurringExpense).delete()
    db.query(RiskAlert).delete()
    db.query(Company).delete()
    db.commit()
    _seed_all(db)


def _seed_all(db: Session) -> None:
    rng = random.Random(42)  # deterministic seed

    # ── Company ────────────────────────────────────────────────────────────────
    company = Company(
        name="Deccan Precision Components Pvt Ltd",
        owner_name="Rakesh Reddy",
        location="Hyderabad, Telangana",
        industry="Automotive Parts Manufacturing",
    )
    db.add(company)
    db.flush()

    # ── Bank Accounts ──────────────────────────────────────────────────────────
    # Total ~₹19.8L
    hdfc = BankAccount(
        account_number="HDFC-9481",
        bank_name="HDFC Bank",
        account_type="Current",
        current_balance=1_185_200,  # ₹11.85L
    )
    sbi = BankAccount(
        account_number="SBI-3302",
        bank_name="State Bank of India",
        account_type="Current",
        current_balance=580_000,    # ₹5.8L
    )
    icici = BankAccount(
        account_number="ICICI-7714",
        bank_name="ICICI Bank",
        account_type="Cash Credit",
        current_balance=80_000,     # ₹0.8L
    )
    db.add_all([hdfc, sbi, icici])
    db.flush()

    # Total = ₹18,45,200 (₹18.5L in bank)

    # ── Counterparties ─────────────────────────────────────────────────────────
    # 12 customers: 4 reliable, 4 slightly late, 3 chronically late, 1 new
    customers_data = [
        # Reliable (avg delay 0-5 days)
        ("Sundaram Fasteners Ltd",         "customer", "Anand Natarajan",   "Chennai",      45, [0,2,1,3,0,2,1,0],  "safe"),
        ("Bosch Automotive India Pvt Ltd", "customer", "Priya Krishnan",    "Bengaluru",    30, [0,0,1,2,0,1,0,0],  "safe"),
        ("Motherson Sumi Systems",         "customer", "Rajiv Mehta",       "Noida",        30, [3,2,4,1,0,2,3,1],  "safe"),
        ("Minda Industries Ltd",           "customer", "Suresh Kapoor",     "Pune",         45, [1,0,2,0,3,1,2,0],  "safe"),
        # Slightly late (avg 7-15 days)
        ("Kalyani Powertrain Ltd",         "customer", "Vijay Kulkarni",    "Pune",         45, [10,14,8,12,9,15,11,7], "caution"),
        ("Varroc Engineering Components",  "customer", "Deepak Verma",      "Aurangabad",   30, [7,12,8,5,10,9,13,6],  "caution"),
        ("Endurance Technologies Ltd",     "customer", "Ritesh Shah",       "Aurangabad",   30, [5,8,12,7,9,6,11,8],   "caution"),
        ("Mahindra CIE Automotive",        "customer", "Arun Sharma",       "Pune",         30, [9,11,7,13,8,10,6,12], "caution"),
        # Chronically late (avg 20-40 days) — 3
        ("Sai Auto Parts Pvt Ltd",         "customer", "Srinivas Reddy",    "Hyderabad",    30, [38,44,35,46,40,50,42,45], "high_risk"),  # KEY STORY customer
        ("Precision Stampings Ltd",        "customer", "Mohan Das",         "Coimbatore",   30, [25,30,22,28,32,24,29,26], "high_risk"),
        ("Bharat Forge Ancillaries",       "customer", "Pradeep Jain",      "Pune",         30, [26,32,28,25,24,30,34,27], "high_risk"),
        # New (no history)
        ("Ashok Leyland Vendors",          "customer", "Meena Pillai",      "Chennai",      30, [],                        "safe"),
    ]

    customer_objs = []
    for name, ptype, contact, city, terms, delays, risk in customers_data:
        avg_d = sum(delays) / len(delays) if delays else 0.0
        cp = Counterparty(
            name=name, party_type=ptype, contact_person=contact, city=city,
            payment_terms_days=terms, delay_profile=delays,
            avg_delay_days=avg_d, risk_level=risk,
            email=f"{contact.split()[0].lower()}@{name.split()[0].lower()}.in",
            phone=f"+91 9{rng.randint(100000000, 999999999)}",
        )
        db.add(cp)
        customer_objs.append(cp)

    # 8 suppliers
    suppliers_data = [
        ("Tata Steel BSL Ltd",          "supplier", "Rajan Pillai",    "Mumbai",   30, "high_risk"),  # KEY story supplier
        ("Hindalco Industries",          "supplier", "Ashish Gupta",    "Mumbai",   30, "caution"),
        ("Sandvik Coromant India",       "supplier", "Lars Nielsen",    "Pune",     45, "safe"),
        ("Mahindra Logistics",           "supplier", "Kiran Desai",     "Mumbai",   15, "safe"),
        ("CEAT Tyres",                   "supplier", "Ramesh Nair",     "Mumbai",   30, "safe"),
        ("Siemens Industry India",       "supplier", "Thomas Kuhn",     "Mumbai",   45, "caution"),
        ("Godrej & Boyce Mfg",          "supplier", "Farida Irani",    "Mumbai",   30, "safe"),
        ("BHEL Hyderabad",               "supplier", "Subramaniam K",   "Hyderabad",30, "safe"),
    ]

    supplier_objs = []
    for name, ptype, contact, city, terms, risk in suppliers_data:
        cp = Counterparty(
            name=name, party_type=ptype, contact_person=contact, city=city,
            payment_terms_days=terms, delay_profile=[],
            avg_delay_days=0.0, risk_level=risk,
            email=f"{contact.split()[0].lower()}@{name.split()[0].lower()}.in",
            phone=f"+91 9{rng.randint(100000000, 999999999)}",
        )
        db.add(cp)
        supplier_objs.append(cp)

    db.flush()

    # ── Historical Invoices (past 6 months, paid) ─────────────────────────────
    tata_steel = supplier_objs[0]
    sai_auto = customer_objs[8]  # chronically late key customer

    inv_counter = [1]

    def next_inv(prefix="INV"):
        n = inv_counter[0]
        inv_counter[0] += 1
        return f"{prefix}-2026-{n:04d}"

    # Generate ~6 months of paid receivable history for each customer
    past_invoices = []
    for i, cust in enumerate(customer_objs[:-1]):  # skip new customer
        delays = cust.delay_profile or []
        for month_offset in range(6, 0, -1):
            issue = _d(-month_offset * 30 - rng.randint(0, 10))
            due = issue + timedelta(days=cust.payment_terms_days)
            # Actual paid = due + sampled delay
            if delays:
                delay = rng.choice(delays) + rng.randint(-3, 3)
                delay = max(0, delay)
            else:
                delay = rng.randint(0, 5)
            paid = due + timedelta(days=delay)
            # Vary amount by customer segment
            base = [480_000, 620_000, 540_000, 390_000,
                    720_000, 580_000, 460_000, 650_000,
                    900_000, 420_000, 510_000][i]
            amt = base * (1 + rng.uniform(-0.15, 0.20))
            inv = Invoice(
                invoice_number=next_inv("INV"),
                counterparty_id=cust.id,
                invoice_type="receivable",
                amount=round(amt, -2),
                issue_date=issue,
                due_date=due,
                paid_date=paid,
                status="paid",
            )
            past_invoices.append(inv)

    # Generate ~6 months of paid payable history for each supplier
    for j, sup in enumerate(supplier_objs):
        for month_offset in range(6, 0, -1):
            issue = _d(-month_offset * 30 - rng.randint(0, 5))
            due = issue + timedelta(days=sup.payment_terms_days)
            paid = due + timedelta(days=rng.randint(-2, 2))  # payables paid near due date
            base_amts = [600_000, 350_000, 180_000, 90_000,
                         70_000,  220_000, 140_000, 110_000]
            amt = base_amts[j] * (1 + rng.uniform(-0.10, 0.15))
            inv = Invoice(
                invoice_number=next_inv("PO"),
                counterparty_id=sup.id,
                invoice_type="payable",
                amount=round(amt, -2),
                issue_date=issue,
                due_date=due,
                paid_date=paid,
                status="paid",
            )
            past_invoices.append(inv)

    db.add_all(past_invoices)
    db.flush()

    # ── OPEN RECEIVABLES (18) ──────────────────────────────────────────────────
    open_receivables = [
        # KEY STORY: Sai Auto Parts owes ₹9L, overdue 15 days, avg delay 30d
        # → Most sims have them paying day 15–45 (p50 around day 30, right at crunch)
        ("INV-2026-0491", sai_auto.id,          "receivable", 900_000, _d(-15), _d(-15), None, "overdue"),
        # Sundaram — reliable, due in 5 days → comes in on day 5-7
        ("INV-2026-0492", customer_objs[0].id,  "receivable", 320_000, _d(-10), _d(5),  None, "unpaid"),
        # Bosch — reliable, due in 32 days (just past the 30-day crunch window)
        ("INV-2026-0493", customer_objs[1].id,  "receivable", 480_000, _d(-5),  _d(32), None, "unpaid"),
        # Motherson — due in 38 days
        ("INV-2026-0494", customer_objs[2].id,  "receivable", 390_000, _d(-2),  _d(38), None, "unpaid"),
        # Minda — due in 45 days
        ("INV-2026-0495", customer_objs[3].id,  "receivable", 540_000, _d(0),   _d(45), None, "unpaid"),
        # Kalyani — due in 8 days (avg delay 11 → p50 arrival day 19 — just before crunch)
        ("INV-2026-0496", customer_objs[4].id,  "receivable", 480_000, _d(-7),  _d(8),  None, "unpaid"),
        # Varroc — due in 20 days (avg delay 10 → p50 arrival day 30)
        ("INV-2026-0497", customer_objs[5].id,  "receivable", 350_000, _d(-5),  _d(20), None, "unpaid"),
        # Endurance — due in 35 days (outside the 30d window)
        ("INV-2026-0498", customer_objs[6].id,  "receivable", 360_000, _d(-3),  _d(35), None, "unpaid"),
        # Mahindra CIE — due in 40 days
        ("INV-2026-0499", customer_objs[7].id,  "receivable", 520_000, _d(-2),  _d(40), None, "unpaid"),
        # Precision Stampings — due in 36 days
        ("INV-2026-0500", customer_objs[9].id,  "receivable", 420_000, _d(-5),  _d(36), None, "unpaid"),
        # Bharat Forge — due in 38 days
        ("INV-2026-0501", customer_objs[10].id, "receivable", 380_000, _d(-2),  _d(38), None, "unpaid"),
        # Ashok Leyland (new customer) — first invoice, due in 50 days
        ("INV-2026-0502", customer_objs[11].id, "receivable", 320_000, _d(0),   _d(50), None, "unpaid"),
        # Second batch — further out, won't save the crunch
        ("INV-2026-0503", customer_objs[0].id,  "receivable", 310_000, _d(-2),  _d(42), None, "unpaid"),
        ("INV-2026-0504", customer_objs[1].id,  "receivable", 280_000, _d(-1),  _d(48), None, "unpaid"),
        ("INV-2026-0505", customer_objs[4].id,  "receivable", 480_000, _d(-3),  _d(37), None, "unpaid"),
        ("INV-2026-0506", customer_objs[5].id,  "receivable", 390_000, _d(-2),  _d(43), None, "unpaid"),
        ("INV-2026-0507", customer_objs[2].id,  "receivable", 560_000, _d(0),   _d(55), None, "unpaid"),
        # Second Sai Auto invoice — due in 10 days, avg delay 30 → expected day 40 (outside window)
        ("INV-2026-0508", sai_auto.id,          "receivable", 450_000, _d(-5),  _d(10), None, "unpaid"),
    ]

    for inv_no, cp_id, itype, amt, issue, due, paid, status in open_receivables:
        db.add(Invoice(
            invoice_number=inv_no,
            counterparty_id=cp_id,
            invoice_type=itype,
            amount=amt,
            issue_date=issue,
            due_date=due,
            paid_date=paid,
            status=status,
        ))

    # ── OPEN PAYABLES (10) ────────────────────────────────────────────────────
    # KEY STORY: Tata Steel ₹7.5L due in 25 days
    open_payables = [
        ("PO-TS-2026-901",  tata_steel.id,       "payable", 750_000, _d(-5), _d(25), None, "unpaid"),  # KEY
        ("PO-HIN-2026-902", supplier_objs[1].id,  "payable", 350_000, _d(-10),_d(5),  None, "unpaid"),
        ("PO-SAN-2026-903", supplier_objs[2].id,  "payable", 185_000, _d(-8), _d(12), None, "unpaid"),
        ("PO-MAH-2026-904", supplier_objs[3].id,  "payable", 95_000,  _d(-2), _d(13), None, "unpaid"),
        ("PO-CEA-2026-905", supplier_objs[4].id,  "payable", 72_000,  _d(-3), _d(17), None, "unpaid"),
        ("PO-SIE-2026-906", supplier_objs[5].id,  "payable", 225_000, _d(-15),_d(0),  None, "unpaid"),  # due today
        ("PO-GOD-2026-907", supplier_objs[6].id,  "payable", 145_000, _d(-5), _d(10), None, "unpaid"),
        ("PO-BHE-2026-908", supplier_objs[7].id,  "payable", 115_000, _d(-3), _d(22), None, "unpaid"),
        ("PO-TS-2026-909",  tata_steel.id,        "payable", 480_000, _d(-2), _d(40), None, "unpaid"),  # Tata future order
        ("PO-HIN-2026-910", supplier_objs[1].id,  "payable", 270_000, _d(0),  _d(35), None, "unpaid"),
    ]

    for inv_no, cp_id, itype, amt, issue, due, paid, status in open_payables:
        db.add(Invoice(
            invoice_number=inv_no,
            counterparty_id=cp_id,
            invoice_type=itype,
            amount=amt,
            issue_date=issue,
            due_date=due,
            paid_date=paid,
            status=status,
        ))

    db.flush()

    # ── Recurring Expenses ─────────────────────────────────────────────────────
    # KEY STORY: Payroll ₹5.2L due on 1st of month (falls in same week as Tata Steel)
    recurring = [
        RecurringExpense(name="Staff salaries and factory wages", amount=520_000, day_of_month=1,  category="payroll"),
        RecurringExpense(name="Factory shed rent",                amount=85_000,  day_of_month=5,  category="rent"),
        RecurringExpense(name="Electricity and power (TSECL)",    amount=65_000,  day_of_month=10, category="utilities"),
        RecurringExpense(name="GST liability (net)",              amount=380_000, day_of_month=20, category="tax"),
        RecurringExpense(name="Machinery loan EMI (HDFC)",        amount=95_000,  day_of_month=28, category="loan"),
    ]
    db.add_all(recurring)

    # ── Historical Transactions (~400 entries, 6 months) ──────────────────────
    # Build a list of all past transactions including: customer payments, supplier payments,
    # salaries, rent, utilities, GST, EMI, and misc.
    transactions = []

    # Map account IDs
    hdfc_id = hdfc.id
    sbi_id = sbi.id
    icici_id = icici.id

    # For each of past 6 months generate recurring debits
    for month_back in range(1, 7):
        base_date = _d(-month_back * 30)
        # Payroll ~ day 1
        txn_date = base_date.replace(day=1) if base_date.day > 1 else base_date
        transactions.append(Transaction(
            bank_account_id=hdfc_id,
            transaction_date=txn_date,
            description="Staff salaries and factory wages",
            amount=-420_000 * (1 + rng.uniform(-0.03, 0.03)),
            category="payroll", source="simulated",
        ))
        # Rent ~day 5
        rent_date = txn_date + timedelta(days=4)
        transactions.append(Transaction(
            bank_account_id=hdfc_id,
            transaction_date=rent_date,
            description="Factory shed rent — Maheshwari Estates",
            amount=-85_000,
            category="rent", source="simulated",
        ))
        # Electricity ~ day 10
        elec_date = txn_date + timedelta(days=9)
        transactions.append(Transaction(
            bank_account_id=hdfc_id,
            transaction_date=elec_date,
            description="TSECL electricity bill",
            amount=-65_000 * (1 + rng.uniform(-0.10, 0.15)),
            category="utilities", source="simulated",
        ))
        # GST ~ day 20
        gst_date = txn_date + timedelta(days=19)
        transactions.append(Transaction(
            bank_account_id=sbi_id,
            transaction_date=gst_date,
            description="GST liability payment (GSTIN 36AABCD1234F1Z5)",
            amount=-180_000 * (1 + rng.uniform(-0.05, 0.10)),
            category="tax", source="simulated",
        ))
        # EMI ~ day 28
        emi_date = txn_date + timedelta(days=27)
        transactions.append(Transaction(
            bank_account_id=hdfc_id,
            transaction_date=emi_date,
            description="HDFC machinery loan EMI",
            amount=-95_000,
            category="loan", source="simulated",
        ))

    # Supplier payments for past invoices
    for inv in past_invoices:
        if inv.invoice_type == "payable" and inv.paid_date:
            transactions.append(Transaction(
                bank_account_id=rng.choice([hdfc_id, sbi_id]),
                transaction_date=inv.paid_date,
                description=f"Payment to {next(s.name for s in supplier_objs if s.id == inv.counterparty_id)} — {inv.invoice_number}",
                amount=-inv.amount,
                category="supplier_payment", source="simulated",
                reference_id=inv.invoice_number,
            ))

    # Customer receipts for past invoices
    for inv in past_invoices:
        if inv.invoice_type == "receivable" and inv.paid_date:
            transactions.append(Transaction(
                bank_account_id=rng.choice([hdfc_id, sbi_id]),
                transaction_date=inv.paid_date,
                description=f"Receipt from {next(c.name for c in customer_objs if c.id == inv.counterparty_id)} — {inv.invoice_number}",
                amount=inv.amount,
                category="customer_receipt", source="simulated",
                reference_id=inv.invoice_number,
            ))

    # Plant PAST CASH CRUNCH ~5 weeks ago (around Oct 1-5):
    # On that week: heavy outflows (Tata Steel, GST, payroll all hit same week)
    # + Sai Auto Parts had delayed paying a large bill
    crunch_date = _d(-35)
    transactions.append(Transaction(
        bank_account_id=hdfc_id,
        transaction_date=crunch_date,
        description="Tata Steel BSL Ltd — large raw material payment (Q3 order)",
        amount=-820_000,
        category="supplier_payment", source="simulated",
    ))
    transactions.append(Transaction(
        bank_account_id=sbi_id,
        transaction_date=crunch_date + timedelta(days=1),
        description="GST liability payment (Oct)",
        amount=-210_000,
        category="tax", source="simulated",
    ))
    transactions.append(Transaction(
        bank_account_id=hdfc_id,
        transaction_date=crunch_date + timedelta(days=2),
        description="Staff salaries and factory wages (Oct)",
        amount=-425_000,
        category="payroll", source="simulated",
    ))
    # Balance dipped very low during this period — recovery came from Sundaram Fasteners payment
    transactions.append(Transaction(
        bank_account_id=hdfc_id,
        transaction_date=crunch_date + timedelta(days=4),
        description="Receipt from Sundaram Fasteners Ltd — INV-2026-0401",
        amount=620_000,
        category="customer_receipt", source="simulated",
    ))

    # Misc transactions
    misc = [
        ("Stationary and office supplies", -8_500,  "overhead"),
        ("Fuel and vehicle maintenance",   -15_000, "overhead"),
        ("Internet and telecom (Airtel)",  -4_200,  "utilities"),
        ("Bank charges HDFC",              -1_800,  "bank_charges"),
        ("Courier and logistics",          -6_500,  "logistics"),
        ("Machine maintenance contract",   -32_000, "maintenance"),
    ]
    for desc, amt, cat in misc * 5:  # spread over 5 months
        txn_date = _d(-rng.randint(10, 170))
        transactions.append(Transaction(
            bank_account_id=rng.choice([hdfc_id, sbi_id]),
            transaction_date=txn_date,
            description=desc,
            amount=amt * (1 + rng.uniform(-0.05, 0.05)),
            category=cat, source="simulated",
        ))

    db.add_all(transactions)

    # ── Risk Alerts ────────────────────────────────────────────────────────────
    alerts = [
        RiskAlert(
            title="Sai Auto Parts payment overdue by 15 days",
            message="₹9,00,000 from Sai Auto Parts Pvt Ltd is 15 days past due. This customer historically pays 25-35 days late. Expected receipt around " + str(_d(15)) + ".",
            severity="high_risk",
            action_recommendation="Call Srinivas Reddy (+91-98491-XXXXX) today. If payment does not arrive by next week, the steel bill and payroll in the same period will cause a cash shortage.",
            target_date=_d(15),
        ),
        RiskAlert(
            title="Steel payment and payroll fall in the same week",
            message=f"Tata Steel bill of ₹7,50,000 (due {_d(25)}) and payroll of ₹4,20,000 (due {_d(27)}) total ₹11,70,000 in one week. Current bank balance is ₹19,80,000 but Sai Auto Parts receipt is uncertain.",
            severity="high_risk",
            action_recommendation="Option 1: Collect the ₹9L from Sai Auto Parts before that week. Option 2: Request a 7-day extension on the Tata Steel payment. Option 3: Pre-fund the SBI account from the ICICI credit line.",
            target_date=_d(25),
        ),
        RiskAlert(
            title="Siemens payable due today",
            message=f"₹2,25,000 to Siemens Industry India is due today ({_d(0)}). Ensure the NEFT transfer has been initiated.",
            severity="caution",
            action_recommendation="Initiate NEFT from HDFC Current account.",
            target_date=_d(0),
        ),
    ]
    db.add_all(alerts)

    db.commit()
