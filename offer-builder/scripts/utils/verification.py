#!/usr/bin/env python3
"""
Syntra Bizz Offer Builder - Installation Verification Script

Copyright (c) 2026 Steff Vanhaverbeke for Syntra Bizz
Licensed under the MIT License

Verifies that all required components are installed and configured correctly.
"""

import sys
import os


def verify_installation():
    """Run all verification checks and report results."""
    checks = []
    
    # 1. Python version check
    py_version = sys.version_info
    checks.append(("Python 3.9+", py_version >= (3, 9)))
    
    # 2. Virtual environment check
    in_venv = (hasattr(sys, 'real_prefix') or 
               (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix))
    checks.append(("Virtual environment", in_venv))
    
    # 3. Required packages
    packages_ok = True
    try:
        import fastapi
        import google.generativeai
        import playwright
        from docx import Document
        import uvicorn
        import pydantic
    except ImportError as e:
        packages_ok = False
        print(f"  Import error: {e}")
    
    checks.append(("Core packages", packages_ok))
    
    # 4. Playwright browsers
    playwright_ok = True
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            # Just check if chromium executable exists
            browser = p.chromium.launch()
            browser.close()
    except Exception as e:
        playwright_ok = False
        print(f"  Playwright error: {e}")
    
    checks.append(("Playwright Chromium", playwright_ok))
    
    # 5. Environment file
    env_exists = os.path.exists(".env")
    checks.append((".env file", env_exists))
    
    # 6. Required directories
    dirs_ok = (os.path.exists("generated_offers") and 
               os.path.exists("templates"))
    checks.append(("Required directories", dirs_ok))
    
    # 7. Backend structure
    backend_ok = (os.path.exists("backend/app.py") and 
                  os.path.exists("backend/requirements.txt"))
    checks.append(("Backend files", backend_ok))
    
    # Print results
    print("\n" + "="*50)
    print("Installation Verification")
    print("="*50)
    
    all_passed = True
    for name, passed in checks:
        status = "✅" if passed else "❌"
        print(f"{status} {name}")
        if not passed:
            all_passed = False
    
    print("="*50)
    
    if all_passed:
        print("✅ All checks passed!")
    else:
        print("❌ Some checks failed. Please review the output above.")
    
    print("")
    
    return all_passed


if __name__ == "__main__":
    try:
        success = verify_installation()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"❌ Verification failed with error: {e}")
        sys.exit(1)
