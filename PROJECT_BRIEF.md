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

## Design system: "calm, friendly money mentor"
- Background: Warm cream #FBF7F0. Surface: #FFFFFF used sparingly. Large colour-blocked sections: soft sand #F1E9DC.
- Primary text & sidebar: Deep green ink #0F3D33. Active nav items: cream #FBF7F0 pill.
- Status colours:
  - "Safe": Soft mint #CDEBDD background with deep green ink #0F3D33 text and matching dot.
  - "Watch": Butter yellow #FFE8A3 background with warm amber #8A5B00 text and matching dot.
  - "Needs attention" / Primary CTA: Warm vibrant coral #FF6B4A (with white text on buttons, and soft coral #FDEEE9 on chips).
- Typography:
  - Headings, hero statements, and signature numbers: Fraunces (serif, weight 600, optical size auto).
  - Body copy, labels, and metadata: Inter (clean, neutral, readable).
  - Home headline 40px, page titles 32px, big signature numbers 36px.
  - Lots of whitespace: 48px between major sections, 28px padding inside cards.
- Shapes:
  - Very rounded cards (24px radius, rounded-3xl), pill buttons (rounded-full).
  - No hard grey borders — use colour blocking (white, sand #F1E9DC, mint #CDEBDD) and soft, warm shadows (0 2px 8px rgba(15,61,51,0.04), 0 8px 24px rgba(15,61,51,0.06)).
- Home hero:
  - Large colour-blocked panel (sand #F1E9DC or mint #CDEBDD depending on cash status) with headline on the left and a custom inline-SVG illustration on the right: friendly stylised workshop/factory with a gently rising path or coins, in 3 status variants (healthy, watch, urgent).
- Charts:
  - Thick rounded lines (3px) in deep green #0F3D33.
  - Soft mint #CDEBDD area fill under the line (opacity ~0.35).
  - Coral #FF6B4A danger zone with hand-drawn-style annotation arrow & label ("Cash gets tight here").
  - No gridlines except a faint baseline, no legends (labelled directly), rounded bar tops, custom white floating tooltips with soft shadow.
- Status:
  - Friendly status chips (mint, butter yellow, coral) with a small matching indicator dot.
- Lists & Tables:
  - Avatar circles with initials in palette colours, generous row heights, status chips on the right, amounts rendered in Fraunces serif.
- Motion:
  - Gentle 250 ms fades, soft hover lift on clickable cards, charts draw in over 700 ms. No bouncing, glow, glass, neon, or emoji.

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
