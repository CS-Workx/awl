# Quick Reference - Syntra Bizz Offerte Generator

Een compact overzicht voor dagelijks gebruik.

---

## ⚡ Snelstart Commando's

```bash
# Start applicatie
./start.sh

# Handmatig backend starten
cd backend && python app.py

# Handmatig frontend starten
cd frontend && python3 -m http.server 8766

# Servers stoppen
Ctrl + C
```

**URLs**:
- Frontend: `http://localhost:8766`
- Backend API: `http://localhost:8765`
- API Docs: `http://localhost:8765/docs`

---

## 📋 Workflow Checklist

### ✓ Voorbereiding
- [ ] Servers gestart
- [ ] Browser open op localhost:8766
- [ ] CRM data beschikbaar (screenshot OF login ready)
- [ ] Training URL gekopieerd
- [ ] Klantdoelen gedocumenteerd

### ✓ Stap 1: Template
- [ ] Template geselecteerd (of standaard)
- [ ] Custom template geupload (optioneel)

### ✓ Stap 2: CRM Data
**Optie A - Screenshot**:
- [ ] Screenshot gemaakt (hoge kwaliteit)
- [ ] Screenshot geupload
- [ ] Data geverifieerd en gecorrigeerd

**Optie B - Browser**:
- [ ] CRM browser geopend
- [ ] Ingelogd in CRM
- [ ] Naar ticket genavigeerd
- [ ] Data gecaptured
- [ ] Data geverifieerd

### ✓ Stap 3: Training
- [ ] Training URL ingevoerd
- [ ] Data opgehaald
- [ ] Details gecontroleerd
- [ ] Handmatig aangevuld indien nodig

### ✓ Stap 4: Intake
- [ ] Aantal deelnemers ingevuld
- [ ] Doelstellingen beschreven (specifiek!)
- [ ] Specifieke eisen toegevoegd
- [ ] Voorkeursdata vermeld

### ✓ Stap 5: Genereren
- [ ] Offerte gegenereerd
- [ ] Preview bekeken
- [ ] Kwaliteit gecontroleerd
- [ ] (Optioneel) Geregenereerd
- [ ] DOCX gedownload
- [ ] Document geopend in Word
- [ ] Finale check gedaan

---

## 🎯 Kwaliteit Criteria

### Screenshot Upload
```
✓ Resolutie ≥ 1280x720
✓ Alle velden zichtbaar
✓ Scherp en leesbaar
✓ Goed contrast
✓ PNG formaat (bij voorkeur)
```

### Doelstellingen Formuleren
```
Format: [WHO] moet [WHAT] kunnen [HOW] om [WHY] te bereiken

Voorbeeld:
"Het sales team (12 personen) moet binnen 8 weken 
consultative selling technieken kunnen toepassen in 
klantgesprekken om de conversieratio te verhogen van 
15% naar 25%."
```

### AI Output Quality
```
Score 1-5 op:
□ Structuur (logische opbouw)
□ Tone-of-voice (professioneel)
□ Inhoud (compleet)
□ Personalisatie (klantspecifiek)

18-20: Excellent ✓
15-17: Goed (minor tweaks)
12-14: Acceptabel (aanpassingen)
< 12: Regenereer
```

---

## 🔧 Troubleshooting Quick Fixes

| Probleem | Snelle Oplossing |
|----------|------------------|
| API Key error | Check `.env` bestand in project root |
| Playwright error | Run `playwright install chromium` |
| Port in use | `lsof -i :8765` → `kill -9 PID` |
| CORS error | Check `ALLOWED_ORIGINS` in `.env` |
| Screenshot fails | Hogere resolutie, betere contrast |
| Scraping fails | Vul handmatig in, check URL |
| Browser won't open | `python -m playwright install chromium` |
| Template not found | Check `TEMPLATE_PATH` in `.env` |

**Universal Fix**: Herstart servers met `./start.sh`

---

## 📊 Tijdsinschatting

| Taak | Eerste keer | Met ervaring |
|------|-------------|--------------|
| Setup installatie | 15 min | - |
| Eerste offerte | 10-12 min | 5-7 min |
| Screenshot methode | 8-10 min | 4-5 min |
| Browser methode | 6-8 min | 3-4 min |
| Zelfde training hergebruiken | 5-7 min | 3-4 min |

**Batch processing** (5 offertes, zelfde training): ~25 min totaal

---

## 🔑 Keyboard Shortcuts

### OS Screenshot Shortcuts
```
macOS:    Cmd + Shift + 4  (select area)
Windows:  Win + Shift + S  (snipping tool)
Linux:    PrtScn           (full screen)
```

### Browser Navigation
```
Ctrl/Cmd + T     New tab
Ctrl/Cmd + W     Close tab
Ctrl/Cmd + R     Refresh
F12              Developer tools
```

