# Technische Architectuur - Syntra Bizz Offerte Generator

## Inhoudsopgave
- [Overzicht](#overzicht)
- [Systeem Architectuur](#systeem-architectuur)
- [Backend Componenten](#backend-componenten)
- [Frontend Architectuur](#frontend-architectuur)
- [Data Flow](#data-flow)
- [Externe Dependencies](#externe-dependencies)
- [Deployment](#deployment)
- [Security](#security)

---

## Overzicht

De Syntra Bizz Offerte Generator is een full-stack applicatie met:
- **Backend**: Python FastAPI server
- **Frontend**: Vanilla JavaScript SPA
- **AI Integration**: Google Gemini API
- **Browser Automation**: Playwright
- **Document Processing**: python-docx

**Architectuur Pattern**: Microservices-georiënteerd met service layer separation

---

## Systeem Architectuur

### High-Level Diagram

```
┌─────────────────────────────────────────────────────┐
│                    Frontend                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │   HTML/CSS   │  │  JavaScript  │  │   API    │  │
│  │              │  │   (app.js)   │  │ Client   │  │
│  └──────────────┘  └──────────────┘  └──────────┘  │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP/REST
                      │
┌─────────────────────┴───────────────────────────────┐
│              Backend (FastAPI)                       │
│  ┌──────────────────────────────────────────────┐  │
│  │           API Layer (app.py)                  │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────────────┐ │  │
│  │  │ Routes  │ │ Models  │ │  Middleware     │ │  │
│  │  └─────────┘ └─────────┘ └─────────────────┘ │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │            Service Layer                      │  │
│  │  ┌──────────────┐  ┌─────────────────────┐   │  │
│  │  │ OCR Service  │  │ Scraper Service     │   │  │
│  │  │  (Gemini)    │  │  (BeautifulSoup)    │   │  │
│  │  └──────────────┘  └─────────────────────┘   │  │
│  │  ┌──────────────┐  ┌─────────────────────┐   │  │
│  │  │ AI Service   │  │ DOCX Service        │   │  │
│  │  │  (Gemini)    │  │  (python-docx)      │   │  │
│  │  └──────────────┘  └─────────────────────┘   │  │
│  │  ┌──────────────┐  ┌─────────────────────┐   │  │
│  │  │ Browser Svc  │  │ Template Service    │   │  │
│  │  │ (Playwright) │  │                     │   │  │
│  │  └──────────────┘  └─────────────────────┘   │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
┌────────▼─────────┐     ┌────────▼─────────┐
│  Google Gemini   │     │  External Web    │
│      API         │     │   (Syntra.be)    │
└──────────────────┘     └──────────────────┘
```

---

## Backend Componenten

### Directory Structure

```
backend/
├── app.py                    # Main FastAPI application
├── requirements.txt          # Python dependencies
├── models/
│   └── schemas.py           # Pydantic data models
└── services/
    ├── __init__.py
    ├── ocr_service.py       # Screenshot → CRM data
    ├── scraper_service.py   # URL → Training data
    ├── gemini_service.py    # AI content generation
    ├── docx_service.py      # Word document creation
    ├── browser_service.py   # Playwright automation
    └── template_service.py  # Template management
```

### app.py - Main Application

**Verantwoordelijkheden**:
- FastAPI app instantiatie
- CORS configuratie
- Route definitions
- Dependency injection
- Error handling middleware

**Key Code**:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Syntra Bizz Offer Generator API",
    description="AI-assisted custom training offer generation system",
    version="1.0.0"
)

# CORS setup
allowed_origins = os.getenv('ALLOWED_ORIGINS', '').split(',')
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Services Layer

#### OCR Service (`ocr_service.py`)

**Purpose**: Screenshot → Structured CRM data

**Technology**: Google Gemini Vision API

**Flow**:
```
Screenshot (Base64) 
  → Gemini Vision API 
  → Structured JSON extraction 
  → CRMData model
```

**Key Methods**:
```python
class OCRService:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
    
    def extract_crm_fields(self, image_base64: str) -> dict:
        """Extract CRM fields using vision model"""
        # Decode base64 image
        # Create prompt for structured extraction
        # Call Gemini Vision API
        # Parse and validate response
        return crm_data
```

**Prompt Engineering**:
- Structured output format (JSON)
- Field-specific instructions
- Error handling for missing data

#### Scraper Service (`scraper_service.py`)

**Purpose**: Syntra.be URL → Training details

**Technology**: BeautifulSoup4 + Requests

**Flow**:
```
Training URL 
  → HTTP GET request 
  → HTML parsing 
  → Element extraction 
  → TrainingData model
```

**Key Methods**:
```python
class ScraperService:
    def scrape_training_url(self, url: str) -> dict:
        """Scrape training page for details"""
        response = requests.get(url)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract title, description, duration, price
        # Handle different page layouts
        # Fallback strategies for missing elements
        
        return training_data
```

**Challenges**:
- Dynamic page structures
- JavaScript-rendered content
- Rate limiting
- Error handling

#### Gemini Service (`gemini_service.py`)

**Purpose**: Generate personalized offer content

**Technology**: Google Gemini API (Text generation)

**Flow**:
```
CRM + Training + Intake data 
  → Prompt construction 
  → Gemini API call 
  → Content generation 
  → OfferContent model
```

**Key Methods**:
```python
class GeminiService:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
    
    def generate_offer_content(
        self, 
        crm_data: dict, 
        training_data: dict, 
        intake_data: dict
    ) -> dict:
        """Generate personalized offer text"""
        # Build comprehensive prompt
        # Include all context data
        # Call Gemini API
        # Post-process response
        return offer_content
```

**Prompt Template**:
```python
prompt = f"""
Je bent een professionele offerte schrijver voor Syntra Bizz.

KLANT INFORMATIE:
- Bedrijf: {company_name}
- Contactpersoon: {contact_name}

TRAINING:
- Titel: {training_title}
- Beschrijving: {training_description}

DOELSTELLINGEN:
{objectives}

Schrijf een gepersonaliseerde, professionele offerte van 300-500 woorden...
"""
```

#### DOCX Service (`docx_service.py`)

**Purpose**: Generate Word documents from templates

**Technology**: python-docx

**Flow**:
```
Template.docx + Data 
  → Load template 
  → Replace placeholders 
  → Format content 
  → Save to output_dir 
  → Return file path
```

**Key Methods**:
```python
class DocxService:
    def __init__(self, template_path: str, output_dir: str):
        self.template_path = template_path
        self.output_dir = output_dir
    
    def create_offer_document(
        self, 
        offer_data: dict,
        crm_data: dict,
        training_data: dict,
        intake_data: dict
    ) -> str:
        """Create DOCX from template"""
        # Load template
        doc = Document(self.template_path)
        
        # Replace placeholders
        self._replace_text(doc, '{{company_name}}', crm_data['company_name'])
        # ... more replacements
        
        # Generate filename with timestamp
        filename = f"Syntra_Offerte_{timestamp}.docx"
        
        # Save
        doc.save(os.path.join(self.output_dir, filename))
        return filename
```

**Placeholder System**:
```
{{company_name}}        → Bedrijfsnaam
{{contact_name}}        → Contactpersoon
{{training_title}}      → Opleidingstitel
{{offer_text}}          → AI gegenereerde content
{{num_participants}}    → Aantal deelnemers
```

#### Browser Service (`browser_service.py`)

**Purpose**: Automated CRM interaction

**Technology**: Playwright (Chromium)

**Flow**:
```
Open browser 
  → Navigate to CRM 
  → User logs in manually 
  → Navigate to ticket 
  → Capture screenshot 
  → Extract data 
  → Close browser
```

**Key Methods**:
```python
class BrowserService:
    def __init__(self):
        self.browser = None
        self.page = None
    
    async def open_crm(self, crm_url: str):
        """Launch browser and navigate to CRM"""
        self.browser = await playwright.chromium.launch(headless=False)
        self.page = await self.browser.new_page()
        await self.page.goto(crm_url)
    
    async def navigate_to_ticket(self, ticket_url: str):
        """Navigate to specific ticket"""
        await self.page.goto(ticket_url)
    
    async def capture_screenshot(self) -> bytes:
        """Take screenshot of current page"""
        screenshot = await self.page.screenshot()
        return screenshot
    
    async def close(self):
        """Close browser session"""
        await self.browser.close()
```

**Session Management**:
- Singleton pattern (één browser per server instance)
- Persistent cookies voor session
- Graceful shutdown handling

#### Template Service (`template_service.py`)

**Purpose**: Manage multiple DOCX templates

**Flow**:
```
List templates 
  → Upload new template 
  → Select template 
  → Validate template structure
```

**Key Methods**:
```python
class TemplateService:
    def __init__(self, templates_dir: str):
        self.templates_dir = templates_dir
    
    def list_templates(self) -> List[dict]:
        """Get all available templates"""
        # Scan templates directory
        # Return template metadata
    
    def upload_template(self, file: UploadFile) -> dict:
        """Save uploaded template"""
        # Validate file type (.docx)
        # Save to templates directory
        # Return template info
    
    def get_template_path(self, template_id: str) -> str:
        """Get full path for template"""
        return os.path.join(self.templates_dir, f"{template_id}.docx")
```

### Models Layer (`models/schemas.py`)

**Pydantic Models** voor data validatie:

```python
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class CRMData(BaseModel):
    company_name: str = Field(..., min_length=1)
    contact_name: str = Field(..., min_length=1)
    contact_email: EmailStr
    contact_phone: Optional[str] = None
    address: Optional[str] = None

class TrainingData(BaseModel):
    title: str
    description: str
    duration: Optional[str] = None
    price: Optional[str] = None
    additional_info: Optional[str] = None

class IntakeData(BaseModel):
    num_participants: int = Field(..., ge=1)
    objectives: str = Field(..., min_length=10)
    specific_requirements: Optional[str] = None
    preferred_dates: Optional[str] = None

class OfferContent(BaseModel):
    offer_text: str
    generated_at: str
    model_used: Optional[str] = "gemini-1.5-flash"
```

**Validatie Features**:
- Type checking
- Email format validatie
- Minimum/maximum waarden
- Required vs Optional fields

---

## Frontend Architectuur

### Directory Structure

```
frontend/
├── index.html          # Main SPA
├── css/
│   └── styles.css     # Styling
└── js/
    ├── app.js         # Main application logic
    └── api.js         # API client wrapper
```

### index.html

**Structure**:
```html
<!DOCTYPE html>
<html lang="nl">
<head>
    <!-- Meta tags, title, CSS -->
</head>
<body>
    <div class="container">
        <!-- Step 1: Template Selection -->
        <section id="template-section">...</section>
        
        <!-- Step 2: CRM Data -->
        <section id="crm-section">
            <!-- Screenshot upload -->
            <!-- OR Browser login -->
        </section>
        
        <!-- Step 3: Training Data -->
        <section id="training-section">...</section>
        
        <!-- Step 4: Intake Info -->
        <section id="intake-section">...</section>
        
        <!-- Step 5: Generate & Download -->
        <section id="generate-section">...</section>
    </div>
    
    <script src="js/api.js"></script>
    <script src="js/app.js"></script>
</body>
</html>
```

**Progressive Disclosure**: Stappen worden één voor één getoond.

### app.js - Application Logic

**State Management**:
```javascript
const appState = {
    crmData: null,
    trainingData: null,
    intakeData: null,
    offerData: null,
    currentStep: 1,
    browserActive: false
};
```

**Key Functions**:
```javascript
// Screenshot upload handling
async function handleScreenshotUpload(file) {
    const base64 = await fileToBase64(file);
    const crmData = await extractCRM(base64);
    populateCRMForm(crmData);
}

// Training scraping
async function handleTrainingURL(url) {
    const trainingData = await extractTraining(url);
    populateTrainingForm(trainingData);
}

// Offer generation
async function generateOffer() {
    const offerData = await generateOfferContent(
        appState.crmData,
        appState.trainingData,
        appState.intakeData
    );
    displayOfferPreview(offerData);
}

// DOCX creation
async function downloadDocx() {
    const docxInfo = await createDocxDocument(appState);
    downloadFile(docxInfo.file_id);
}
```

### api.js - API Client

**Wrapper voor alle API calls**:
```javascript
const API_BASE = 'http://localhost:8765';

async function extractCRM(imageBase64) {
    const response = await fetch(`${API_BASE}/api/extract-crm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: imageBase64 })
    });
    return await response.json();
}

// Similar functions for all endpoints...
```

**Error Handling**:
```javascript
async function apiCall(endpoint, options) {
    try {
        const response = await fetch(endpoint, options);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail);
        }
        return await response.json();
    } catch (error) {
        showError(error.message);
        throw error;
    }
}
```

---

## Data Flow

### Complete Workflow Sequence

```
User Action: Upload Screenshot
  ↓
