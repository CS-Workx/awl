/**
 * AWL Scanner - Aanwezigheidslijst Scanner voor Trainers
 * Copyright (C) 2026 Steff Van Haverbeke / The House of Coaching
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 */

require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_PATH = process.env.BASE_PATH || '';

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from /public on the base path
if (BASE_PATH) {
  app.use(BASE_PATH, express.static(path.join(__dirname, '../public')));
} else {
  app.use(express.static(path.join(__dirname, '../public')));
}

// File upload config met HEIC support (multi-file)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 10 * 1024 * 1024,  // 10MB per file
    files: 5                      // Max 5 files total
  },
  fileFilter: (req, file, cb) => {
    // Accepteer alle image types + HEIC/HEIF
    const isImage = file.mimetype.startsWith('image/');
    const isHEIC = /\.(heic|heif)$/i.test(file.originalname);
    
    if (isImage || isHEIC) {
      cb(null, true);
    } else {
      cb(new Error('Alleen afbeeldingen zijn toegestaan'));
    }
  }
});

// Data storage paths
const DATA_DIR = path.join(__dirname, '../data');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize contacts file if doesn't exist
if (!fs.existsSync(CONTACTS_FILE)) {
  fs.writeFileSync(CONTACTS_FILE, JSON.stringify([
    { id: 1, name: "Syntra Bizz", email: "admin@syntrabizz.be" },
    { id: 2, name: "Syntra West", email: "admin@syntrawest.be" },
    { id: 3, name: "Cevora", email: "admin@cevora.be" }
  ], null, 2));
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize email client (Microsoft Graph API)
let graphClient;
try {
  const GraphEmailClient = require('./graphClient');
  graphClient = new GraphEmailClient();
  console.log('✓ Microsoft Graph API client initialized');
} catch (error) {
  console.warn('⚠ Graph API not available:', error.message);
  console.warn('Email sending will use alternative method if configured');
}

// ============ API ROUTES ============
// Create router for API routes with base path support
const apiRouter = express.Router();

// ============ CONTACTS API ============

apiRouter.get('/api/contacts', (req, res) => {
  try {
    const contacts = JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf8'));
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Kon contacten niet laden' });
  }
});

apiRouter.post('/api/contacts', (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Naam en email zijn verplicht' });
    }

    const contacts = JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf8'));
    const newContact = {
      id: Date.now(),
      name,
      email
    };
    contacts.push(newContact);
    fs.writeFileSync(CONTACTS_FILE, JSON.stringify(contacts, null, 2));
    res.json(newContact);
  } catch (error) {
    res.status(500).json({ error: 'Kon contact niet toevoegen' });
  }
});

apiRouter.delete('/api/contacts/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    let contacts = JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf8'));
    contacts = contacts.filter(c => c.id !== id);
    fs.writeFileSync(CONTACTS_FILE, JSON.stringify(contacts, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Kon contact niet verwijderen' });
  }
});

// ============ MANIFEST ENDPOINT ============
// Dynamisch manifest.json met BASE_PATH support

apiRouter.get('/manifest.json', (req, res) => {
  const manifest = {
    name: "AWL Scanner",
    short_name: "AWL Scanner",
    description: "Scan, digitaliseer en verstuur aanwezigheidslijsten",
    start_url: BASE_PATH + "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4F46E5",
    orientation: "portrait",
    icons: [
      {
        src: BASE_PATH + "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: BASE_PATH + "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }
    ]
  };
  
  res.setHeader('Content-Type', 'application/manifest+json');
  res.json(manifest);
});

// ============ SCAN & PROCESS API ============

