# API Reference - Syntra Bizz Offerte Generator

## Inhoudsopgave
- [Overzicht](#overzicht)
- [Base URL](#base-url)
- [Authenticatie](#authenticatie)
- [Endpoints](#endpoints)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Rate Limits](#rate-limits)
- [Code Voorbeelden](#code-voorbeelden)

---

## Overzicht

De Syntra Bizz Offerte Generator API is gebouwd met FastAPI en biedt RESTful endpoints voor:
- CRM data extractie (OCR)
- Training data scraping
- AI-gegenereerde offerte content
- DOCX document creatie
- Browser automatisering voor CRM integratie

**API Versie**: 1.0.0  
**Framework**: FastAPI  
**OpenAPI Docs**: http://localhost:8765/docs  
**ReDoc**: http://localhost:8765/redoc

---

## Base URL

**Development**: `http://localhost:8765`  
**Production**: *Configureerbaar via environment variables*

All API endpoints zijn relatief aan de base URL:
```
http://localhost:8765/api/{endpoint}
```

---

## Authenticatie

**Huidige versie**: Geen authenticatie vereist (local development)

**Toekomstige versies**: 
- API Key authenticatie
- JWT tokens voor team access
- OAuth2 voor enterprise integratie

**CORS**:
```bash
# Configureer in .env
ALLOWED_ORIGINS=http://localhost:8766,http://127.0.0.1:8766
```

Toegestane origins worden automatisch geladen bij server startup.

---

## Endpoints

### Health Check

#### `GET /`

Controleert of de API server actief is.

**Response**:
```json
{
  "status": "ok",
  "message": "Syntra Bizz Offer Generator API is running"
}
```

**Status Codes**:
- `200`: Server is operationeel

---

### CRM Data Extractie

#### `POST /api/extract-crm`

Extraheert CRM velden uit een screenshot met behulp van Gemini Vision API.

**Request Body**:
```json
{
  "image_base64": "iVBORw0KGgoAAAANS..."
}
```

**Parameters**:
| Veld | Type | Verplicht | Beschrijving |
|------|------|-----------|--------------|
| image_base64 | string | Ja | Base64-encoded afbeelding (PNG/JPG) |

**Response**:
```json
{
  "company_name": "TechCorp NV",
  "contact_name": "Jan Janssen",
  "contact_email": "jan.janssen@techcorp.be",
  "contact_phone": "+32 3 123 45 67",
  "address": "Mechelsesteenweg 123, 2018 Antwerpen"
}
```

**Status Codes**:
- `200`: Succesvolle extractie
- `500`: Server error (bijv. ongeldige afbeelding, API key probleem)

**Errors**:
```json
{
  "detail": "Invalid image format"
}
```

**Voorbeeld**:
```javascript
// JavaScript/Frontend
async function extractCRM(imageBase64) {
  const response = await fetch('http://localhost:8765/api/extract-crm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_base64: imageBase64 })
  });
  return await response.json();
}
```

---

### Training Data Scraping

#### `POST /api/extract-training`

Scraped training programma details van een Syntra Bizz URL.

**Request Body**:
```json
{
  "url": "https://www.syntra-ab.be/opleidingen/agile-project-management"
}
```

**Parameters**:
| Veld | Type | Verplicht | Beschrijving |
|------|------|-----------|--------------|
| url | string | Ja | Volledige URL van training pagina |

**Response**:
```json
{
  "title": "Agile Project Management",
  "description": "Leer de Scrum en Kanban methodieken...",
  "duration": "3 dagen",
  "price": "€1.250",
  "additional_info": "Inclusief certificaat"
}
```

**Status Codes**:
- `200`: Succesvolle scrape
- `500`: Server error (bijv. URL niet bereikbaar, parsing fout)

**Errors**:
```json
{
  "detail": "Failed to scrape URL: 404 Not Found"
}
```

**Voorbeeld**:
```python
# Python
import requests

response = requests.post(
    'http://localhost:8765/api/extract-training',
    json={'url': 'https://www.syntra-ab.be/opleidingen/excel-advanced'}
)
training_data = response.json()
```

---

### Offerte Generatie

#### `POST /api/generate-offer`

Genereert gepersonaliseerde offerte content met AI.

**Request Body**:
```json
{
  "crm_data": {
    "company_name": "TechCorp NV",
    "contact_name": "Jan Janssen",
    "contact_email": "jan@techcorp.be",
    "contact_phone": "+32 3 123 45 67",
    "address": "Mechelsesteenweg 123, 2018 Antwerpen"
  },
  "training_data": {
    "title": "Agile Project Management",
    "description": "Scrum en Kanban methodieken...",
    "duration": "3 dagen",
    "price": "€1.250"
  },
  "intake_data": {
    "num_participants": 12,
    "objectives": "Team moet Scrum framework implementeren...",
    "specific_requirements": "On-site training, hands-on workshops",
    "preferred_dates": "Q2 2026"
  }
}
```

**Parameters**:
| Veld | Type | Verplicht | Beschrijving |
|------|------|-----------|--------------|
| crm_data | object | Ja | Klantgegevens |
| training_data | object | Ja | Training details |
| intake_data | object | Ja | Specifieke eisen en doelen |

**Response**:
```json
{
  "offer_text": "Geachte Jan Janssen,\n\nGraag presenteren wij...",
  "generated_at": "2026-01-23T14:30:00Z",
  "model_used": "gemini-1.5-flash"
}
```

**Status Codes**:
- `200`: Succesvolle generatie
- `400`: Ongeldige input data
- `500`: Server error (bijv. Gemini API failure)

**Response Fields**:
| Veld | Type | Beschrijving |
|------|------|--------------|
| offer_text | string | Gegenereerde offerte tekst (Markdown) |
| generated_at | string | ISO 8601 timestamp |
| model_used | string | Gebruikte AI model |

---

### DOCX Document Creatie

#### `POST /api/create-docx`

Creëert een Word document op basis van template en gegenereerde content.

**Request Body**:
```json
{
  "offer_data": {
    "offer_text": "Geachte Jan Janssen...",
    "generated_at": "2026-01-23T14:30:00Z"
  },
  "crm_data": {
    "company_name": "TechCorp NV",
    "contact_name": "Jan Janssen",
    "contact_email": "jan@techcorp.be"
  },
  "training_data": {
    "title": "Agile Project Management",
    "description": "..."
  },
  "intake_data": {
    "num_participants": 12
  }
}
```

**Response**:
```json
{
  "file_id": "offer_20260123_143045_a3f2",
  "filename": "Syntra_Offerte_TechCorp_20260123.docx",
  "download_url": "/api/download/offer_20260123_143045_a3f2"
}
```

**Status Codes**:
- `200`: Document succesvol aangemaakt
- `400`: Ongeldige input data
- `500`: Server error (bijv. template niet gevonden)

---

### Document Download

#### `GET /api/download/{file_id}`

Download een gegenereerd DOCX bestand.

**Path Parameters**:
| Parameter | Type | Beschrijving |
|-----------|------|--------------|
| file_id | string | Unieke file identifier uit create-docx response |

**Response**:
- Binary file download (application/vnd.openxmlformats-officedocument.wordprocessingml.document)

**Status Codes**:
- `200`: Download succesvol
- `404`: File niet gevonden
- `500`: Server error

**Headers**:
```
Content-Disposition: attachment; filename="Syntra_Offerte_TechCorp_20260123.docx"
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

---

### Browser Automatisering

#### `POST /api/browser/open-crm`

Opent een geautomatiseerde browser voor CRM toegang.

**Request Body**:
```json
{
  "crm_url": "https://your-crm.com/login"
}
```

**Response**:
```json
{
  "status": "success",
  "message": "Browser opened successfully",
  "session_active": true
}
```

**Status Codes**:
- `200`: Browser geopend
- `500`: Browser kon niet gestart worden

---

#### `POST /api/browser/navigate-ticket`

Navigeert naar een specifiek CRM ticket.

**Request Body**:
```json
{
  "ticket_url": "https://your-crm.com/tickets/12345"
}
```

**Response**:
```json
{
  "status": "success",
  "current_url": "https://your-crm.com/tickets/12345"
}
```

**Status Codes**:
- `200`: Navigatie succesvol
- `400`: Ongeldige URL
- `500`: Browser sessie niet actief

---

#### `POST /api/browser/capture-screenshot`

Maakt screenshot van huidige browser pagina en extraheert CRM data.

**Request Body**: *(leeg)*

**Response**:
```json
{
  "crm_data": {
    "company_name": "TechCorp NV",
    "contact_name": "Jan Janssen",
    "contact_email": "jan@techcorp.be",
    "contact_phone": "+32 3 123 45 67",
    "address": "Mechelsesteenweg 123, 2018 Antwerpen"
  },
  "screenshot_taken": true
}
```

**Status Codes**:
- `200`: Screenshot en extractie succesvol
- `500`: Browser sessie niet actief of extractie mislukt

---

#### `GET /api/browser/status`

Controleert of browser sessie actief is.

**Response**:
```json
{
  "active": true,
  "current_url": "https://your-crm.com/tickets/12345"
}
```

**Status Codes**:
- `200`: Status opgehaald

---

#### `POST /api/browser/close`

Sluit de browser sessie.

**Response**:
```json
{
  "status": "success",
  "message": "Browser closed successfully"
}
```

**Status Codes**:
- `200`: Browser gesloten
- `500`: Error tijdens sluiten

---

### Template Management

#### `GET /api/templates`

Haal lijst van beschikbare templates op.

**Response**:
```json
{
  "templates": [
    {
      "id": "default",
      "name": "Standaard Syntra Bizz Template",
      "path": "./templates/syntra-bizz-2026.docx"
    },
    {
      "id": "premium",
      "name": "Premium Maatwerk Template",
      "path": "./templates/premium-maatwerk.docx"
    }
  ]
}
```

**Status Codes**:
- `200`: Templates opgehaald
- `500`: Server error

---

#### `POST /api/templates/upload`

Upload een nieuwe template.

**Request**: Multipart form data

**Form Fields**:
| Veld | Type | Beschrijving |
|------|------|--------------|
| file | file | DOCX template bestand |
| name | string | Template naam |

**Response**:
```json
{
  "template_id": "custom_12345",
  "name": "Mijn Custom Template",
  "uploaded_at": "2026-01-23T14:30:00Z"
}
```

**Status Codes**:
- `201`: Template geüpload
- `400`: Ongeldige bestandstype
- `500`: Server error

---

## Data Models

### CRMData

```python
class CRMData(BaseModel):
    company_name: str
    contact_name: str
    contact_email: str
    contact_phone: Optional[str] = None
    address: Optional[str] = None
```

**Velden**:
- `company_name`: Officiële bedrijfsnaam (incl. rechtsvorm)
- `contact_name`: Volledige naam contactpersoon
- `contact_email`: Email adres
- `contact_phone`: Telefoonnummer (optioneel)
- `address`: Volledig adres (optioneel)

---

### TrainingData

```python
class TrainingData(BaseModel):
    title: str
    description: str
    duration: Optional[str] = None
    price: Optional[str] = None
    additional_info: Optional[str] = None
```

**Velden**:
- `title`: Training titel
- `description`: Uitgebreide beschrijving
- `duration`: Duur (bijv. "3 dagen", "24 uur")
- `price`: Prijs (bijv. "€1.250")
- `additional_info`: Extra informatie

---

### IntakeData

```python
class IntakeData(BaseModel):
    num_participants: int
    objectives: str
    specific_requirements: Optional[str] = None
    preferred_dates: Optional[str] = None
```

**Velden**:
- `num_participants`: Aantal deelnemers (min: 1)
- `objectives`: Doelstellingen klant
- `specific_requirements`: Specifieke eisen (optioneel)
- `preferred_dates`: Voorkeursdata (optioneel)

---

### OfferContent

```python
class OfferContent(BaseModel):
    offer_text: str
    generated_at: str
    model_used: Optional[str] = "gemini-1.5-flash"
```

**Velden**:
- `offer_text`: Gegenereerde tekst (Markdown format)
- `generated_at`: ISO 8601 timestamp
- `model_used`: AI model identifier

---

## Error Handling

### Error Response Format

Alle errors volgen FastAPI's standaard format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common Errors

#### 400 Bad Request
```json
{
  "detail": "Invalid input data: num_participants must be at least 1"
}
```

**Oorzaken**:
- Ongeldige data types
- Ontbrekende verplichte velden
- Validatie fouten

#### 404 Not Found
```json
{
  "detail": "File not found: offer_12345"
}
```

**Oorzaken**:
- File ID bestaat niet
- Template niet gevonden

#### 500 Internal Server Error
```json
{
  "detail": "Gemini API error: Rate limit exceeded"
}
```

**Oorzaken**:
- Gemini API problemen
- Database errors
- Onverwachte exceptions

### Error Handling Best Practice

```javascript
// JavaScript voorbeeld
async function generateOffer(data) {
  try {
    const response = await fetch('/api/generate-offer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Offer generation failed:', error.message);
    // Handle error (show to user, retry, etc.)
  }
}
```

---

## Rate Limits

**Huidige versie**: Geen rate limits (local development)

**Gemini API Limits** (upstream):
- Free tier: 60 requests/minuut
- Standard tier: Variabel (check Google AI Studio)

**Best Practices**:
- Gebruik caching voor herhaalde requests
- Implement exponential backoff bij errors
- Monitor API usage in Google AI Studio dashboard

---

## Code Voorbeelden

### Complete Workflow - JavaScript

```javascript
class OfferGenerator {
  constructor(apiUrl = 'http://localhost:8765') {
    this.apiUrl = apiUrl;
  }

  async extractCRM(imageFile) {
    const base64 = await this.fileToBase64(imageFile);
    const response = await fetch(`${this.apiUrl}/api/extract-crm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_base64: base64 })
    });
    return await response.json();
  }

  async extractTraining(url) {
    const response = await fetch(`${this.apiUrl}/api/extract-training`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    return await response.json();
  }

  async generateOffer(crmData, trainingData, intakeData) {
    const response = await fetch(`${this.apiUrl}/api/generate-offer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        crm_data: crmData,
        training_data: trainingData,
        intake_data: intakeData
      })
    });
    return await response.json();
  }

  async createDocx(offerData, crmData, trainingData, intakeData) {
    const response = await fetch(`${this.apiUrl}/api/create-docx`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        offer_data: offerData,
        crm_data: crmData,
        training_data: trainingData,
        intake_data: intakeData
      })
    });
    return await response.json();
  }

  async downloadFile(fileId) {
    window.location.href = `${this.apiUrl}/api/download/${fileId}`;
  }

  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