Frontend: Convert to Base64
  ↓
API Call: POST /api/extract-crm
  ↓
Backend: OCR Service (Gemini Vision)
  ↓
Response: CRM Data JSON
  ↓
Frontend: Populate form, allow editing
  ↓
User Action: Submit Training URL
  ↓
API Call: POST /api/extract-training
  ↓
Backend: Scraper Service (BeautifulSoup)
  ↓
Response: Training Data JSON
  ↓
Frontend: Populate form, allow editing
  ↓
User Action: Fill Intake form
  ↓
Frontend: Validate input
  ↓
User Action: Click "Genereer Offerte"
  ↓
API Call: POST /api/generate-offer
  ↓
Backend: Gemini Service (AI generation)
  ↓
Response: Offer Content
  ↓
Frontend: Display preview
  ↓
User Action: Click "Download DOCX"
  ↓
API Call: POST /api/create-docx
  ↓
Backend: DOCX Service (python-docx)
  ↓
Response: File ID + Download URL
  ↓
API Call: GET /api/download/{file_id}
  ↓
Backend: Stream file
  ↓
Frontend: Browser download
```

---

## Externe Dependencies

### Google Gemini API

**Gebruik**:
- Vision API: Screenshot OCR
- Text API: Offer content generatie

**Rate Limits**:
- Free tier: 60 requests/minuut
- Response time: 2-10 seconden

**Error Handling**:
- API key invalid → 500 error
- Rate limit → Exponential backoff
- Network timeout → Retry 3x

### Playwright

**Browser Automation**:
- Chromium engine
- Headless: False (user moet inloggen)
- Session persistence

**Installation**:
```bash
pip install playwright
playwright install chromium
```

**Resource Usage**:
- ~200MB RAM per browser instance
- ~150MB disk (Chromium binary)

### BeautifulSoup4

**Web Scraping**:
- HTML parsing
- CSS selector support
- Robust error handling

**Limitations**:
- No JavaScript execution
- Static content only
- Afhankelijk van HTML structuur

### python-docx

**Document Processing**:
- Read/write .docx files
- Placeholder replacement
- Formatting preservation

**Limitations**:
- Geen macro support
- Basis opmaak only
- Complex layouts kunnen problemen geven

---

## Deployment

### Development

**Start Script** (`start.sh`):
```bash
#!/bin/bash
# Activate venv
source venv/bin/activate

