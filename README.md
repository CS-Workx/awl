# AWL Scanner

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Codeberg](https://img.shields.io/badge/Codeberg-cs--workx%2Ftools-blue?logo=codeberg)](https://codeberg.org/cs-workx/tools/src/branch/main/awl)

**Aanwezigheidslijst Scanner voor Trainers**

Een Progressive Web App (PWA) die het makkelijk maakt om papieren aanwezigheidslijsten te scannen, digitaliseren en doorsturen.

## Features

- **Scan**: Maak een foto van je aanwezigheidslijst met je iPhone camera
- **Multi-Image Support**: Upload tot 10 foto's tegelijk voor multi-page lijsten
- **AI-Powered OCR**: Gemini Vision analyseert de lijst en extraheert alle data
- **Digitale versie**: Automatisch CSV export van aanwezigheden
- **PDF**: Gescande afbeelding wordt omgezet naar PDF (multi-page support)
- **Email**: Verstuur beide bestanden naar je contactpersonen met één klik
- **PWA**: Installeerbaar op je iPhone home screen
- **Deduplicatie**: Dubbele namen worden automatisch verwijderd

---

## ⚠️ Important Notes

- This is a self-hosted solution - you need your own VPS
- Requires API keys (Gemini AI, SMTP credentials)
- Data stays on your server (privacy by design)
- Best suited for trainers/educators in Belgium/Netherlands

---

## Installatie op je VPS

### Vereisten

- Node.js 18+
- npm of yarn
- Een Gemini API key (gratis: https://aistudio.google.com/app/apikey)
- SMTP credentials voor email

### Stap 1: Upload naar VPS

Upload de `awl-scanner` folder naar je VPS, bijvoorbeeld via SCP:

```bash
scp -r awl-scanner/ user@jouw-vps:/var/www/
```

### Stap 2: Configuratie

```bash
cd /var/www/awl-scanner
cp .env.example .env
nano .env
```

Vul de volgende waarden in:

```env
PORT=3000
GEMINI_API_KEY=jouw_gemini_api_key

# Microsoft Graph API (AANBEVOLEN - voor email verzending)
MICROSOFT_CLIENT_ID=jouw-azure-client-id
MICROSOFT_CLIENT_SECRET=jouw-azure-client-secret
MICROSOFT_TENANT_ID=jouw-azure-tenant-id
SENDER_EMAIL=jouw@email.com
SENDER_NAME="Jouw Naam"
```

### Microsoft Graph API Setup (Email Verzending)

De applicatie gebruikt Microsoft Graph API voor veilige email verzending via OAuth2. Volg deze stappen:

#### 1. Azure AD App Registration

1. Ga naar [Azure Portal → App Registrations](https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
2. Click **New registration**
3. Configureer:
   - **Name**: AWL Scanner
   - **Supported account types**: Accounts in this organizational directory only
   - **Redirect URI**: Laat leeg (niet nodig voor server apps)
4. Click **Register**
5. Noteer op het Overview scherm:
   - **Application (client) ID**
   - **Directory (tenant) ID**

#### 2. Client Secret Aanmaken

1. Ga naar **Certificates & secrets** in het linker menu
2. Click **New client secret**
3. Geef een beschrijving (bijv. "AWL Scanner Production")
4. Stel expiration in (max 24 maanden)
5. Click **Add**
6. **Kopieer direct de Value** (wordt maar 1x getoond!)

#### 3. API Permissions Configureren

1. Ga naar **API permissions**
2. Click **Add a permission** → **Microsoft Graph** → **Application permissions**
3. Zoek en selecteer: **`Mail.Send`**
4. Click **Add permissions**
5. Click **Grant admin consent for [Your Tenant]**
   - ⚠️ Dit vereist admin rechten in je Azure AD tenant

#### 4. .env Configureren

Voeg de verzamelde waarden toe aan je `.env` bestand:

```env
MICROSOFT_CLIENT_ID=12345678-1234-1234-1234-123456789abc
MICROSOFT_CLIENT_SECRET=jouw_client_secret_value_hier
MICROSOFT_TENANT_ID=87654321-4321-4321-4321-cba987654321
SENDER_EMAIL=steff@thehouseofcoaching.com
SENDER_NAME="Steff - The House of Coaching"
```

#### Troubleshooting Email Sending

| Error | Oorzaak | Oplossing |
|-------|---------|-----------|
| **401 Unauthorized** | Incorrecte credentials | Check `MICROSOFT_CLIENT_ID` en `MICROSOFT_CLIENT_SECRET` in `.env` |
| **403 Forbidden** | Ontbrekende permissions | Verifieer dat `Mail.Send` permission admin consent heeft in Azure Portal |
| **404 Not Found** | Sender email bestaat niet | Check dat `SENDER_EMAIL` correct is en bestaat in je tenant |
| **Graph API initialization failed** | Ontbrekende env variables | Controleer of alle `MICROSOFT_*` variabelen aanwezig zijn in `.env` |

### Stap 3: Installeer dependencies

```bash
npm install
```

### Stap 4: Genereer PWA iconen

Converteer het SVG icoon naar PNG formaten:

```bash
# Met ImageMagick (installeer indien nodig: apt install imagemagick)
convert public/icon.svg -resize 192x192 public/icon-192.png
convert public/icon.svg -resize 512x512 public/icon-512.png
```

Of download handmatig PNG versies en plaats ze in de `public/` folder.

### Stap 5: Start de app

**Voor testen:**
```bash
npm start
```

**Voor productie met PM2:**
```bash
npm install -g pm2
pm2 start src/server.js --name awl-scanner
pm2 save
pm2 startup
```

---

## Nginx Reverse Proxy (aanbevolen)

Voeg toe aan je Nginx config:

```nginx
server {
    listen 443 ssl http2;
    server_name awl.jouw-domein.be;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;

        # Voor grote uploads (scans)
        client_max_body_size 10M;
    }
}
```

Vergeet niet te herladen:
```bash
nginx -t && systemctl reload nginx
```

---

## Gebruik

### Als PWA installeren op iPhone

1. Open de app URL in Safari
2. Tik op het "Delen" icoon (vierkant met pijl omhoog)
3. Scroll naar beneden en tik "Zet op beginscherm"
4. De app verschijnt nu als icoon op je home screen!

### Workflow

1. **Scan**: Tik op het camera-icoon en maak een foto van de aanwezigheidslijst
2. **Check**: Bekijk het AI-resultaat en controleer de aanwezigheden
3. **Verstuur**: Selecteer de ontvangers en verstuur met één klik

### Contacten beheren

- Tik op het tandwiel-icoon rechtsboven om contacten toe te voegen of te verwijderen
- Standaard zijn er al voorbeeldcontacten voor Syntra Bizz, Syntra West en Cevora

---

## Multi-Image Support

Upload meerdere foto's tegelijk voor lange of multi-page aanwezigheidslijsten:

📸 **Hoe te gebruiken:**
- Klik op "Kies foto's" en selecteer 2-10 bestanden tegelijk
- Of maak meerdere foto's achter elkaar met de camera
- Preview thumbnails tonen alle geselecteerde foto's
- Klik op ×  knop om een foto te verwijderen

✨ **Wat gebeurt er:**
- Alle foto's worden sequentieel verwerkt met AI
- Deelnemers van alle pagina's worden samengevoegd in één lijst
- Dubbele namen worden automatisch verwijderd
- PDF bevat alle gescande pagina's
- CSV bevat alle unieke deelnemers

⚡ **Verwerkingstijd:**
- 1 foto: ~4 seconden
- 3 foto's: ~12 seconden  
- 5 foto's: ~20 seconden

---

## Troubleshooting

### Supported Image Formats

- ✅ JPEG (.jpg, .jpeg)
- ✅ PNG (.png)
- ✅ WebP (.webp)
- ✅ HEIC (.heic, .heif) - **Requires libheif on server**

**macOS Server Setup:**
```bash
brew install libheif
cd awl && npm rebuild sharp
```

**iOS Users:** If HEIC uploads fail, convert to JPEG:
1. Open image in Photos app
2. Tap Share → Duplicate
3. Choose "Save as JPEG"

### Email wordt niet verstuurd

- Check je SMTP credentials in `.env`
- Controleer of je SMTP poort open staat op de VPS firewall
- Bij Microsoft 365: gebruik een App Password
- Check de server logs: `pm2 logs awl-scanner`

### AI herkent de lijst niet goed

**Verbeter de fotokwaliteit:**
- ✅ Goede, gelijkmatige belichting (geen schaduwen)
- ✅ Camera recht boven de lijst (niet schuin)
- ✅ Geen reflecties of glare
- ✅ Scherpe focus (niet wazig of bewogen)
- ✅ Alle velden volledig zichtbaar (niet afgesneden)
- ✅ Hoge resolutie (gebruik achtercamera, niet voorcamera)

**Pro Tips:**
- 💡 Gebruik natuurlijk licht bij een raam (geen TL-licht)
- 📄 Leg de lijst op een vlakke, donkere ondergrond
- 🤳 Houd camera stil met beide handen of gebruik statief
- 🔍 Zoom niet in, fotografeer de hele lijst in één keer
- 📐 Zorg dat de lijst recht ligt (niet gedraaid)
- ⚡ Vermijd flits, gebruik daglicht

**Herkenning verbeterd:**
De app optimaliseert automatisch:
- Contrast en helderheid
- Beeldscherpte
- Rotatie (EXIF)
- Bestandsgrootte

### PWA installeert niet

- Zorg dat de site via HTTPS draait (vereist voor PWA)
- Clear de Safari cache en probeer opnieuw

---

## Bestandsstructuur

```
awl-scanner/
├── src/
│   └── server.js          # Backend API
├── public/
│   ├── index.html         # Frontend app
│   ├── manifest.json      # PWA manifest
│   ├── sw.js              # Service worker
│   └── icon.svg           # App icoon
├── data/
│   └── contacts.json      # Contactenlijst (auto-generated)
├── .env                   # Configuratie (maak zelf aan)
├── .env.example           # Voorbeeld configuratie
├── package.json
└── README.md
```

---

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Please read our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## Support & Contact

- Issues: [Codeberg Issues](https://codeberg.org/cs-workx/tools/issues)
- Email: steff@thehouseofcoaching.com
- Security: See [SECURITY.md](../SECURITY.md)

## License

Copyright (C) 2026 Steff Van Haverbeke / The House of Coaching

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

See [LICENSE](../LICENSE) for details.

