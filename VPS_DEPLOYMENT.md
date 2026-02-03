# AWL Scanner - VPS Deployment Guide

Complete deployment guide voor Ubuntu VPS (Hostinger, DigitalOcean, Hetzner, etc.)

---

## Prerequisites

**VPS Requirements:**
- OS: Ubuntu 24.04 LTS (of 22.04 LTS)
- RAM: 1GB minimum (2GB aanbevolen)
- Storage: 10GB minimum
- Root of sudo toegang
- Domein of subdomein met DNS naar VPS IP

**Local Requirements:**
- Git repository met AWL Scanner code
- `.env` bestand met API credentials (niet in Git!)

---

## Part 1: Server Setup

### 1.1. Connect to VPS

```bash
ssh root@your-vps-ip
# Of met key:
ssh -i ~/.ssh/your_key root@your-vps-ip
```

### 1.2. Install Node.js 20 LTS

```bash
# Update systeem
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installatie
node -v  # Should show v20.x.x
npm -v   # Should show 10.x.x
```

### 1.3. Install PM2 Process Manager

```bash
sudo npm install -g pm2

# PM2 auto-start op reboot
pm2 startup systemd
# Kopieer en run de gegenereerde command
```

### 1.4. Install Nginx (Reverse Proxy)

```bash
sudo apt install -y nginx

# Start en enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify
sudo systemctl status nginx
```

### 1.5. Install Certbot (SSL/TLS)

```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

## Part 2: Deploy Application

### 2.1. Create Application Directory

```bash
# Create user voor app (security best practice)
sudo adduser --system --group --disabled-password awl
sudo mkdir -p /opt/awl-scanner
sudo chown awl:awl /opt/awl-scanner
```

### 2.2. Upload Code to VPS

**Option A: Via Git (aanbevolen)**

```bash
cd /opt/awl-scanner
sudo -u awl git clone https://github.com/CS-Workx/awl.git .

# Of via SSH key
sudo -u awl git clone git@github.com:CS-Workx/awl.git .
```

**Option B: Via SCP (manual upload)**

```bash
# Lokaal (op je Mac):
cd /path/to/awl
tar -czf awl-scanner.tar.gz --exclude=node_modules --exclude=.git --exclude=data .
scp awl-scanner.tar.gz root@your-vps-ip:/opt/awl-scanner/

# Op VPS:
cd /opt/awl-scanner
tar -xzf awl-scanner.tar.gz
rm awl-scanner.tar.gz
chown -R awl:awl /opt/awl-scanner
```

### 2.3. Configure Environment

```bash
cd /opt/awl-scanner

# Create .env file
sudo -u awl nano .env
```

Voeg toe:
```env
# Production port (Nginx forwardt naar deze port)
PORT=3001

# Google Gemini API Key
GEMINI_API_KEY=jouw_gemini_api_key

# Microsoft Graph API (voor email)
MICROSOFT_CLIENT_ID=jouw_client_id
MICROSOFT_CLIENT_SECRET=jouw_client_secret
MICROSOFT_TENANT_ID=jouw_tenant_id
SENDER_EMAIL=steff@thehouseofcoaching.com
SENDER_NAME="Steff Vanhaverbeke"

# Node environment
NODE_ENV=production
```

**Security:** Zorg dat `.env` niet readable is voor anderen:
```bash
sudo chmod 600 /opt/awl-scanner/.env
sudo chown awl:awl /opt/awl-scanner/.env
```

### 2.4. Install Dependencies

```bash
cd /opt/awl-scanner
sudo -u awl npm install --omit=dev
```

**Note:** `--omit=dev` installeert alleen production dependencies (geen nodemon).

### 2.5. Start Application with PM2

```bash
cd /opt/awl-scanner

# Start app met PM2
sudo -u awl pm2 start src/server.js --name awl-scanner

# Check status
sudo -u awl pm2 status

# View logs
sudo -u awl pm2 logs awl-scanner

# Save PM2 config
sudo -u awl pm2 save
```

**PM2 Commands:**
```bash
pm2 restart awl-scanner  # Restart app
pm2 stop awl-scanner     # Stop app
pm2 logs awl-scanner     # View logs
pm2 monit                # Monitoring dashboard
```

---

## Part 3: Nginx Configuration

### 3.1. Configure Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/awl-scanner
```

Voeg toe:
```nginx
server {
    listen 80;
    server_name awl.jouwdomein.nl;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Increase client body size voor image uploads (10MB)
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeout settings voor AI processing
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Service Worker en PWA assets
    location ~ ^/(sw\.js|manifest\.json)$ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

### 3.2. Enable Site

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/awl-scanner /etc/nginx/sites-enabled/

# Test configuratie
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## Part 4: SSL/TLS Setup

### 4.1. Obtain SSL Certificate

**Zorg dat DNS al naar VPS IP wijst!**

```bash
sudo certbot --nginx -d awl.jouwdomein.nl

# Volg de prompts:
# - Email: [jouw email]
# - Terms: Agree
# - Share email: No (optioneel)
# - HTTPS redirect: Yes (aanbevolen)
```

### 4.2. Auto-Renewal Test

```bash
# Test renewal (dry-run)
sudo certbot renew --dry-run

# Certbot cronjob is automatisch toegevoegd
# Certificaten worden automatisch hernieuwd
```

---

## Part 5: Microsoft Graph API Setup

### 5.1. Update Azure Redirect URIs

Ga naar Azure Portal → App Registrations → jouw AWL app:

1. **Authentication** → **Platform configurations** → **Add a platform** → **Web**
2. **Redirect URIs**: Voeg toe:
   - `https://awl.jouwdomein.nl/auth/callback`
