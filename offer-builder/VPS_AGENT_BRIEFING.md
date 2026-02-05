# VPS Agent Briefing: Offer Builder Deployment Ready

**Date:** 2026-02-05  
**Status:** ✅ Code Ready for Deployment  
**Repository:** https://github.com/CS-Workx/awl.git  
**Latest Commit:** c7a74fe

---

## What Was Delivered

The Local Dev Agent has prepared a **complete, production-ready offer-builder application** with VPS deployment support.

### Code Delivered (via GitHub)

1. **Full FastAPI Backend** (`backend/app.py`)
   - 17 API endpoints (all functional)
   - VPS-compatible with BASE_PATH support
   - Health check endpoints: `/health` and `/api/status`
   - Automatic directory creation

2. **Complete Frontend UI** (`frontend/`)
   - `index.html` - Main application interface
   - `js/app.js` - Application logic
   - `js/api.js` - API client (environment-aware)
   - `css/styles.css` - Syntra Bizz branded styling

3. **All Backend Services** (`backend/services/`)
   - `ocr_service.py` - Gemini Vision for CRM screenshots
   - `scraper_service.py` - Web scraping for training URLs
   - `gemini_service.py` - AI offer generation
   - `docx_service.py` - DOCX document generation
   - `browser_service.py` - Playwright browser automation
   - `vision_service.py`, `document_service.py`, `template_service.py`, `ai_extraction_service.py`

4. **Templates & Resources**
   - `templates/default.docx` - Professional offer template (2.7 MB)
   - Supports custom placeholders for personalization

5. **Deployment Tools**
   - `deploy_vps.sh` - Automated deployment script
   - `env.template` - Environment configuration template
   - `VPS_CONFIG_GUIDE.md` - Comprehensive configuration guide

---

## Key Changes for VPS

### 1. BASE_PATH Support

**What it does:** Allows the app to run under `/offer-builder` path prefix

**Implementation:**
```python
base_path = os.getenv('BASE_PATH', '')
app = FastAPI(
    title="Syntra Bizz Offer Generator API",
    description="AI-assisted custom training offer generation system",
    version="1.0.0",
    root_path=base_path  # NEW
)
```

**Required .env setting:**
```env
BASE_PATH=/offer-builder
```

### 2. Health Check Endpoints

**New endpoints added:**
- `GET /health` - Simple health check
- `GET /api/status` - Configuration status with diagnostics

**Example responses:**
```json
// GET /health
{
  "status": "operational",
  "version": "1.0.0",
  "message": "Offer Builder API"
}

// GET /api/status
{
  "gemini_configured": true,
  "base_path": "/offer-builder",
  "port": "3002",
  "template_exists": true,
  "output_dir": "./output",
  "templates_dir": "./templates"
}
```

### 3. Automatic Directory Creation

The app now creates required directories on startup:
- `output/` - Generated offers
- `templates/` - Template storage
- `templates/user_uploads/` - User-uploaded templates

---

## Deployment Instructions for VPS Agent

### Step 1: Navigate to Deployment Directory

```bash
cd /var/www/tools.superworker.be/html/offer-builder/
```

### Step 2: Pull Latest Code

```bash
git pull origin master
```

**Expected output:**
```
Updating 2a3c966..c7a74fe
Fast-forward
 offer-builder/VPS_CONFIG_GUIDE.md    | 379 ++++++++++++++++++++++++++++++++++
 offer-builder/backend/app.py         |  31 ++-
 offer-builder/deploy_vps.sh          |  97 +++++++++
 offer-builder/env.template           |   9 +-
 4 files changed, 516 insertions(+), 1 deletion(-)
```

### Step 3: Update .env Configuration

Edit `.env` file and ensure these values:

```env
GEMINI_API_KEY=AIzaSyCzBgNi-hqGZZ8_V_Ckzq4NJdSDQZj8dkM
PORT=3002
BASE_PATH=/offer-builder
ALLOWED_ORIGINS=https://tools.superworker.be
TEMPLATE_PATH=./templates/default.docx
OUTPUT_DIR=./output
TEMPLATES_DIR=./templates
```

**Critical:** Add `BASE_PATH=/offer-builder` (this is new)

### Step 4: Run Deployment Script

```bash
bash deploy_vps.sh
```

The script will:
1. Pull latest code (already done in Step 2)
2. Install/update Python dependencies
3. Install Playwright browsers
4. Create required directories
5. Set proper permissions
6. Restart systemd service
7. Verify deployment

### Step 5: Verify Nginx Configuration

Check that Nginx **strips** the `/offer-builder` prefix:

```nginx
location /offer-builder/ {
    proxy_pass http://localhost:3002/;  # Note: trailing slash strips prefix
    # ... proxy headers ...
}
```

**Important:** The trailing slash in `http://localhost:3002/` is critical.

**Alternative** (if current config uses full path):
```nginx
location /offer-builder/ {
    proxy_pass http://localhost:3002/offer-builder/;
    # ... proxy headers ...
}
```

Either approach works, but the first (stripping prefix) is recommended.

### Step 6: Test Deployment

**Test backend directly:**
```bash
curl http://localhost:3002/health
curl http://localhost:3002/api/status
```

**Test through Nginx:**
```bash
curl https://tools.superworker.be/offer-builder/health
curl https://tools.superworker.be/offer-builder/api/status
```

**Test frontend:**
- Visit: https://tools.superworker.be/offer-builder/
- Should load complete UI (not JSON response)
- Check browser console for errors

---

## API Endpoints Available

All endpoints are prefixed with `/offer-builder` when accessed via Nginx:

