#!/bin/bash
# Syntra Bizz Offer Builder - Universal Installation Script
# Copyright (c) 2026 Steff Vanhaverbeke for Syntra Bizz
# Licensed under the MIT License
#
# Detects operating system and delegates to platform-specific installer

# Navigate to project root (two levels up from scripts/install/)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1

# Display banner
echo "🚀 Syntra Bizz Offer Builder - Installation"
echo "============================================="
echo ""

# Detect operating system
OS="unknown"
case "$(uname -s)" in
    Darwin*)
        OS="mac"
        OS_NAME="macOS"
        ;;
    Linux*)
        OS="linux"
        OS_NAME="Linux"
        ;;
    MINGW*|MSYS*|CYGWIN*)
        OS="windows"
        OS_NAME="Windows (Git Bash/MSYS)"
        ;;
    *)
        echo "❌ Unsupported operating system: $(uname -s)"
        echo ""
        echo "Supported platforms:"
        echo "  - macOS"
        echo "  - Linux (Ubuntu, Debian, Fedora, CentOS)"
        echo "  - Windows (use install.bat directly)"
        echo ""
        exit 1
        ;;
esac

echo "Detected OS: $OS_NAME"
echo ""

# Delegate to platform-specific installer
case $OS in
    mac)
        if [ ! -f "install-mac.sh" ]; then
            echo "❌ Error: install-mac.sh not found"
            exit 1
        fi
        
        # Make sure it's executable
        chmod +x install-mac.sh
        
        # Run macOS installer
        bash install-mac.sh
        ;;
        
    linux)
        if [ ! -f "install-linux.sh" ]; then
            echo "❌ Error: install-linux.sh not found"
            exit 1
        fi
        
        # Make sure it's executable
        chmod +x install-linux.sh
        
        # Run Linux installer
        bash install-linux.sh
        ;;
        
    windows)
        echo "For Windows installation, please run:"
        echo "  install.bat"
        echo ""
        echo "Double-click install.bat or run from Command Prompt:"
        echo "  cmd.exe /c install.bat"
        echo ""
        
        # Try to run if we're in a bash-compatible environment on Windows
        if [ -f "install.bat" ]; then
            echo "Attempting to run install.bat..."
            cmd.exe /c install.bat
        fi
        ;;
        
    *)
        echo "❌ Unknown OS: $OS"
        exit 1
        ;;
esac

exit $?