3. **Front-channel logout URL**: (leeg laten)
4. **Implicit grant**: Uitvinken (niet nodig)
5. Klik **Configure**

### 5.2. API Permissions

Verify dat deze permissions zijn toegewezen:
- `Mail.Send` (Application) - **Admin consent required**

Als "Admin consent required" staat: vraag tenant admin om consent te geven.

---

## Part 6: Firewall Configuration

### 6.1. UFW Firewall Setup

```bash
# Enable UFW
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Check status
sudo ufw status
```

**Expected output:**
```
Status: active

To                         Action      From
--                         ------      ----
OpenSSH                    ALLOW       Anywhere
Nginx Full                 ALLOW       Anywhere
```

---

## Part 7: Verification & Testing

### 7.1. Health Checks

```bash
# Check Node.js app
sudo -u awl pm2 status
sudo -u awl pm2 logs awl-scanner --lines 50

# Check Nginx
sudo systemctl status nginx
sudo nginx -t

# Check SSL
curl -I https://awl.jouwdomein.nl
```

### 7.2. Test PWA Installation

1. Open in browser: `https://awl.jouwdomein.nl`
2. Check dat HTTPS actief is (groene slot)
3. Test PWA install prompt (mobiel + desktop)
4. Upload test image → OCR → Email versturen

### 7.3. Monitor Logs

```bash
# Real-time app logs
sudo -u awl pm2 logs awl-scanner

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

---

## Part 8: Maintenance

### 8.1. Update Application

```bash
cd /opt/awl-scanner

# Pull latest code
sudo -u awl git pull origin main

# Install/update dependencies
sudo -u awl npm install --omit=dev

# Restart app
sudo -u awl pm2 restart awl-scanner

# Check logs
sudo -u awl pm2 logs awl-scanner --lines 20
```

### 8.2. Backup Contacts Data

```bash
# Backup contacts.json
sudo cp /opt/awl-scanner/data/contacts.json /opt/awl-scanner/data/contacts.json.backup

# Of via cronjob (daily backup):
sudo crontab -e
# Voeg toe:
0 3 * * * cp /opt/awl-scanner/data/contacts.json /opt/awl-scanner/data/contacts.$(date +\%Y\%m\%d).json
```

### 8.3. Security Updates

```bash
# Update OS packages (monthly)
sudo apt update && sudo apt upgrade -y

# Update Node.js packages
cd /opt/awl-scanner
sudo -u awl npm audit
sudo -u awl npm audit fix

# Restart app na updates
sudo -u awl pm2 restart awl-scanner
```

---

## Part 9: Troubleshooting

### Issue 1: App niet bereikbaar via browser

**Check:**
```bash
# Is app running?
sudo -u awl pm2 status

# Is Nginx running?
sudo systemctl status nginx

# Is firewall correct?
sudo ufw status

# DNS correct?
dig awl.jouwdomein.nl
```

### Issue 2: Image upload faalt

**Check:**
```bash
# App logs
sudo -u awl pm2 logs awl-scanner

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check client_max_body_size
grep client_max_body_size /etc/nginx/sites-available/awl-scanner
```

### Issue 3: Email niet versturen

**Check:**
```bash
# Graph API credentials correct?
sudo -u awl cat /opt/awl-scanner/.env | grep MICROSOFT

# App initialization logs
sudo -u awl pm2 logs awl-scanner | grep -i graph

# Test manually (op VPS):
cd /opt/awl-scanner
sudo -u awl node -e "const GraphClient = require('./src/graphClient'); new GraphClient();"
```

### Issue 4: SSL Certificate errors

**Check:**
```bash
# Certificate status
sudo certbot certificates

# Renew manually
sudo certbot renew --force-renewal -d awl.jouwdomein.nl

# Reload Nginx
sudo systemctl reload nginx
```

---

## Part 10: Performance Optimization

### 10.1. PM2 Cluster Mode (optioneel, voor > 4 CPU cores)

```bash
# Stop current instance
sudo -u awl pm2 delete awl-scanner

# Start in cluster mode (max 2 instances voor 1GB RAM)
sudo -u awl pm2 start src/server.js --name awl-scanner -i 2

# Save config
sudo -u awl pm2 save
```

### 10.2. Nginx Caching (optioneel)

```nginx
# In /etc/nginx/sites-available/awl-scanner

# Static assets caching
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
    proxy_pass http://localhost:3001;
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## Quick Commands Reference

```bash
# === App Management ===
pm2 status                          # Status check
pm2 restart awl-scanner             # Restart app
pm2 logs awl-scanner                # View logs
pm2 monit                           # Monitoring

# === Updates ===
cd /opt/awl-scanner && git pull     # Pull code
npm install --omit=dev              # Update deps
pm2 restart awl-scanner             # Restart

# === Nginx ===
sudo nginx -t                       # Test config
sudo systemctl reload nginx         # Reload config
sudo tail -f /var/log/nginx/error.log  # Error logs

# === SSL ===
sudo certbot renew --dry-run        # Test renewal
sudo certbot certificates           # List certs

# === Security ===
sudo apt update && sudo apt upgrade -y  # OS updates
npm audit                           # Security scan
```

---

## Support

**Documentation:**
- Node.js: https://nodejs.org/docs
- PM2: https://pm2.keymetrics.io/docs
- Nginx: https://nginx.org/en/docs/
- Certbot: https://certbot.eff.org/

**Issues:**
- GitHub: https://github.com/CS-Workx/awl/issues

**Contact:**
- Email: steff@thehouseofcoaching.com
