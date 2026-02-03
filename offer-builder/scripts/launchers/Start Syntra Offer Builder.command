#!/bin/bash

# Syntra Bizz Offer Generator - macOS Launcher
# Copyright (c) 2026 Steff Vanhaverbeke for Syntra Bizz
# Double-click this file to start the application

# Navigate to project root (two levels up from scripts/launchers/)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo ""
echo "🚀 Syntra Bizz Offer Generator - Launcher"
echo "================================================"
echo ""

# Step 1: Check Python version
echo -e "${BLUE}[1/7] Checking Python installation...${NC}"
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
    PYTHON_VERSION=$($PYTHON_CMD --version 2>&1 | awk '{print $2}')
    PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
    PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)
    
    if [ "$PYTHON_MAJOR" -lt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 9 ]); then
        echo -e "${RED}❌ Python 3.9+ required, found $PYTHON_VERSION${NC}"
        echo "Please install Python 3.9 or higher from https://www.python.org/downloads/"
        echo ""
        read -p "Press Enter to exit..."
        exit 1
    fi
    echo -e "${GREEN}✅ Python $PYTHON_VERSION${NC}"
else
    echo -e "${RED}❌ Python not found${NC}"
    echo "Please install Python 3.9 or higher from https://www.python.org/downloads/"
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi

# Step 2: Setup virtual environment
echo -e "${BLUE}[2/7] Setting up virtual environment...${NC}"
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    $PYTHON_CMD -m venv venv
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to create virtual environment${NC}"
        echo ""
        read -p "Press Enter to exit..."
        exit 1
    fi
    echo -e "${GREEN}✅ venv created${NC}"
else
    echo -e "${GREEN}✅ venv ready${NC}"
fi

# Activate virtual environment
source venv/bin/activate

# Step 3: Check .env file
echo -e "${BLUE}[3/7] Checking configuration...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo "Copying env.template to .env..."
    cp env.template .env
    echo ""
    echo -e "${YELLOW}⚠️  GEMINI_API_KEY not configured!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Get your API key: https://makersuite.google.com/app/apikey"
    echo "2. Open .env file in the project root"
    echo "3. Replace 'your_gemini_api_key_here' with your actual key"
    echo "4. Re-run this script"
    echo ""
    read -p "Continue without API key? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled. Please configure your API key and try again."
        echo ""
        read -p "Press Enter to exit..."
        exit 0
    fi
    echo -e "${YELLOW}⚠️  Continuing without API key (app will fail on first API call)${NC}"
else
    # Check if API key is configured
    if grep -q "your_gemini_api_key_here" .env; then
        echo -e "${YELLOW}⚠️  API key not configured (still placeholder)${NC}"
        echo ""
        echo "Please update GEMINI_API_KEY in .env file"
        echo "Get your key: https://makersuite.google.com/app/apikey"
        echo ""
        read -p "Continue anyway? (y/n): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Setup cancelled."
            echo ""
            read -p "Press Enter to exit..."
            exit 0
        fi
        echo -e "${YELLOW}⚠️  Continuing without valid API key${NC}"
    else
        echo -e "${GREEN}✅ .env configured${NC}"
    fi
fi

# Step 4: Install dependencies
echo -e "${BLUE}[4/7] Installing dependencies...${NC}"
echo "This may take a minute on first run..."
cd backend
pip install -q -r requirements.txt
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    echo "Try running manually: pip install -r backend/requirements.txt"
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi
cd ..
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 5: Check Playwright browsers
echo -e "${BLUE}[5/7] Checking Playwright browsers...${NC}"
if ! venv/bin/python -c "from playwright.sync_api import sync_playwright; sync_playwright().start().chromium.executable_path" &> /dev/null; then
    echo "Installing Chromium browser (~150MB, ~30 seconds)..."
    venv/bin/playwright install chromium
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}⚠️  Playwright installation incomplete${NC}"
        echo "Browser automation may not work. Try manually: playwright install chromium"
    else
        echo -e "${GREEN}✅ Chromium ready${NC}"
    fi
else
    echo -e "${GREEN}✅ Chromium ready${NC}"
fi

# Step 6: Verify directories
echo -e "${BLUE}[6/7] Verifying directories...${NC}"
mkdir -p generated_offers
mkdir -p templates
echo -e "${GREEN}✅ All directories ready${NC}"

# Step 7: Check ports
echo -e "${BLUE}[7/7] Checking ports...${NC}"
if lsof -Pi :8765 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 8765 is already in use${NC}"
    read -p "Kill existing process on port 8765? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        lsof -ti:8765 | xargs kill -9 2>/dev/null
        echo "Process killed"
    else
        echo "Cannot start with port in use. Exiting."
        echo ""
        read -p "Press Enter to exit..."
        exit 1
    fi
fi

if lsof -Pi :8766 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 8766 is already in use${NC}"
    read -p "Kill existing process on port 8766? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        lsof -ti:8766 | xargs kill -9 2>/dev/null
        echo "Process killed"
    else
        echo "Cannot start with port in use. Exiting."
        echo ""
        read -p "Press Enter to exit..."
        exit 1
    fi
fi
echo -e "${GREEN}✅ Ports available${NC}"

echo ""
echo "Starting servers..."
echo ""

# Start backend
echo -e "${BLUE}Starting backend server...${NC}"
cd backend
$PYTHON_CMD app.py &
BACKEND_PID=$!
cd ..

# Wait for backend to initialize
sleep 3

# Start frontend
echo -e "${BLUE}Starting frontend server...${NC}"
$PYTHON_CMD -m http.server 8766 -d frontend &
FRONTEND_PID=$!

# Wait a moment for servers to fully start
sleep 2

echo ""
echo -e "${GREEN}✅ Backend running on http://localhost:8765${NC}"
echo -e "${GREEN}✅ Frontend running on http://localhost:8766${NC}"
echo ""
echo "================================================"
echo -e "${GREEN}📱 Open your browser: http://localhost:8766${NC}"
echo -e "${BLUE}📚 API docs: http://localhost:8765/docs${NC}"
echo "================================================"
echo ""
echo "Press Ctrl+C to stop servers..."
echo ""

# Cleanup function
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    # Also kill any remaining processes on the ports
    lsof -ti:8765 | xargs kill -9 2>/dev/null
    lsof -ti:8766 | xargs kill -9 2>/dev/null
    echo -e "${GREEN}✅ Servers stopped${NC}"
    echo ""
    exit 0
}

# Trap Ctrl+C
trap cleanup INT TERM

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID
