import google.generativeai as genai
from typing import Dict, Any
import json
import logging

logger = logging.getLogger(__name__)


class AIExtractionService:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')
    
    def extract_training_data(self, content: str, source_type: str = "unknown") -> Dict[str, Any]:
        try:
            logger.info(f"[AI_EXTRACTION] Starting extraction for {source_type}, content length: {len(content)}")
            
            if len(content) > 50000:
                content = content[:50000]
                logger.warning(f"[AI_EXTRACTION] Content truncated to 50000 characters")
            
            prompt = f"""
Je bent een AI-assistent gespecialiseerd in het extraheren van opleidingsgegevens.

Analyseer de volgende content en extraheer ALLE beschikbare informatie over het opleidingsprogramma.

CONTENT TYPE: {source_type}

CONTENT:
{content}

Extraheer de volgende informatie en retourneer een JSON object met deze exacte veldnamen:

{{
    "title": "Volledige titel van de opleiding",
    "duration": "Duur van de opleiding (bijv. '3 dagen', '24 uur', '6 weken')",
    "price": "Prijs inclusief valuta (bijv. '€ 1.500', '€ 2.000 excl. BTW')",
    "target_audience": "Beschrijving van de doelgroep - voor wie is deze opleiding bedoeld",
    "learning_objectives": "Alle leerdoelen of wat deelnemers zullen leren - maak een gestructureerde lijst",
    "program_outline": "Volledige programma-inhoud, modules, onderwerpen - geef een gedetailleerd overzicht",
    "trainer_info": "Informatie over de trainer(s) of docent(en)"
}}

BELANGRIJKE INSTRUCTIES:
1. Als een veld niet beschikbaar is in de content, gebruik dan null (niet een lege string)
2. Behoud alle relevante details - wees volledig en grondig
3. Voor lijsten (leerdoelen, programma-inhoud): gebruik bullet points of nummering voor leesbaarheid
4. Retourneer ALLEEN het JSON object, geen extra tekst
5. Zorg dat het JSON valid is (correct gebruik van quotes en komma's)
6. Als de content in HTML formaat is, extraheer dan de tekst en negeer HTML tags
7. Prijs: zoek naar € symbolen, bedragen, of woorden zoals 'prijs', 'kosten', 'investering'
8. Duur: zoek naar uren, dagen, weken, maanden, of andere tijdseenheden
9. Let op synoniemen: 'doelstellingen' = 'leerdoelen', 'lesinhoud' = 'programma-inhoud', etc.

Retourneer nu het JSON object:
"""
            
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            logger.info(f"[AI_EXTRACTION] Raw response length: {len(response_text)}")
            logger.debug(f"[AI_EXTRACTION] Raw response: {response_text[:500]}...")
            
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.startswith('```'):
                response_text = response_text[3:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            
            response_text = response_text.strip()
            
            try:
                extracted_data = json.loads(response_text)
                logger.info(f"[AI_EXTRACTION] Successfully parsed JSON response")
                logger.info(f"[AI_EXTRACTION] Extracted fields: {list(extracted_data.keys())}")
                
                for field, value in extracted_data.items():
                    if value:
                        logger.info(f"[AI_EXTRACTION] {field}: {str(value)[:100]}...")
                
                return extracted_data
                
            except json.JSONDecodeError as e:
                logger.error(f"[AI_EXTRACTION] JSON parse error: {str(e)}")
                logger.error(f"[AI_EXTRACTION] Problematic response: {response_text}")
                
                return {
                    'title': None,
                    'duration': None,
                    'price': None,
                    'target_audience': None,
                    'learning_objectives': None,
                    'program_outline': None,
                    'trainer_info': None
                }
                
        except Exception as e:
            logger.error(f"[AI_EXTRACTION] Extraction error: {str(e)}")
            raise Exception(f"AI extraction failed: {str(e)}")
