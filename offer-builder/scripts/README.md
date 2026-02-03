# Scripts Directory

This directory contains all automation and utility scripts for the Syntra Bizz Offer Generator project.

---

## Directory Structure

```
scripts/
├── install/        # Installation scripts for different platforms
├── launchers/      # Application start/stop scripts
├── utils/          # Utility and helper scripts
└── README.md       # This file
```

---

## Installation Scripts (`/install/`)

Scripts for setting up the application on different platforms.

### `install.sh` (Universal)
**Purpose**: Platform-agnostic installation script that detects OS and runs appropriate installer.

**Usage**:
```bash
bash scripts/install/install.sh
```

**What it does**:
- Detects operating system
- Validates Python 3.9+ installation
- Creates virtual environment
- Installs Python dependencies
- Installs Playwright Chromium browser
- Creates necessary directories
- Copies environment template
- Verifies installation

### `install-mac.sh`
**Purpose**: macOS-specific installation with native features.

**Usage**:
```bash
bash scripts/install/install-mac.sh
```

**Additional features**:
- macOS-specific path handling
- Homebrew integration suggestions
- Terminal permissions guidance

### `install-linux.sh`
**Purpose**: Linux-specific installation (Ubuntu/Debian/Fedora).

**Usage**:
```bash
bash scripts/install/install-linux.sh
```

**Additional features**:
- APT/YUM package manager support
- Linux-specific Python path detection
- Distribution-specific instructions

### `install.bat`
**Purpose**: Windows installation script.

**Usage**:
```cmd
scripts\install\install.bat
```

**Additional features**:
- Windows path handling
- py launcher support
- CMD-specific error handling

---

## Launcher Scripts (`/launchers/`)

Scripts for starting and stopping the application.

### Start Scripts

#### `Start Syntra Offer Builder.command` (macOS)
**Purpose**: Double-clickable macOS launcher with GUI support.

**Usage**: 
- Double-click in Finder
- Or: `./scripts/launchers/Start\ Syntra\ Offer\ Builder.command`

**Features**:
- Validates installation (venv, dependencies)
- Checks configuration (.env file)
- Starts backend on port 8765
- Starts frontend on port 8766
- Opens browser automatically
- Graceful shutdown on Ctrl+C

#### `Start Syntra Offer Builder.bat` (Windows)
**Purpose**: Double-clickable Windows launcher.

**Usage**:
- Double-click in File Explorer
- Or: `scripts\launchers\Start Syntra Offer Builder.bat`

**Features**:
- Same as macOS version, adapted for Windows
- CMD window with colored output
- Keeps window open for logs

#### `start.sh` (Legacy)
**Purpose**: Simple terminal-based launcher.

**Usage**:
```bash
bash scripts/launchers/start.sh
```

**Features**:
- Minimal setup
- Starts both servers
- Ctrl+C to stop

### Stop Scripts

#### `Stop Syntra Offer Builder.command` (macOS)
**Purpose**: Gracefully stop all running processes.

**Usage**:
- Double-click in Finder
- Or: `./scripts/launchers/Stop\ Syntra\ Offer\ Builder.command`

**What it does**:
- Finds processes on ports 8765 and 8766
- Terminates them gracefully
- Confirms shutdown

#### `Stop Syntra Offer Builder.bat` (Windows)
**Purpose**: Windows equivalent stop script.

**Usage**:
- Double-click in File Explorer
- Or: `scripts\launchers\Stop Syntra Offer Builder.bat`

---

## Utility Scripts (`/utils/`)

Helper and diagnostic scripts.

### `check-config.sh`
**Purpose**: Validates environment configuration and installation.

**Usage**:
```bash
bash scripts/utils/check-config.sh
```

**Checks**:
- Python version and location
- Virtual environment exists and activated
- .env file exists and valid
- Required Python packages installed
- Playwright browser installed
- Template file exists
- Output directory exists and writable
- File permissions

**Output**: Detailed report with ✅/❌ status indicators.

### `verification.py`
**Purpose**: Python-based installation verification.

**Usage**:
```bash
python scripts/utils/verification.py
```

**Verifies**:
- Python imports work
- Dependencies installed correctly
- API connectivity (if configured)
- File structure integrity

---

## Script Development Guidelines

### Path Handling

All scripts must navigate to project root at start:

**Bash/Shell:**
```bash
#!/bin/bash
# Navigate to project root (two levels up from scripts/*)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1
```

**Windows Batch:**
```batch
@echo off
REM Navigate to project root
cd /d "%~dp0..\..\"
```

### Error Handling

**Bash:**
```bash
# Exit on errors
set -e

# Check command success
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 not found"
    exit 1
fi
```

**Batch:**
```batch
REM Check command success
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python not found
    exit /b 1
)
```

### Output Formatting

Use clear, colored output when possible:

**Bash:**
```bash
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}✅ Success${NC}"
echo -e "${RED}❌ Error${NC}"
```

### Testing Scripts

Before committing:
1. Test from script's own directory
2. Test from project root
3. Test from arbitrary location
4. Verify all paths resolve correctly
5. Test error cases
6. Check output is user-friendly

---

## Adding New Scripts

### Checklist

1. **Choose correct subdirectory**:
   - Installation → `/install/`
   - Starting/stopping app → `/launchers/`
   - Diagnostics/utilities → `/utils/`

2. **Follow naming conventions**:
   - Descriptive names
   - Platform suffix if needed: `-mac.sh`, `.bat`
   - Use hyphens for multi-word: `check-config.sh`

3. **Include proper headers**:
   ```bash
   #!/bin/bash
   #
   # Script Name - Brief Description
   # Part of Syntra Bizz Offer Generator
   #
   ```

4. **Make executable** (Unix):
   ```bash
   chmod +x scripts/category/script-name.sh
   ```

5. **Handle paths correctly**:
   - Navigate to project root
   - Use relative paths from root
   - Test from different directories

6. **Document**:
   - Add entry to this README
   - Include usage examples
   - Explain what it does

7. **Test thoroughly**:
   - Multiple platforms if applicable
   - Various starting directories
   - Error conditions

---

## Troubleshooting

### "Permission denied" on macOS/Linux
```bash
chmod +x scripts/category/script-name.sh
```

### "command not found" for Python
Check Python installation:
```bash
python3 --version
which python3
```

### Scripts can't find files
- Ensure script navigates to project root
- Check relative paths
- Verify working directory: `pwd`

### Port already in use (8765 or 8766)
Run stop script:
```bash
bash scripts/launchers/Stop\ Syntra\ Offer\ Builder.command
```

Or manually:
```bash
lsof -ti:8765 | xargs kill -9  # macOS/Linux
```

---

## Platform-Specific Notes

### macOS
- Scripts need executable permission: `chmod +x`
- May need to allow in System Preferences > Security
- Use `.command` extension for double-clickable scripts

### Windows
- Use `.bat` extension
- Paths use backslash: `\`
- `py` launcher may be available instead of `python`

### Linux
- Package managers vary (apt, yum, dnf)
- Python may be `python` or `python3`
- Virtual environment activation path: `venv/bin/activate`

---

**For more information, see**:
- Project documentation: `/doc/`
- AI Development Rules: `/AI_DEVELOPMENT_RULES.md`
- Installation guide: `/doc/01-setup.md`
