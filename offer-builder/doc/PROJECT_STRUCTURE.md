# Project Structuur - Syntra Bizz Offerte Generator

## 📁 Overzicht

Dit document beschrijft de organisatie van het project en het doel van elke map en belangrijk bestand.

---

## Root Directory Structuur

```
offer-builder/
├── backend/                     # Backend API (FastAPI)
├── frontend/                    # Frontend web interface
├── scripts/                     # 🛠️ Installatie & launcher scripts
│   ├── install/                 # Installatie scripts
│   ├── launchers/               # Applicatie launchers
│   ├── utils/                   # Utility scripts
│   └── README.md                # Scripts documentatie
├── doc/                         # 📚 Volledige documentatie
├── templates/                   # DOCX templates voor offertes
├── generated_offers/            # Gegenereerde offertes (output)
├── archive/                     # Gearchiveerde bestanden (niet essentieel)
├── venv/                        # Python virtual environment
├── .env                         # Environment configuratie (NIET in git)
├── env.template                 # Environment template
├── AI_DEVELOPMENT_RULES.md      # AI development guidelines
├── LICENSE                      # MIT License
├── README.md                    # Quick start guide
└── CLEANUP_SUMMARY.md           # Cleanup rapport
```

---

## 📂 Directory Details

### `/backend/` - Backend API

De Python FastAPI server die alle backend functionaliteit verzorgt.

```
backend/
├── app.py                   # Main FastAPI applicatie
├── requirements.txt         # Python dependencies
├── services/                # Business logic layer
│   ├── ocr_service.py       # CRM screenshot → data (Gemini Vision)
│   ├── scraper_service.py   # URL → training data (BeautifulSoup)
│   ├── gemini_service.py    # AI content generatie (Gemini)
│   ├── docx_service.py      # DOCX document creatie
│   ├── browser_service.py   # Browser automatisering (Playwright)
│   └── template_service.py  # Template management
└── models/
    └── schemas.py           # Pydantic data models
```

**Poort**: 8765  
**Documentatie**: http://localhost:8765/docs

---

### `/scripts/` - Installatie & Launcher Scripts

Georganiseerde scripts voor installatie en applicatie launchers.

```
scripts/
├── install/                         # Installatie scripts
│   ├── install.sh                   # Universal installer (alle platforms)
│   ├── install-mac.sh               # macOS-specifieke installer
│   ├── install-linux.sh             # Linux-specifieke installer
│   └── install.bat                  # Windows installer
├── launchers/                       # Applicatie launchers
│   ├── Start Syntra Offer Builder.command  # macOS launcher (dubbelklik)
│   ├── Start Syntra Offer Builder.bat      # Windows launcher (dubbelklik)
│   ├── Stop Syntra Offer Builder.command   # macOS stop script
│   ├── Stop Syntra Offer Builder.bat       # Windows stop script
│   └── start.sh                     # Terminal start script
├── utils/                           # Utility scripts
└── README.md                        # Scripts documentatie
```

**Gebruik**:
- **Installatie**: `bash scripts/install/install.sh` of platform-specifiek
- **Starten (GUI)**: Dubbelklik launcher in `scripts/launchers/`
- **Starten (terminal)**: `./scripts/launchers/start.sh`
- **Stoppen**: Dubbelklik stop script of Ctrl+C

---

### `/doc/` - Documentatie

De HTML/JavaScript single-page applicatie voor gebruikers.

```
frontend/
├── index.html               # Main UI pagina
├── css/
│   └── styles.css           # Volledige styling
└── js/
    ├── app.js               # Applicatie logica & state management
    └── api.js               # API client wrapper
```

**Poort**: 8766  
**URL**: http://localhost:8766

---

### `/doc/` - Documentatie

Volledige gebruikers- en technische documentatie.

```
doc/
├── README.md                        # Documentatie overzicht
├── DOCUMENTATION_INDEX.md           # Master index met zoekfunctie
├── 01-setup.md                      # Installatie handleiding
├── 02-first-use.md                  # Eerste gebruik tutorial
├── 03-best-practices.md             # Optimalisatie & best practices
├── 04-api-reference.md              # Complete API documentatie
├── 05-technical-architecture.md     # Technische architectuur
├── 06-quick-reference.md            # Dagelijkse referentie
├── MIGRATION_GUIDE.md               # Migratie naar nieuwe structuur
├── PROJECT_STRUCTURE.md             # Project organisatie (dit bestand)
└── COMPLETION_SUMMARY.txt           # Documentatie voltooiing rapport
```

