# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Repository Overview

This is a monorepo containing productivity tools for coaches, trainers, and educators. Each tool is a self-contained project in its own subdirectory.

**License**: All projects use GPL-3.0-or-later unless otherwise specified.

**Primary maintainer**: Steff Van Haverbeke (steff@thehouseofcoaching.com)

## Active Projects

### AWL Scanner (`awl/`)
Progressive Web App (PWA) for scanning paper attendance lists using AI-powered OCR.

**Tech Stack**:
- Backend: Node.js with Express
- AI: Google Gemini Vision API (gemini-1.5-flash model)
- Image Processing: Sharp for image conversion, pdf-lib for PDF generation
- Email: Nodemailer for SMTP delivery
- Storage: File-based JSON for contacts (`data/contacts.json`)

**Architecture**:
- Single-file backend (`src/server.js`) with three main API groups:
  1. Contacts API (`/api/contacts`) - CRUD operations for email recipients
  2. Scan & Process API (`/api/scan`) - Handles image upload, Gemini OCR, CSV/PDF generation
  3. Send Email API (`/api/send`) - Delivers processed files via SMTP
- Frontend: Vanilla HTML/JS PWA in `public/index.html`
- Service Worker (`public/sw.js`) enables offline installation and caching

**Key Dependencies**:
- `@google/generative-ai`: Gemini Vision integration
- `sharp`: Image format conversion (JPG/PNG handling)
- `pdf-lib`: Client-side PDF creation from scanned images
- `nodemailer`: Email delivery with attachments
- `multer`: Multipart file uploads (10MB limit)

**Development Workflow**:
```bash
cd awl/
npm install
cp .env.example .env  # Configure GEMINI_API_KEY and SMTP credentials
npm run dev           # Development with nodemon hot-reload
npm start             # Production server
```

**Testing**: No automated tests currently present. Manual testing workflow:
1. Start server with valid API keys
2. Access PWA in browser
3. Upload sample attendance list image
4. Verify OCR extraction accuracy
5. Test email delivery to configured recipients

**Deployment**:
- Designed for VPS self-hosting (not cloud platforms)
- Requires HTTPS for PWA installation on mobile devices
- Recommended: PM2 process manager + Nginx reverse proxy
- See `awl/README.md` for detailed VPS setup instructions

**Security Considerations**:
- Never commit `.env` files (already in `.gitignore`)
- SMTP credentials should use app-specific passwords, not main account passwords
- GEMINI_API_KEY must be restricted to necessary scopes
- File uploads limited to 10MB to prevent DoS
- All sensitive config in environment variables

**Image Processing Flow**:
1. Upload received via multer → in-memory buffer
2. Sharp converts to JPEG (90% quality) for Gemini compatibility
3. Gemini processes with structured JSON prompt for attendance data extraction
4. Sharp converts to PNG for PDF embedding
5. pdf-lib creates PDF with embedded image scaled to A4 dimensions
6. Both CSV (extracted data) and PDF (original scan) attached to email

**Data Storage**:
- `data/contacts.json`: Persistent contact list (auto-created with default entries)
- No database required - intentionally simple file-based storage
- Contact IDs use timestamp-based generation (`Date.now()`)

## Common Commands

### AWL Scanner
```bash
# Development
cd awl/ && npm run dev

# Production
cd awl/ && npm start

# Security audit
cd awl/ && npm audit
cd awl/ && npm audit fix

# Generate PWA icons (requires ImageMagick)
cd awl/public/ && convert icon.svg -resize 192x192 icon-192.png
cd awl/public/ && convert icon.svg -resize 512x512 icon-512.png
```

## Repository Structure Notes

- Root-level README.md provides project index
- Each project has its own README.md with detailed setup instructions
- Security policy in root SECURITY.md applies to all projects
- Common .gitignore at root + project-specific .gitignore files

## Future Projects

When adding new tools to this repository:
1. Create subdirectory with descriptive name
2. Include project-specific README.md
3. Update root README.md project list
4. Ensure GPL-3.0-or-later license or document alternative
5. Follow existing pattern: self-hosted, privacy-focused, minimal dependencies
