# VPS Deployment Guide - Syntra Bizz Offer Builder

This guide provides step-by-step instructions for deploying the offer-builder application to a VPS at `https://tools.superworker.be/offer-builder/`.

## Architecture

```
Internet → Nginx (HTTPS/SSL) → FastAPI Backend (Port 8767)
                              ↓
                         Static Frontend Files
```

## Prerequisites

- VPS with Ubuntu/Debian Linux
- Root or sudo access
- Python 3.9 or higher installed
- Nginx web server installed
- SSL certificate (Let's Encrypt recommended)
- Gemini API key

---

## Step 1: Install Application Files

SSH to your VPS and navigate to the web directory:

```bash
ssh user@tools.superworker.be
cd /var/www/tools.superworker.be/html/tools/
```

Clone or upload the offer-builder directory:

```bash
# Option 1: Clone from GitHub
git clone https://github.com/yourusername/tools.git
cd tools/offer-builder

# Option 2: Upload via SCP (from local machine)
scp -r offer-builder/ user@tools.superworker.be:/var/www/tools.superworker.be/html/tools/
```

Set correct ownership and permissions:

```bash
sudo chown -R www-data:www-data /var/www/tools.superworker.be/html/tools/offer-builder/
sudo chmod -R 755 /var/www/tools.superworker.be/html/tools/offer-builder/
```

---

## Step 2: Python Environment Setup

Create a virtual environment:

```bash
cd /var/www/tools.superworker.be/html/tools/offer-builder/
python3 -m venv venv
```

Activate the environment and install dependencies:

```bash
source venv/bin/activate
cd backend
pip install -r requirements.txt
```

Install Playwright browsers:

```bash
playwright install chromium
playwright install-deps  # Install system dependencies
```

Verify installation:

```bash
python3 --version  # Should show 3.9+
pip list | grep fastapi
playwright --version
```

---

## Step 3: Environment Configuration

Create the production `.env` file:

```bash
cd /var/www/tools.superworker.be/html/tools/offer-builder/
cp env.template .env
nano .env
```

Configure with production values:

```env
# Gemini API Key (Required)
GEMINI_API_KEY=your_production_gemini_api_key_here

# Server Configuration
PORT=8767

# CORS Configuration
ALLOWED_ORIGINS=https://tools.superworker.be

# File Paths (Relative to project root)
TEMPLATE_PATH=./templates/default.docx
OUTPUT_DIR=./generated_offers
TEMPLATES_DIR=./templates
```

Secure the `.env` file:

```bash
chmod 600 .env
chown www-data:www-data .env
```

---

## Step 4: Create Required Directories

```bash
cd /var/www/tools.superworker.be/html/tools/offer-builder/
mkdir -p generated_offers
mkdir -p templates/user_uploads
chmod 755 generated_offers templates/user_uploads
chown www-data:www-data generated_offers templates/user_uploads
```

---

## Step 5: Systemd Service Setup

Create the systemd service file:

```bash
sudo nano /etc/systemd/system/offer-builder.service
```

Add the following content:

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

# Security hardening
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable offer-builder
sudo systemctl start offer-builder
```

Check service status:

```bash
sudo systemctl status offer-builder
```

Verify backend is running:

```bash
netstat -tuln | grep 8767
curl http://127.0.0.1:8767/
```

---

## Step 6: Nginx Reverse Proxy Configuration

Edit your Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/tools.superworker.be
```

Add these location blocks inside the `server` block (port 443, SSL):

```nginx
# Offer Builder - Frontend (static files)
location /offer-builder/ {
    alias /var/www/tools.superworker.be/html/tools/offer-builder/frontend/;
    index index.html;
    try_files $uri $uri/ /offer-builder/index.html;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}

# Offer Builder - API Backend
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
    
    # Large file uploads (screenshots, documents)
    client_max_body_size 10M;
    
    # Longer timeout for AI processing
    proxy_read_timeout 300s;
    proxy_connect_timeout 300s;
}
```

Test and reload Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 7: SSL Certificate Verification

Check if your SSL certificate covers the domain:

```bash
sudo certbot certificates
```

If needed, add the domain:

```bash
sudo certbot --nginx -d tools.superworker.be
```

Test auto-renewal:

```bash
sudo certbot renew --dry-run
```

---

## Step 8: Testing & Verification

### Test Frontend
Open in browser: `https://tools.superworker.be/offer-builder/`

### Test API
```bash
curl https://tools.superworker.be/offer-builder/api/
```

Expected response:
```json
{"status":"ok","message":"Syntra Bizz Offer Generator API is running"}
```

### Test Full Workflow
1. Upload a CRM screenshot
2. Enter a training URL
3. Fill intake information
4. Generate offer
5. Download DOCX

---

## Monitoring & Maintenance

### View Logs

```bash
# Backend logs
sudo journalctl -u offer-builder -f

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Service Management

```bash
# Check status
sudo systemctl status offer-builder

# Restart service
sudo systemctl restart offer-builder

# Stop service
sudo systemctl stop offer-builder

# Start service
sudo systemctl start offer-builder
```

### Check Backend Port

```bash
netstat -tuln | grep 8767
```

---

## Troubleshooting

### 502 Bad Gateway
**Cause:** Backend not running  
**Solution:**
```bash
sudo systemctl status offer-builder
sudo journalctl -u offer-builder -n 50
sudo systemctl restart offer-builder
```

### CORS Errors
**Cause:** Wrong origin in `.env`  
**Solution:**
```bash
nano .env
# Set: ALLOWED_ORIGINS=https://tools.superworker.be
sudo systemctl restart offer-builder
```

### Playwright Browser Fails
**Cause:** Browser not installed  
**Solution:**
```bash
source venv/bin/activate
playwright install chromium
playwright install-deps
```

### Permission Denied (File Uploads)
**Cause:** Wrong directory ownership  
**Solution:**
```bash
sudo chown -R www-data:www-data generated_offers/ templates/user_uploads/
sudo chmod -R 755 generated_offers/ templates/user_uploads/
```

---

## Security Checklist

- ✅ `.env` file has 600 permissions (not world-readable)
- ✅ Backend runs as www-data (not root)
- ✅ CORS restricted to tools.superworker.be domain
- ✅ SSL/TLS certificate valid
- ✅ File uploads limited to 10MB
- ✅ Backend port (8767) not exposed externally
- ✅ Sensitive directories not served by Nginx

---

## Rollback Procedure

If deployment fails:

1. Stop service:
   ```bash
   sudo systemctl stop offer-builder
   sudo systemctl disable offer-builder
   ```

2. Remove Nginx config blocks from `/etc/nginx/sites-available/tools.superworker.be`

3. Reload Nginx:
   ```bash
   sudo systemctl reload nginx
   ```

4. Remove systemd service:
   ```bash
   sudo rm /etc/systemd/system/offer-builder.service
   sudo systemctl daemon-reload
   ```

---

## Support

For issues or questions:
- Email: steff@vanhaverbeke.com
- Repository: https://github.com/yourusername/tools

---

**Deployment Date:** 2026-02-03  
**Version:** 1.0.0  
**Deployed By:** Steff Vanhaverbeke