apiRouter.post('/api/scan', upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Geen afbeeldingen ontvangen' });
    }

    if (req.files.length > 5) {
      return res.status(400).json({ error: 'Maximum 5 afbeeldingen toegestaan' });
    }

    console.log(`Processing ${req.files.length} image(s)...`);
    req.files.forEach((file, i) => {
      console.log(`Image ${i + 1}:`, {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      });
    });

    // Arrays to store results from all images
    const allParsedData = [];
    const processedImages = [];

    // Process each image sequentially
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      console.log(`\n=== Processing image ${i + 1}/${req.files.length} ===`);
      
      try {
        // 1. Convert image to JPEG format (compatible with Gemini)
        let processedImageBuffer;
        try {
          processedImageBuffer = await sharp(file.buffer)
            .resize(3000, 3000, { fit: 'inside', withoutEnlargement: true })
            .sharpen()
            .normalize()
            .jpeg({ quality: 95 })
            .toBuffer();
          
          const imageInfo = await sharp(processedImageBuffer).metadata();
          console.log(`Image ${i + 1} optimized:`, imageInfo.width, 'x', imageInfo.height, 'JPEG');
        } catch (conversionError) {
          console.error(`Image ${i + 1} conversion error:`, conversionError.message);
          
          // Special handling for HEIC files
          if (file.mimetype === 'image/heic' || file.mimetype === 'image/heif' || 
              file.originalname.match(/\.(heic|heif)$/i)) {
            console.error('HEIC processing failed - libheif codec not available on server');
            
            // If this is the only image, return specific error
            if (req.files.length === 1) {
              return res.status(400).json({
                error: 'HEIC conversie niet ondersteund op deze server',
                suggestion: 'Gebruik een moderne browser (Chrome/Edge/Safari) die HEIC automatisch converteert, of converteer de foto eerst naar JPEG'
              });
            }
          }
          
          // Continue with other images if multi-upload
          continue;
        }

        // 2. Process image with Gemini Vision
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        const imageData = {
          inlineData: {
            data: processedImageBuffer.toString('base64'),
            mimeType: 'image/jpeg'
          }
        };

        const prompt = `Je bent een OCR-specialist. Analyseer deze aanwezigheidslijst (attendance list) en extraheer alle gegevens.

Geef het resultaat EXACT in dit JSON formaat:
{
  "training_info": {
    "titel": "naam van de training/cursus",
    "datum": "datum van de training",
    "locatie": "locatie indien zichtbaar",
    "trainer": "naam trainer indien zichtbaar"
  },
  "deelnemers": [
    {
      "naam": "volledige naam",
      "bedrijf": "bedrijf indien zichtbaar",
      "email": "email indien zichtbaar",
      "aanwezig": true of false,
      "handtekening": true of false
    }
  ]
}

Regels:
- "aanwezig" is true als er een handtekening, vinkje of andere markering staat
- "handtekening" is true als er daadwerkelijk een handtekening zichtbaar is
- Laat velden leeg ("") als de info niet zichtbaar is
- Geef ALLEEN valid JSON terug, geen andere tekst`;

        console.log(`Image ${i + 1}: Sending to Gemini API...`);
        let result;
        try {
          result = await model.generateContent([prompt, imageData]);
          console.log(`Image ${i + 1}: Gemini API response received`);
        } catch (geminiError) {
          console.error(`Image ${i + 1} Gemini API error:`, geminiError.message);
          continue; // Skip this image, continue with next
        }

        const responseText = result.response.text();
        console.log(`Image ${i + 1}: Response text length:`, responseText.length);

        // Parse the JSON from Gemini's response
        try {
          // Try to extract JSON from the response
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsedData = JSON.parse(jsonMatch[0]);
            allParsedData.push(parsedData);
            console.log(`Image ${i + 1}: Found ${parsedData.deelnemers?.length || 0} deelnemers`);
          } else {
            console.warn(`Image ${i + 1}: Geen JSON gevonden in response`);
          }
        } catch (parseError) {
          console.error(`Image ${i + 1} JSON parse error:`, parseError.message);
          // Continue with next image
        }

        // Store processed image for PDF
        processedImages.push(processedImageBuffer);

      } catch (error) {
        console.error(`Error processing image ${i + 1}:`, error.message);
        // Continue with next image
      }
    }

    console.log(`\n=== Processed ${processedImages.length}/${req.files.length} images successfully ===`);

    // Check if we got any results
    if (allParsedData.length === 0) {
      // Detect if all files were HEIC
      const allHEIC = req.files.every(f => 
        f.mimetype === 'image/heic' || 
        f.mimetype === 'image/heif' || 
        f.originalname.match(/\.(heic|heif)$/i)
      );
      
      if (allHEIC) {
        return res.status(400).json({ 
          error: 'HEIC bestanden konden niet verwerkt worden',
          suggestion: 'Gebruik een moderne browser (Chrome/Edge/Safari) voor automatische conversie, of converteer de foto\'s naar JPEG',
          processed: processedImages.length,
          total: req.files.length
        });
      }
      
      return res.status(500).json({ 
        error: 'Geen gegevens kunnen extraheren uit de afbeeldingen',
        processed: processedImages.length,
        total: req.files.length
      });
    }

    // Combine training_info from all results (use first non-empty)
    const combinedData = {
      training_info: allParsedData.find(d => d.training_info?.titel)?.training_info || allParsedData[0]?.training_info || {},
      deelnemers: []
    };

    // Merge all deelnemers from all images
    allParsedData.forEach((data, idx) => {
      if (data.deelnemers) {
        combinedData.deelnemers.push(...data.deelnemers);
      }
    });

    // Deduplicate deelnemers by email (case-insensitive)
    const uniqueDeelnemers = Array.from(
      new Map(
        combinedData.deelnemers
          .filter(d => d.email) // Only deelnemers with email
          .map(d => [d.email.toLowerCase(), d])
      ).values()
    );

    // Add deelnemers without email (can't deduplicate these)
    const noEmailDeelnemers = combinedData.deelnemers.filter(d => !d.email);
    const finalDeelnemers = [...uniqueDeelnemers, ...noEmailDeelnemers];

    console.log(`Total deelnemers: ${combinedData.deelnemers.length}, Unique: ${finalDeelnemers.length}`);

    // 2. Generate CSV
    const csvRows = ['Naam,Bedrijf,Email,Aanwezig,Handtekening'];
    finalDeelnemers.forEach(d => {
      csvRows.push(`"${d.naam || ''}","${d.bedrijf || ''}","${d.email || ''}","${d.aanwezig ? 'Ja' : 'Nee'}","${d.handtekening ? 'Ja' : 'Nee'}"`);
    });
    const csvContent = csvRows.join('\n');

    // 3. Create multi-page PDF from images
    const pdfDoc = await PDFDocument.create();

    for (let i = 0; i < processedImages.length; i++) {
      console.log(`Adding page ${i + 1}/${processedImages.length} to PDF`);
      
      // Convert JPEG to PNG for pdf-lib
      const pngBuffer = await sharp(processedImages[i])
        .png()
        .toBuffer();

      const pngImage = await pdfDoc.embedPng(pngBuffer);
      const { width, height } = pngImage.scale(1);

      // Calculate page size to fit image (A4 max)
      const maxWidth = 595; // A4 width in points
      const maxHeight = 842; // A4 height in points
      const scale = Math.min(maxWidth / width, maxHeight / height, 1);

      const page = pdfDoc.addPage([width * scale, height * scale]);
      page.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: width * scale,
        height: height * scale
      });
    }

    console.log(`PDF generated: ${processedImages.length} pages`);

    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

    // 4. Return all data
    res.json({
      success: true,
      data: {
        training_info: combinedData.training_info,
        deelnemers: finalDeelnemers
      },
      csv: csvContent,
      pdf: pdfBase64,
      summary: {
        totaal: finalDeelnemers.length,
        aanwezig: finalDeelnemers.filter(d => d.aanwezig).length || 0,
        training: combinedData.training_info?.titel || 'Onbekend'
      },
      metadata: {
        totalImages: req.files.length,
        processedImages: processedImages.length,
        totalContacts: combinedData.deelnemers.length,
        uniqueContacts: finalDeelnemers.length,
        pdfPages: processedImages.length
      }
    });

  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ error: 'Er ging iets mis bij het verwerken: ' + error.message });
  }
});

