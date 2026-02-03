@echo off
REM Syntra Bizz Offer Generator - Windows Launcher
REM Copyright (c) 2026 Steff Vanhaverbeke for Syntra Bizz
REM Double-click this file to start the application

REM Navigate to project root (two levels up from scripts\launchers\)
cd /d "%~dp0..\.."

echo.
echo ======================================================
echo    Syntra Bizz Offer Generator - Launcher
echo ======================================================
echo.

REM Step 1: Check Python installation
echo [1/7] Checking Python installation...

REM Try py command first (Python Launcher for Windows)
py --version >nul 2>&1
if %errorlevel% equ 0 (
    set PYTHON_CMD=py
    for /f "tokens=2" %%i in ('py --version 2^>^&1') do set PYTHON_VERSION=%%i
    goto :check_version
)

REM Try python command
python --version >nul 2>&1
if %errorlevel% equ 0 (
    set PYTHON_CMD=python
    for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
    goto :check_version
)

REM Python not found
echo [ERROR] Python not found
echo Please install Python 3.9 or higher from https://www.python.org/downloads/
echo Make sure to check "Add Python to PATH" during installation
echo.
pause
exit /b 1

:check_version
REM Extract major and minor version
for /f "tokens=1 delims=." %%a in ("%PYTHON_VERSION%") do set PYTHON_MAJOR=%%a
for /f "tokens=2 delims=." %%a in ("%PYTHON_VERSION%") do set PYTHON_MINOR=%%a

if %PYTHON_MAJOR% lss 3 (
    echo [ERROR] Python 3.9+ required, found %PYTHON_VERSION%
    echo Please install Python 3.9 or higher from https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

if %PYTHON_MAJOR% equ 3 if %PYTHON_MINOR% lss 9 (
    echo [ERROR] Python 3.9+ required, found %PYTHON_VERSION%
    echo Please install Python 3.9 or higher from https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

echo [OK] Python %PYTHON_VERSION%

REM Step 2: Setup virtual environment
echo [2/7] Setting up virtual environment...

if not exist "venv\" (
    echo Creating virtual environment...
    %PYTHON_CMD% -m venv venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment
        pause
        exit /b 1
    )
    echo [OK] venv created
) else (
    echo [OK] venv ready
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Step 3: Check .env file
echo [3/7] Checking configuration...

if not exist ".env" (
    echo [WARN] .env file not found
    echo Copying env.template to .env...
    copy env.template .env >nul
    echo.
    echo [WARN] GEMINI_API_KEY not configured!
    echo.
    echo Next steps:
    echo 1. Get your API key: https://makersuite.google.com/app/apikey
    echo 2. Open .env file in the project root
    echo 3. Replace 'your_gemini_api_key_here' with your actual key
    echo 4. Re-run this script
    echo.
    set /p CONTINUE="Continue without API key? (y/n): "
    if /i not "%CONTINUE%"=="y" (
        echo Setup cancelled. Please configure your API key and try again.
        echo.
        pause
        exit /b 0
    )
    echo [WARN] Continuing without API key (app will fail on first API call^)
) else (
    REM Check if API key is placeholder
    findstr /C:"your_gemini_api_key_here" .env >nul
    if errorlevel 0 if not errorlevel 1 (
        echo [WARN] API key not configured (still placeholder^)
        echo.
        echo Please update GEMINI_API_KEY in .env file
        echo Get your key: https://makersuite.google.com/app/apikey
        echo.
        set /p CONTINUE="Continue anyway? (y/n): "
        if /i not "%CONTINUE%"=="y" (
            echo Setup cancelled.
            echo.
            pause
            exit /b 0
        )
        echo [WARN] Continuing without valid API key
    ) else (
        echo [OK] .env configured
    )
)

REM Step 4: Install dependencies
echo [4/7] Installing dependencies...
echo This may take a minute on first run...
cd backend
pip install -q -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    echo Try running manually: pip install -r backend\requirements.txt
    echo.
    cd ..
    pause
    exit /b 1
)
cd ..
echo [OK] Dependencies installed

REM Step 5: Check Playwright browsers
echo [5/7] Checking Playwright browsers...
python -c "from playwright.sync_api import sync_playwright; sync_playwright().start().chromium.executable_path" >nul 2>&1
if errorlevel 1 (
    echo Installing Chromium browser (~150MB, ~30 seconds^)...
    playwright install chromium
    if errorlevel 1 (
        echo [WARN] Playwright installation incomplete
        echo Browser automation may not work. Try manually: playwright install chromium
    ) else (
        echo [OK] Chromium ready
    )
) else (
    echo [OK] Chromium ready
)

REM Step 6: Verify directories
echo [6/7] Verifying directories...
if not exist "generated_offers\" mkdir generated_offers
if not exist "templates\" mkdir templates
echo [OK] All directories ready

REM Step 7: Check ports
echo [7/7] Checking ports...

REM Check port 8765
netstat -ano | findstr ":8765" | findstr "LISTENING" >nul
if errorlevel 0 if not errorlevel 1 (
    echo [WARN] Port 8765 is already in use
    set /p KILL="Kill existing process on port 8765? (y/n): "
    if /i "%KILL%"=="y" (
        for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8765"') do taskkill /F /PID %%a >nul 2>&1
        echo Process killed
    ) else (
        echo Cannot start with port in use. Exiting.
        echo.
        pause
        exit /b 1
    )
)

REM Check port 8766
netstat -ano | findstr ":8766" | findstr "LISTENING" >nul
if errorlevel 0 if not errorlevel 1 (
    echo [WARN] Port 8766 is already in use
    set /p KILL="Kill existing process on port 8766? (y/n): "
    if /i "%KILL%"=="y" (
        for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8766"') do taskkill /F /PID %%a >nul 2>&1
        echo Process killed
    ) else (
        echo Cannot start with port in use. Exiting.
        echo.
        pause
        exit /b 1
    )
)
echo [OK] Ports available

echo.
echo Starting servers...
echo.

REM Start backend
echo Starting backend server...
start /B python backend\app.py

REM Wait for backend to initialize
timeout /T 3 /NOBREAK >nul

REM Start frontend
echo Starting frontend server...
start /B python -m http.server 8766 -d frontend

REM Wait for servers to fully start
timeout /T 2 /NOBREAK >nul

echo.
echo [OK] Backend running on http://localhost:8765
echo [OK] Frontend running on http://localhost:8766
echo.
echo ======================================================
echo    Open your browser: http://localhost:8766
echo    API docs: http://localhost:8765/docs
echo ======================================================
echo.
echo Press Ctrl+C to stop servers, or close this window
echo.

REM Keep window open and wait
pause >nul
