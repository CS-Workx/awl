# First Use Guide - Syntra Bizz Offerte Generator

## Inhoudsopgave
- [Quick Start](#quick-start)
- [Workflow Overzicht](#workflow-overzicht)
- [Stap-voor-Stap Tutorial](#stap-voor-stap-tutorial)
- [Tips voor Eerste Gebruik](#tips-voor-eerste-gebruik)

---

## Quick Start

### 1. Start de Applicatie

Open een terminal in de projectmap en voer uit:

```bash
./start.sh
```

### 2. Open de Interface

Ga in uw browser naar: **http://localhost:8766**

### 3. Volg de Workflow

De interface begeleidt u door 5 stappen:
1. 📄 **Template Selectie**
2. 👤 **CRM Data Extractie**
3. 📚 **Opleidingsprogramma**
4. 📋 **Intake Informatie**
5. ✨ **Offerte Genereren**

---

## Workflow Overzicht

### Twee Hoofdroutes

#### Route A: Screenshot Upload (Traditioneel)
```
Screenshot uploaden → Data extractie → Handmatige correctie → Verder
```

**Voordelen**:
- Snel voor eenmalig gebruik
- Geen browser automatisering nodig
- Werkt met elk CRM systeem

**Nadelen**:
- Kwaliteit afhankelijk van screenshot
- Handmatige correctie vaak nodig

#### Route B: Browser Automatisering (Nieuw)
```
CRM login → Ticket navigatie → Automatische extractie → Verder
```

**Voordelen**:
- Hogere nauwkeurigheid
- Directe data extractie
- Minder handmatige correctie

**Nadelen**:
- Vereist Playwright setup
- Eerste keer inloggen nodig

---

## Stap-voor-Stap Tutorial

### Voorbereiding

**Wat u nodig heeft**:
- [ ] CRM toegang (login credentials of screenshot)
- [ ] URL van de Syntra Bizz opleidingspagina
- [ ] Aantal verwachte deelnemers
- [ ] Klantdoelstellingen en specifieke eisen (optioneel)

### Stap 1: Template Selectie

1. De applicatie opent met de template selectie sectie
2. **Standaard template** is al geselecteerd
3. Optioneel: Upload eigen template via **"Upload Eigen Template"** knop

**Template Placeholders**:
Als u een eigen template gebruikt, zorg dat deze volgende placeholders bevat:

```
{{company_name}}        - Bedrijfsnaam
{{contact_name}}        - Contactpersoon
{{contact_email}}       - Email
{{training_title}}      - Opleidingstitel
{{training_description}}- Beschrijving
{{offer_text}}          - Gegenereerde offerte tekst
{{num_participants}}    - Aantal deelnemers
```

### Stap 2: CRM Data Extractie

#### Optie A: Screenshot Upload

1. Maak een screenshot van uw CRM ticket/opportunity
   - **Windows**: Win + Shift + S
   - **macOS**: Cmd + Shift + 4
   - **Tip**: Zorg dat alle relevante velden zichtbaar zijn

2. Sleep het screenshot naar de **upload zone** of klik om te bladeren

3. Wacht op extractie (5-10 seconden)

4. **Controleer en corrigeer** de geëxtraheerde data:
   - Bedrijfsnaam
   - Contactpersoon
   - Email
   - Telefoon
   - Adres

**Voorbeeld Screenshot Vereisten**:
```
✓ Scherp en leesbaar
✓ Alle velden zichtbaar
✓ Goede contrast
✓ Minimale resolutie: 1024x768
✗ Geen blurred text
✗ Geen te kleine tekst
```

#### Optie B: Browser Automatisering

1. Klik op de tab **"CRM Browser Login"**

2. Voer de CRM login URL in (bijv. `https://yourcrm.com/login`)

3. Klik **"Open CRM"** - een browser venster opent automatisch

4. **Log in met uw normale credentials** in het geopende browser venster

5. Navigeer naar het gewenste ticket/opportunity
   - **Optie 1**: Handmatig navigeren in de browser
   - **Optie 2**: Direct URL invoeren en klik "Navigeer naar Ticket"

6. Als u op de juiste pagina bent, klik **"Capture & Extract Data"**

7. Het systeem:
   - Maakt automatisch een screenshot
   - Extraheert de data
   - Toont de resultaten ter controle

8. **Controleer en corrigeer** indien nodig

**Status Indicatoren**:
- 🟢 Groen: Browser actief en verbonden
- 🔴 Rood: Geen actieve browser sessie

### Stap 3: Opleidingsprogramma Toevoegen

1. Ga naar de Syntra Bizz website en vind de gewenste opleiding

2. Kopieer de volledige URL (bijv. `https://www.syntra-ab.be/opleidingen/...`)

3. Plak de URL in het **"Training URL"** veld

4. Klik **"Ophalen"**

5. Het systeem scraped automatisch:
   - Titel van de opleiding
   - Volledige beschrijving
   - Duur en opties
   - Prijs (indien beschikbaar)

6. **Review** de geëxtraheerde informatie

7. Optioneel: **Handmatig aanpassen** indien nodig
   - Titel wijzigen
   - Beschrijving aanvullen
   - Extra informatie toevoegen

**Veelvoorkomende URLs**:
```
https://www.syntra-ab.be/opleidingen/[opleiding-naam]
https://www.syntra-ab.be/bedrijfsopleidingen/[programma]
```

### Stap 4: Intake Informatie

Vul de specifieke klantinformatie in:

#### 4.1 Aantal Deelnemers
```
Voorbeeld: 12
```

#### 4.2 Doelstellingen
Beschrijf wat de klant wil bereiken met de opleiding.

**Voorbeelden**:
```
"Het team moet de nieuwste marketingstrategieën leren 
om de online conversie te verhogen met minimaal 20%."

"Medewerkers moeten Excel Power BI kunnen gebruiken 
voor financiële rapportage."

"Leidinggevenden moeten effectieve feedbackgesprekken 
kunnen voeren volgens de GROW-methodiek."
```

**Tips**:
- Wees specifiek en meetbaar
- Vermeld gewenste resultaten
- Noem relevante context

#### 4.3 Specifieke Eisen (Optioneel)
```
"Training moet on-site plaatsvinden in Antwerpen"
"Maximum 4 uur per sessie"
"Praktijkgerichte oefeningen met eigen cases"
"Certificaat vereist"
```

#### 4.4 Voorkeursdata (Optioneel)
```
"Q2 2026, bij voorkeur dinsdag/donderdag"
"Voor 1 mei 2026"
"September - Oktober 2026"
```

### Stap 5: Offerte Genereren

1. Controleer of alle stappen compleet zijn (groene vinkjes)

2. Klik op de grote knop **"✨ Genereer Offerte"**

3. Wacht terwijl de AI:
   - Analyseert alle ingevoerde data
   - Genereert gepersonaliseerde content
   - Structureert de offerte tekst
   - **Verwachte tijd**: 10-20 seconden

4. **Preview** verschijnt automatisch met:
   - Inleiding
   - Training beschrijving
   - Toegevoegde waarde
   - Volgende stappen
   - Call-to-action

5. **Review** de gegenereerde tekst:
   - ✓ Klopt de tone-of-voice?
   - ✓ Zijn alle details correct?
   - ✓ Is de structuur logisch?

6. Optioneel: Klik **"Regenereer"** voor nieuwe variant

7. Tevreden? Klik **"📥 Download DOCX"**

8. Het Word document wordt automatisch gedownload naar uw Downloads map

---

## Tips voor Eerste Gebruik

### Voor Optimale Resultaten

#### 1. Screenshot Kwaliteit
- Gebruik hoge resolutie (minimaal 1024x768)
- Zorg voor goede verlichting/contrast
- Vermijd scheve of wazig screenshots
- Test eerst met één screenshot om het systeem te leren kennen

#### 2. Training URLs
- Gebruik de volledige URL
- Controleer dat de pagina publiek toegankelijk is
- Bij problemen: probeer de URL in een incognito venster
- Fallback: vul handmatig in als scraping faalt

#### 3. Intake Informatie
- Hoe meer detail, hoe betere AI output
- Gebruik concrete voorbeelden en cijfers
- Vermijd vage termen zoals "beter worden"
- Denk na als klant: wat wil ik lezen?

#### 4. Review Proces
- Neem altijd tijd om de output te reviewen
- De AI is een assistent, geen vervanging
- Maak notities van veelvoorkomende correcties
- Gebruik de regenereer functie bij ontevreden resultaat

### Veelvoorkomende Beginfouten

❌ **Fout**: Te kleine screenshot uploaden
✅ **Juist**: Volledige CRM pagina met alle velden zichtbaar

❌ **Fout**: Vage doelstellingen zoals "training in Excel"
✅ **Juist**: "Medewerkers moeten pivot tables en VLOOKUP beheersen voor maandelijkse sales reports"

❌ **Fout**: Direct downloaden zonder preview te checken
✅ **Juist**: Altijd eerst preview bekijken en kritisch beoordelen

❌ **Fout**: Eigen template uploaden zonder placeholders
✅ **Juist**: Template voorbereiden met correcte {{placeholder}} syntax

### Uw Eerste Offerte - Checklist

Voordat u uw eerste productie-offerte maakt:

- [ ] Test met dummy data
- [ ] Controleer template formatting
- [ ] Verifieer placeholder vervanging
- [ ] Review AI tone-of-voice
- [ ] Test download functionaliteit
- [ ] Open gegenereerde DOCX in Word
- [ ] Controleer alle secties van het document
- [ ] Test met verschillende training types
- [ ] Evalueer kwaliteit met collega
- [ ] Maak notities voor verbetering

---

## Workflow Voorbeeld: Volledige Cyclus

### Scenario
**Klant**: TechCorp NV  
**Opleiding**: Agile Project Management  
**Deelnemers**: 8  
**Doel**: Team leren werken volgens Scrum methodiek  

### Stap voor Stap

1. **Start applicatie**: `./start.sh`
2. **Open browser**: http://localhost:8766
3. **Screenshot upload**: CRM ticket van TechCorp
4. **Verifieer data**:
   - Bedrijf: TechCorp NV ✓
   - Contact: Jan Janssen ✓
   - Email: jan@techcorp.be ✓
5. **Training URL**: https://www.syntra-ab.be/opleidingen/agile-project-management
6. **Klik "Ophalen"**: Data verschijnt automatisch
7. **Intake invullen**:
   - Deelnemers: 8
   - Doelstellingen: "Team moet Scrum framework implementeren voor software projecten"
   - Eisen: "On-site training, hands-on workshops"
   - Data: "Q2 2026"
8. **Genereer offerte**: Wacht 15 seconden
9. **Review preview**: Tekst checken
10. **Download DOCX**: Bestand openen in Word
11. **Laatste controle**: Alles correct
12. **Versturen naar klant**: Via email

**Totale tijd**: 5-8 minuten per offerte

---

## Veelgestelde Vragen - Eerste Gebruik

### Q: Moet ik elke keer opnieuw inloggen in de CRM browser?
**A**: Nee, de browser sessie blijft actief zolang de applicatie draait. Na een herstart moet u opnieuw inloggen.

### Q: Kan ik meerdere offertes achter elkaar maken?
**A**: Ja! Nadat u een offerte heeft gedownload, kunt u direct nieuwe data invoeren voor de volgende offerte.

### Q: Wat als de AI gegenereerde tekst niet goed is?
**A**: Klik op "Regenereer" voor een nieuwe versie, of pas de intake informatie aan voor betere resultaten.

### Q: Kan ik de template later wijzigen?
**A**: Ja, u kunt op elk moment een nieuwe template selecteren of uploaden voordat u de offerte genereert.

### Q: Worden mijn offertes opgeslagen?
**A**: Ja, alle gegenereerde DOCX bestanden worden bewaard in de `generated_offers/` map met timestamp in de bestandsnaam.

### Q: Kan ik de applicatie offline gebruiken?
**A**: Nee, de applicatie vereist een internetverbinding voor de Gemini API calls en web scraping.

---

## Volgende Stappen

Nu u de basis kent:

1. Lees **Best Practices** (`03-best-practices.md`) voor geavanceerde tips
2. Experimenteer met verschillende training types
3. Optimaliseer uw persoonlijke workflow
4. Maak eigen template varianten
5. Verzamel feedback van collega's

---

**Copyright © 2026 Steff Vanhaverbeke for Syntra Bizz**  
Licensed under the MIT License
