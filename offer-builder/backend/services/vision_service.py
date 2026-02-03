import google.generativeai as genai
from typing import Dict, Any
import json
import base64
from PIL import Image
import io
import logging

logger = logging.getLogger(__name__)


class VisionService:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')
    
    def extract_training_from_image(self, image_base64: str) -> Dict[str, Any]:
        try:
            logger.info(f"[VISION] Starting training extraction, image_base64 length: {len(image_base64)}")
            
            if ',' in image_base64:
                image_base64 = image_base64.split(',')[1]
            
            logger.info(f"[VISION] After split, image_base64 length: {len(image_base64)}")
            
            image_data = base64.b64decode(image_base64)
            logger.info(f"[VISION] Decoded image data length: {len(image_data)}")
            
            image = Image.open(io.BytesIO(image_data))
            logger.info(f"[VISION] Image opened successfully: {image.size}, {image.format}")
            
            prompt = """
Extract training program information from this webpage screenshot. Focus on identifying:
- Training title/name
- Duration (hours, days, or time period)
- Target audience (who the training is for)
- Learning objectives (what participants will learn)
- Program outline/curriculum (topics covered)
- Price/cost information
- Trainer/instructor information

Return ONLY a valid JSON object with these exact fields (use null for missing values):
{
    "title": "training title",
    "duration": "duration information",
    "target_audience": "target audience description",
    "learning_objectives": "learning objectives text",
    "program_outline": "program outline/curriculum",
    "price": "price information",
    "trainer_info": "trainer/instructor details"
}

Extract the actual values from the webpage. Return ONLY the JSON, no other text.
"""
            
            logger.info("[VISION] Calling Gemini API...")
            response = self.model.generate_content([prompt, image])
            
            logger.info("[VISION] Gemini response received")
            
            response_text = response.text.strip()
            logger.info(f"[VISION] Response text (first 200 chars): {response_text[:200]}")
            
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.startswith('```'):
                response_text = response_text[3:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            
            response_text = response_text.strip()
            
            extracted_data = json.loads(response_text)
            logger.info(f"[VISION] Successfully extracted {len(extracted_data)} fields")
            
            return extracted_data
            
        except Exception as e:
            logger.error(f"[VISION] Error extracting training data: {str(e)}")
            import traceback
            traceback.print_exc()
            raise Exception(f"Failed to extract training data from image: {str(e)}")
