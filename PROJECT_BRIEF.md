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
- Light theme only. Calm, clean, trusted finance SaaS look (reference: Zoho Books, Stripe Dashboard, Mercury).
- Background #F7F8FA, surface/cards white (#FFFFFF), 1px border #E5E7EB, card radius 10px, no heavy shadows (faint shadow-sm at most).
- Text: #111827 primary, #6B7280 secondary. Font: Inter. Tabular numbers for all money values, right-aligned in tables.
- ONE accent colour for buttons, links, and active states: #2548C9.
- Status colours are soft and muted pills: green text #15803D on #ECFDF3, amber text #B45309 on #FFFAEB, red text #B42318 on #FEF3F2.
- No glow effects, gradients, glassmorphism, neon colours, decorative blobs, count-up number animations, or emoji.
- Motion: 150–200 ms fades and hover colour changes only.
- Typography scale: page title 24px/600, section heading 16px/600, body 14px, caption 12px secondary. Whitespace: 24px between sections, 20px inside cards.
- Tables: 48px rows, no zebra stripes, light hover row, sticky header, clear column alignment.
- Charts: single-colour lines, light grey gridlines, thin axes, plain white tooltips with 1px border, no gradients. Accent colour for main series, grey for comparison.
- Buttons: one primary button per page (solid #2548C9), secondary buttons white with border, sentence case labels.
- Icons: small 18px stroke style (lucide-react), used sparingly where helpful.
- Plain language: simple, friendly English without jargon. Sentence case everywhere.
- All future UI work must follow this design system and use plain-language copy.

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