**Start hier**: [doc/README.md](doc/README.md)

---

### `/frontend/` - Frontend Interface

De HTML/JavaScript single-page applicatie voor gebruikers.

```
frontend/
├── index.html               # Main UI pagina
├── css/
│   └── styles.css           # Volledige styling
└── js/
    ├── app.js               # Applicatie logica & state management
    └── api.js               # API client wrapper
```

**Poort**: 8766  
**URL**: http://localhost:8766

---

### `/templates/` - DOCX Templates

Word templates voor offerte generatie.

```
templates/
├── default.docx                     # Standaard Syntra Bizz template
└── user_uploads/                    # Custom uploaded templates
```

**Gebruik**: Template selectie in frontend, placeholder replacement in backend.

**Belangrijke placeholders**:
- `{{company_name}}`
- `{{contact_name}}`
- `{{training_title}}`
- `{{offer_text}}`
- `{{num_participants}}`

---

### `/generated_offers/` - Output Directory

Gegenereerde offerte documenten (DOCX).

```
generated_offers/
├── Syntra_Offerte_TechCorp_20260123_143045.docx
├── Syntra_Offerte_Acme_20260123_150230.docx
└── ...
```

**Automatische cleanup**: Optioneel na 90 dagen (zie [doc/03-best-practices.md](doc/03-best-practices.md))

---

### `/archive/` - Gearchiveerde Bestanden

Niet-essentiële bestanden voor referentie en ontwikkeling.

```
archive/
├── old-docs/                # Oude documentatie & development notes
│   ├── IMPLEMENTATION_SUMMARY.md
│   ├── SESSION_SUMMARY.md
│   └── ...
├── test-scripts/            # Ontwikkeling & test scripts
│   ├── analyze_template.py
│   ├── extract_colors.py
│   └── ...
└── examples/                # Voorbeeld documenten
    ├── 2026_061_MP_Mouterij Albert...docx
    ├── Syntra Bizz workflow.graffle
    └── ...
```

**Opmerking**: Deze folder is niet nodig voor productie gebruik en staat in `.gitignore`.

---

### `/venv/` - Python Virtual Environment

Python geïsoleerde dependency environment.

```
venv/
├── bin/                     # Executables (python, pip, etc.)
├── lib/                     # Installed packages
└── ...
```

**Activatie**:
```bash
source venv/bin/activate     # macOS/Linux
venv\Scripts\activate        # Windows
```

---

## 📄 Root Files

### Configuratie Files

#### `.env` (NIET in git)
Environment variabelen voor configuratie.

```bash
GEMINI_API_KEY=AIza...
ALLOWED_ORIGINS=http://localhost:8766
TEMPLATE_PATH=./templates/default.docx
OUTPUT_DIR=./generated_offers
```

**Aanmaken**: `cp env.template .env` en vul API key in.

#### `env.template`
Template voor `.env` bestand met placeholders.

#### `.gitignore`
Git ignore regels voor:
- `.env` (bevat secrets)
- `venv/` (grote dependencies)
- `generated_offers/*.docx` (output files)
- `archive/` (development only)
- OS files (`.DS_Store`, etc.)

---

### Scripts

#### Installatie Scripts (`scripts/install/`)

**Universal Installer** (`install.sh`):
```bash
bash scripts/install/install.sh
```

**Platform-specifiek**:
- **macOS**: `bash scripts/install/install-mac.sh`
- **Linux**: `bash scripts/install/install-linux.sh`
- **Windows**: `scripts\install\install.bat`

**Features**:
- Checkt Python 3.9+ installatie
- Maakt venv aan indien nodig
- Valideert .env configuratie
- Installeert dependencies automatisch
- Checkt Playwright browsers

#### Launcher Scripts (`scripts/launchers/`)

**macOS Launcher** (`Start Syntra Offer Builder.command`):
Double-clickable macOS launcher met volledige setup validatie.

**Gebruik**: Dubbelklik het bestand in Finder

**Windows Launcher** (`Start Syntra Offer Builder.bat`):
Double-clickable Windows launcher met volledige setup validatie.

**Gebruik**: Dubbelklik het bestand in File Explorer

**Terminal Launcher** (`start.sh`):
```bash
./scripts/launchers/start.sh
```

**Stop Scripts**:
- **macOS**: `scripts/launchers/Stop Syntra Offer Builder.command`
- **Windows**: `scripts/launchers/Stop Syntra Offer Builder.bat`