---

## 📝 Template Placeholders

```
Verplicht:
{{company_name}}         - Bedrijfsnaam
{{contact_name}}         - Contactpersoon
{{contact_email}}        - Email adres
{{training_title}}       - Training titel
{{offer_text}}           - AI gegenereerde content
{{num_participants}}     - Aantal deelnemers

Optioneel:
{{contact_phone}}        - Telefoonnummer
{{address}}              - Adres
{{training_description}} - Training beschrijving
{{duration}}             - Duur
{{price}}                - Prijs
{{preferred_dates}}      - Voorkeursdata
```

---

## 🌐 API Endpoints Cheatsheet

```
GET  /                           → Health check
POST /api/extract-crm            → Screenshot → CRM data
POST /api/extract-training       → URL → Training data
POST /api/generate-offer         → All data → AI content
POST /api/create-docx            → Data → DOCX file
GET  /api/download/{file_id}     → Download DOCX

Browser endpoints:
POST /api/browser/open-crm       → Open browser
POST /api/browser/navigate-ticket → Go to ticket
POST /api/browser/capture-screenshot → Screenshot + extract
GET  /api/browser/status         → Check if active
POST /api/browser/close          → Close browser
```

---

## 💡 Pro Tips

### Efficiency
```
✓ Houd browser sessie actief hele dag
✓ Cache veelgebruikte training URLs
✓ Maak template varianten voor verschillende scenario's
✓ Gebruik bookmarks voor frequente CRM tickets
```

### Quality
```
✓ Altijd preview checken voor download
✓ Specifieke doelstellingen = betere AI output
✓ Screenshots in goede lichtomstandigheden
✓ Dubbel-check email adressen
```

### Speed
```
✓ Gebruik browser methode voor snelheid
✓ Batch vergelijkbare offertes
✓ Hergebruik training data binnen zelfde dag
✓ Prepare intake info vooraf
```

---

## 📞 Support Contacten

**Technische vragen**: steff@vanhaverbeke.com  
**Syntra Bizz**: www.syntra-ab.be  
**API Documentatie**: http://localhost:8765/docs  
**Volledige Docs**: `/doc/` folder in project

---

## 🔄 Dagelijkse Routine

### Morning Startup
```bash
1. cd /path/to/offer-builder
2. ./start.sh
3. Open browser → localhost:8766
4. Open CRM browser (indien gebruikt)
5. Log in CRM (one-time per dag)
```

### During Day
```
→ Voor elke offerte:
  - Screenshot OF navigate to ticket
  - Get training URL
  - Fill intake
  - Generate & download
  - (Optional) Close browser sessie niet!
```

### End of Day
```
1. Download alle offertes check
2. Browser sessie sluiten (Ctrl+C in terminal)
3. Cleanup: verwijder temp screenshots (optioneel)
```

---

## 📈 Quality Metrics to Track

```
Persoonlijke KPI's:
□ Gemiddelde tijd per offerte
□ Regenerate ratio (hoe vaak hergenereerd?)
□ Client acceptance rate
□ Screenshots vs Browser usage

Team KPI's:
□ Offertes per dag/week
□ Template adoption rate
□ User satisfaction score
```

---

## 🎓 Training Checklist (Nieuwe Gebruikers)

### Week 1
- [ ] Installation & setup complete
- [ ] 5 dummy offertes gemaakt
- [ ] Screenshot methode onder de knie
- [ ] Browser methode geprobeerd
- [ ] Template customization begrepen

### Week 2
- [ ] 10 echte offertes gemaakt
- [ ] Best practices toegepast
- [ ] Eigen workflow ontwikkeld
- [ ] Quality standards behalen
- [ ] Feedback gegeven over tool

### Week 3+
- [ ] Zelfstandig werken
- [ ] Batch processing gebruiken
- [ ] Collega's helpen
- [ ] Verbeteringen suggereren

---

## 🔐 Security Checklist

- [ ] `.env` bestand nooit delen
- [ ] API key periodiek roteren (elk kwartaal)
- [ ] Screenshots niet bewaren na extractie
- [ ] Generated offers cleanup na 90 dagen
- [ ] CRM credentials niet opslaan in browser
- [ ] HTTPS gebruiken in productie
- [ ] Klantdata niet delen met derden

---

## 📚 Documentatie Navigatie

```
README.md                  → Start hier voor overzicht
01-setup.md               → Installatie instructies
02-first-use.md           → Eerste offerte maken
03-best-practices.md      → Optimalisatie tips
04-api-reference.md       → Voor developers
05-technical-architecture.md → Technische details
06-quick-reference.md     → Deze pagina (snelle opzoeking)
```

---

**Laatste update**: 23 januari 2026  
**Versie**: 1.0.0

**Copyright © 2026 Steff Vanhaverbeke for Syntra Bizz**
