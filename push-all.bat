@echo off
echo ========================================
echo   Push to All Repositories
echo ========================================
echo.

set MSG=%1
if "%MSG%"=="" set MSG=update

echo [1/2] Pushing main project (website + backend)...
cd /d d:\diskusi-bisnis
git add .
git commit -m "%MSG%"
git push all

echo.
echo [2/2] Pushing mobile app...
cd /d d:\diskusi-bisnis\mobile
git add .
git commit -m "%MSG%"
git push origin main

echo.
echo ========================================
echo   All repositories pushed!
echo ========================================
pause
