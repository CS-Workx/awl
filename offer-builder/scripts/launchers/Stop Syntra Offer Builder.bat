@echo off
REM Syntra Bizz Offer Generator - Stop Script (Windows)
REM Copyright (c) 2026 Steff Vanhaverbeke for Syntra Bizz

echo.
echo Stopping Syntra Bizz Offer Generator...
echo.

REM Kill processes on port 8765 (backend)
set FOUND_8765=0
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8765" ^| findstr "LISTENING"') do (
    set FOUND_8765=1
    echo Stopping backend (port 8765^)...
    taskkill /F /PID %%a >nul 2>&1
    echo [OK] Backend stopped
)
if %FOUND_8765%==0 echo Backend not running on port 8765

REM Kill processes on port 8766 (frontend)
set FOUND_8766=0
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8766" ^| findstr "LISTENING"') do (
    set FOUND_8766=1
    echo Stopping frontend (port 8766^)...
    taskkill /F /PID %%a >nul 2>&1
    echo [OK] Frontend stopped
)
if %FOUND_8766%==0 echo Frontend not running on port 8766

echo.
echo [OK] All servers stopped
echo.
pause
