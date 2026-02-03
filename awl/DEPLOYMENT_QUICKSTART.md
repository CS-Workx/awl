# AWL Scanner - Quick Start Deployment

**Target URL**: `https://tools.superworker.be/awl`  
**Server**: Hostinger VPS (Ubuntu 24.04, IP: 69.62.106.56)

---

## Step 1: SSH naar VPS

```bash
ssh root@69.62.106.56
```

---

## Step 2: Deploy Applicatie

```bash
# 1. Clone repository
cd /opt
git clone https://github.com/CS-Workx/awl.git awl-scanner
cd awl-scanner

# 2. Maak .env bestand
nano .env
```

Voeg toe in `.env`:
```env
PORT=3001
BASE_PATH=/awl
GEMINI_API_KEY=jouw_gemini_api_key_hier
MICROSOFT_CLIENT_ID=jouw_client_id
MICROSOFT_CLIENT_SECRET=jouw_client_secret
MICROSOFT_TENANT_ID=jouw_tenant_id
SENDER_EMAIL=steff@thehouseofcoaching.com
SENDER_NAME="Steff Vanhaverbeke"
NODE_ENV=production
```

Sla op: `Ctrl+O`, `Enter`, `Ctrl+X`

```bash
# 3. Beveilig .env
chmod 600 .env

# 4. Installeer dependencies
npm install --omit=dev

# 5. Start met PM2
pm2 start src/server.js --name awl-scanner
pm2 save
```

---

## Step 3: Configure Nginx

```bash
# Edit Nginx config voor tools.superworker.be
nano /etc/nginx/sites-available/tools-superworker
```

Voeg deze `location` block toe **binnen de bestaande `server` block**:

```nginx
    # AWL Scanner
    location /awl/ {
        proxy_pass http://localhost:3001/awl/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout voor AI processing
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Service Worker en manifest
    location ~ ^/awl/(sw\.js|manifest\.json)$ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
```

**Zorg ook dat deze regel in de server block staat:**
```nginx
    client_max_body_size 10M;
```

Sla op: `Ctrl+O`, `Enter`, `Ctrl+X`

```bash
# Test en reload Nginx
nginx -t
systemctl reload nginx
```

---

## Step 4: Test Deployment

```bash
# Check app status
pm2 status
pm2 logs awl-scanner

# Test endpoints
curl http://localhost:3001/awl/api/contacts
curl -I https://tools.superworker.be/awl
```

Open in browser: **https://tools.superworker.be/awl**

Verwachte resultaat:
- ✅ Pagina laadt correct
- ✅ HTTPS (groene slot)
- ✅ PWA install prompt (mobiel)
- ✅ Image upload werkt
- ✅ Email versturen werkt

---

## Step 5: Microsoft Graph Redirect URI

Ga naar Azure Portal → App Registrations → AWL Scanner app:

1. **Authentication** → **Platform configurations** → **Web**
2. **Redirect URIs**: Voeg toe:
   ```
   https://tools.superworker.be/awl/auth/callback
   ```
3. Klik **Save**

---

## Maintenance Commands

```bash
# View logs
pm2 logs awl-scanner

# Restart app
pm2 restart awl-scanner

# Update code
cd /opt/awl-scanner
git pull origin main
npm install --omit=dev
pm2 restart awl-scanner

# Check Nginx
systemctl status nginx
tail -f /var/log/nginx/error.log
```

---

## Troubleshooting

### App niet bereikbaar

```bash
# Check PM2 status
pm2 status
pm2 logs awl-scanner --lines 50

# Check Nginx
systemctl status nginx
nginx -t

# Check firewall
ufw status
```

### Image upload faalt

```bash
# Check Nginx error logs
tail -f /var/log/nginx/error.log

# Verify client_max_body_size
grep -r "client_max_body_size" /etc/nginx/sites-available/
```

### Email niet versturen

```bash
# Check Graph API init
pm2 logs awl-scanner | grep -i graph

# Test credentials
cd /opt/awl-scanner
node -e "const GraphClient = require('./src/graphClient'); new GraphClient();"
```

---

## Quick Reference

| Item | Value |
|------|-------|
| **URL** | https://tools.superworker.be/awl |
| **Server Path** | /opt/awl-scanner |
| **Node Port** | 3001 |
| **Base Path** | /awl |
| **PM2 Process** | awl-scanner |
| **Nginx Config** | /etc/nginx/sites-available/tools-superworker |
| **Logs** | `pm2 logs awl-scanner` |
| **GitHub** | https://github.com/CS-Workx/awl |

---

Voor volledige documentatie, zie: **VPS_DEPLOYMENT.md**
