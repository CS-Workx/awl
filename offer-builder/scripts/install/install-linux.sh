#!/bin/bash
# Syntra Bizz Offer Builder - Linux Installation Script
# Copyright (c) 2026 Steff Vanhaverbeke for Syntra Bizz
# Licensed under the MIT License

set -e  # Exit on error

# Color definitions
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Navigate to project root (two levels up from scripts/install/)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1

# Display banner
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Syntra Bizz Offer Builder - Linux Setup  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Detect distribution
DISTRO="unknown"
if [ -f /etc/os-release ]; then
    . /etc/os-release
    DISTRO=$ID
fi

echo "Detected distribution: $DISTRO"
echo ""

# Cleanup function for errors
cleanup() {
    echo -e "${RED}Installation failed. Cleaning up...${NC}"
    rm -rf venv/ 2>/dev/null
    exit 1
}

trap cleanup ERR

# Step 1: Python validation
echo -e "${BLUE}[1/9]${NC} Validating Python installation..."

# Check if python3 exists
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 not found${NC}"
    echo "Please install Python 3.9 or higher:"
    case $DISTRO in
        ubuntu|debian)
            echo "  sudo apt update && sudo apt install python3.11"
            ;;
        fedora|centos|rhel)
            echo "  sudo dnf install python3.11"
            ;;
        *)
            echo "  Install Python 3.9+ using your package manager"
            ;;
    esac
    exit 1
fi

# Get Python version
PYTHON_VERSION=$(python3 --version 2>&1 | grep -oE '[0-9]+\.[0-9]+' | head -1)
PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)

# Check version is 3.9+
if [ "$PYTHON_MAJOR" -lt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 9 ]); then
    echo -e "${RED}❌ Python $PYTHON_VERSION is too old (need 3.9+)${NC}"
    echo "Please install Python 3.9 or higher"
    exit 1
fi

echo -e "${GREEN}✅ Python $PYTHON_VERSION detected${NC}"

# Step 2: Check python3-venv
echo -e "${BLUE}[2/9]${NC} Checking python3-venv..."

if ! python3 -m venv --help &>/dev/null; then
    echo -e "${YELLOW}⚠️  python3-venv not found, installing...${NC}"
    case $DISTRO in
        ubuntu|debian)
            sudo apt-get update
            sudo apt-get install -y python3-venv
            ;;
        fedora|centos|rhel)
            sudo dnf install -y python3-venv
            ;;
        *)
            echo -e "${RED}❌ Cannot auto-install python3-venv on $DISTRO${NC}"
            echo "Please install python3-venv manually and re-run this script"
            exit 1
            ;;
    esac
fi

echo -e "${GREEN}✅ python3-venv available${NC}"

# Step 3: System dependencies for Playwright
echo -e "${BLUE}[3/9]${NC} Checking system dependencies for Playwright..."

case $DISTRO in
    ubuntu|debian)
        echo "Installing Chromium dependencies..."
        sudo apt-get update -qq
        sudo apt-get install -y -qq \
            libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 \
            libcups2 libdrm2 libxkbcommon0 libxcomposite1 \
            libxdamage1 libxfixes3 libxrandr2 libgbm1 \
            libasound2 libpango-1.0-0 libcairo2 2>/dev/null || true
        ;;
    fedora|centos|rhel)
        echo "Installing Chromium dependencies..."
        sudo dnf install -y -q \
            nss nspr atk at-spi2-atk cups-libs libdrm \
            libxkbcommon libXcomposite libXdamage libXrandr \
            mesa-libgbm alsa-lib pango cairo 2>/dev/null || true
        ;;
    *)
        echo -e "${YELLOW}⚠️  Unknown distribution, skipping system dependencies${NC}"
        echo "Playwright may require additional system packages"
        ;;
esac

echo -e "${GREEN}✅ System dependencies checked${NC}"

# Step 4: Disk space check
echo -e "${BLUE}[4/9]${NC} Checking disk space..."

# Get available space in MB
AVAILABLE_MB=$(df -m . | awk 'NR==2 {print $4}')

