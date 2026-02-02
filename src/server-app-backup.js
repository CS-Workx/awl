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
const nodemailer = require('nodemailer');
const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// File upload config
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
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

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// ============ CONTACTS API ============

app.get('/api/contacts', (req, res) => {
  try {
    const contacts = JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf8'));
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Kon contacten niet laden' });
  }
});

app.post('/api/contacts', (req, res) => {
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

app.delete('/api/contacts/:id', (req, res) => {
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

// ============ SCAN & PROCESS API ============

app.post('/api/scan', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Geen afbeelding ontvangen' });
    }

    console.log('Processing image...');
    console.log('File info:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // 1. Convert image to JPEG format (compatible with Gemini)
    let processedImageBuffer;
    try {
      processedImageBuffer = await sharp(req.file.buffer)
        .jpeg({ quality: 90 })
        .toBuffer();
      console.log('Image converted to JPEG, size:', processedImageBuffer.length);
    } catch (conversionError) {
      console.error('Image conversion error:', conversionError);
      return res.status(500).json({ error: 'Kon afbeelding niet verwerken' });
    }

    // 2. Process image with Gemini Vision
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

    console.log('Sending request to Gemini API...');
    let result;
    try {
      result = await model.generateContent([prompt, imageData]);
      console.log('Gemini API response received');
    } catch (geminiError) {
      console.error('Gemini API error:', geminiError);
      return res.status(500).json({ 
        error: 'Fout bij AI verwerking: ' + geminiError.message,
        details: geminiError.toString()
      });
    }

    const responseText = result.response.text();
    console.log('Response text length:', responseText.length);

    // Parse the JSON from Gemini's response
    let parsedData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Geen JSON gevonden in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return res.status(500).json({
        error: 'Kon de aanwezigheidslijst niet correct lezen',
        raw: responseText
      });
    }

    // 2. Generate CSV
    const csvRows = ['Naam,Bedrijf,Email,Aanwezig,Handtekening'];
    if (parsedData.deelnemers) {
      parsedData.deelnemers.forEach(d => {
        csvRows.push(`"${d.naam || ''}","${d.bedrijf || ''}","${d.email || ''}","${d.aanwezig ? 'Ja' : 'Nee'}","${d.handtekening ? 'Ja' : 'Nee'}"`);
      });
    }
    const csvContent = csvRows.join('\n');

    // 3. Create PDF from image
    const pdfDoc = await PDFDocument.create();

    // Convert image to PNG if needed and embed
    const pngBuffer = await sharp(req.file.buffer)
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

    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

    // 4. Return all data
    res.json({
      success: true,
      data: parsedData,
      csv: csvContent,
      pdf: pdfBase64,
      summary: {
        totaal: parsedData.deelnemers?.length || 0,
        aanwezig: parsedData.deelnemers?.filter(d => d.aanwezig).length || 0,
        training: parsedData.training_info?.titel || 'Onbekend'
      }
    });

  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ error: 'Er ging iets mis bij het verwerken: ' + error.message });
  }
});

// ============ SEND EMAIL API ============

app.post('/api/send', async (req, res) => {
  try {
    const { contactIds, csv, pdf, summary, customMessage } = req.body;

    if (!contactIds || contactIds.length === 0) {
      return res.status(400).json({ error: 'Selecteer minimaal één contactpersoon' });
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
        await transporter.sendMail({
          from: `"Steff - The House of Coaching" <${process.env.SMTP_USER}>`,
          to: contact.email,
          subject: `Aanwezigheidslijst: ${summary?.training || 'Training'} - ${dateStr}`,
          html: `
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
            <p>Steff<br>The House of Coaching</p>
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
});
