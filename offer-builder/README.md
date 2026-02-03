# Syntra Bizz Offerte Generator

AI-ondersteunde tool voor het genereren van gepersonaliseerde opleidingsoffertes.

## Overzicht

Deze applicatie helpt Syntra Bizz account managers om snel en efficiënt professionele offertes te maken door:
- **CRM-gegevens te extraheren** via screenshot upload OF directe browser login (Gemini Vision API)
- **Opleidingsinformatie** op te halen van URLs
- **AI-gegenereerde, gepersonaliseerde** offerte-inhoud te creëren
- **DOCX-documenten** te genereren op basis van templates

## Nieuwe Features

### Browser Automatisering
- **Directe CRM login**: Open uw CRM rechtstreeks in een geautomatiseerde browser
- **Geen screenshots nodig**: Login, navigeer naar uw ticket, en laat het systeem automatisch de data extraheren
- **Veilig en gemakkelijk**: Uw credentials blijven in uw eigen browser sessie

## Installatie

### 🚀 Snelle Installatie (Aanbevolen)

**Alle platforms (macOS, Windows, Linux)** - Eén commando:

```bash
bash scripts/install/install.sh
```

**Of platform-specifiek:**

**macOS**:
```bash
bash scripts/install/install-mac.sh
```

**Windows** (Command Prompt):
```cmd
scripts\install\install.bat
```

**Linux**:
```bash
bash scripts/install/install-linux.sh
```

**Wat doet het installatiescript?**
- ✅ Valideert Python 3.9+
- ✅ Creëert geïsoleerde virtual environment
- ✅ Installeert alle dependencies (~255MB)
- ✅ Installeert Playwright Chromium browser
- ✅ Configureert environment template
- ✅ Creëert benodigde directories
- ✅ Verifieert installatie

**Tijd**: 5-10 minuten (afhankelijk van internetsnelheid)

### Na Installatie

1. **Configureer API Key**:
   ```bash
   nano .env  # of gebruik je favoriete editor
   ```

2. **Verkrijg Gemini API Key**:
   - Bezoek: https://makersuite.google.com/app/apikey
   - Kopieer key en plak in `.env`

3. **Start Applicatie**:
   - **macOS**: Dubbelklik `scripts/launchers/Start Syntra Offer Builder.command`
   - **Windows**: Dubbelklik `scripts/launchers/Start Syntra Offer Builder.bat`
   - **Linux**: Run `./scripts/launchers/start.sh`

---

### Handmatige Installatie (Gevorderd)

<details>
<summary>Klik om handmatige installatie-instructies te zien</summary>

#### Vereisten

- Python 3.9 of hoger
- pip (Python package manager)
- Gemini API key (Google AI)

#### Stap 1: Repository klonen of downloaden

```bash
cd /Users/steffvanhaverbeke/Development/01_projects/offer-builder
```

#### Stap 2: Python virtual environment aanmaken

```bash
python3 -m venv venv
source venv/bin/activate  # Op macOS/Linux
# of
venv\Scripts\activate  # Op Windows
```

#### Stap 3: Afhankelijkheden installeren

```bash
cd backend
pip install -r requirements.txt
```

**Belangrijk**: Na installatie moet Playwright de browsers downloaden:
```bash
playwright install chromium
```

#### Stap 4: Omgevingsvariabelen configureren

1. Kopieer het env template bestand:
```bash
cp ../env.template ../.env
```

2. Bewerk `.env` en vul je Gemini API key in:
```
GEMINI_API_KEY=your_actual_gemini_api_key_here
ALLOWED_ORIGINS=http://localhost:8766,http://127.0.0.1:8766
TEMPLATE_PATH=./2026_xxx_MP_klant_blanco bizz offerte caroline-nieuwe versie.docx
OUTPUT_DIR=./generated_offers
```

#### Stap 5: Template bestand plaatsen

Zorg ervoor dat het template bestand `2026_xxx_MP_klant_blanco bizz offerte caroline-nieuwe versie.docx` in de project root staat.

</details>

---

### Problemen Oplossen

**Python niet gevonden**:
```bash
# macOS
brew install python@3.11

# Ubuntu/Debian
sudo apt install python3.11

# Windows
# Download van python.org
```

**Toestemming geweigerd**:
```bash
# macOS/Linux
sudo chown -R $USER:$USER .
```

**Netwerk timeout**:
```bash
pip install --timeout=300 -r backend/requirements.txt
```

**Playwright installatie mislukt**:
```bash
python -m playwright install chromium --verbose
```

Voor meer hulp, zie `doc/01-setup.md` of contact: steff@vanhaverbeke.com

---

## Gebruik

### Snelstart - Geen Terminal Nodig! (Nieuw)

**macOS**:
1. Dubbelklik `scripts/launchers/Start Syntra Offer Builder.command`
2. Sta Terminal toe om te draaien indien gevraagd
3. Wacht tot "✅ Servers started" verschijnt
4. Open browser naar http://localhost:8766