// Gebruik
const generator = new OfferGenerator();

// 1. Extract CRM
const crmData = await generator.extractCRM(screenshotFile);

// 2. Extract Training
const trainingData = await generator.extractTraining(trainingUrl);

// 3. Generate Offer
const offerData = await generator.generateOffer(crmData, trainingData, {
  num_participants: 12,
  objectives: "Team moet Scrum implementeren",
  specific_requirements: "On-site training",
  preferred_dates: "Q2 2026"
});

// 4. Create DOCX
const docxInfo = await generator.createDocx(
  offerData, crmData, trainingData, intakeData
);

// 5. Download
await generator.downloadFile(docxInfo.file_id);
```

---

### Complete Workflow - Python

```python
import requests
import base64
from typing import Dict, Any

class OfferGeneratorClient:
    def __init__(self, api_url: str = 'http://localhost:8765'):
        self.api_url = api_url
        
    def extract_crm(self, image_path: str) -> Dict[str, Any]:
        """Extract CRM data from screenshot"""
        with open(image_path, 'rb') as f:
            image_base64 = base64.b64encode(f.read()).decode()
        
        response = requests.post(
            f'{self.api_url}/api/extract-crm',
            json={'image_base64': image_base64}
        )
        response.raise_for_status()
        return response.json()
    
    def extract_training(self, url: str) -> Dict[str, Any]:
        """Scrape training data from URL"""
        response = requests.post(
            f'{self.api_url}/api/extract-training',
            json={'url': url}
        )
        response.raise_for_status()
        return response.json()
    
    def generate_offer(
        self, 
        crm_data: Dict[str, Any],
        training_data: Dict[str, Any],
        intake_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate offer content with AI"""
        response = requests.post(
            f'{self.api_url}/api/generate-offer',
            json={
                'crm_data': crm_data,
                'training_data': training_data,
                'intake_data': intake_data
            }
        )
        response.raise_for_status()
        return response.json()
    
    def create_docx(
        self,
        offer_data: Dict[str, Any],
        crm_data: Dict[str, Any],
        training_data: Dict[str, Any],
        intake_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create DOCX document"""
        response = requests.post(
            f'{self.api_url}/api/create-docx',
            json={
                'offer_data': offer_data,
                'crm_data': crm_data,
                'training_data': training_data,
                'intake_data': intake_data
            }
        )
        response.raise_for_status()
        return response.json()
    
    def download_file(self, file_id: str, output_path: str):
        """Download generated DOCX"""
        response = requests.get(
            f'{self.api_url}/api/download/{file_id}',
            stream=True
        )
        response.raise_for_status()
        
        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

# Gebruik
if __name__ == '__main__':
    client = OfferGeneratorClient()
    
    # 1. Extract CRM
    crm_data = client.extract_crm('screenshot.png')
    
    # 2. Extract Training
    training_data = client.extract_training(
        'https://www.syntra-ab.be/opleidingen/agile'
    )
    
    # 3. Prepare intake
    intake_data = {
        'num_participants': 12,
        'objectives': 'Team moet Scrum implementeren',
        'specific_requirements': 'On-site training',
        'preferred_dates': 'Q2 2026'
    }
    
    # 4. Generate offer
    offer_data = client.generate_offer(crm_data, training_data, intake_data)
    
    # 5. Create DOCX
    docx_info = client.create_docx(
        offer_data, crm_data, training_data, intake_data
    )
    
    # 6. Download
    client.download_file(docx_info['file_id'], 'offerte.docx')
    print(f"Offerte opgeslagen: offerte.docx")
```

---

## Testing

### API Testing met cURL

```bash
# Health check
curl http://localhost:8765/

# Extract CRM
curl -X POST http://localhost:8765/api/extract-crm \
  -H "Content-Type: application/json" \
  -d '{"image_base64":"iVBORw0KGgo..."}'

# Extract Training
curl -X POST http://localhost:8765/api/extract-training \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.syntra-ab.be/opleidingen/excel"}'

# Generate Offer
curl -X POST http://localhost:8765/api/generate-offer \
  -H "Content-Type: application/json" \
  -d @offer_request.json

# Download File
curl http://localhost:8765/api/download/offer_12345 \
  --output offerte.docx
```

### Interactive API Docs

Bezoek **http://localhost:8765/docs** voor:
- Interactieve API exploratie
- Request/response voorbeelden
- Schema validatie
- Direct API calls testen

---

## Changelog

### Version 1.0.0 (2026-01-23)
- Initial release
- CRM extraction via screenshot
- Training data scraping
- AI offer generation
- DOCX creation
- Browser automation for CRM

---

**Copyright © 2026 Steff Vanhaverbeke for Syntra Bizz**  
Licensed under the MIT License
