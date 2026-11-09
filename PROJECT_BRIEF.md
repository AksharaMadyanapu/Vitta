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
- Light theme only with modern, trustworthy SaaS polish (inspired by Zoho Books, Mercury, Notion).
- Background: #F5F6FA, cards white (#FFFFFF), 14px border radius, 1px border #E8EAF0, soft shadow (0 1px 2px rgba(16,24,40,0.05), 0 4px 12px rgba(16,24,40,0.04)). Slight lift on hover only for clickable cards.
- Brand colour: Deep indigo #3F3DDB (buttons, links, active items, main chart line). Secondary accent teal #0EA5A4 used sparingly.
- Status colours: soft muted pills only (green #15803D on #E8F7EE, amber #B45309 on #FFF4DB, red #B42318 on #FDECEA).
- Sidebar: deep indigo background #1E1B4B, 232px wide, white text, active items with lighter indigo pill, small group headings in muted lavender (#A5B4FC). Inline SVG Runway logo mark and wordmark at the top.
- Summary cards: 36px rounded square icon badge with matching tinted background, label, 28px/600 value, plain-language caption.
- Overview page: subtle indigo-to-lavender welcome banner with greeting ("Good morning, Rakesh"), one-sentence cash status, two action buttons, and inline SVG chart illustration.
- Typography: Plus Jakarta Sans for headings, Inter for body and numbers. Page title 26px/700. Tabular numbers for all money values, right-aligned in tables.
- Motion: gentle 200 ms fade and 8px upward slide on page load, smooth hover states, 600 ms chart draw-in. No bouncing, count-up animations, glow, glassmorphism, neon, or decorative blobs.
- Tables: 52px rows, light hover, status pills, avatar circles with initials for counterparties, right-aligned money.
- Charts: soft area fill (8–12% indigo opacity) under main line, rounded line caps, light dashed gridlines, direct danger zone shading and labels on forecast.
- Onboarding & Guidance: first-time welcome modal, interactive spotlight guided tour, getting-started checklist (persisted in localStorage), top bar help drawer with FAQs, collapsible page guidance boxes, inline term tooltips, prefilled example chips, and bottom next-step cue strips.
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
