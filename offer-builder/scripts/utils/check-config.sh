#!/bin/bash
# Syntra Bizz Offer Builder - Configuration Validation Script
# Copyright (c) 2026 Steff Vanhaverbeke for Syntra Bizz
# Licensed under the MIT License
#
# Validates configuration before launching the application

# Color definitions
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Navigate to project root (two levels up from scripts/utils/)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1

echo "Checking configuration..."
echo ""

ALL_OK=true

# Check 1: .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file missing${NC}"
    echo "   Solution: cp env.template .env"
    ALL_OK=false
else
    echo -e "${GREEN}✅ .env file exists${NC}"
    
    # Check 2: API key configured
    API_KEY=$(grep "GEMINI_API_KEY=" .env | cut -d'=' -f2 | tr -d ' ')
    
    if [ -z "$API_KEY" ]; then
        echo -e "${RED}❌ GEMINI_API_KEY is empty in .env${NC}"
        echo "   Solution: Edit .env and add your API key"
        ALL_OK=false
    elif [ "$API_KEY" = "your_gemini_api_key_here" ]; then
        echo -e "${RED}❌ GEMINI_API_KEY not configured (still using placeholder)${NC}"
        echo "   Solution: Edit .env and replace with your actual API key"
        echo "   Get key: https://makersuite.google.com/app/apikey"
        ALL_OK=false
    else
        # API key looks configured
        KEY_LENGTH=${#API_KEY}
        if [ $KEY_LENGTH -lt 20 ]; then
            echo -e "${YELLOW}⚠️  GEMINI_API_KEY seems too short ($KEY_LENGTH chars)${NC}"
            echo "   Warning: This may not be a valid API key"
        else
            echo -e "${GREEN}✅ GEMINI_API_KEY configured${NC}"
        fi
    fi
fi

# Check 3: Virtual environment exists
if [ ! -d venv ]; then
    echo -e "${RED}❌ Virtual environment missing${NC}"
    echo "   Solution: Run install script first"
    echo "   macOS: bash install-mac.sh"
    echo "   Linux: bash install-linux.sh"
    echo "   Windows: install.bat"
    ALL_OK=false
else
    echo -e "${GREEN}✅ Virtual environment exists${NC}"
fi

# Check 4: Backend files exist
if [ ! -f backend/app.py ]; then
    echo -e "${RED}❌ Backend application missing (backend/app.py)${NC}"
    ALL_OK=false
else
    echo -e "${GREEN}✅ Backend files present${NC}"
fi

# Check 5: Required directories
if [ ! -d generated_offers ]; then
    echo -e "${YELLOW}⚠️  generated_offers directory missing${NC}"
    mkdir -p generated_offers
    echo "   Created: generated_offers/"
fi

if [ ! -d templates ]; then
    echo -e "${YELLOW}⚠️  templates directory missing${NC}"
    mkdir -p templates
    echo "   Created: templates/"
fi

# Check 6: Template file (optional check)
TEMPLATE_PATH=$(grep "TEMPLATE_PATH=" .env 2>/dev/null | cut -d'=' -f2 | tr -d ' ')
if [ -n "$TEMPLATE_PATH" ] && [ ! -f "$TEMPLATE_PATH" ]; then
    echo -e "${YELLOW}⚠️  Template file not found: $TEMPLATE_PATH${NC}"
    echo "   Warning: DOCX generation will fail without a valid template"
fi

echo ""
echo "=========================================="

if [ "$ALL_OK" = true ]; then
    echo -e "${GREEN}✅ Configuration valid - ready to launch!${NC}"
    echo "=========================================="
    echo ""
    exit 0
else
    echo -e "${RED}❌ Configuration incomplete${NC}"
    echo "=========================================="
    echo ""
    echo "Please fix the issues above and run this script again."
    echo ""
    exit 1
fi
