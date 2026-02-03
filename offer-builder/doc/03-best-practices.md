# Best Practices - Syntra Bizz Offerte Generator

## Inhoudsopgave
- [Workflow Optimalisatie](#workflow-optimalisatie)
- [Kwaliteit & Nauwkeurigheid](#kwaliteit--nauwkeurigheid)
- [Template Management](#template-management)
- [AI Prompt Engineering](#ai-prompt-engineering)
- [Beveiliging & Privacy](#beveiliging--privacy)
- [Performance Tips](#performance-tips)
- [Team Samenwerking](#team-samenwerking)

---

## Workflow Optimalisatie

### Efficiënte Data Extractie

#### Screenshot Upload Best Practices

**Voorbereiding**:
```
1. Gebruik consistente CRM views
2. Zet zoom op 100% voor optimale leesbaarheid
3. Maak volledige pagina screenshots (niet cropped)
4. Gebruik OS native screenshot tools voor beste kwaliteit
```

**Screenshot Checklist**:
- [ ] Alle vereiste velden zichtbaar
- [ ] Geen overlappende windows
- [ ] Goede contrast (donkere tekst op lichte achtergrond)
- [ ] Minimaal 1280x720 resolutie
- [ ] PNG formaat (beter dan JPG voor text)

**Sneltoetsen**:
- **macOS**: `Cmd + Shift + 4` → Selecteer area
- **Windows**: `Win + Shift + S` → Snipping tool
- **Linux**: `PrtScn` of `Shift + PrtScn`

#### Browser Automatisering Best Practices

**Session Management**:
```
✓ Open één browser sessie per werkdag
✓ Houd de browser tab open in achtergrond
✓ Sluit de browser alleen bij einde werkdag
✓ Gebruik "Navigeer naar Ticket" voor snelle switches
```

**Login Strategie**:
```
1. Start applicatie bij begin werkdag
2. Open CRM browser eenmalig
3. Log in met saved credentials
4. Laat sessie actief tijdens werkuren
5. Gebruik direct URL navigatie voor volgende tickets
```

**Performance Tip**:
```javascript
// Bewaar veelgebruikte ticket URLs in browser bookmarks
// of maak een lijst in een text bestand voor snelle toegang
```

### Batch Processing

Voor meerdere offertes achter elkaar:

**Methode 1: Sequentieel**
```
1. Verzamel alle benodigde URLs en CRM data vooraf
2. Maak lijst met klant + training combinaties
3. Verwerk één voor één met minimale schakeltijd
4. Download alle DOCX bestanden in één keer
```

**Methode 2: Template Variatie**
```
1. Maak basis offerte voor standaard programma
2. Gebruik zelfde training data voor meerdere klanten
3. Alleen CRM data en intake aanpassen
4. 3-5 minuten per extra offerte
```

**Tijdsbesparing**:
- Eerste offerte: ~8 minuten
- Tweede met zelfde training: ~5 minuten  
- Derde met zelfde training: ~4 minuten

---

## Kwaliteit & Nauwkeurigheid

### Data Verificatie Protocol

#### Dubbele Controle Systeem

**Fase 1: Automatische Extractie**
```
1. AI extraheert data uit screenshot/CRM
2. Data verschijnt in formulier velden
```

**Fase 2: Handmatige Verificatie**
```
Verplichte checks:
☑ Bedrijfsnaam spelling (let op: BV, NV, VOF)
☑ Contactpersoon volledige naam + correcte titel
☑ Email adres (geen typfouten)
☑ Telefoonnummer formaat (+32 vs 0)
☑ Adres volledigheid (straat + nummer + postcode + plaats)
```

**Fase 3: Context Validatie**
```
☑ Is dit de juiste contactpersoon voor deze opleiding?
☑ Klopt het aantal deelnemers met CRM notities?
☑ Zijn er specifieke afspraken die vermeld moeten worden?
```

### Training Data Kwaliteit

#### Web Scraping Validatie

**Succesvolle Scrape Herkennen**:
```
✓ Training titel is volledig (niet afgekapt)
✓ Beschrijving bevat meerdere paragrafen
✓ Geen HTML tags zichtbaar in tekst
✓ Speciale karakters correct weergegeven (€, %, etc.)
```

**Probleemdetectie**:
```
⚠ Zeer korte beschrijving (< 100 woorden)
⚠ Vreemde characters of encoding issues
⚠ Ontbrekende prijs of duur informatie
⚠ "Error" of "404" in de titel
```

**Fallback Procedure**:
```
Als scraping fails:
1. Open training URL handmatig in browser
2. Kopieer relevante tekst
3. Plak in de handmatige invoer velden
4. Selecteer "Handmatige Invoer" modus
```

#### Handmatige Aanvullingen

**Wanneer Handmatig Aanvullen**:
- Gecraped tekst is te algemeen
- Specifieke klant context moet toegevoegd
- Extra modules of opties beschikbaar
- Prijsafspraken afwijken van website

**Voorbeelden**:
```
Origineel (scrape):
"Excel training voor professionals, 3 dagen"

Aangevuld:
"Excel training voor professionals met focus op 
financiële rapportage en Power BI integratie, 3 dagen 
inclusief certificaat. Optioneel: extra dag Advanced Macros."
```

### AI Output Quality Control

#### Evaluatie Criteria

**Structuur** (Score 1-5):
- Logische opbouw (intro → kern → call-to-action)
- Duidelijke paragrafen en kopjes
- Goede flow tussen secties

**Tone-of-Voice** (Score 1-5):
- Professioneel maar toegankelijk
- Klantgericht (niet te product-focused)
- Enthousiasmerend zonder overdrijving
- Passend bij Syntra Bizz huisstijl

**Inhoudelijke Kwaliteit** (Score 1-5):
- Alle klant doelstellingen worden aangehaald
- Training voordelen duidelijk benoemd
- Concrete next steps
- Geen algemene platitudes

**Personalisatie** (Score 1-5):
- Bedrijfsnaam en context correct gebruikt
- Specifieke eisen verwerkt
- Aansluiting bij klant doelen
- Uniek (niet template-achtig)

**Quality Score**:
```
18-20: Excellent - Direct gebruiken
15-17: Goed - Minor tweaks
12-14: Acceptabel - Significante aanpassingen
< 12:  Regenereer met betere intake data
```

---

## Template Management

### Template Structuur

#### Optimale Placeholder Placement

**Standaard Template Structuur**:
```
[Header - Logo]

Offerte voor: {{company_name}}
T.a.v.: {{contact_name}}

Geachte {{contact_name}},

[Intro paragraaf]

Training: {{training_title}}

{{offer_text}}

[Training Details]
{{training_description}}

Aantal deelnemers: {{num_participants}}

[Footer]
Contactgegevens
{{contact_email}}
{{contact_phone}}
```

#### Geavanceerde Placeholders

**Conditionele Secties** (handmatig verwerken):
```
Als {{num_participants}} > 10:
  "Groepskorting beschikbaar"

Als {{custom_requirements}} bevat "certificaat":
  "Inclusief erkend certificaat"
```

### Template Varianten

**Aanbevolen Template Set**:

1. **Standaard Template**
   - Algemene opleidingen
   - B2B klanten
   - 1-20 deelnemers

2. **Premium Template**
   - Maatwerk programma's
   - Strategische klanten
   - 20+ deelnemers
   - Uitgebreidere opmaak

3. **Quick Quote Template**
   - Eenvoudige trainingen
   - Herhalingsklanten
   - Snelle offertes
   - Minimale detail

4. **Government Template**
   - Overheidsorganisaties
   - Formele tone
   - Extra compliance secties

**Template Organisatie**:
```
templates/
├── standaard-syntra-bizz.docx
├── premium-maatwerk.docx
├── quick-quote-herhalingklant.docx
└── government-formeel.docx
```

### Styling Best Practices

**Typography**:
- Body tekst: 11pt of 12pt (Calibri, Arial, of Helvetica)
- Headers: Hiërarchie met bold + groter
- Gebruik bullet points voor overzichtelijkheid

**Layout**:
- Marges: minimaal 2cm rondom
- Line spacing: 1.15 of 1.5 voor leesbaarheid
- Witruimte tussen secties

**Branding**:
- Syntra Bizz logo in header
- Corporate kleuren consistent gebruiken
- Footer met contactgegevens op elke pagina

---

## AI Prompt Engineering

### Intake Informatie Optimalisatie

#### Doelstellingen Formuleren

**Zwak** ❌:
```
"Medewerkers moeten Excel leren"
```

**Sterk** ✅:
```
"Het finance team (8 medewerkers) moet binnen 6 weken 
zelfstandig maandelijkse P&L rapporten kunnen maken met 
Excel pivot tables en grafieken, om de huidige externe 
consultant te vervangen en €2000/maand te besparen."
```

**Formule voor Sterke Doelstellingen**:
```
[WHO] moet [WHAT] kunnen [HOW] om [WHY/RESULT] te bereiken

Elementen:
- WHO: Specifieke doelgroep
- WHAT: Concrete skill/kennis
- HOW: Met welke tools/methoden
- WHY: Business impact/resultaat
- WHEN: Tijdslijn (optioneel)
```

#### Specifieke Eisen Effectief Communiceren

**Structuur**:
```
1. Praktische constraints
   - Locatie (on-site/online)
   - Timing (dagen/uren/periodes)
   - Groepsgrootte limieten

2. Inhoudelijke vereisten
   - Moeten behandeld worden
   - Mag niet ontbreken
   - Extra aandacht voor...

3. Certificering/Erkenning
   - Vereiste certificaten
   - Erkende instanties
   - Compliance eisen

4. Didactische voorkeuren
   - Hands-on vs theorie ratio
   - Case studies gewenst
   - Eigen materiaal gebruiken
```

**Voorbeelden**:
```
Goed:
"On-site training in Brussel, max 4u per sessie, verspreid 
over 6 weken. Gebruik van eigen sales cases verplicht. 
Certificaat vereist voor HR dossier. Focus op praktijk (70%) 
vs theorie (30%)."

Slecht:
"Flexibel, liefst snel, certificaat zou fijn zijn"
```

### Tone-of-Voice Sturing

#### Impliciete Tone Signalen in Intake

**Formeel** (overheid/corporate):
```
Doelstellingen:
"De organisatie streeft naar verhoging van de digitale 
competenties van het management team conform de 
strategische meerjarenplanning 2026-2030."

→ AI genereert formele taal
```

**Casual** (startup/creatief):
```
Doelstellingen:
"Ons team moet eindelijk snappen hoe AI werkt zodat we 
slimme features kunnen bouwen voor onze app."

→ AI genereert toegankelijke taal
```

**Commercieel** (sales-gedreven):
```
Doelstellingen:
"Sales team moet conversie verhogen met 15% door betere 
consultative selling technieken."

→ AI benadrukt ROI en resultaten
```

---

## Beveiliging & Privacy

### API Key Management

**Best Practices**:
```bash
# .env bestand NOOIT committen naar Git
✓ .env in .gitignore

# Gebruik verschillende keys voor dev/prod
✓ GEMINI_API_KEY_DEV=...
✓ GEMINI_API_KEY_PROD=...

# Roteer keys periodiek
✓ Elke 3-6 maanden nieuwe key genereren

# Monitor API usage
✓ Check Google AI Studio dashboard maandelijks
```

**Key Rotatie Procedure**:
```
1. Genereer nieuwe key in Google AI Studio
2. Update .env bestand met nieuwe key
3. Test volledige workflow
4. Deactiveer oude key na 24u grace period
5. Update documentatie met rotatie datum
```

### Klantdata Privacy

**GDPR Compliance**:
```
☑ Screenshot bestanden lokaal opslaan (niet cloud)
☑ Automatische cleanup van oude screenshots (> 30 dagen)
☑ Klant email adressen niet delen met derden
☑ API logs bevatten geen persoonlijke data
```

**Data Minimalisatie**:
```
Opslaan:
✓ Gegenereerde offertes
✓ Templates
✓ Configuratie

NIET Opslaan:
✗ CRM screenshots na extractie
✗ Browser session cookies
✗ API request/response logs met PII
```

**Cleanup Script** (optioneel):
```bash
#!/bin/bash
# cleanup-old-data.sh

# Verwijder screenshots ouder dan 30 dagen
find ./temp_screenshots -type f -mtime +30 -delete

# Verwijder oude offertes ouder dan 90 dagen
find ./generated_offers -type f -mtime +90 -delete

echo "Cleanup completed"
```

Run maandelijks via cron of handmatig.

### Secure Configuration

**Environment Variables**:
```bash
# .env - Goede praktijk
GEMINI_API_KEY=AIza...                    # ✓ 
ALLOWED_ORIGINS=http://localhost:8766    # ✓

# .env - Vermijd
# GEMINI_API_KEY=my-key                  # ✗ Te simpel
# ALLOWED_ORIGINS=*                      # ✗ Te breed
```

**File Permissions** (Linux/macOS):
```bash
# .env alleen leesbaar voor owner
chmod 600 .env

# Scripts executable
chmod +x start.sh

# Templates read-only
chmod 444 templates/*.docx
```

---

## Performance Tips

### Snelheid Optimalisatie

**Startup Tijd Reduceren**:
```bash
# Gebruik pre-built virtual environment
# Maak één keer aan, hergebruik daarna

# Start script optimalisatie
# Check of dependencies update nodig is voordat installeren
```

**Caching Strategies**:
```
✓ Training data cachen per URL (24u)
✓ Template files in memory houden
✓ Browser session hergebruiken
✗ CRM data cachen (privacy/actualiteit)
```

### AI Response Time

**Gemini API Optimalisatie**:
```python
# Gebruik juiste model voor use case
# Voor offertes: gemini-1.5-flash (sneller, goedkoper)
# Voor complexe analyse: gemini-1.5-pro (langzamer, beter)

# Optimale prompt length
# Sweet spot: 500-1500 tokens input
# Te kort: generieke output
# Te lang: langzamer en duurder
```

**Parallellisatie**:
```
Als meerdere offertes:
1. Extract alle CRM data eerst (parallel screenshots)
2. Scrape alle training URLs (parallel requests)
3. Genereer offertes sequentieel (API rate limits)
```

### Network Optimalisatie

**Local First**:
```
✓ Templates lokaal opslaan
✓ Favoriete training data cachen
✓ Offline mode voor template editing (toekomstige feature)
```

**API Call Reductie**:
```
# Hergebruik training data voor zelfde opleiding
1. Scrape URL eerste keer
2. Sla op in session storage
3. Hergebruik voor volgende klanten (zelfde dag)
4. Refresh alleen indien nodig
```

---

## Team Samenwerking

### Shared Resources

**Template Library**:
```
Centraal repository:
├── templates/
│   ├── standaard/
│   │   └── syntra-bizz-2026.docx
│   ├── custom/
│   │   ├── government-formal.docx
│   │   └── startup-casual.docx
│   └── archived/
│       └── oude-versies/

Workflow:
1. Team lead beheert master templates
2. Account managers gebruiken copies
3. Suggesties via team meetings
4. Updates quarterly
```

**Knowledge Base**:
```
Gedeelde documentatie:
- Veelgestelde training combinaties
- Best performing intake formuleringen
- Klant-specifieke tone voorkeuren
- Success stories en voorbeelden
```

### Quality Standards

**Team Review Process**:
```
Peer Review voor:
- Nieuwe template varianten
- Standaard intake teksten
- AI prompt templates
- Custom configurations

Format:
1. Creator maakt eerste versie
2. Minimaal 1 collega reviewed
3. Feedback verwerken
4. Team lead approveert
5. Deployment naar productie
```

**Performance Metrics**:
```
Track per account manager:
- Gemiddelde tijd per offerte
- Acceptance rate (% klanten die converteren)
- Regenerate ratio (hoe vaak hergenereerd)
- Template usage patterns

Maandelijkse review:
- Bottlenecks identificeren
- Best practices delen
- Tool verbeteringen prioriteren
```

### Onboarding Nieuwe Teamleden

**Checklist**:
```
Week 1:
☐ Setup installatie (deze docs)
☐ Credentials verkrijgen (Gemini API)
☐ Sandbox environment testen
☐ 5 dummy offertes maken
☐ Review met mentor

Week 2:
☐ 3 echte offertes onder supervisie
☐ Template customization leren
☐ AI prompt engineering workshop
☐ Quality standards training

Week 3-4:
☐ Zelfstandig werken met spot-checks
☐ Eigen best practices ontwikkelen
☐ Feedback geven over tool improvements
```

---

## Geavanceerde Technieken

### Custom AI Instructions

**System Prompt Customization** (voor ontwikkelaars):
```python
# In gemini_service.py

# Standaard tone
system_prompt = "Je bent een professionele offerte schrijver..."

# Custom per klant type
if client_type == "government":
    system_prompt += " Gebruik formele taal en volledige zinnen."
elif client_type == "startup":
    system_prompt += " Wees enthousiast en gebruik moderne terminologie."
```

### Template Scripting

**Word Macro's** (optioneel):
```vba
' Automatische formatting na generatie
Sub FormatOffer()
    ' Pas corporate styling toe
    ' Check placeholder replacement
    ' Valideer documentstructuur
End Sub
```

### Integration Possibilities

**Toekomstige Uitbreidingen**:
```
- CRM direct API integration (ipv screenshots)
- Email automation (direct versturen vanuit tool)
- Calendar integration (training data coordinatie)
- Analytics dashboard (conversion tracking)
- Multi-taal support (FR/EN offertes)
```

---

## Troubleshooting Checklist

**Voor elke offerte generatie**:
```
☐ Backend server running? (http://localhost:8765/docs laadt)
☐ .env bestand correct? (API key ingevuld)
☐ CRM data compleet? (alle velden ingevuld)
☐ Training URL valide? (opent in browser)
☐ Intake informatie specifiek genoeg?
☐ Preview bekeken voordat downloaden?
☐ DOCX opent correct in Word?
```

**Bij problemen**:
```
1. Check browser console (F12) voor errors
2. Check backend terminal voor stack traces
3. Test met dummy data eerst
4. Herstart servers als laatste resort
5. Check documentatie voor specifieke foutcode
```

---

## Conclusie

Door deze best practices te volgen:

✓ **Snelheid**: 50% tijdsbesparing per offerte  
✓ **Kwaliteit**: Hogere acceptance rates  
✓ **Consistentie**: Professionele uitstraling  
✓ **Veiligheid**: GDPR compliant  
✓ **Schaalbaarheid**: Team-wide efficiency  

**Continue Verbetering**:
- Verzamel metrics
- Vraag klantfeedback
- Update best practices quarterly
- Deel learnings met team

---

**Copyright © 2026 Steff Vanhaverbeke for Syntra Bizz**  
Licensed under the MIT License
