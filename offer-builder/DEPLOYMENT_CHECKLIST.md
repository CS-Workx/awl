# VPS Deployment Checklist - offer-builder

**Target URL:** https://tools.superworker.be/offer-builder/  
**Backend Port:** 8767  
**Date:** 2026-02-03

---

## Pre-Deployment (Local - ✅ COMPLETED)

- ✅ Port configuration made dynamic (`backend/app.py`)
- ✅ Environment variable `PORT` added to `env.template`
- ✅ Frontend API base auto-detects environment (`frontend/js/api.js`)
- ✅ `.gitignore` excludes: `venv/`, `.env`, `archive/`, `generated_offers/*.docx`
- ✅ VPS deployment documentation created (`DEPLOYMENT_VPS.md`)
- ✅ Code committed to git (commit: 6c1e581)
- ✅ Code pushed to GitHub: https://github.com/CS-Workx/awl.git

---

## VPS Deployment Steps

### ☐ Step 1: Clone Repository to VPS

```bash
ssh user@tools.superworker.be
cd /var/www/tools.superworker.be/html/tools/
git clone https://github.com/CS-Workx/awl.git
cd awl/offer-builder/

# Set ownership
sudo chown -R www-data:www-data .
sudo chmod -R 755 .
```

**Verify:**
- [ ] Directory exists at `/var/www/tools.superworker.be/html/tools/offer-builder/`
- [ ] Files owned by `www-data:www-data`

---

### ☐ Step 2: Python Environment

```bash
cd /var/www/tools.superworker.be/html/tools/offer-builder/
python3 -m venv venv
source venv/bin/activate
cd backend
pip install -r requirements.txt
playwright install chromium
playwright install-deps
```

**Verify:**
- [ ] `venv/bin/python --version` shows Python 3.9+
- [ ] `pip list | grep fastapi` shows FastAPI installed
- [ ] `playwright --version` shows version

---

### ☐ Step 3: Environment Configuration

```bash
cd /var/www/tools.superworker.be/html/tools/offer-builder/
cp env.template .env
nano .env
```

**Configure:**
```env
GEMINI_API_KEY=<production_key>
PORT=8767
ALLOWED_ORIGINS=https://tools.superworker.be
TEMPLATE_PATH=./templates/default.docx
OUTPUT_DIR=./generated_offers
TEMPLATES_DIR=./templates
```

**Secure:**
```bash
chmod 600 .env
chown www-data:www-data .env
```

**Verify:**
- [ ] `.env` exists with production values
- [ ] Permissions are `600`
- [ ] Owner is `www-data:www-data`

---

### ☐ Step 4: Create Directories

```bash
cd /var/www/tools.superworker.be/html/tools/offer-builder/
mkdir -p generated_offers templates/user_uploads
chmod 755 generated_offers templates/user_uploads
chown www-data:www-data generated_offers templates/user_uploads
```

**Verify:**
- [ ] Directories exist
- [ ] Writable by www-data

---

### ☐ Step 5: Systemd Service

Create `/etc/systemd/system/offer-builder.service`:

```ini
[Unit]
Description=Syntra Bizz Offer Builder API
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/tools.superworker.be/html/tools/offer-builder/backend
Environment="PATH=/var/www/tools.superworker.be/html/tools/offer-builder/venv/bin"
ExecStart=/var/www/tools.superworker.be/html/tools/offer-builder/venv/bin/python app.py
Restart=always
RestartSec=10
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

**Commands:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable offer-builder
sudo systemctl start offer-builder
sudo systemctl status offer-builder
```

**Verify:**
- [ ] Service is `active (running)`
- [ ] No errors in `journalctl -u offer-builder -n 50`
- [ ] Port 8767 listening: `netstat -tuln | grep 8767`

---

### ☐ Step 6: Nginx Configuration

Edit `/etc/nginx/sites-available/tools.superworker.be`:

Add inside `server` block (HTTPS/SSL):

```nginx
# Offer Builder - Frontend
location /offer-builder/ {
    alias /var/www/tools.superworker.be/html/tools/offer-builder/frontend/;
    index index.html;
    try_files $uri $uri/ /offer-builder/index.html;
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}

# Offer Builder - API
location /offer-builder/api/ {
    proxy_pass http://127.0.0.1:8767/api/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    client_max_body_size 10M;
    proxy_read_timeout 300s;
    proxy_connect_timeout 300s;
}
```

**Commands:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

**Verify:**
- [ ] `nginx -t` passes
- [ ] Nginx reloaded without errors

---

### ☐ Step 7: SSL Certificate

```bash
sudo certbot certificates
# If needed: sudo certbot --nginx -d tools.superworker.be
sudo certbot renew --dry-run
```

**Verify:**
- [ ] Certificate covers tools.superworker.be
- [ ] Auto-renewal works

---

## Testing

### ☐ Frontend Test
- [ ] Visit: https://tools.superworker.be/offer-builder/
- [ ] Page loads without errors
- [ ] CSS/JS assets load
- [ ] No console errors

### ☐ API Test
```bash
curl https://tools.superworker.be/offer-builder/api/
```
- [ ] Returns JSON: `{"status":"ok",...}`

### ☐ Screenshot Upload
- [ ] Upload CRM screenshot
- [ ] AI extraction works
- [ ] Fields populated

### ☐ Training URL
- [ ] Enter Syntra URL
- [ ] Data extracted successfully

### ☐ Offer Generation
- [ ] Fill all fields
- [ ] Generate offer
- [ ] AI content appears

### ☐ DOCX Download
- [ ] Click download
- [ ] File downloads
- [ ] Content correct

### ☐ Browser Automation
- [ ] CRM browser opens
- [ ] Screenshot capture works

---

## Post-Deployment

### ☐ Security Review
- [ ] `.env` has 600 permissions
- [ ] Backend runs as www-data
- [ ] Port 8767 not externally accessible
- [ ] CORS restricted to tools.superworker.be
- [ ] File uploads limited to 10MB

### ☐ Monitoring Setup
- [ ] Backend logs: `journalctl -u offer-builder -f`
- [ ] Nginx logs: `/var/log/nginx/access.log`
- [ ] Error tracking setup

---

## Quick Commands

```bash
# Service management
sudo systemctl status offer-builder
sudo systemctl restart offer-builder
sudo systemctl stop offer-builder

# Logs
sudo journalctl -u offer-builder -f
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Test API directly
curl http://127.0.0.1:8767/

# Test through Nginx
curl https://tools.superworker.be/offer-builder/api/
```

---

## Rollback

If deployment fails:

```bash
sudo systemctl stop offer-builder
sudo systemctl disable offer-builder
sudo rm /etc/systemd/system/offer-builder.service
sudo systemctl daemon-reload
```

Remove Nginx config blocks and reload:
```bash
sudo nano /etc/nginx/sites-available/tools.superworker.be
sudo systemctl reload nginx
```

---

## Notes

- Repository: https://github.com/CS-Workx/awl.git
- Deployment commit: 6c1e581
- Backend port: 8767 (configurable via .env PORT variable)
- Isolated from AWL (separate port, separate .env)
- Full documentation: `DEPLOYMENT_VPS.md`

---

**Deployed by:** _________________  
**Date:** _________________  
**Verified by:** _________________  
**Sign-off:** _________________
