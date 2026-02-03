# Documentatie Overzicht - Syntra Bizz Offerte Generator

Welkom bij de documentatie van de Syntra Bizz Offerte Generator, een AI-ondersteunde tool voor het automatisch genereren van gepersonaliseerde opleidingsoffertes.

## 📚 Documentatie Structuur

### Voor Eindgebruikers

1. **[Setup Handleiding](01-setup.md)** *(Start hier!)*
   - Systeemvereisten
   - Stap-voor-stap installatie instructies
   - Configuratie van environment variables
   - Gemini API key setup
   - Verificatie en troubleshooting

2. **[First Use Guide](02-first-use.md)**
   - Quick start instructies
   - Gedetailleerde workflow uitleg
   - Stap-voor-stap tutorial met voorbeelden
   - Screenshot upload vs Browser automatisering
   - Tips voor eerste gebruik
   - Veelgestelde vragen

3. **[Best Practices](03-best-practices.md)**
   - Workflow optimalisatie technieken
   - Kwaliteit en nauwkeurigheid tips
   - Template management strategieën
   - AI prompt engineering gids
   - Beveiliging en privacy richtlijnen
   - Performance optimalisatie
   - Team samenwerking best practices

### Voor Ontwikkelaars

4. **[API Reference](04-api-reference.md)**
   - Complete endpoint documentatie
   - Request/response voorbeelden
   - Data models en schemas
   - Error handling
   - Code voorbeelden (JavaScript & Python)
   - Testing instructies

5. **[Technische Architectuur](05-technical-architecture.md)**
   - Systeem architectuur overzicht
   - Backend componenten uitleg
   - Frontend architectuur
   - Data flow diagrammen
   - Externe dependencies
   - Deployment strategieën
   - Security consideraties

### Project Documentatie

6. **[Migration Guide](MIGRATION_GUIDE.md)**
   - Migratie naar nieuwe project structuur
   - Breaking changes en updates
   - Pad updates en legacy ondersteuning

7. **[AI Development Rules](../AI_DEVELOPMENT_RULES.md)**
   - AI development guidelines
   - Best practices voor AI assistenten
   - Code standards en conventions

---

## 🚀 Quick Navigation

### Ik wil...

#### ...de applicatie installeren
→ Start met **[Setup Handleiding](01-setup.md)**

#### ...mijn eerste offerte maken
→ Ga naar **[First Use Guide](02-first-use.md)**

#### ...betere resultaten krijgen
→ Lees **[Best Practices](03-best-practices.md)**

#### ...de API gebruiken in eigen code
→ Bekijk **[API Reference](04-api-reference.md)**

#### ...de techniek begrijpen
→ Raadpleeg **[Technische Architectuur](05-technical-architecture.md)**

#### ...een probleem oplossen
→ Check de **Troubleshooting** secties in Setup of Best Practices

---

## 📖 Leeswijzer per Rol

### Account Manager (Eindgebruiker)

**Aanbevolen volgorde**:
1. Setup Handleiding → Installatie uitvoeren
2. First Use Guide → Eerste offerte maken
3. Best Practices → Workflow optimaliseren

**Focus op**:
- Praktische workflows
- Screenshot kwaliteit tips
- Intake informatie formuleren
- Template gebruik

**Overslaan**:
- API Reference
- Technische architectuur details

---

### Team Lead / Manager

**Aanbevolen volgorde**:
1. Setup Handleiding → Begrip van requirements
2. First Use Guide → Workflow kennen
3. Best Practices → Team standaarden opstellen
4. API Reference → Integratiemogelijkheden verkennen

**Focus op**:
- Team onboarding processen
- Quality standards
- Performance metrics
- Security & privacy

**Interessant**:
- Template management
- Shared resources setup
- Monitoring mogelijkheden

---

### Developer / IT

**Aanbevolen volgorde**:
1. Setup Handleiding → Environment setup
2. Technische Architectuur → Systeem begrip
3. API Reference → Integration development
4. Best Practices → Optimization & security

**Focus op**:
- Backend architectuur
- API endpoints en data models
- Security implementatie
- Performance tuning
- Deployment strategieën

**Deep dive**:
- Service layer design
- External API integration
- Error handling patterns
- Caching strategies

---

## 🔑 Belangrijkste Features

### CRM Data Extractie
- **Screenshot upload**: Traditionele methode met Gemini Vision OCR
- **Browser automatisering**: Directe CRM integratie met Playwright

### Training Data
- **Automatisch scrapen**: URL → Volledige training details
- **Handmatige invoer**: Fallback voor custom content

### AI Content Generatie
- **Gepersonaliseerd**: Op basis van klantdoelen en context
- **Professioneel**: Syntra Bizz tone-of-voice
- **Aanpasbaar**: Regenereer optie voor variaties

### Document Creatie
- **Template-based**: DOCX templates met placeholders
- **Instant download**: Direct bruikbare Word documenten
- **Custom templates**: Upload eigen templates

---

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.9+)
- **AI**: Google Gemini API (Vision + Text)
- **Automation**: Playwright (Chromium)
- **Scraping**: BeautifulSoup4 + Requests
- **Documents**: python-docx

### Frontend
- **Core**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3
- **Architecture**: Single Page Application

### Infrastructure
- **Development**: Local servers (Python http.server)
- **Production**: Nginx + Gunicorn (recommended)

---

## 📞 Support & Contact

### Vragen over gebruik
→ Check eerst **[Best Practices](03-best-practices.md)** en **[First Use Guide](02-first-use.md)**

### Technische problemen
→ Zie **Troubleshooting** in **[Setup Handleiding](01-setup.md)**

### Bug reports of feature requests
→ Contact: **steff@vanhaverbeke.com**

### Syntra Bizz informatie
→ Website: **[www.syntra-ab.be](https://www.syntra-ab.be)**

---

## 📝 Changelog

### Version 1.0.0 (Januari 2026)
- Initial release
- CRM screenshot extractie
- Browser automatisering voor CRM
- Training URL scraping
- AI offer generatie
- DOCX template systeem
- Volledige documentatie set

---

## 🔐 Licentie

**Copyright © 2026 Steff Vanhaverbeke for Syntra Bizz**

Dit project is gelicenseerd onder de MIT License.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED.

---

## 🙏 Credits

**Ontwikkeld door**: Steff Vanhaverbeke  
**Voor**: Syntra Bizz  
**Powered by**: Google Gemini AI

---

## 🗺️ Documentatie Roadmap

### Toekomstige Toevoegingen

- **Video Tutorials**: Screencast van complete workflows
- **FAQ Database**: Uitgebreide Q&A sectie
- **Integration Guide**: CRM API directe integratie
- **Advanced Features**: Multi-taal support, email automation
- **Analytics Dashboard**: Usage metrics en insights

---

**Laatste update**: 23 januari 2026  
**Documentatie versie**: 1.0.0
