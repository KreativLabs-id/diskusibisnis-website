@echo off
echo Stopping backend server...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq backend*" 2>nul
timeout /t 2 /nobreak >nul

echo Building backend...
cd backend
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo Build failed!
    pause
    exit /b 1
)

echo Starting backend server...
start "backend" cmd /k "npm start"

echo Backend restarted successfully!
timeout /t 2 /nobreak >nul