// ============ SEND EMAIL API ============

apiRouter.post('/api/send', async (req, res) => {
  try {
    const { contactIds, csv, pdf, summary, customMessage } = req.body;

    if (!contactIds || contactIds.length === 0) {
      return res.status(400).json({ error: 'Selecteer minimaal één contactpersoon' });
    }

    if (!graphClient) {
      return res.status(500).json({ error: 'Email service niet beschikbaar. Controleer server configuratie.' });
    }

    const contacts = JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf8'));
    const selectedContacts = contacts.filter(c => contactIds.includes(c.id));

    if (selectedContacts.length === 0) {
      return res.status(400).json({ error: 'Geen geldige contacten gevonden' });
    }

    // Create filename with date
    const dateStr = new Date().toISOString().split('T')[0];
    const trainingName = (summary?.training || 'training').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    const baseFilename = `AWL_${trainingName}_${dateStr}`;

    // Send email to each contact
    const results = [];
    for (const contact of selectedContacts) {
      try {
        await graphClient.sendEmail({
          to: contact.email,
          subject: `Aanwezigheidslijst: ${summary?.training || 'Training'} - ${dateStr}`,
          htmlBody: `
            <p>Beste ${contact.name},</p>

            <p>Hierbij de aanwezigheidslijst van de training.</p>

            <p><strong>Samenvatting:</strong></p>
            <ul>
              <li>Training: ${summary?.training || 'Onbekend'}</li>
              <li>Totaal deelnemers: ${summary?.totaal || 0}</li>
              <li>Aanwezig: ${summary?.aanwezig || 0}</li>
            </ul>

            ${customMessage ? `<p>${customMessage}</p>` : ''}

            <p>In bijlage vind je:</p>
            <ul>
              <li>De ingescande aanwezigheidslijst (PDF)</li>
              <li>Een digitale versie van de aanwezigheden (CSV)</li>
            </ul>

            <p>Met vriendelijke groeten,</p>
            <p>${process.env.SENDER_NAME || 'Steff'}<br>The House of Coaching</p>
          `,
          attachments: [
            {
              filename: `${baseFilename}.pdf`,
              content: Buffer.from(pdf, 'base64'),
              contentType: 'application/pdf'
            },
            {
              filename: `${baseFilename}.csv`,
              content: csv,
              contentType: 'text/csv'
            }
          ]
        });

        results.push({ contact: contact.name, success: true });
      } catch (emailError) {
        console.error(`Email error for ${contact.email}:`, emailError);
        results.push({ contact: contact.name, success: false, error: emailError.message });
      }
    }

    const allSuccess = results.every(r => r.success);
    res.json({
      success: allSuccess,
      results,
      message: allSuccess
        ? `Email verstuurd naar ${results.length} contacten`
        : 'Sommige emails konden niet verstuurd worden'
    });

  } catch (error) {
    console.error('Send error:', error);
    res.status(500).json({ error: 'Kon email niet versturen: ' + error.message });
  }
});

// ============ MOUNT ROUTER ============

// Mount API router with or without base path
if (BASE_PATH) {
  app.use(BASE_PATH, apiRouter);
} else {
  app.use(apiRouter);
}

// ============ START SERVER ============

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║     AWL Scanner - Aanwezigheidslijst      ║
  ║         Scanner voor Trainers             ║
  ╠═══════════════════════════════════════════╣
  ║  Server draait op: http://localhost:${PORT}  ║
  ╚═══════════════════════════════════════════╝
  `);
  console.log('Environment:', {
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    graphConfigured: !!graphClient,
    port: PORT,
    basePath: BASE_PATH || '/'
  });
});

