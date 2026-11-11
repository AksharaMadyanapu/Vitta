# Runway Production Deployment Guide

## 1. Production Backend Service

### Requirements
- Python 3.11+
- Virtualenv with dependencies from `backend/requirements.txt`

### Start Command
Run with `uvicorn` in production mode (no auto-reload, gzip compression enabled, 1 worker for free/shared CPU tiers):

```bash
cd backend
./venv/bin/uvicorn backend.app.main:app \
  --host 0.0.0.0 \
  --port 8000 \
  --workers 1 \
  --no-access-log
```

*(On multi-core dedicated machines, scale `--workers` to 2 or 4).*

### Environment Variables (`backend/.env`)
| Variable | Default | Description |
|---|---|---|
| `PORT` | `8000` | Port uvicorn binds to |
| `HOST` | `0.0.0.0` | Listen host interface |
| `CORS_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173,*` | Allowed origins (comma-separated, or `*` for broad access) |
| `DATABASE_URL` | `sqlite:///./runway.db` | SQLAlchemy database URL (SQLite with WAL mode or PostgreSQL) |
| `DEFAULT_SIMULATIONS` | `500` | Fast Monte Carlo simulation count (under 1s response on small CPU) |
| `COMPANY_NAME` | `Deccan Precision Components Pvt Ltd` | Demo company name |
| `ENVIRONMENT` | `production` | Deployment mode |
| `GEMINI_API_KEY` | *(optional)* | Google Gemini API key for Copilot chat grounded in real data |

---

## 2. Production Frontend Service

### Build Command
Compile static assets using Vite:

```bash
cd frontend
npm run build
```

This generates production-optimized, code-split chunks in `frontend/dist`.

### Preview / Serve Command
```bash
npx serve -s frontend/dist -l 5173
```
*(Or let Vercel / Netlify / Cloudflare Pages serve the `frontend/dist` directory as static assets).*

### Environment Variables (`frontend/.env.production`)
| Variable | Example | Description |
|---|---|---|
| `VITE_API_URL` | `/api` (or `https://api.yourdomain.com/api`) | Base API endpoint for client requests |

---

## 3. Performance & Reliability Features

1. **Monte Carlo Optimization**: Default 500 vectorised simulations for standard page loads (<1s response on single CPU); 2000 simulations preserved for deep purchase-risk assessments.
2. **Multi-tier In-Memory Caching**: 60s cache on all forecast, runway, dashboard summary, and recommendation endpoints, with instant invalidation upon new invoices or transactions.
3. **Automatic Startup Warm-up**: Background worker pre-calculates 14, 30, and 60-day forecasts on startup so the first human visitor experiences zero latency.
4. **Database Speed**: SQLite WAL (Write-Ahead Logging) mode enabled, with B-Tree indexes on `counterparty_id`, `invoice_type`, `due_date`, `status`, and `transaction_date`.
5. **Cold-Start Shield**: The `/api/health` endpoint monitors server warm-up and seeding status; frontend displays a smooth "Waking up the server" animation if the cloud host is spinning up from idle.
6. **Network Resilience**: 10s request abort timeouts, 60s TanStack Query cache, automatic retries, and friendly retry cards.

