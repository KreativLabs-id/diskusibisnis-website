@echo off
echo ========================================
echo Starting Diskusi Bisnis Platform
echo ========================================
echo.

echo [1/2] Starting Backend Server (Express)...
cd backend
start cmd /k "npm run dev"
timeout /t 3 /nobreak > nul

echo [2/2] Starting Frontend Server (Next.js)...
cd ..\frontend
start cmd /k "npm run dev"

echo.
echo ========================================
echo ✅ Both servers are starting...
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this window...
pause > nul