Clean shutdown scripts die processen op poorten 8765 en 8766 stoppen.

---

### Documentatie

#### `README.md`
Quick start guide met:
- Installatie instructies
- Basic workflow
- Troubleshooting
- Links naar `/doc/` voor details

#### `AI_DEVELOPMENT_RULES.md`
AI development guidelines en best practices voor het project.

#### `LICENSE`
MIT License - Open source licentie voor het project.

#### `PROJECT_STRUCTURE.md` (dit bestand)
Uitleg van project organisatie.

---

## 🗂️ File Type Overzicht

| Type | Locatie | Doel |
|------|---------|------|
| **Python** | `backend/*.py` | Backend logica |
| **JavaScript** | `frontend/js/*.js` | Frontend logica |
| **HTML** | `frontend/*.html` | UI markup |
| **CSS** | `frontend/css/*.css` | Styling |
| **DOCX** | `templates/*.docx` | Templates |
| **DOCX** | `generated_offers/*.docx` | Output |
| **Markdown** | `doc/*.md` | Documentatie |
| **Text** | `.env` | Configuratie |
| **Shell** | `start.sh` | Automation |

---

## 🔍 Waar te Vinden

### "Ik wil..."

#### ...de applicatie starten
→ **Makkelijkste**: Dubbelklik `scripts/launchers/Start Syntra Offer Builder.command` (macOS) of `.bat` (Windows)  
→ **Terminal**: `./scripts/launchers/start.sh` in root directory

#### ...de applicatie stoppen
→ **Makkelijkste**: Dubbelklik `scripts/launchers/Stop Syntra Offer Builder.command` (macOS) of `.bat` (Windows)  
→ **Terminal**: Druk Ctrl+C in het terminal venster

#### ...configuratie aanpassen
→ `.env` bestand in root

#### ...documentatie lezen
→ `doc/README.md` als startpunt

#### ...de API begrijpen
→ `doc/04-api-reference.md` of http://localhost:8765/docs

#### ...een template aanpassen
→ `templates/default.docx` of upload nieuwe in frontend

#### ...gegenereerde offertes vinden
→ `generated_offers/` folder

#### ...de backend code begrijpen
→ `backend/services/` voor business logic

#### ...de frontend code begrijpen
→ `frontend/js/app.js` voor main logic

#### ...troubleshooting doen
→ `doc/01-setup.md` troubleshooting sectie  
→ `doc/06-quick-reference.md` quick fixes

---

## 📦 Dependencies

### Backend Dependencies
Zie `backend/requirements.txt`:
- FastAPI - Web framework
- Uvicorn - ASGI server
- Playwright - Browser automation
- google-generativeai - AI integration
- python-docx - Document processing
- BeautifulSoup4 - Web scraping
- Pydantic - Data validation

### Frontend Dependencies
Geen externe dependencies - Vanilla JavaScript!
- Pure HTML5
- Pure CSS3
- Pure JavaScript (ES6+)

---

## 🔐 Beveiliging & Privacy

### Gevoelige Bestanden (NIET in git)

```
.env                         # API keys en secrets
venv/                        # Dependencies (kunnen opnieuw gegenereerd)
generated_offers/*.docx      # Klantdata
archive/                     # Development files
```

### Publieke Bestanden (WEL in git)

```
backend/                     # Source code (geen secrets)
frontend/                    # Source code
doc/                         # Documentatie
templates/default.docx       # Standaard template (geen klantdata)
env.template                 # Template (placeholders, geen secrets)
README.md, LICENSE           # Project info
.gitignore                   # Git configuratie
```

---

## 🚀 Development Workflow

1. **Clone/Download** project
2. **Setup**: `cd backend && pip install -r requirements.txt`
3. **Configure**: `cp env.template .env` en vul API key
4. **Start**: `./start.sh` in root
5. **Develop**: Edit code in `backend/` of `frontend/`
6. **Test**: Gebruik frontend op http://localhost:8766
7. **Document**: Update relevante `.md` in `doc/`

---

## 📞 Meer Informatie

- **Volledige docs**: [doc/README.md](doc/README.md)
- **Setup guide**: [doc/01-setup.md](doc/01-setup.md)
- **API reference**: [doc/04-api-reference.md](doc/04-api-reference.md)
- **Architecture**: [doc/05-technical-architecture.md](doc/05-technical-architecture.md)

---

**Copyright © 2026 Steff Vanhaverbeke for Syntra Bizz**  
Licensed under the MIT License
