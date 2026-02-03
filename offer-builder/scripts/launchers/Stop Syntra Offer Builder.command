#!/bin/bash

# Syntra Bizz Offer Generator - Stop Script (macOS)
# Copyright (c) 2026 Steff Vanhaverbeke for Syntra Bizz

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "Stopping Syntra Bizz Offer Generator..."
echo ""

# Check and kill processes on port 8765 (backend)
if lsof -Pi :8765 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}Stopping backend (port 8765)...${NC}"
    lsof -ti:8765 | xargs kill -9 2>/dev/null
    echo -e "${GREEN}✅ Backend stopped${NC}"
else
    echo "Backend not running on port 8765"
fi

# Check and kill processes on port 8766 (frontend)
if lsof -Pi :8766 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}Stopping frontend (port 8766)...${NC}"
    lsof -ti:8766 | xargs kill -9 2>/dev/null
    echo -e "${GREEN}✅ Frontend stopped${NC}"
else
    echo "Frontend not running on port 8766"
fi

echo ""
echo -e "${GREEN}✅ All servers stopped${NC}"
echo ""
read -p "Press Enter to close..."
