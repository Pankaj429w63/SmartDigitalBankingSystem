@echo off
REM SmartDigitalBankingSystem fullstack startup script for Windows

REM 1) Start backend server
start "SmartBank Backend" cmd /k "cd /d "%~dp0backend" && npm install && npm run dev"

REM 2) Start frontend React app
start "SmartBank Frontend" cmd /k "cd /d "%~dp0frontend" && npm install && npm start"

REM 3) Start Streamlit analytics dashboard
start "SmartBank Dashboard" cmd /k "cd /d "%~dp0" && python -m pip install -r requirements.txt && python -m streamlit run src/dashboard_rl.py --server.port 8502"

echo Fullstack startup launched. Close this window if you want to keep the apps running.
pause