**Windows**:
1. Dubbelklik `scripts/launchers/Start Syntra Offer Builder.bat`
2. Wacht tot "[OK] Backend running" verschijnt
3. Open browser naar http://localhost:8766

**Stoppen**:
- **macOS**: Druk Ctrl+C in Terminal, of dubbelklik `scripts/launchers/Stop Syntra Offer Builder.command`
- **Windows**: Sluit het command window, of dubbelklik `scripts/launchers/Stop Syntra Offer Builder.bat`

### Terminal Gebruik (Gevorderd)

Gebruik het meegeleverde start script:
```bash
./scripts/launchers/start.sh
```

Dit script start automatisch:
- Backend API server op `http://localhost:8765`
- Frontend webinterface op `http://localhost:8766`

### Handmatig starten

#### Backend starten

```bash
cd backend
python app.py
```

De API is nu beschikbaar op: `http://localhost:5001`

API documentatie: `http://localhost:5001/docs`

#### Frontend starten

Open een nieuwe terminal en start een eenvoudige HTTP server:

```bash
cd frontend
python3 -m http.server 5002
```

Open je browser en ga naar: `http://localhost:5002`

## Workflow

### Optie 1: CRM Screenshot Upload (Traditioneel)

1. **CRM Screenshot Uploaden**
   - Sleep een screenshot van je CRM systeem naar de upload zone
   - De AI extraheert automatisch alle relevante velden
   - Controleer en bewerk de geëxtraheerde gegevens indien nodig

### Optie 2: CRM Browser Login (Nieuw!)

1. **CRM Browser Openen**
   - Klik op de tab "CRM Browser Login"
   - Voer de login URL van uw CRM in
   - Klik op "Open CRM" - een browser wordt automatisch geopend
   
2. **Inloggen en Navigeren**
   - Log in met uw normale credentials in de geopende browser
   - Navigeer naar het gewenste ticket/opportunity
   - OF: voer de directe ticket URL in en klik "Navigeer"
   
3. **Data Extraheren**
   - Klik op "Capture & Extract Data"
   - Het systeem maakt automatisch een screenshot en extraheert alle data
   - Controleer de geëxtraheerde gegevens

### Verder met beide opties:

2. **Opleidingsprogramma Toevoegen**
   - Voer de URL van een Syntra Bizz opleidingspagina in
   - Klik op "Ophalen" om de gegevens te extraheren
   - Bewerk indien nodig

3. **Intake Informatie Invullen**
   - Voer het aantal deelnemers in
   - Beschrijf de doelstellingen van de klant
   - Voeg specifieke eisen en voorkeursdata toe

4. **Offerte Genereren**
   - Klik op "Genereer Offerte"
   - De AI creëert een gepersonaliseerde offerte
   - Bekijk het voorbeeld

5. **DOCX Downloaden**
   - Klik op "Download DOCX"
   - Het bestand wordt automatisch gedownload

## API Endpoints

### POST /api/extract-crm
Extract CRM data from screenshot
```json
{
  "image_base64": "base64_encoded_image"
}
```

### POST /api/extract-training
Extract training data from URL
```json
{
  "url": "https://www.syntra-ab.be/..."
}
```

### POST /api/generate-offer
Generate offer content
```json
{
  "crm_data": {...},
  "training_data": {...},
  "intake_data": {...}
}
```

### POST /api/create-docx
Create DOCX document
```json
{
  "offer_data": {...},
  "crm_data": {...},
  "training_data": {...},
  "intake_data": {...}
}
```

### GET /api/download/{file_id}
Download generated DOCX file

### POST /api/browser/open-crm
Open CRM in automated browser
```json
{
  "crm_url": "https://your-crm.com/login"
}
```

### POST /api/browser/navigate-ticket
Navigate to specific ticket
```json
{
  "ticket_url": "https://your-crm.com/ticket/123"
}
```

### POST /api/browser/capture-screenshot
Capture screenshot from browser and extract CRM data

### GET /api/browser/status
Check if browser session is active

### POST /api/browser/close
Close browser session

## Projectstructuur