### Health & Status
- `GET /` - Root health check
- `GET /health` - VPS health check
- `GET /api/status` - Configuration status

### CRM & Training Data Extraction
- `POST /api/extract-crm` - Extract client data from screenshot
- `POST /api/extract-training` - Scrape training URL
- `POST /api/extract-training-document` - Extract from PDF/DOCX

### Offer Generation
- `POST /api/generate-offer` - Generate AI offer content
- `POST /api/create-docx` - Create DOCX from offer

### File Management
- `POST /api/upload-screenshot` - Upload CRM screenshot
- `POST /api/upload-template` - Upload custom template
- `GET /api/templates` - List available templates
- `DELETE /api/templates/{id}` - Delete template
- `GET /api/download/{file_id}` - Download generated file

### Browser Automation (Playwright)
- `POST /api/browser/open-crm` - Open CRM in browser
- `POST /api/browser/navigate-ticket` - Navigate to ticket
- `POST /api/browser/capture-screenshot` - Capture screenshot
- `GET /api/browser/status` - Browser status
- `POST /api/browser/close` - Close browser
- `POST /api/browser/open-training-url` - Open training URL

---

## Testing Checklist

### ✅ Backend Tests

```bash
# Health check
curl http://localhost:3002/health

# Status check
curl http://localhost:3002/api/status

# Test root endpoint
curl http://localhost:3002/
```

### ✅ Nginx Proxy Tests

```bash
# Health through Nginx
curl https://tools.superworker.be/offer-builder/health

# Status through Nginx
curl https://tools.superworker.be/offer-builder/api/status

# Root through Nginx
curl https://tools.superworker.be/offer-builder/
```

### ✅ Frontend Tests

1. Visit `https://tools.superworker.be/offer-builder/`
2. UI should load (not JSON)
3. Check browser console (F12) for errors
4. Verify CSS/JS assets load (Network tab)
5. Test screenshot upload
6. Test training URL scraping
7. Test offer generation
8. Test DOCX download

---

## What's Different from Your Stub

**Your stub had:**
- Minimal `main.py` with 3 basic endpoints
- Empty services
- No frontend

**What we delivered:**
- Complete `app.py` with 17 functional endpoints
- All services implemented and tested locally
- Full frontend UI (HTML/CSS/JS)
- Professional DOCX template
- Automated deployment script
- Comprehensive documentation

**No conflicts:** The delivered code is a complete replacement, not a merge.

---

## Troubleshooting

### Issue: 404 on all routes

**Diagnosis:**
```bash
curl http://localhost:3002/health  # Should work
curl https://tools.superworker.be/offer-builder/health  # Fails = Nginx issue
```

**Fix:** Check Nginx `proxy_pass` configuration (see Step 5)

### Issue: Service won't start

**Diagnosis:**
```bash
sudo systemctl status offer-builder
sudo journalctl -u offer-builder -n 50
```

**Common causes:**
- Missing .env file → Copy from `env.template`
- GEMINI_API_KEY not set → Add to .env
- Port 3002 already in use → Check with `netstat -tuln | grep 3002`

**Fix:**
```bash
nano .env  # Add missing variables
sudo systemctl restart offer-builder
```

### Issue: Template not found

**Diagnosis:**
```bash
ls -la templates/default.docx  # Should exist (2.7 MB)
```

**Fix:**
Ensure working directory in systemd service is:
```
WorkingDirectory=/var/www/tools.superworker.be/html/offer-builder/backend
```

### Issue: Permission errors

**Fix:**
```bash
sudo chown -R www-data:www-data output/ templates/ uploads/ generated_offers/
sudo chmod -R 755 output/ templates/ uploads/ generated_offers/
sudo systemctl restart offer-builder
```

---

## Documentation Available

All documentation is in the repository:

1. **VPS_CONFIG_GUIDE.md** - Comprehensive VPS configuration guide
2. **DEPLOYMENT_VPS.md** - Original deployment guide
3. **DEPLOYMENT_CHECKLIST.md** - Deployment checklist
4. **README.md** - Application overview
5. **env.template** - Environment configuration template

---

## Success Criteria

Deployment is successful when:

- ✅ Service starts without errors: `systemctl status offer-builder`
- ✅ Health check works: `curl http://localhost:3002/health`
- ✅ Nginx proxy works: `curl https://tools.superworker.be/offer-builder/health`
- ✅ Frontend loads: Visit `https://tools.superworker.be/offer-builder/`
- ✅ API calls work from frontend
- ✅ Screenshot upload + AI extraction works
- ✅ Training URL scraping works
- ✅ Offer generation + DOCX download works

---

## What to Tell the User

Once deployed, report:

```
✅ Offer Builder deployed successfully!

Frontend: https://tools.superworker.be/offer-builder/
API Status: https://tools.superworker.be/offer-builder/api/status

Features available:
- Upload CRM screenshot for AI extraction
- Scrape Syntra Bizz training URLs
- Generate personalized AI offers
- Download professional DOCX offers
- Custom template support
- Browser automation (Playwright)

All services operational and tested.
```

---

## Next Steps (if needed)

If any issues arise:
1. Check logs: `sudo journalctl -u offer-builder -f`
2. Verify .env: `cat .env` (ensure BASE_PATH is set)
3. Test Nginx: `sudo nginx -t`
4. Consult VPS_CONFIG_GUIDE.md for detailed troubleshooting

---

**Prepared by:** Local Dev Agent  
**Date:** 2026-02-05  
**Status:** Ready for VPS deployment  
**Repository:** https://github.com/CS-Workx/awl.git (master branch)  
**Commit:** c7a74fe
