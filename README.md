# Runway – Cash-Flow Intelligence for Indian MSMEs

Runway is a SaaS cash-flow intelligence platform specifically engineered for Indian MSME manufacturers. It tracks real-time bank and ledger accounts, predicts cash shortfalls 14/30/60 days in advance via a 2,000-run Monte Carlo simulation engine, explains root causes, recommends preventive actions, and pre-checks proposed transactions before commitment.

---

## Demo Profile
- **Company**: Deccan Precision Components Pvt Ltd
- **Location**: Hyderabad, Telangana
- **Owner**: Rakesh Reddy (Managing Director)
- **Sector**: Automotive Parts Manufacturing
- **Currency**: INR (₹) displayed in standard Indian numbering (`₹12,45,000` or `₹12.4L`)
- **Ecosystem**: 12 Customers, 8 Suppliers, 6 months historical baseline

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Recharts, Lucide React, React Router 6, TanStack Query, date-fns |
| **Backend** | Python 3.11+, FastAPI, SQLAlchemy, SQLite, NumPy, pandas, pdfplumber, uvicorn |
| **Ports** | Frontend: `5173` (proxies `/api` to `8000`), Backend: `8000` |

---

## Quick Start

### Prerequisites
- **Python 3.11+** installed
- **Node.js 18+** and **npm** installed

### One-Click Launch

#### Mac / Linux:
```bash
./start.sh
```

#### Windows:
```cmd
start.bat
```

The script will automatically set up the Python virtual environment (`backend/venv`), install Python requirements, install Node dependencies (`frontend/node_modules`), and launch both servers concurrently.

---

### Manual Start

#### 1. Backend Setup & Run
```bash
# From project root
python3 -m venv backend/venv
source backend/venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
Test health endpoint:
```bash
curl http://localhost:8000/api/health
```

#### 2. Frontend Setup & Run
```bash
# In a separate terminal
cd frontend
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## Features & Navigation

1. **Dashboard** (`/dashboard`): Cash balance, runway horizon (days), 30-day shortfall risk probability, and projected liquidity envelopes.
2. **Bank & Transactions** (`/banking`): Simulated bank feeds, CSV statement uploads, and categorized ledger entries.
3. **Customers & Suppliers** (`/parties`): Automotive OEM customers and raw material suppliers with empirical payment delay statistics.
4. **Invoices & OCR** (`/invoices`): Open receivables/payables with status tracking and PDF invoice field extraction.
5. **Reminders & Calendar** (`/reminders`): Automated 7-day advance payment notices and monthly due date schedule.
6. **Customer Behaviour Analytics** (`/customer-analytics`): Historical delay distributions, empirical bootstrap sampling, and reliability scoring.
7. **Cash-Flow Forecast** (`/forecast`): Vectorized 2,000-run Monte Carlo simulations across 14, 30, and 60-day horizons with counterfactual driver ranking.
8. **Risk Alerts & Recommendations** (`/risk-alerts`): Root-cause diagnoses explaining projected deficits with preventive operational actions.
9. **Pre-Transaction Risk Assessment** (`/pre-transaction`): Counterfactual simulation of proposed POs and capex outlays before approval.
10. **Business Performance** (`/business-analytics`): Working capital metrics (CCC, DSO, DPO), burn rate, and gross margin profiles.

---

## Design System Tokens
- **Background**: `#0B1220` (Dark navy fintech aesthetic)
- **Surface**: `#111A2E` (Cards, drawers, modals)
- **Elevated**: `#16213A` (Inputs, sub-panels, hover highlights)
- **Border**: `#22304D`
- **Text**: Primary `#E6ECF8`, Secondary `#8FA0C0`
- **Accents**: Blue `#3B82F6`, Teal `#14B8A6`, Green `#22C55E`, Amber `#F59E0B`, Red `#EF4444`
- **Risk Color Language**:
  - `Safe` (Green #22C55E): Ample liquidity, low shortfall risk, on-time payments
  - `Caution` (Amber #F59E0B): Approaching due date, moderate delay drift, buffer warning
  - `High Risk` (Red #EF4444): Projected cash deficit, severe delay past terms, overdraft breach

