# AWL Scanner

**Aanwezigheidslijst Scanner voor Trainers**

Een Progressive Web App (PWA) die het makkelijk maakt om papieren aanwezigheidslijsten te scannen, digitaliseren en doorsturen.

## Features

- **Scan**: Maak een foto van je aanwezigheidslijst met je iPhone camera
- **AI-Powered OCR**: Gemini Vision analyseert de lijst en extraheert alle data
- **Digitale versie**: Automatisch CSV export van aanwezigheden
- **PDF**: Gescande afbeelding wordt omgezet naar PDF
- **Email**: Verstuur beide bestanden naar je contactpersonen met één klik
- **PWA**: Installeerbaar op je iPhone home screen

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
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=steff@thehouseofcoaching.com
SMTP_PASS=jouw_email_wachtwoord
```

**SMTP configuratie voor The House of Coaching:**
Als je Microsoft 365 / Outlook gebruikt, heb je mogelijk een "App Password" nodig. Zie: https://support.microsoft.com/nl-nl/account-billing/app-wachtwoorden

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

## Troubleshooting

### Email wordt niet verstuurd

- Check je SMTP credentials in `.env`
- Controleer of je SMTP poort open staat op de VPS firewall
- Bij Microsoft 365: gebruik een App Password
- Check de server logs: `pm2 logs awl-scanner`

### AI herkent de lijst niet goed

- Zorg voor goede belichting bij het fotograferen
- Houd de camera recht boven de lijst
- Vermijd schaduwen en reflecties
- Het werkt het best met duidelijk leesbare handtekeningen

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

## Support

Vragen? Neem contact op met de ontwikkelaar.

Gebouwd met ❤️ voor trainers die hun administratie willen vereenvoudigen.