# Start backend
cd backend
python app.py &

# Start frontend
cd ../frontend
python3 -m http.server 8766 &
```

**Ports**:
- Backend: 8765
- Frontend: 8766

### Production Considerations

**Backend**:
```bash
# Use production ASGI server
pip install gunicorn

# Run with workers
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app:app
```

**Frontend**:
```bash
# Use nginx for static files
server {
    listen 80;
    root /var/www/offer-builder/frontend;
    index index.html;
}
```

**Environment**:
```bash
# Production .env
GEMINI_API_KEY=prod_key_here
ALLOWED_ORIGINS=https://offertes.syntra-ab.be
TEMPLATE_PATH=/var/templates/syntra-bizz.docx
OUTPUT_DIR=/var/offers
```

**Security**:
- HTTPS only
- API key rotation
- Rate limiting
- CORS restrictie
- Input sanitization

---

## Security

### API Key Protection

**Storage**:
```bash
# .env file (NEVER commit)
GEMINI_API_KEY=AIzaSy...

# File permissions
chmod 600 .env
```

**Usage**:
```python
# Environment variable only
api_key = os.getenv('GEMINI_API_KEY')
if not api_key:
    raise ValueError("API key not set")
```

### Data Privacy

**GDPR Compliance**:
- Minimale data opslag
- Geen logging van PII
- Lokale verwerking
- Geen third-party tracking

**Cleanup**:
- Screenshots: Niet bewaard
- Generated offers: 90 dagen retention
- Logs: Geen persoonlijke data

### Input Validation

**Pydantic Models**:
```python
# Automatische validatie
class IntakeData(BaseModel):
    num_participants: int = Field(ge=1, le=1000)
    objectives: str = Field(min_length=10, max_length=5000)
