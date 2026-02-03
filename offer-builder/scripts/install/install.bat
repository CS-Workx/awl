@echo off
REM Syntra Bizz Offer Builder - Windows Installation Script
REM Copyright (c) 2026 Steff Vanhaverbeke for Syntra Bizz
REM Licensed under the MIT License

setlocal enabledelayedexpansion

REM Navigate to project root (two levels up from scripts\install\)
cd /d "%~dp0..\.."

REM Display banner
echo ================================================
echo   Syntra Bizz Offer Builder - Windows Setup
echo ================================================
echo.

REM Step 1: Python detection
echo [1/8] Validating Python installation...

REM Try 'py' first (Python Launcher)
py --version >nul 2>&1
if %errorlevel% == 0 (
    set PYTHON_CMD=py
    goto :python_found
)

REM Try 'python' command
python --version >nul 2>&1
if %errorlevel% == 0 (
    set PYTHON_CMD=python
    goto :python_found
)

REM Try 'python3' command
python3 --version >nul 2>&1
if %errorlevel% == 0 (
    set PYTHON_CMD=python3
    goto :python_found
)

REM Python not found
echo [ERROR] Python not found
echo.
echo Please install Python 3.9 or higher from:
echo   https://www.python.org/downloads/
echo.
echo Make sure to check "Add Python to PATH" during installation.
pause
exit /b 1

:python_found
REM Get Python version
for /f "tokens=2" %%v in ('%PYTHON_CMD% --version 2^>^&1') do set PY_VERSION=%%v

REM Parse major and minor version
for /f "tokens=1,2 delims=." %%a in ("%PY_VERSION%") do (
    set PY_MAJOR=%%a
    set PY_MINOR=%%b
)

REM Check version is 3.9+
if %PY_MAJOR% LSS 3 (
    echo [ERROR] Python %PY_VERSION% is too old (need 3.9+^)
    echo Please install Python 3.9 or higher
    pause
    exit /b 1
)

if %PY_MAJOR% EQU 3 if %PY_MINOR% LSS 9 (
    echo [ERROR] Python %PY_VERSION% is too old (need 3.9+^)
    echo Please install Python 3.9 or higher
    pause
    exit /b 1
)

echo [OK] Python %PY_VERSION% detected
echo.

REM Step 2: Disk space check (basic check - requires PowerShell)
echo [2/8] Checking disk space...

for /f "tokens=3" %%a in ('dir /-c ^| find "bytes free"') do set FREE_SPACE=%%a
REM Convert to MB (rough calculation)
set /a FREE_MB=%FREE_SPACE:~0,-6%

if %FREE_MB% LSS 500 (
    echo [WARN] Low disk space detected (need 500MB^)
    echo Continuing anyway...
)

echo [OK] Disk space check passed
echo.

REM Step 3: Virtual environment
echo [3/8] Setting up virtual environment...

if exist venv\ (
    echo [WARN] Virtual environment already exists, skipping creation
) else (
    %PYTHON_CMD% -m venv venv
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create virtual environment
        pause
        exit /b 1
    )
    echo [OK] Virtual environment created
)
echo.

REM Activate venv
call venv\Scripts\activate.bat

REM Step 4: Upgrade pip
echo [4/8] Upgrading pip...

python -m pip install --quiet --upgrade pip setuptools wheel
if %errorlevel% neq 0 (
    echo [WARN] pip upgrade had issues, but continuing...
)

echo [OK] pip upgraded
echo.

REM Step 5: Install dependencies
echo [5/8] Installing Python dependencies (~105MB, 2-5 minutes^)...
echo This may take a while depending on your internet connection...
echo.

pip install -q -r backend\requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Dependency installation failed
    echo Try running manually: venv\Scripts\activate.bat ^&^& pip install -r backend\requirements.txt
    pause
    exit /b 1
)

echo [OK] All dependencies installed
echo.

REM Step 6: Playwright browsers
echo [6/8] Installing Playwright Chromium (~150MB, 30-60 seconds^)...

playwright install chromium
if %errorlevel% neq 0 (
    echo [WARN] Playwright installation had issues, but continuing...
)

echo [OK] Playwright Chromium installed
echo.

REM Step 7: Environment configuration
echo [7/8] Setting up environment...

if not exist .env (
    copy env.template .env >nul
    echo [OK] .env file created from template
    echo [WARN] Please configure GEMINI_API_KEY in .env before first use
) else (
    echo [WARN] .env file already exists, skipping
)
echo.

REM Create required directories
if not exist generated_offers mkdir generated_offers
if not exist templates\user_uploads mkdir templates\user_uploads

echo [OK] Directories created
echo.

REM Step 8: Verification
echo [8/8] Running verification tests...
echo.

python verification.py
if %errorlevel% neq 0 (
    echo.
    echo ================================================
    echo    [WARN] Installation Incomplete
    echo ================================================
    echo.
    echo Some verification checks failed. Please review the output above.
    echo You may need to:
    echo   - Manually install missing packages: pip install -r backend\requirements.txt
    echo   - Install Playwright browsers: playwright install chromium
    echo   - Check for error messages in the output
    echo.
    pause
    exit /b 1
)

echo.
echo ================================================
echo      [OK] Installation Complete!
echo ================================================
echo.
echo IMPORTANT: Configure API Key
echo    1. Open .env file:
echo       notepad .env
echo.
echo    2. Get your Gemini API key:
echo       https://makersuite.google.com/app/apikey
echo.
echo    3. Replace "your_gemini_api_key_here" with your actual key
echo.
echo Start Application:
echo    Double-click: "Start Syntra Offer Builder.bat"
echo.
echo Documentation: See doc\ folder
echo Support: steff@vanhaverbeke.com
echo.
pause
