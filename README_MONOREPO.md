# Productivity Tools Monorepo

A collection of self-hosted productivity tools for coaches, trainers, and educators. Each tool is designed for privacy-first, VPS deployment.

**Maintained by:** Steff Van Haverbeke (steff@thehouseofcoaching.com)

---

## 📦 Tools in this Repository

### 1. AWL Scanner (`awl/`)
**Progressive Web App for Attendance List Scanning**

- 📸 AI-powered OCR using Gemini Vision
- 📧 Email integration (Microsoft Graph API)
- 📱 PWA - Install on iPhone home screen
- 🖼️ Multi-image support (up to 10 photos)
- 📄 Auto-generate CSV + PDF

**Tech Stack:** Node.js, Express, Gemini Vision API  
**License:** GPL-3.0-or-later  
**Documentation:** [awl/README.md](awl/README.md)

---

### 2. Offer Builder (`offer-builder/`)
**AI-Powered Training Offer Generation for Syntra Bizz**

- 🤖 AI-generated personalized offers using Gemini API
- 📸 CRM data extraction from screenshots
- 🌐 Web scraping for training program details
- 🎭 Browser automation with Playwright
- 📝 DOCX document generation from templates
- 🎨 Custom template support

**Tech Stack:** Python, FastAPI, Playwright, Google Gemini API  
**License:** MIT  
**Documentation:** [offer-builder/README.md](offer-builder/README.md)  
**VPS Deployment:** [offer-builder/DEPLOYMENT_VPS.md](offer-builder/DEPLOYMENT_VPS.md)

---

## 🚀 Quick Start

Each tool is self-contained with its own:
- Dependencies and requirements
- Installation scripts
- Configuration templates
- Documentation

Navigate to the specific tool directory and follow its README for installation.

---

## 🏗️ Architecture

All tools are designed for VPS self-hosting:

```
VPS Server
├── Nginx (Reverse Proxy + SSL)
├── AWL Scanner (Node.js, Port 3000)
└── Offer Builder (Python/FastAPI, Port 8767)
```

**Key Features:**
- ✅ Complete isolation between tools
- ✅ Individual .env configuration
- ✅ Systemd service management
- ✅ HTTPS/SSL with Let's Encrypt
- ✅ Privacy-first (data stays on your server)

---

## 🔒 Security

- **No cloud dependencies** - All processing happens on your VPS
- **Environment-based secrets** - API keys in `.env` files (not tracked in git)
- **Restricted CORS** - Production domains only
- **File upload limits** - 10MB max for safety
- **Service isolation** - Each tool runs as www-data with minimal privileges

See individual tool security documentation for details.

---

## 📋 Common Requirements

### For AWL Scanner
- Node.js 18+
- Gemini API key
- Microsoft Graph API credentials (for email)

### For Offer Builder
- Python 3.9+
- Gemini API key
- Playwright browser (auto-installed)

### VPS Infrastructure
- Ubuntu/Debian Linux
- Nginx web server
- SSL certificate (Let's Encrypt)
- Systemd service management

---

## 🛠️ Development Workflow

```bash
# Clone repository
git clone https://github.com/CS-Workx/awl.git
cd awl

# Work on specific tool
cd awl/          # or cd offer-builder/
cp .env.example .env
# Follow tool-specific README for setup
```

---

## 📚 Documentation Structure

```
tools/
├── README.md (this file)
├── awl/
│   ├── README.md
│   ├── .env.example
│   └── src/
├── offer-builder/
│   ├── README.md
│   ├── DEPLOYMENT_VPS.md
│   ├── DEPLOYMENT_CHECKLIST.md
│   ├── env.template
│   ├── backend/
│   ├── frontend/
│   └── doc/
└── SECURITY.md
```

---

## 🌐 Deployment Targets

**Primary VPS:** tools.superworker.be

- AWL: `https://tools.superworker.be/awl/`
- Offer Builder: `https://tools.superworker.be/offer-builder/`

---

## 🤝 Contributing

This is a private collection of productivity tools. External contributions are not currently accepted.

For issues or questions:
- **Email:** steff@thehouseofcoaching.com
- **Repository:** https://github.com/CS-Workx/awl

---

## 📜 Licenses

- **AWL Scanner:** GPL-3.0-or-later
- **Offer Builder:** MIT License

See individual LICENSE files in each tool directory.

---

## 🔄 Version History

**2026-02-03**
- ✅ Added offer-builder tool
- ✅ VPS deployment configurations
- ✅ Environment-based port configuration

**2025-12**
- ✅ Initial AWL Scanner release
- ✅ Multi-image support
- ✅ Microsoft Graph API integration

---

## 💬 Support

For support, issues, or questions:
- Email: steff@thehouseofcoaching.com
- Primary client: Syntra Bizz (www.syntra-ab.be)

---

**Copyright © 2026 Steff Van Haverbeke / The House of Coaching**
