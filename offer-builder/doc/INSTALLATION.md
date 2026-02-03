# Installation Guide - Syntra Bizz Offerte Generator

Complete installation guide for all platforms.

---

## Table of Contents

- [System Requirements](#system-requirements)
- [Quick Installation](#quick-installation)
- [Platform-Specific Installation](#platform-specific-installation)
- [Post-Installation Configuration](#post-installation-configuration)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)
- [Uninstallation](#uninstallation)

---

## System Requirements

### All Platforms

- **Python**: 3.9 or higher
- **Disk Space**: 500MB free space
- **RAM**: 4GB minimum
- **Network**: Internet connection required for installation
- **API Key**: Google Gemini API key (free tier available)

### Platform-Specific

**macOS**:
- macOS 10.14 (Mojave) or higher
- Xcode Command Line Tools (auto-installed if missing)

**Windows**:
- Windows 10 or higher
- PowerShell or Command Prompt

**Linux**:
- Ubuntu 20.04+, Debian 11+, Fedora 35+, or equivalent
- `sudo` access for system dependencies

---

## Quick Installation

### Universal Command (All Platforms)

```bash
bash install.sh
```

This single command will:
1. Detect your operating system
2. Validate system requirements
3. Install all dependencies
4. Configure the environment
5. Verify the installation

**Estimated time**: 5-10 minutes

---

## Platform-Specific Installation

### macOS

#### Method 1: Using the Installer Script (Recommended)

1. **Open Terminal** (Applications > Utilities > Terminal)

2. **Navigate to project directory**:
   ```bash
   cd /path/to/offer-builder
   ```

3. **Run installer**:
   ```bash
   bash install-mac.sh
   ```

4. **Follow on-screen instructions**

The script will:
- ✅ Check Python 3.9+ installation
- ✅ Verify Xcode Command Line Tools
- ✅ Check disk space (need 500MB)
- ✅ Test network connectivity
- ✅ Create virtual environment
- ✅ Install Python dependencies (~105MB)
- ✅ Install Playwright Chromium (~150MB)
- ✅ Set up `.env` file
- ✅ Create required directories
- ✅ Run verification tests

#### Method 2: Manual Installation

<details>
<summary>Click to expand manual instructions</summary>

1. **Check Python version**:
   ```bash
   python3 --version
   # Should be 3.9 or higher
   ```

2. **Install Python if needed**:
   ```bash
   brew install python@3.11
   ```

3. **Create virtual environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

4. **Install dependencies**:
   ```bash
   pip install -r backend/requirements.txt
   playwright install chromium
   ```

5. **Configure environment**:
   ```bash
   cp env.template .env
   nano .env  # Edit and add API key
   ```

6. **Create directories**:
   ```bash
   mkdir -p generated_offers templates/user_uploads
   ```

</details>

---

### Windows

#### Method 1: Using the Installer Script (Recommended)

1. **Open Command Prompt**:
   - Press `Win + R`
   - Type `cmd` and press Enter

2. **Navigate to project directory**:
   ```cmd
   cd C:\path\to\offer-builder
   ```

3. **Run installer**:
   ```cmd
   install.bat
   ```

4. **Follow on-screen instructions**

The script will:
- ✅ Detect Python installation (tries `py`, `python`, `python3`)
- ✅ Validate Python 3.9+
- ✅ Create virtual environment
- ✅ Install Python dependencies
- ✅ Install Playwright Chromium
- ✅ Set up `.env` file
- ✅ Create required directories
- ✅ Run verification tests

#### Troubleshooting Windows

**If Python is not found**:
1. Download Python from [python.org](https://www.python.org/downloads/)
2. During installation, **check "Add Python to PATH"**
3. Restart Command Prompt and try again

**If you get a "script is disabled" error**:
- Run Command Prompt as Administrator
- Or use `install.bat` instead of PowerShell

---

### Linux (Ubuntu/Debian/Fedora)

#### Method 1: Using the Installer Script (Recommended)

1. **Open Terminal** (Ctrl + Alt + T)

2. **Navigate to project directory**:
   ```bash
   cd /path/to/offer-builder
   ```

3. **Run installer**:
   ```bash
   bash install-linux.sh
   ```

4. **Follow on-screen instructions**

The script will:
- ✅ Detect Linux distribution
- ✅ Check Python 3.9+ installation
- ✅ Install `python3-venv` if missing
- ✅ Install system dependencies for Playwright
- ✅ Create virtual environment
- ✅ Install Python dependencies
- ✅ Install Playwright Chromium
- ✅ Set up `.env` file
- ✅ Create required directories
- ✅ Run verification tests

#### Distribution-Specific Notes

**Ubuntu/Debian**:
```bash
# Install Python 3.11 if needed
sudo apt update
sudo apt install python3.11 python3.11-venv
```

**Fedora/CentOS**:
```bash
# Install Python 3.11 if needed
sudo dnf install python3.11
```

**System Dependencies**:
The installer automatically installs Chromium dependencies:
- libnss3, libnspr4, libatk1.0-0
- libcups2, libdrm2, libgbm1
- libasound2, libpango-1.0-0, libcairo2

---

## Post-Installation Configuration

### Step 1: Get Gemini API Key

1. **Visit Google AI Studio**:
   - https://makersuite.google.com/app/apikey

2. **Sign in** with your Google account

3. **Create API Key**:
   - Click "Create API Key"
   - Select project or create new one
   - Copy the generated key

### Step 2: Configure `.env` File

**macOS/Linux**:
```bash
nano .env
```

**Windows**:
```cmd
notepad .env
```

**Edit these values**:
```env
GEMINI_API_KEY=your_actual_api_key_here
ALLOWED_ORIGINS=http://localhost:8766,http://127.0.0.1:8766
TEMPLATE_PATH=./2026_xxx_MP_klant_blanco bizz offerte caroline-nieuwe versie.docx
OUTPUT_DIR=./generated_offers
```

**Save and close** the editor.

### Step 3: Verify Configuration

Run the configuration checker:
```bash
bash check-config.sh
```

If all checks pass, you're ready to launch!

---

## Verification

### Automatic Verification

The installer runs `verification.py` automatically at the end.

### Manual Verification

To verify installation manually:

```bash
# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate.bat  # Windows

# Run verification
python verification.py
```

**Expected output**:
```
==================================================
Installation Verification
==================================================
✅ Python 3.9+
✅ Virtual environment
✅ Core packages
✅ Playwright Chromium
✅ .env file
✅ Required directories
✅ Backend files
==================================================
✅ All checks passed!
```

---

## Troubleshooting

### Common Issues

#### 1. Python Not Found

**Error**: `python3: command not found`

**Solutions**:

**macOS**:
```bash
# Install with Homebrew
brew install python@3.11

# Or download from python.org
```

**Ubuntu/Debian**:
```bash
sudo apt update
sudo apt install python3.11
```

**Windows**:
- Download from [python.org](https://www.python.org/downloads/)
- **Important**: Check "Add Python to PATH" during installation

---

#### 2. Permission Denied

**Error**: `Permission denied: cannot create venv`

**Solutions**:

**macOS/Linux**:
```bash
# Fix ownership
sudo chown -R $USER:$USER .

# Or run without sudo
chmod -R u+w .
```

**Windows**:
- Run Command Prompt as Administrator
- Or change installation location to your user directory

---

#### 3. Network Timeout

**Error**: `Could not fetch URL` or `Timeout downloading packages`

**Solutions**:

```bash
# Increase timeout
pip install --timeout=300 -r backend/requirements.txt

# Use a mirror (if in China/Asia)
pip install --index-url https://pypi.tuna.tsinghua.edu.cn/simple -r backend/requirements.txt
```

---

#### 4. Playwright Installation Fails

**Error**: `Failed to download Chromium`

**Solutions**:

```bash
# Manual installation with verbose logging
playwright install chromium --verbose

# With system dependencies (Linux)
playwright install --with-deps chromium

# Check available space
df -h .  # Need at least 500MB free
```

---

#### 5. Python Version Too Old

**Error**: `Python 3.8 is too old (need 3.9+)`

**Solutions**:

**macOS**:
```bash
# Install specific version
brew install python@3.11

# Use specific version for venv
/opt/homebrew/bin/python3.11 -m venv venv
```

**Ubuntu/Debian**:
```bash
# Add deadsnakes PPA
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt update
sudo apt install python3.11 python3.11-venv

# Create venv with specific version
python3.11 -m venv venv
```

---

#### 6. Missing Xcode Command Line Tools (macOS)

**Error**: `xcode-select: error: tool 'xcodebuild' requires Xcode`

**Solution**:
```bash
xcode-select --install
# Follow the on-screen prompts
# Then re-run install-mac.sh
```

---

#### 7. Insufficient Disk Space

**Error**: `Insufficient disk space (need 500MB)`

**Solution**:
- Free up disk space
- Remove old files/applications
- Empty trash
- Clean brew cache: `brew cleanup` (macOS)

---

#### 8. API Key Not Working

**Error**: `Invalid API key` or `403 Forbidden`

**Solutions**:

1. **Verify API key**:
   - Check for extra spaces: `GEMINI_API_KEY=AIzaSy...` (no spaces)
   - Make sure key is copied completely

2. **Check API key status**:
   - Visit https://makersuite.google.com/app/apikey
   - Verify key is active and not revoked

3. **Check API quotas**:
   - Free tier: 60 requests/minute
   - Check usage in Google AI Studio dashboard

---

### Getting More Help

**Documentation**:
- `doc/01-setup.md` - Detailed setup guide
- `doc/06-quick-reference.md` - Quick troubleshooting

**Check configuration**:
```bash
bash check-config.sh
```

**Contact Support**:
- Email: steff@vanhaverbeke.com
- Include: OS version, Python version, error messages

---

## Uninstallation

### Clean Removal

To completely remove the installation:

**macOS/Linux**:
```bash
# Remove virtual environment
rm -rf venv/

# Remove generated files
rm -rf generated_offers/
rm -rf __pycache__/
rm -rf backend/__pycache__/
rm -rf backend/services/__pycache__/

# Remove environment file (keeps your API key!)
# Only delete if you want to remove all config
rm .env

# Keep: Source code, documentation, templates
```

**Windows**:
```cmd
# Remove virtual environment
rmdir /s /q venv

# Remove generated files
rmdir /s /q generated_offers
del /s /q __pycache__
del /s /q backend\__pycache__
del /s /q backend\services\__pycache__

# Remove environment file
del .env
```

### Reinstallation

After uninstallation, you can reinstall by running the installer again:
```bash
bash install.sh
```

---

## Advanced Configuration

### Offline Installation

**Prepare on connected machine**:
```bash
# Download all packages
pip download -r backend/requirements.txt -d ./packages/

# Package includes:
# - packages/ directory
# - install scripts
# - project files
```

**Install on offline machine**:
```bash
# Install from local packages
pip install --no-index --find-links=./packages/ -r backend/requirements.txt

# Playwright browsers need manual transfer:
# Copy ~/.cache/ms-playwright/ from connected machine
```

### Custom Installation Location

Change the default paths in `.env`:
```env
# Custom output directory
OUTPUT_DIR=/path/to/custom/output

# Custom template path
TEMPLATE_PATH=/path/to/custom/template.docx

# Custom templates directory
TEMPLATES_DIR=/path/to/custom/templates
```

### Development Setup

For development (includes testing tools):
```bash
# Install with dev dependencies
pip install -r backend/requirements.txt
pip install -r backend/requirements-dev.txt  # If exists

# Enable debug mode in .env
DEBUG=true
```

---

## Next Steps

After successful installation:

1. **✅ Configure API key** (required)
2. **✅ Start the application**:
   - macOS: Double-click `Start Syntra Offer Builder.command`
   - Windows: Double-click `Start Syntra Offer Builder.bat`
   - Linux: Run `./start.sh`

3. **📚 Read the documentation**:
   - `doc/02-first-use.md` - First time user guide
   - `doc/03-best-practices.md` - Optimization tips
   - `doc/06-quick-reference.md` - Quick reference

4. **🎯 Create your first offer**:
   - Upload a CRM screenshot or use browser login
   - Add training URL
   - Fill intake information
   - Generate and download

---

**Copyright © 2026 Steff Vanhaverbeke for Syntra Bizz**  
Licensed under the MIT License

**Version**: 1.0.0  
**Last Updated**: January 2026
