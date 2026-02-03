import google.generativeai as genai
from typing import Dict, Any
import json


class GeminiService:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')
    
    def generate_offer_content(
        self, 
        crm_data: Dict[str, Any], 
        training_data: Dict[str, Any], 
        intake_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate custom offer content using Gemini API
        """
        try:
            # Prepare comprehensive prompt
            prompt = f"""
Je bent een expert offertewriter voor Syntra Bizz, gespecialiseerd in bedrijfsopleidingen en coaching.

Creëer een professionele, gepersonaliseerde offerte op basis van onderstaande gegevens:

CRM GEGEVENS:
- Onderwerp: {crm_data.get('onderwerp', 'N/A')}
- Klant: {crm_data.get('potentiele_klant', 'N/A')}
- Contactpersoon: {crm_data.get('primaire_contact', 'N/A')}
- Beschrijving: {crm_data.get('beschrijving', 'N/A')}
- Training code: {crm_data.get('commerciele_container', 'N/A')}

OPLEIDINGSGEGEVENS:
- Titel: {training_data.get('title', 'N/A')}
- Duur: {training_data.get('duration', 'N/A')}
- Doelgroep: {training_data.get('target_audience', 'N/A')}
- Leerdoelen: {training_data.get('learning_objectives', 'N/A')}
- Programma-inhoud: {training_data.get('program_outline', 'N/A')}
- Prijs: {training_data.get('price', 'N/A')}

INTAKE INFORMATIE:
- Aantal deelnemers: {intake_data.get('number_of_participants', 'N/A')}
- Doelstellingen klant: {intake_data.get('client_goals', 'N/A')}
- Specifieke eisen: {intake_data.get('specific_requirements', 'N/A')}
- Voorkeursdata: {intake_data.get('preferred_dates', 'N/A')}
- Aanvullende opmerkingen: {intake_data.get('additional_notes', 'N/A')}

Genereer de volgende secties in het Nederlands, professionele B2B-toon:

1. INTRODUCTIE (2-3 alinea's)
   - Persoonlijke aanspreking gebaseerd op intake
   - Referentie naar de specifieke noden van de klant
   - Waarom deze opleiding aansluit bij hun doelstellingen

2. OPLEIDINGSDOELSTELLINGEN (4-6 punten)
   - Afgestemd op de doelstellingen van de klant
   - Concrete, meetbare resultaten
   - Link naar bedrijfscontext

3. PROGRAMMAOVERZICHT (gedetailleerde inhoud)
   - Gestructureerd curriculum
   - Belangrijkste modules en topics
   - Praktische werkvormen
   - Duur per onderdeel

4. PRAKTISCHE REGELING (alle logistieke details)
   - Aantal deelnemers
   - Voorgestelde planning/data
   - Locatie (in-company bij {crm_data.get('potentiele_klant', 'de klant')} of op locatie Syntra)
   - Materialen en handboeken
   - Begeleiding en coaching

5. INVESTERING (prijsopbouw)
   - Heldere kostenstructuur
   - Inclusief: lesmateriaal, begeleiding, certificaten
   - Eventuele kortingen of voordelen
   - Betalingsvoorwaarden

6. VOLGENDE STAPPEN (call-to-action)
   - Hoe verder te gaan
   - Contactgegevens
   - Vrijblijvend gesprek aanbieden

Retourneer de output als een JSON object met deze structuur:
{{
    "introduction": "tekst hier",
    "training_objectives": "tekst hier",
    "program_overview": "tekst hier",
    "practical_arrangements": "tekst hier",
    "investment": "tekst hier",
    "next_steps": "tekst hier"
}}

Gebruik professioneel Nederlands, wees concreet en klantgericht. Return ALLEEN het JSON object, geen andere tekst.
"""
            
            # Generate content
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Remove markdown code blocks if present
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.startswith('```'):
                response_text = response_text[3:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            
            response_text = response_text.strip()
            
            # Parse JSON
            offer_content = json.loads(response_text)
            
            return offer_content
            
        except Exception as e:
            print(f"Error generating offer content: {str(e)}")
            # Return fallback content
            return self._get_fallback_content(crm_data, training_data, intake_data)
    
    def _get_fallback_content(
        self, 
        crm_data: Dict[str, Any], 
        training_data: Dict[str, Any], 
        intake_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Provide fallback content if API fails
        """
        client = crm_data.get('potentiele_klant', 'Geachte klant')
        training = training_data.get('title', 'de gevraagde opleiding')
        
        return {
            "introduction": f"Beste {client},\n\nBedankt voor uw interesse in onze opleidingen. Wij bieden u graag een offerte aan voor {training}.",
            "training_objectives": "De opleiding is gericht op praktijkgerichte vaardigheden en directe toepasbaarheid in uw bedrijfscontext.",
            "program_overview": "Het programma bestaat uit verschillende modules die systematisch opgebouwd zijn en aansluiten bij de behoeften van uw organisatie.",
            "practical_arrangements": f"De opleiding wordt verzorgd voor {intake_data.get('number_of_participants', 'uw medewerkers')} en kan zowel in-company als op onze locatie plaatsvinden.",
            "investment": "Wij bieden u een concurrerend tarief inclusief alle materialen en begeleiding.",
            "next_steps": "Graag bespreken wij deze offerte verder met u. Neem contact op voor een vrijblijvend gesprek."
        }
