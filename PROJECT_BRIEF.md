# RUNWAY – Project Brief

## Product
Runway is a SaaS cash-flow intelligence platform for Indian MSME manufacturers. It tracks finances, predicts cash shortages 14/30/60 days ahead, explains why, recommends preventive actions and checks proposed transactions for cash-flow risk before they are confirmed. Currency is INR (₹), shown in Indian format (₹12,45,000 or ₹12.4L on compact cards).

## Demo company (seed data)
Deccan Precision Components Pvt Ltd, Hyderabad. Manufactures automotive parts. Owner: Rakesh Reddy. 12 customers, 8 suppliers, about 6 months of history. All dates are generated relative to today so the demo is always fresh.

## Tech stack
- Frontend: React 18, Vite, TypeScript, Tailwind CSS, Recharts, Framer Motion, lucide-react, React Router, TanStack Query, date-fns
- Backend: Python 3.11+, FastAPI, SQLAlchemy, SQLite, NumPy, pandas, pdfplumber, uvicorn
- Structure: /frontend, /backend, /sample_data, README.md, start scripts
- Frontend dev server proxies /api to the backend (port 8000). Frontend runs on port 5173.

## Design system
- Dark navy fintech SaaS look. Background #0B1220, surface #111A2E, elevated #16213A, border #22304D.
- Accents: blue #3B82F6, teal #14B8A6, green #22C55E, amber #F59E0B, red #EF4444.
- Text: #E6ECF8 primary, #8FA0C0 secondary. Font: Inter. Use tabular numbers for all money.
- Cards: rounded-2xl, subtle border, soft glow on hover, generous spacing. Left sidebar navigation, top bar with search, notification bell and company name.
- Every page needs: loading skeletons, empty states, error states, smooth page transitions, count-up animations on key numbers, responsive layout.
- Charts use the accent palette, gradient fills, custom dark tooltips.
- Risk colour language everywhere: green = safe, amber = caution, red = high risk.

## Features
1 Dashboard, 2 Bank and transactions (manual, CSV upload, simulated bank connection), 3 Customers and suppliers, 4 Invoices (create, status tracking, PDF/image upload with data extraction), 5 Reminders (7 days before due) and calendar, 6 Customer payment behaviour analytics, 7 Cash-flow forecast (14/30/60 days, shortage date, top 5 contributing transactions), 8 Risk alerts and recommendations, 9 Pre-transaction risk assessment, 10 Business performance analytics.

## Forecast engine rules (single shared module: backend/app/forecast.py)
- Start from the current total bank balance.
- Open receivables: predicted payment date = due date + delay sampled from that customer's historical delay distribution (bootstrap from past paid invoices; blend with the global distribution when the customer has fewer than 5 paid invoices; small chance of a very late payment).
- Open payables: paid on due date with small random jitter.
- Recurring expenses (salaries, rent, electricity, GST, loan EMI) projected from detected monthly patterns.
- Run 2000 vectorised NumPy simulations. Accept an optional as_of date and optional extra hypothetical transactions.
- Output: daily p10/p50/p90 balance, probability of shortfall within 14/30/60 days, expected first shortfall date and amount, risk level, and top 5 contributing transactions found by counterfactual re-simulation with a fixed random seed.
- Must respond in under 2 seconds. Cache results and invalidate on any data change.

## Honesty labels
Bank connection is a simulated sandbox. Data is synthetic. Show a small "Demo data" badge in the top bar.

## Engineering rules
- Before changing anything: inspect the existing project and keep all working functionality.
- Never leave the app in a broken state. After each stage: install dependencies, run backend and frontend, fix every error, and test the main flows.
- Use typed API responses, consistent naming, clear folder structure, and short comments.
- No placeholder text such as "Lorem ipsum" and no dead buttons. Every visible control must work.
- No secrets in code. Use a .env file with a .env.example.
