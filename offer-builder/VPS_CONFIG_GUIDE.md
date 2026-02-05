# VPS Configuration Guide for Offer Builder

This guide explains the configuration changes needed for VPS deployment at `https://tools.superworker.be/offer-builder/`

---

## Changes Made for VPS Compatibility

### 1. BASE_PATH Support

**File:** `backend/app.py`

Added `root_path` parameter to FastAPI initialization:

```python
base_path = os.getenv('BASE_PATH', '')
app = FastAPI(
    title="Syntra Bizz Offer Generator API",
    description="AI-assisted custom training offer generation system",
    version="1.0.0",
    root_path=base_path  # NEW: Enables BASE_PATH prefix
)
```

**Effect:** All routes are automatically prefixed with `/offer-builder` when `BASE_PATH=/offer-builder` is set.

---

### 2. Health Check Endpoints

**File:** `backend/app.py`

Added VPS-compatible health check endpoints:

```python
@app.get("/health")
async def health_check():
    """VPS health check endpoint"""
    return {
        "status": "operational",
        "version": "1.0.0",
        "message": "Offer Builder API"
    }

@app.get("/api/status")
async def api_status():
    """Configuration status endpoint"""
    return {
        "gemini_configured": bool(gemini_api_key),
        "base_path": os.getenv('BASE_PATH', ''),
        "port": os.getenv('PORT', '8765'),
        "template_exists": os.path.exists(template_path),
        "output_dir": output_dir,
        "templates_dir": templates_dir
    }
```

**Endpoints:**
- `/health` - Simple health check
- `/api/status` - Configuration and status information

---

### 3. Directory Auto-Creation

**File:** `backend/app.py`

Added automatic directory creation on startup:

```python
os.makedirs(output_dir, exist_ok=True)
os.makedirs(templates_dir, exist_ok=True)
os.makedirs(os.path.join(templates_dir, 'user_uploads'), exist_ok=True)
```

**Effect:** Required directories are automatically created if they don't exist.

---

### 4. Environment Configuration

**File:** `env.template`

Added `BASE_PATH` configuration option:

```env
# Base Path Configuration (for VPS deployment behind reverse proxy)
# Local development: leave empty or comment out
# VPS production: set to /offer-builder
BASE_PATH=
```

---

## VPS .env Configuration

Create/update `.env` file on VPS with these values:

```env
# Gemini API Key
GEMINI_API_KEY=AIzaSyCzBgNi-hqGZZ8_V_Ckzq4NJdSDQZj8dkM

# Server Configuration
PORT=3002

# Base Path (IMPORTANT for VPS)
BASE_PATH=/offer-builder

# CORS Configuration
ALLOWED_ORIGINS=https://tools.superworker.be

# File Paths (relative to backend/ directory)
TEMPLATE_PATH=./templates/default.docx
OUTPUT_DIR=./output
TEMPLATES_DIR=./templates
```

**Key changes from local:**
- `PORT=3002` (instead of 8765)
- `BASE_PATH=/offer-builder` (NEW - required for VPS)
- `ALLOWED_ORIGINS=https://tools.superworker.be` (instead of localhost)
- `OUTPUT_DIR=./output` (instead of ./generated_offers)

---

## Nginx Configuration

The Nginx configuration on VPS should **strip** the `/offer-builder` prefix before passing to FastAPI:

```nginx
location /offer-builder/ {
    # Strip /offer-builder prefix
    proxy_pass http://localhost:3002/;  # Note the trailing slash
    
    # Proxy headers
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    
    # Large file uploads
    client_max_body_size 10M;
    
    # Longer timeout for AI processing
    proxy_read_timeout 300s;
    proxy_connect_timeout 300s;
}
```

**Important:** The `proxy_pass http://localhost:3002/;` (with trailing slash) strips the `/offer-builder` prefix.

**Alternative configuration** (if prefix should be kept):
```nginx
location /offer-builder/ {
    proxy_pass http://localhost:3002/offer-builder/;
    # ... rest of config
}
```

---

## How It Works

### Request Flow

1. **Browser** → `https://tools.superworker.be/offer-builder/api/extract-crm`
2. **Nginx** → Strips `/offer-builder` prefix
3. **FastAPI** → Receives `/api/extract-crm`
4. **FastAPI** → Processes with `root_path=/offer-builder`
5. **FastAPI** → Generates correct URLs in responses

### Why `root_path` is Needed

FastAPI's `root_path` parameter tells the application:
- How to generate URLs in responses
- How to update OpenAPI/Swagger docs
- How to handle CORS properly

Without `root_path`, FastAPI would generate URLs like:
- `http://localhost:3002/api/extract-crm` (WRONG)