if [ "$AVAILABLE_MB" -lt 500 ]; then
    echo -e "${RED}❌ Insufficient disk space (need 500MB, have ${AVAILABLE_MB}MB)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Sufficient disk space available (${AVAILABLE_MB}MB)${NC}"

# Step 5: Network connectivity
echo -e "${BLUE}[5/9]${NC} Checking network connectivity..."

if ! curl -s --head --max-time 5 https://pypi.org | head -n 1 | grep "HTTP" > /dev/null; then
    echo -e "${RED}❌ Cannot reach PyPI (no internet connection)${NC}"
    echo "Please check your network connection and try again."
    exit 1
fi

echo -e "${GREEN}✅ Network connection OK${NC}"

# Step 6: Virtual environment
echo -e "${BLUE}[6/9]${NC} Setting up virtual environment..."

if [ -d "venv" ]; then
    echo -e "${YELLOW}⚠️  Virtual environment already exists, skipping creation${NC}"
else
    python3 -m venv venv
    echo -e "${GREEN}✅ Virtual environment created${NC}"
fi

# Activate venv
source venv/bin/activate

# Step 7: Upgrade pip
echo -e "${BLUE}[7/9]${NC} Upgrading pip..."

python -m pip install --quiet --upgrade pip setuptools wheel

echo -e "${GREEN}✅ pip upgraded${NC}"

# Step 8: Install dependencies
echo -e "${BLUE}[8/9]${NC} Installing Python dependencies (~105MB, 2-5 minutes)..."
echo "This may take a while depending on your internet connection..."

# Install with progress
if pip install -q -r backend/requirements.txt; then
    echo -e "${GREEN}✅ All dependencies installed${NC}"
else
    echo -e "${RED}❌ Dependency installation failed${NC}"
    echo "Try running manually: source venv/bin/activate && pip install -r backend/requirements.txt"
    exit 1
fi

# Step 9: Playwright browsers
echo -e "${BLUE}[9/9]${NC} Installing Playwright Chromium (~150MB, 30-60 seconds)..."

if playwright install chromium; then
    echo -e "${GREEN}✅ Playwright Chromium installed${NC}"
else
    echo -e "${YELLOW}⚠️  Playwright installation had issues, but continuing...${NC}"
fi

# Environment configuration
echo ""
echo -e "${BLUE}Setting up environment...${NC}"

if [ ! -f .env ]; then
    cp env.template .env
    echo -e "${GREEN}✅ .env file created from template${NC}"
    echo -e "${YELLOW}⚠️  Please configure GEMINI_API_KEY in .env before first use${NC}"
else
    echo -e "${YELLOW}⚠️  .env file already exists, skipping${NC}"
fi

# Create required directories
mkdir -p generated_offers
mkdir -p templates/user_uploads

echo -e "${GREEN}✅ Directories created${NC}"

# Verification
echo ""
echo -e "${BLUE}Running verification tests...${NC}"
echo ""

if python verification.py; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║     ✅ Installation Complete!               ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}📋 IMPORTANT: Configure API Key${NC}"
    echo "   1. Open .env file:"
    echo "      nano .env"
    echo "      (or use your preferred text editor)"
    echo ""
    echo "   2. Get your Gemini API key:"
    echo "      https://makersuite.google.com/app/apikey"
    echo ""
    echo "   3. Replace 'your_gemini_api_key_here' with your actual key"
    echo ""
    echo -e "${BLUE}🚀 Start Application:${NC}"
    echo "   ./start.sh"
    echo "   (or create your own launch script)"
    echo ""
    echo -e "${BLUE}📚 Documentation:${NC} See doc/ folder"
    echo -e "${BLUE}💬 Support:${NC} steff@vanhaverbeke.com"
    echo ""
else
    echo ""
    echo -e "${RED}╔════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║   ⚠️  Installation Incomplete               ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Some verification checks failed. Please review the output above."
    echo "You may need to:"
    echo "  - Manually install missing packages: pip install -r backend/requirements.txt"
    echo "  - Install Playwright browsers: playwright install chromium"
    echo "  - Check for error messages in the output"
    echo ""
    exit 1
fi
