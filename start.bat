@echo off
REM RUNWAY – Windows Startup Script
echo =====================================================
echo   RUNWAY - Cash-Flow Intelligence for Indian MSMEs
echo   Deccan Precision Components Pvt Ltd (Demo)
echo =====================================================

cd /d "%~dp0"

REM 1. Python virtual environment check
if not exist "backend\venv" (
    echo [1/4] Creating Python virtual environment...
    python -m venv backend\venv
)

REM 2. Install backend dependencies
echo [2/4] Verifying backend dependencies...
backend\venv\Scripts\pip install -q -r backend\requirements.txt

REM 3. Frontend dependencies
echo [3/4] Verifying frontend dependencies...
cd frontend
if not exist "node_modules" (
    echo Installing frontend packages with npm...
    npm install
)
cd ..

REM 4. Start servers
echo [4/4] Starting backend and frontend...
echo Backend:  http://localhost:8000/api/health
echo Frontend: http://localhost:5173
echo.

start "Runway Backend" cmd /k "backend\venv\Scripts\uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload"
start "Runway Frontend" cmd /k "cd frontend && npm run dev"

echo Both services launched in separate terminal windows.
pause

