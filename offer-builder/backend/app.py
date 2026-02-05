"""
Syntra Bizz Offer Generator - Main API Application

Copyright (c) 2026 Steff Vanhaverbeke for Syntra Bizz
Licensed under the MIT License - see LICENSE file for details

AI-assisted training offer generation system
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import base64

from models.schemas import (
    CRMData, TrainingData, IntakeData, OfferContent,
    GenerateOfferRequest, ExtractCRMRequest, ExtractTrainingRequest,
    CreateDocxRequest, OpenCRMRequest, NavigateTicketRequest, OpenTrainingURLRequest
)
from services.ocr_service import OCRService
from services.scraper_service import ScraperService
from services.gemini_service import GeminiService
from services.docx_service import DocxService
from services.template_service import TemplateService
from services.browser_service import browser_service
from services.ai_extraction_service import AIExtractionService
from services.document_service import DocumentService
from services.vision_service import VisionService

# Load environment variables
load_dotenv()

# Get base path from environment (empty for local, /offer-builder for VPS)
base_path = os.getenv('BASE_PATH', '')

# Initialize FastAPI app
app = FastAPI(
    title="Syntra Bizz Offer Generator API",
    description="AI-assisted custom training offer generation system",
    version="1.0.0",
    root_path=base_path
)

# Configure CORS
allowed_origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:8766').split(',')
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
gemini_api_key = os.getenv('GEMINI_API_KEY')
if not gemini_api_key:
    raise ValueError("GEMINI_API_KEY environment variable is not set")

template_path = os.getenv('TEMPLATE_PATH', './templates/default.docx')
output_dir = os.getenv('OUTPUT_DIR', './generated_offers')
templates_dir = os.getenv('TEMPLATES_DIR', './templates')

# Ensure output directories exist
os.makedirs(output_dir, exist_ok=True)
os.makedirs(templates_dir, exist_ok=True)
os.makedirs(os.path.join(templates_dir, 'user_uploads'), exist_ok=True)

ocr_service = OCRService(gemini_api_key)
ai_extraction_service = AIExtractionService(gemini_api_key)
scraper_service = ScraperService(ai_extraction_service)
document_service = DocumentService()
gemini_service = GeminiService(gemini_api_key)
docx_service = DocxService(template_path, output_dir)
template_service = TemplateService(templates_dir)
vision_service = VisionService(gemini_api_key)

# Store generated files (in-memory for MVP, use database in production)
generated_files = {}


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "message": "Syntra Bizz Offer Generator API is running"}


@app.get("/health")
async def health_check():
    """VPS health check endpoint"""
    return {
        "status": "operational",
        "version": "1.0.0",
        "message": "Offer Builder API"
    }


@app.get("/api/status")
async def api_status():
    """Configuration status endpoint"""
    return {
        "gemini_configured": bool(gemini_api_key),
        "base_path": os.getenv('BASE_PATH', ''),
        "port": os.getenv('PORT', '8765'),
        "template_exists": os.path.exists(template_path),
        "output_dir": output_dir,
        "templates_dir": templates_dir
    }


@app.post("/api/extract-crm")
async def extract_crm(request: ExtractCRMRequest):
    """
    Extract CRM data from screenshot using Gemini Vision API
    """
    try:
        extracted_data = ocr_service.extract_crm_fields(request.image_base64)
        return JSONResponse(content=extracted_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/extract-training")
async def extract_training(request: ExtractTrainingRequest):
    """
    Scrape training program details from URL with AI extraction
    """
    try:
        training_data = scraper_service.scrape_training_url(request.url)
        return JSONResponse(content=training_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/extract-training-document")
async def extract_training_document(file: UploadFile = File(...)):
    """
    Extract training program details from uploaded document (PDF, Word, TXT)
    """
    try:
        filename = file.filename.lower()
        
        valid_extensions = ('.pdf', '.docx', '.doc', '.txt')
        if not filename.endswith(valid_extensions):
            raise HTTPException(
                status_code=400, 
                detail=f"Ongeldig bestandstype. Gebruik PDF, Word of tekst. Ontvangen: {filename}"
            )
        
        max_size = 10 * 1024 * 1024
        file_content = await file.read()
        if len(file_content) > max_size:
            raise HTTPException(
                status_code=400,
                detail="Bestand is te groot. Maximum is 10MB."
            )
        
        await file.seek(0)
        
        document_text = await document_service.extract_document(file)
        
        training_data = ai_extraction_service.extract_training_data(
            content=document_text,
            source_type=f"document ({filename})"
        )
        
        return JSONResponse(content=training_data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fout bij het verwerken van document: {str(e)}")


@app.post("/api/generate-offer")
async def generate_offer(request: GenerateOfferRequest):
    """
    Generate complete offer content using Gemini API
    """
    try:
        offer_content = gemini_service.generate_offer_content(
            crm_data=request.crm_data.model_dump(),
            training_data=request.training_data.model_dump(),
            intake_data=request.intake_data.model_dump()
        )
        return JSONResponse(content=offer_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/create-docx")
async def create_docx(request: CreateDocxRequest, template_id: str = None):
    """
    Generate DOCX file from offer data
    Optional template_id parameter to use custom template
    """
    try:
        # Get template path based on template_id
        if template_id and template_id != "default":
            template_path_to_use = template_service.get_template_path(template_id)
            # Create new docx service instance with custom template
            custom_docx_service = DocxService(template_path_to_use, output_dir)
            service_to_use = custom_docx_service
        else:
            # Use default template
            service_to_use = docx_service
        
        filepath = service_to_use.create_offer_docx(
            offer_data=request.offer_data,
            crm_data=request.crm_data.model_dump(),
            training_data=request.training_data.model_dump(),
            intake_data=request.intake_data.model_dump()
        )
        
        # Generate file ID
        file_id = os.path.basename(filepath)
        generated_files[file_id] = filepath
        
        return JSONResponse(content={"file_id": file_id, "filename": file_id})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/download/{file_id}")
async def download_file(file_id: str):
    """
    Download generated DOCX file
    """
    try:
        if file_id not in generated_files:
            raise HTTPException(status_code=404, detail="File not found")
        
        filepath = generated_files[file_id]
        
        if not os.path.exists(filepath):
            raise HTTPException(status_code=404, detail="File not found on disk")
        
        return FileResponse(
            path=filepath,
            filename=file_id,
            media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/upload-screenshot")
async def upload_screenshot(file: UploadFile = File(...)):
    """
    Upload screenshot and extract CRM data
    Alternative endpoint for file upload
    """
    try:
        # Read file
        contents = await file.read()
        
        # Convert to base64
        image_base64 = base64.b64encode(contents).decode('utf-8')
        
        # Extract CRM data
        extracted_data = ocr_service.extract_crm_fields(image_base64)
        
        return JSONResponse(content=extracted_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/upload-template")
async def upload_template(file: UploadFile = File(...)):
    """
    Upload custom DOCX template
    """
    try:
        result = await template_service.upload_template(file, user_id="default")
        return JSONResponse(content=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/templates")
async def list_templates():
    """
    List all available templates
    """
    try:
        templates = template_service.list_templates(user_id="default")
        return JSONResponse(content=templates)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/templates/{template_id}")
async def delete_template(template_id: str):
    """
    Delete uploaded template
    """
    try:
        success = template_service.delete_template(template_id)
        if success:
            return JSONResponse(content={"status": "success", "message": "Template deleted"})
        else:
            raise HTTPException(status_code=404, detail="Template not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/browser/open-crm")
async def open_crm_browser(request: OpenCRMRequest):
    """
    Open CRM in browser for user login
    """
    try:
        session_id = await browser_service.open_crm_login(request.crm_url)
        return JSONResponse(content={
            "status": "success",
            "session_id": session_id,
            "message": "Browser opened. Please login to your CRM."
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/browser/navigate-ticket")
async def navigate_to_ticket(request: NavigateTicketRequest):
    """
    Navigate to specific CRM ticket/opportunity
    """
    try:
        success = await browser_service.navigate_to_ticket(request.ticket_url)
        return JSONResponse(content={
            "status": "success",
            "message": "Navigated to ticket successfully"
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/browser/capture-screenshot")
async def capture_browser_screenshot():
    """
    Capture screenshot from open browser session
    """
    try:
        screenshot_base64 = await browser_service.capture_screenshot()
        
        # Extract CRM data from screenshot
        extracted_data = ocr_service.extract_crm_fields(screenshot_base64)
        
        return JSONResponse(content=extracted_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/browser/status")
async def browser_status():
    """
    Check browser session status
    """
    try:
        is_active = await browser_service.is_active()
        current_url = ""
        
        if is_active:
            current_url = await browser_service.get_current_url()
        
        return JSONResponse(content={
            "active": is_active,
            "current_url": current_url
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/browser/close")
async def close_browser():
    """
    Close browser session
    """
    try:
        await browser_service.close()
        return JSONResponse(content={
            "status": "success",
            "message": "Browser closed"
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/browser/open-training-url")
async def open_training_url(request: OpenTrainingURLRequest):
    """
    Open training URL in browser, capture screenshot, and extract data with Gemini Vision
    """
    try:
        await browser_service.open_training_url(request.url)
        
        screenshot_base64 = await browser_service.capture_full_page_screenshot()
        
        extracted_data = vision_service.extract_training_from_image(screenshot_base64)
        
        await browser_service.close_training_browser()
        
        return JSONResponse(content=extracted_data)
        
    except Exception as e:
        try:
            await browser_service.close_training_browser()
        except:
            pass
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv('PORT', '8765'))
    uvicorn.run(app, host="0.0.0.0", port=port)