With `root_path=/offer-builder`, FastAPI generates:
- `https://tools.superworker.be/offer-builder/api/extract-crm` (CORRECT)

---

## Testing VPS Configuration

### 1. Test Backend Directly (localhost)

```bash
# SSH to VPS
ssh user@tools.superworker.be

# Test health endpoint
curl http://localhost:3002/health

# Expected output:
# {"status":"operational","version":"1.0.0","message":"Offer Builder API"}

# Test status endpoint
curl http://localhost:3002/api/status

# Expected output:
# {"gemini_configured":true,"base_path":"/offer-builder","port":"3002",...}
```

### 2. Test Through Nginx (HTTPS)

```bash
# Test health endpoint
curl https://tools.superworker.be/offer-builder/health

# Test status endpoint
curl https://tools.superworker.be/offer-builder/api/status

# Test root endpoint
curl https://tools.superworker.be/offer-builder/
```

### 3. Test Frontend

Visit `https://tools.superworker.be/offer-builder/` in browser:
- UI should load
- CSS/JS assets should load (check Network tab)
- API calls should work (check Console tab)

---

## Deployment Procedure

### Step 1: Pull Code

```bash
cd /var/www/tools.superworker.be/html/offer-builder/
git pull origin master
```

### Step 2: Update .env

```bash
nano .env
# Add or verify: BASE_PATH=/offer-builder
```

### Step 3: Run Deployment Script

```bash
bash deploy_vps.sh
```

The script will:
- Pull latest code
- Install dependencies
- Install Playwright browsers
- Create directories
- Restart service
- Check status

### Step 4: Verify Service

```bash
sudo systemctl status offer-builder
sudo journalctl -u offer-builder -n 50
```

### Step 5: Test Endpoints

```bash
curl http://localhost:3002/health
curl http://localhost:3002/api/status
curl https://tools.superworker.be/offer-builder/health
curl https://tools.superworker.be/offer-builder/api/status
```

---

## Troubleshooting

### Issue: 404 on all routes

**Cause:** BASE_PATH mismatch between .env and Nginx config

**Fix:**
1. Check `.env` has `BASE_PATH=/offer-builder`
2. Check Nginx `proxy_pass` strips prefix correctly
3. Restart service: `sudo systemctl restart offer-builder`

### Issue: CORS errors in browser

**Cause:** Wrong ALLOWED_ORIGINS in .env

**Fix:**
```bash
nano .env
# Set: ALLOWED_ORIGINS=https://tools.superworker.be
sudo systemctl restart offer-builder
```

### Issue: Template not found

**Cause:** Working directory mismatch

**Fix:**
1. Check systemd service `WorkingDirectory`
2. Ensure it's `/var/www/tools.superworker.be/html/offer-builder/backend`
3. Verify template exists: `ls -la templates/default.docx`

### Issue: Permission denied on file operations

**Cause:** Wrong directory permissions

**Fix:**
```bash
cd /var/www/tools.superworker.be/html/offer-builder/
sudo chown -R www-data:www-data output/ templates/ uploads/
sudo chmod -R 755 output/ templates/ uploads/
sudo systemctl restart offer-builder
```

---

## Local Development

For local development, the configuration remains **unchanged**:

```env
# .env (local)
GEMINI_API_KEY=your_key_here
PORT=8765
BASE_PATH=
ALLOWED_ORIGINS=http://localhost:8766,http://127.0.0.1:8766
```

**Important:** Leave `BASE_PATH` empty or commented out for local development.

---

## Rollback

If deployment fails:

```bash
cd /var/www/tools.superworker.be/html/offer-builder/
git reset --hard HEAD~1
sudo systemctl restart offer-builder
```

---

## Summary

**Key changes for VPS:**
1. ✅ Added `BASE_PATH` environment variable support
2. ✅ Added `root_path` parameter to FastAPI app
3. ✅ Added `/health` and `/api/status` endpoints
4. ✅ Added automatic directory creation
5. ✅ Updated environment template documentation
6. ✅ Created deployment script

**No changes needed:**
- ✅ Frontend API base URL (already environment-aware)
- ✅ CORS configuration (already environment-based)
- ✅ All existing endpoints and services

**VPS-specific configuration:**
- `BASE_PATH=/offer-builder` in `.env`
- `PORT=3002` in `.env`
- `ALLOWED_ORIGINS=https://tools.superworker.be` in `.env`
- Nginx strips `/offer-builder` prefix before proxying

---

**Last updated:** 2026-02-05  
**VPS deployment target:** https://tools.superworker.be/offer-builder/
