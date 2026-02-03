#!/usr/bin/env python3
"""
Test script for Markdown to DOCX conversion
Tests the new Markdown formatting features in docx_service.py
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from services.docx_service import DocxService

def test_markdown_formatting():
    """Test Markdown formatting conversion"""
    
    # Initialize service
    output_dir = "../generated_offers"
    template_path = "../templates/default.docx"
    
    service = DocxService(template_path=None, output_dir=output_dir)
    
    # Test data with Markdown formatting
    test_offer_data = {
        "introduction": """Beste **TechCorp**,

Bedankt voor uw interesse in onze **Leiderschapsontwikkeling** training. 

Deze opleiding is specifiek ontwikkeld voor:
- Ervaren teamleads
- Middle management
- *Aspirant leidinggevenden*

We zijn ervan overtuigd dat deze training ***perfect aansluit*** bij uw doelstellingen.""",
        
        "training_objectives": """## Leerdoelen

Na afloop van deze training kunnen deelnemers:

1. **Effectief teams aansturen** en motiveren
2. *Constructieve feedback* geven en ontvangen
3. Conflicten professioneel oplossen
4. ***Strategisch denken*** en beslissingen nemen""",
        
        "program_overview": """### Programma Overzicht

**Module 1: Leiderschapsstijlen**
- Verschillende stijlen herkennen
- Eigen stijl bepalen
- Situationeel leiderschap

**Module 2: Teamdynamiek**
- Teamfasen
- *Rolverdelingen*
- Effectieve communicatie

**Module 3: Praktijkcase**
- Real-life scenario's
- ***Hands-on oefeningen***
- Peer feedback""",
        
        "practical_arrangements": """## Praktische informatie

- **Duur**: 3 dagen
- **Locatie**: In-company bij TechCorp
- **Aantal deelnemers**: Maximum 12 personen
- *Inclusief*: Materialen, lunch, certificaat""",
        
        "investment": """### Investering

**Totaalprijs**: € 4.500,- (excl. BTW)

Dit omvat:
- Alle lesmaterialen
- Certificaat van deelname
- *Follow-up sessie* na 3 maanden
- **Persoonlijke coaching** (2 uur per deelnemer)""",
        
        "next_steps": """## Volgende Stappen

1. **Kennismakingsgesprek**: Vrijblijvend gesprek over uw specifieke wensen
2. **Planning**: Samen bepalen we de meest geschikte data
3. ***Start training***: We beginnen met een kick-off sessie

*Neem gerust contact met ons op* voor meer informatie!"""
    }
    
    test_crm_data = {
        "potentiele_klant": "TechCorp BV",
        "primaire_contact": "Jan Janssen",
        "datum_offerte": "28/01/2026"
    }
    
    test_training_data = {
        "title": "Leiderschapsontwikkeling voor Teamleads",
        "duration": "3 dagen"
    }
    
    test_intake_data = {
        "number_of_participants": 12
    }
    
    print("Creating test document with Markdown formatting...")
    
    try:
        # Create document
        filepath = service.create_offer_docx(
            offer_data=test_offer_data,
            crm_data=test_crm_data,
            training_data=test_training_data,
            intake_data=test_intake_data
        )
        
        print(f"✅ Success! Document created at: {filepath}")
        print("\nExpected formatting:")
        print("- **bold** should render as bold text")
        print("- *italic* should render as italic text")
        print("- ***bold+italic*** should render as both")
        print("- - bullet points should render as bullet lists")
        print("- 1. numbered items should render as numbered lists")
        print("- ## headings should render as Word headings")
        print("\nPlease open the document and verify the formatting!")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_markdown_formatting()