```
offer-builder/
├── backend/                     # Backend API (FastAPI)
│   ├── app.py                   # FastAPI applicatie
│   ├── requirements.txt         # Python dependencies
│   ├── services/                # Service layer
│   │   ├── ocr_service.py       # Screenshot OCR (Gemini Vision)
│   │   ├── scraper_service.py   # Web scraping
│   │   ├── gemini_service.py    # AI content generatie
│   │   ├── docx_service.py      # DOCX generatie
│   │   └── browser_service.py   # Browser automatisering (Playwright)
│   └── models/
│       └── schemas.py           # Pydantic models
├── frontend/                    # Frontend SPA (HTML/JS)
│   ├── index.html               # Hoofd UI
│   ├── css/
│   │   └── styles.css           # Styling
│   └── js/
│       ├── app.js               # Applicatie logica
│       └── api.js               # API communicatie
├── scripts/                     # 🛠️ Installatie & launcher scripts
│   ├── install/                 # Installatie scripts
│   │   ├── install.sh           # Universal installer
│   │   ├── install-mac.sh       # macOS installer
│   │   ├── install-linux.sh     # Linux installer
│   │   └── install.bat          # Windows installer
│   ├── launchers/               # Applicatie launchers
│   │   ├── Start Syntra Offer Builder.command  # macOS launcher
│   │   ├── Start Syntra Offer Builder.bat      # Windows launcher
│   │   ├── Stop Syntra Offer Builder.command   # macOS stop
│   │   ├── Stop Syntra Offer Builder.bat       # Windows stop
│   │   └── start.sh             # Terminal launcher
│   ├── utils/                   # Utility scripts
│   └── README.md                # Scripts documentatie
├── doc/                         # 📚 Volledige documentatie
│   ├── README.md                # Documentatie overzicht
│   ├── 01-setup.md              # Installatie handleiding
│   ├── 02-first-use.md          # Eerste gebruik tutorial
│   ├── 03-best-practices.md     # Best practices & optimalisatie
│   ├── 04-api-reference.md      # Complete API documentatie
│   ├── 05-technical-architecture.md  # Technische architectuur
│   ├── 06-quick-reference.md    # Snelle referentie
│   ├── MIGRATION_GUIDE.md       # Migratie naar nieuwe structuur
│   └── PROJECT_STRUCTURE.md     # Project organisatie
├── templates/                   # DOCX templates
│   └── default.docx             # Standaard template
├── generated_offers/            # Gegenereerde offertes (output)
├── archive/                     # Gearchiveerde bestanden
│   ├── old-docs/                # Oude documentatie
│   ├── test-scripts/            # Test scripts
│   └── examples/                # Voorbeeld bestanden
├── venv/                        # Python virtual environment
├── .env                         # Environment variabelen (NIET in git)
├── env.template                 # Environment template
├── AI_DEVELOPMENT_RULES.md      # AI development guidelines
├── LICENSE                      # MIT License
└── README.md                    # Deze file (quick start)
```

## Troubleshooting

### "GEMINI_API_KEY environment variable is not set"
- Controleer of je `.env` bestand bestaat in de project root
- Controleer of de API key correct is ingevuld

### "Playwright browsers not installed"
- Run: `playwright install chromium`
- Dit downloadt de benodigde browser voor automatisering

### Browser automatisering werkt niet
- Zorg dat Playwright correct is geïnstalleerd
- Op macOS: mogelijk moet je toegang geven in Systeemvoorkeuren > Beveiliging
- Probeer handmatig: `playwright install chromium`

### Screenshot OCR werkt niet
- Controleer of de afbeelding helder en leesbaar is
- Probeer een hogere resolutie screenshot
- Zorg dat de CRM velden duidelijk zichtbaar zijn

### Training URL scraping faalt
- Controleer of de URL correct is
- Sommige pagina's kunnen extra authenticatie vereisen
- Fallback: vul handmatig in

### DOCX generatie errors
- Controleer of de output directory bestaat en schrijfbaar is
- Controleer of het template bestand aanwezig is (optioneel)

## Gemini API Key verkrijgen

1. Ga naar [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Log in met je Google account
3. Klik op "Get API Key"
4. Kopieer de key naar je `.env` bestand

## Documentatie

**📚 Uitgebreide documentatie beschikbaar in de `/doc/` folder:**

- **[Setup Guide](doc/01-setup.md)** - Volledige installatie handleiding
- **[First Use](doc/02-first-use.md)** - Stap-voor-stap tutorial
- **[Best Practices](doc/03-best-practices.md)** - Optimalisatie & tips
- **[API Reference](doc/04-api-reference.md)** - Complete API docs
- **[Architecture](doc/05-technical-architecture.md)** - Technische details
- **[Quick Reference](doc/06-quick-reference.md)** - Dagelijkse referentie
- **[Migration Guide](doc/MIGRATION_GUIDE.md)** - Migratie naar nieuwe structuur

**Voor AI development**: [AI_DEVELOPMENT_RULES.md](AI_DEVELOPMENT_RULES.md)

**Start hier**: [doc/README.md](doc/README.md)

## Beveiliging

- Bewaar je API keys nooit in Git
- Het `.env` bestand is toegevoegd aan `.gitignore`
- Gebruik alleen op een beveiligde lokale machine of vertrouwde server
- Zie [doc/03-best-practices.md](doc/03-best-practices.md) voor uitgebreide security guidelines

## Licentie

MIT License - Copyright (c) 2026 Steff Vanhaverbeke for Syntra Bizz

Dit project is open source software gelicenseerd onder de MIT License.
Zie het [LICENSE](LICENSE) bestand voor volledige details.

## Credits

**Ontwikkeld door:** Steff Vanhaverbeke  
**Voor:** Syntra Bizz  
**Website:** [www.syntra-ab.be](https://www.syntra-ab.be)

## Contact

Voor vragen of problemen:
- **Email:** steff@vanhaverbeke.com
- **Syntra Bizz:** [www.syntra-ab.be](https://www.syntra-ab.be)
