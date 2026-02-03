# Setup Handleiding - Syntra Bizz Offerte Generator

## Inhoudsopgave
- [Systeemvereisten](#systeemvereisten)
- [Installatie](#installatie)
- [Configuratie](#configuratie)
- [Verificatie](#verificatie)
- [Troubleshooting](#troubleshooting)

---

## Systeemvereisten

### Minimale Vereisten
- **Besturingssysteem**: macOS, Linux, of Windows 10/11
- **Python**: Versie 3.9 of hoger
- **RAM**: Minimaal 4GB (8GB aanbevolen)
- **Schijfruimte**: 500MB vrije ruimte
- **Internet**: Stabiele internetverbinding voor API calls

### Software Vereisten
- Python 3.9+
- pip (Python package manager)
- Git (optioneel, voor klonen van repository)

### API Keys
- **Gemini API Key** (Google AI Studio) - **Verplicht**
  - Gratis verkrijgbaar via [Google AI Studio](https://makersuite.google.com/app/apikey)
  - Vereist een Google account

---

## Installatie

### Stap 1: Project Downloaden

#### Optie A: Via Git (aanbevolen)
```bash
git clone <repository-url>
cd offer-builder
```

#### Optie B: Handmatig
1. Download de project ZIP
2. Pak uit in gewenste locatie
3. Open terminal/command prompt in de projectmap

### Stap 2: Virtual Environment Aanmaken

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

> **💡 Tip**: De virtual environment isoleert de project dependencies van uw systeem Python installatie.

### Stap 3: Dependencies Installeren

```bash
cd backend
pip install -r requirements.txt
```

**Verwachte installatietijd**: 2-5 minuten,afhankelijk van internetsnelheid.

**Belangrijke dependencies:**
- FastAPI - Web framework
- Playwright - Browser automatisering
- python-docx - Word document manipulatie
- BeautifulSoup4 - Web scraping
- google-generativeai - AI content generatie

### Stap 4: Playwright Browsers Installeren

**Verplichte stap** voor browser automatisering functionaliteit:

```bash
playwright install chromium
```

**Verwachte downloadgrootte**: ~150MB

> **⚠️ Belangrijk**: Zonder deze stap werkt de CRM browser login functionaliteit niet.

**macOS gebruikers**: Bij eerste gebruik kan het systeem toestemming vragen voor Chromium. Ga naar Systeemvoorkeuren > Beveiliging & Privacy om toe te staan.

---

## Configuratie

### Stap 1: Environment File Aanmaken

Kopieer het template bestand naar `.env`:

**macOS/Linux:**
```bash
cp env.template .env
```

**Windows:**
```bash
copy env.template .env
```

### Stap 2: Gemini API Key Verkrijgen

1. Ga naar [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Log in met uw Google account
3. Klik op **"Get API Key"** of **"Create API Key"**
4. Klik op **"Create API key in new project"** (of selecteer bestaand project)
5. Kopieer de gegenereerde API key

### Stap 3: .env Bestand Configureren

Open het `.env` bestand met een teksteditor en vul de volgende waarden in:

```bash
# Google AI API Key (VERPLICHT)
GEMINI_API_KEY=your_actual_gemini_api_key_here

# CORS Origins (pas aan indien nodig)
ALLOWED_ORIGINS=http://localhost:8766,http://127.0.0.1:8766

# Template Pad (standaard template)
TEMPLATE_PATH=./2026_xxx_MP_klant_blanco bizz offerte caroline-nieuwe versie.docx

# Output Directory voor gegenereerde offertes
OUTPUT_DIR=./generated_offers
```

#### Configuratie Parameters Uitleg

| Parameter | Beschrijving | Standaard |
|-----------|--------------|-----------|
| `GEMINI_API_KEY` | Google Gemini API sleutel voor AI functionaliteit | *Verplicht* |
| `ALLOWED_ORIGINS` | CORS toegestane origins (voor development) | localhost:8766 |
| `TEMPLATE_PATH` | Pad naar Word template bestand | Standaard template |
| `OUTPUT_DIR` | Map waar gegenereerde offertes worden opgeslagen | ./generated_offers |

### Stap 4: Template Bestand Plaatsen (Optioneel)

Als u een eigen template gebruikt:

1. Plaats uw `.docx` template in de project root of `templates/` map
2. Update `TEMPLATE_PATH` in `.env` met het correcte pad

**Standaard template**: Het systeem werkt met de meegeleverde Syntra Bizz template.

### Stap 5: Output Directory Aanmaken

```bash
mkdir -p generated_offers
```

---

## Verificatie

### Test 1: Backend Server Starten

```bash
cd backend
python app.py
```

**Verwacht resultaat:**
```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8765
```

Test in browser: Open `http://localhost:8765/docs` - U zou de API documentatie moeten zien.

### Test 2: Frontend Server Starten

Open een **nieuwe terminal** (houd backend draaiend):

```bash
cd frontend
python3 -m http.server 8766
```

**Verwacht resultaat:**
```
Serving HTTP on 0.0.0.0 port 8766 (http://0.0.0.0:8766/) ...
```

Test in browser: Open `http://localhost:8766` - U zou de applicatie interface moeten zien.

### Test 3: Volledige Setup met Start Script

Stop eventuele lopende servers (Ctrl+C) en test het start script:

```bash
./start.sh
```

**Verwacht resultaat:**
```
🚀 Starting Syntra Bizz Offer Generator...

Activating virtual environment...
Installing dependencies...
Starting backend server on http://localhost:8765...
Starting frontend server on http://localhost:8766...

✅ Servers started successfully!

📱 Open your browser and go to: http://localhost:8766
📚 API documentation available at: http://localhost:8765/docs

Press Ctrl+C to stop all servers
```

---

## Troubleshooting

### Probleem: "GEMINI_API_KEY environment variable is not set"

**Oorzaak**: `.env` bestand niet aanwezig of API key niet ingevuld.

**Oplossing**:
1. Controleer of `.env` bestand bestaat in de project root:
   ```bash
   ls -la .env
   ```
2. Open `.env` en controleer of `GEMINI_API_KEY` is ingevuld
3. Herstart de backend server

### Probleem: "Playwright browsers not installed"

**Oorzaak**: Chromium browser niet gedownload.

**Oplossing**:
```bash
playwright install chromium
```

**Als dit niet werkt**:
```bash
# Probeer met Python module prefix
python -m playwright install chromium
```

### Probleem: "ModuleNotFoundError: No module named 'fastapi'"

**Oorzaak**: Dependencies niet geïnstalleerd of virtual environment niet geactiveerd.

**Oplossing**:
1. Activeer virtual environment:
   ```bash
   source venv/bin/activate  # macOS/Linux
   venv\Scripts\activate      # Windows
   ```
2. Installeer dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

### Probleem: "Port 8765 already in use"

**Oorzaak**: Een ander proces gebruikt de poort.

**Oplossing macOS/Linux**:
```bash
# Vind het proces
lsof -i :8765

# Stop het proces (vervang PID met de gevonden process ID)
kill -9 PID
```

**Oplossing Windows**:
```bash
# Vind het proces
netstat -ano | findstr :8765

# Stop het proces (vervang PID met de gevonden process ID)
taskkill /PID PID /F
```

### Probleem: "Permission denied: './start.sh'"

**Oorzaak**: Start script heeft geen execute permissies.

**Oplossing**:
```bash
chmod +x start.sh
./start.sh
```

### Probleem: CORS Errors in Browser Console

**Oorzaak**: Frontend draait op andere poort dan geconfigureerd.

**Oplossing**:
1. Controleer welke poort de frontend gebruikt
2. Update `ALLOWED_ORIGINS` in `.env`:
   ```bash
   ALLOWED_ORIGINS=http://localhost:JUISTE_POORT,http://127.0.0.1:JUISTE_POORT
   ```
3. Herstart backend server

### Probleem: Python3 commando niet gevonden

**Oorzaak**: Python niet geïnstalleerd of niet in PATH.

**Oplossing**:
1. Download Python van [python.org](https://www.python.org/downloads/)
2. Installeer met "Add to PATH" optie aangevinkt
3. Herstart terminal
4. Test: `python --version` of `python3 --version`

---

## Volgende Stappen

Na succesvolle installatie en configuratie:

1. Lees de **First Use Guide** (`02-first-use.md`) voor een stapsgewijze introductie
2. Bekijk **Best Practices** (`03-best-practices.md`) voor tips en optimale workflows
3. Raadpleeg de **API Reference** voor technische details

---

## Support

Bij problemen die niet opgelost worden met deze handleiding:

- **Email**: steff@vanhaverbeke.com
- **Syntra Bizz**: [www.syntra-ab.be](https://www.syntra-ab.be)

---

**Copyright © 2026 Steff Vanhaverbeke for Syntra Bizz**  
Licensed under the MIT License
