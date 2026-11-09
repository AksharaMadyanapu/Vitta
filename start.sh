#!/usr/bin/env bash
set -e

# RUNWAY – Launch Script (Mac / Linux)
echo "====================================================="
echo "  RUNWAY – Cash-Flow Intelligence for Indian MSMEs"
echo "  Deccan Precision Components Pvt Ltd (Demo)"
echo "====================================================="

# Ensure Node and Python paths if available in user directory
if [ -d "$HOME/node/node-v20.12.2-darwin-arm64/bin" ]; then
  export PATH="$HOME/node/node-v20.12.2-darwin-arm64/bin:$PATH"
fi

# Detect commands
if command -v python3 >/dev/null 2>&1; then
  PYTHON_CMD="python3"
elif command -v python >/dev/null 2>&1; then
  PYTHON_CMD="python"
else
  echo "[Error] Python 3 is not installed or not in PATH."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "[Error] npm / Node.js is not installed or not in PATH."
  exit 1
fi

echo "[1/4] Setting up Python virtual environment..."
cd "$(dirname "$0")"

if [ ! -d "backend/venv" ]; then
  echo "Creating virtual environment in backend/venv..."
  $PYTHON_CMD -m venv backend/venv
fi

echo "[2/4] Checking backend dependencies..."
./backend/venv/bin/pip install -q -r backend/requirements.txt

echo "[3/4] Checking frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
  echo "Installing frontend dependencies with npm..."
  npm install
fi
cd ..

echo "[4/4] Starting backend (:8000) and frontend (:5173)..."
cleanup() {
  echo ""
  echo "Stopping Runway servers..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
  exit 0
}

trap cleanup INT TERM

# Start Backend
./backend/venv/bin/uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Start Frontend
cd frontend
npm run dev -- --host 0.0.0.0 &
FRONTEND_PID=$!
cd ..

echo ""
echo "🚀 Runway is running!"
echo "   ➜ Frontend: http://localhost:5173"
echo "   ➜ Backend:  http://localhost:8000/api/health"
echo "   ➜ Press Ctrl+C to terminate both servers."
echo ""

wait

