import os
import base64
import json
from typing import Dict, Any
import google.generativeai as genai
from PIL import Image
import io


class OCRService:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')
    
    def extract_crm_fields(self, image_base64: str) -> Dict[str, Any]:
        """
        Extract structured CRM data from screenshot using Gemini Vision API
        """
        try:
            print(f"[OCR] Starting extraction, image_base64 length: {len(image_base64)}")
            
            # Decode base64 image
            if ',' in image_base64:
                image_base64 = image_base64.split(',')[1]
            
            print(f"[OCR] After split, image_base64 length: {len(image_base64)}")
            
            image_data = base64.b64decode(image_base64)
            print(f"[OCR] Decoded image data length: {len(image_data)}")
            
            image = Image.open(io.BytesIO(image_data))
            print(f"[OCR] Image opened successfully: {image.size}, {image.format}")
            
            # Prepare prompt for Gemini Vision
            prompt = """
            Extract all CRM fields from this screenshot. Focus on:
            - Client information (name, contact person)
            - Training details (subject, training code)
            - Financial data (estimated revenue, margin)
            - Timeline (dates, probability)
            
            Return ONLY a valid JSON object with these exact fields (use null for missing values):
            {
                "onderwerp": "subject/topic",
                "potentiele_klant": "client name",
                "type": "type/instructor",
                "primaire_contact": "primary contact name",
                "extra_contact": "additional contact",
                "beschrijving": "description/notes",
                "commerciele_container": "training code/container",
                "sales_stage": "sales stage",
                "waarschijnlijkheid": "probability percentage",
                "gewogen_omzet": "estimated revenue",
                "weighted_margin": "weighted net margin",
                "sluitingsdatum": "closing date",
                "datum_offerte": "offer date"
            }
            
            Extract the actual values from the screenshot. Return ONLY the JSON, no other text.
            """
            
            print("[OCR] Calling Gemini API...")
            # Generate content with image
            response = self.model.generate_content([prompt, image])
            
            print(f"[OCR] Gemini response received")
            
            # Parse response
            response_text = response.text.strip()
            print(f"[OCR] Response text (first 200 chars): {response_text[:200]}")
            
            # Remove markdown code blocks if present
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.startswith('```'):
                response_text = response_text[3:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            
            response_text = response_text.strip()
            
            # Parse JSON
            extracted_data = json.loads(response_text)
            print(f"[OCR] Successfully extracted {len(extracted_data)} fields")
            
            return extracted_data
            
        except Exception as e:
            print(f"[OCR] Error extracting CRM fields: {str(e)}")
            import traceback
            traceback.print_exc()
            raise Exception(f"Failed to extract CRM data: {str(e)}")