```

**SQL Injection**: N/A (geen database)
**XSS**: Frontend sanitization
**CSRF**: CORS configuratie

---

## Performance Optimization

### Caching Strategy

**Training Data**:
```python
# In-memory cache (Redis in productie)
training_cache = {}

def get_training_data(url):
    if url in training_cache:
        return training_cache[url]
    
    data = scraper_service.scrape(url)
    training_cache[url] = data
    return data
```

### Async Processing

**FastAPI Async**:
```python
@app.post("/api/generate-offer")
async def generate_offer(request: GenerateOfferRequest):
    # Async Gemini API call
    offer = await gemini_service.generate_async(...)
    return offer
```

### Resource Management

**Browser Instances**:
- Max 1 browser per user session
- Automatic cleanup after 30 min inactivity
- Graceful shutdown handling

---

## Monitoring & Logging

### Application Logs

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)
logger.info("Offer generated successfully")
```

### Error Tracking

**Try-Except Patterns**:
```python
try:
    result = service.process()
except ExternalAPIError as e:
    logger.error(f"API failed: {e}")
    raise HTTPException(status_code=500, detail=str(e))
```

### Metrics (Toekomstig)

- Request duration
- Success/failure rates
- API quota usage
- Generated offers per day

---

**Copyright © 2026 Steff Vanhaverbeke for Syntra Bizz**  
Licensed under the MIT License
