/**
 * Syntra Bizz Offer Generator - Frontend Application
 * 
 * Copyright (c) 2026 Steff Vanhaverbeke for Syntra Bizz
 * Licensed under the MIT License - see LICENSE file for details
 */

// Global state
let crmData = {};
let trainingData = {};
let offerData = {};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadTemplates();
});

function initializeEventListeners() {
    // Template upload
    document.getElementById('uploadTemplateBtn').addEventListener('click', () => {
        document.getElementById('templateUpload').click();
    });
    document.getElementById('templateUpload').addEventListener('change', handleTemplateUpload);
    
    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Screenshot upload
    const screenshotInput = document.getElementById('screenshotInput');
    const uploadArea = document.getElementById('screenshotUploadArea');
    const selectFileBtn = document.getElementById('selectFileBtn');

    screenshotInput.addEventListener('change', handleScreenshotSelect);

    // Button click
    selectFileBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent bubbling to uploadArea
        screenshotInput.click();
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleScreenshotUpload(files[0]);
        }
    });

    // Upload area click (only if not clicking button)
    uploadArea.addEventListener('click', (e) => {
        // Don't trigger if clicking the button
        if (e.target.id !== 'selectFileBtn' && !e.target.closest('#selectFileBtn')) {
            screenshotInput.click();
        }
    });

    // Training URL extraction
    document.getElementById('extractTrainingBtn').addEventListener('click', handleTrainingExtraction);
    
    // Training URL viewer (Playwright + Vision)
    document.getElementById('viewTrainingUrlBtn').addEventListener('click', handleViewTrainingUrl);

    // Training document upload
    const trainingDocInput = document.getElementById('trainingDocInput');
    const trainingDocUploadArea = document.getElementById('trainingDocUploadArea');
    const selectTrainingDocBtn = document.getElementById('selectTrainingDocBtn');

    trainingDocInput.addEventListener('change', handleTrainingDocumentSelect);
    selectTrainingDocBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        trainingDocInput.click();
    });

    trainingDocUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        trainingDocUploadArea.classList.add('drag-over');
    });

    trainingDocUploadArea.addEventListener('dragleave', () => {
        trainingDocUploadArea.classList.remove('drag-over');
    });

    trainingDocUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        trainingDocUploadArea.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleTrainingDocumentUpload(files[0]);
        }
    });

    trainingDocUploadArea.addEventListener('click', (e) => {
        if (e.target.id !== 'selectTrainingDocBtn' && !e.target.closest('#selectTrainingDocBtn')) {
            trainingDocInput.click();
        }
    });

    // Browser automation
    document.getElementById('openCrmBtn').addEventListener('click', handleOpenCRM);
    document.getElementById('navigateTicketBtn').addEventListener('click', handleNavigateTicket);
    document.getElementById('captureBtn').addEventListener('click', handleCaptureBrowser);
    document.getElementById('closeBrowserBtn').addEventListener('click', handleCloseBrowser);

    // Generate offer
    document.getElementById('generateOfferBtn').addEventListener('click', handleGenerateOffer);

    // Download DOCX
    document.getElementById('downloadDocxBtn').addEventListener('click', handleDownloadDocx);
    
    // Initialize copy buttons (will be attached after offer is generated)
    initializeCopyButtons();
    
    // Initialize textarea auto-resize (will be attached after offer is generated)
    initializeTextareaResize();
}

// Screenshot handling
function handleScreenshotSelect(event) {
    console.log('[UPLOAD] File input changed');
    const file = event.target.files[0];
    if (file) {
        console.log('[UPLOAD] File selected:', file.name, file.size, 'bytes');
        handleScreenshotUpload(file);
    } else {
        console.log('[UPLOAD] No file selected');
    }
}

async function handleScreenshotUpload(file) {
    console.log('[UPLOAD] Starting upload for:', file.name);
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        console.error('[UPLOAD] Invalid file type:', file.type);
        alert('Selecteer een geldig afbeeldingsbestand');
        return;
    }

    console.log('[UPLOAD] File type valid:', file.type);

    // Show preview immediately
    const previewImage = document.getElementById('previewImage');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const uploadPreview = document.getElementById('uploadPreview');
    const previewFileName = document.getElementById('previewFileName');
    const previewStatus = document.getElementById('previewStatus');

    console.log('[UPLOAD] Showing preview...');

    // Read file for preview
    const reader = new FileReader();
    reader.onload = function(e) {
        console.log('[UPLOAD] Preview loaded, data length:', e.target.result.length);
        previewImage.src = e.target.result;
        previewFileName.textContent = file.name + ` (${(file.size / 1024).toFixed(1)} KB)`;
        uploadPlaceholder.style.display = 'none';
        uploadPreview.style.display = 'block';
        previewStatus.textContent = 'Bezig met verwerken...';
        previewStatus.className = 'status-text processing';
    };
    reader.readAsDataURL(file);

    // Show loading
    document.getElementById('crmLoading').style.display = 'block';
    document.getElementById('crmDataPreview').style.display = 'none';

    try {
        console.log('[UPLOAD] Converting to base64...');
        // Convert to base64
        const base64 = await fileToBase64(file);
        console.log('[UPLOAD] Base64 length:', base64.length);

        // Update status
        previewStatus.textContent = 'AI analyseert afbeelding...';

        console.log('[UPLOAD] Calling API...');
        // Extract CRM data
        const extractedData = await API.extractCRM(base64);
        console.log('[UPLOAD] API returned data:', extractedData);
        crmData = extractedData;

        // Update status
        previewStatus.textContent = '✓ Gegevens succesvol geëxtraheerd';
        previewStatus.className = 'status-text success';

        // Display extracted data
        displayCRMData(extractedData);

        // Hide loading
        document.getElementById('crmLoading').style.display = 'none';
        document.getElementById('crmDataPreview').style.display = 'block';

        console.log('[UPLOAD] Upload complete!');

    } catch (error) {
        console.error('[UPLOAD] Error:', error);
        previewStatus.textContent = '✗ Fout bij verwerken: ' + error.message;
        previewStatus.className = 'status-text error';
        alert('Fout bij het extraheren van CRM gegevens: ' + error.message);
        document.getElementById('crmLoading').style.display = 'none';
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function displayCRMData(data) {
    const fields = [
        'onderwerp', 'potentiele_klant', 'type', 'primaire_contact',
        'extra_contact', 'beschrijving', 'commerciele_container',
        'sales_stage', 'waarschijnlijkheid', 'gewogen_omzet',
        'weighted_margin', 'sluitingsdatum', 'datum_offerte',
        'project_manager_name', 'project_manager_phone', 'project_manager_email',
        'advisor_name', 'advisor_phone', 'advisor_email',
        'client_company_address', 'client_vat_number'
    ];

    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.value = data[field] || '';
        }
    });
}

function getCRMDataFromForm() {
    const fields = [
        'onderwerp', 'potentiele_klant', 'type', 'primaire_contact',
        'extra_contact', 'beschrijving', 'commerciele_container',
        'sales_stage', 'waarschijnlijkheid', 'gewogen_omzet',
        'weighted_margin', 'sluitingsdatum', 'datum_offerte',
        'project_manager_name', 'project_manager_phone', 'project_manager_email',
        'advisor_name', 'advisor_phone', 'advisor_email',
        'client_company_address', 'client_vat_number'
    ];

    const data = {};
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            data[field] = element.value || null;
        }
    });

    return data;
}

// Training URL handling
async function handleTrainingExtraction() {
    const url = document.getElementById('trainingUrl').value.trim();

    if (!url) {
        alert('Voer een training URL in');
        return;
    }

    document.getElementById('trainingDocInput').value = '';
    document.getElementById('uploadedFileName').style.display = 'none';

    document.getElementById('trainingLoading').style.display = 'block';
    document.getElementById('trainingDataPreview').style.display = 'none';

    try {
        const extractedData = await API.extractTraining(url);
        trainingData = extractedData;

        displayTrainingData(extractedData);

        document.getElementById('trainingLoading').style.display = 'none';
        document.getElementById('trainingDataPreview').style.display = 'block';

    } catch (error) {
        console.error('Error extracting training data:', error);
        alert('Fout bij het ophalen van opleidingsgegevens: ' + error.message);
        document.getElementById('trainingLoading').style.display = 'none';
    }
}

async function handleViewTrainingUrl() {
    const url = document.getElementById('trainingUrl').value.trim();

    if (!url) {
        alert('Voer een training URL in');
        return;
    }

    document.getElementById('trainingDocInput').value = '';
    document.getElementById('uploadedFileName').style.display = 'none';

    document.getElementById('trainingLoading').style.display = 'block';
    document.getElementById('trainingDataPreview').style.display = 'none';

    try {
        const extractedData = await API.viewTrainingUrl(url);
        trainingData = extractedData;

        displayTrainingData(extractedData);

        document.getElementById('trainingLoading').style.display = 'none';
        document.getElementById('trainingDataPreview').style.display = 'block';

        alert('Training gegevens succesvol geëxtraheerd via Viewer!');

    } catch (error) {
        console.error('Error viewing training URL:', error);
        alert('Fout bij het ophalen van training gegevens: ' + error.message);
        document.getElementById('trainingLoading').style.display = 'none';
    }
}

function handleTrainingDocumentSelect(event) {
    const file = event.target.files[0];
    if (file) {
        handleTrainingDocumentUpload(file);
    }
}

async function handleTrainingDocumentUpload(file) {
    const validTypes = ['.pdf', '.docx', '.doc', '.txt'];
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validTypes.includes(fileExt)) {
        alert('Ongeldig bestandstype. Gebruik PDF, Word of tekst.');
        return;
    }
    
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        alert('Bestand is te groot. Maximum is 10MB.');
        return;
    }
    
    document.getElementById('trainingUrl').value = '';
    
    showUploadedFileName(file.name);
    
    document.getElementById('trainingLoading').style.display = 'block';
    document.getElementById('trainingDataPreview').style.display = 'none';
    
    try {
        const extractedData = await API.extractTrainingDocument(file);
        trainingData = extractedData;
        
        displayTrainingData(extractedData);
        
        document.getElementById('trainingLoading').style.display = 'none';
        document.getElementById('trainingDataPreview').style.display = 'block';
        
    } catch (error) {
        console.error('Error extracting document:', error);
        alert('Fout bij het verwerken van document: ' + error.message);
        document.getElementById('trainingLoading').style.display = 'none';
    }
}

function showUploadedFileName(filename) {
    const fileNameEl = document.getElementById('uploadedFileName');
    fileNameEl.innerHTML = `
        <span>📄 ${filename}</span>
        <button type="button" onclick="clearTrainingDocument()">✕</button>
    `;
    fileNameEl.style.display = 'flex';
}

function clearTrainingDocument() {
    document.getElementById('trainingDocInput').value = '';
    document.getElementById('uploadedFileName').style.display = 'none';
    document.getElementById('trainingDataPreview').style.display = 'none';
}

function displayTrainingData(data) {
    document.getElementById('training_title').value = data.title || '';
    document.getElementById('training_duration').value = data.duration || '';
    document.getElementById('training_price').value = data.price || '';
    document.getElementById('training_target_audience').value = data.target_audience || '';
    document.getElementById('training_learning_objectives').value = data.learning_objectives || '';
    document.getElementById('training_program_outline').value = data.program_outline || '';
    document.getElementById('training_trainer_info').value = data.trainer_info || '';
}

function getTrainingDataFromForm() {
    return {
        title: document.getElementById('training_title').value || null,
        duration: document.getElementById('training_duration').value || null,
        price: document.getElementById('training_price').value || null,
        target_audience: document.getElementById('training_target_audience').value || null,
        learning_objectives: document.getElementById('training_learning_objectives').value || null,
        program_outline: document.getElementById('training_program_outline').value || null,
        trainer_info: document.getElementById('training_trainer_info').value || null,
        url: document.getElementById('trainingUrl').value || null
    };
}

// Intake data handling
function getIntakeDataFromForm() {
    const participants = document.getElementById('number_of_participants').value;
    
    return {
        number_of_participants: participants ? parseInt(participants) : null,
        client_goals: document.getElementById('client_goals').value || null,
        specific_requirements: document.getElementById('specific_requirements').value || null,
        preferred_dates: document.getElementById('preferred_dates').value || null,
        additional_notes: document.getElementById('additional_notes').value || null
    };
}

// Generate offer
async function handleGenerateOffer() {
    // Collect all data from forms
    const currentCrmData = getCRMDataFromForm();
    const currentTrainingData = getTrainingDataFromForm();
    const currentIntakeData = getIntakeDataFromForm();

    // Validate required data
    if (!currentCrmData.potentiele_klant) {
        alert('CRM gegevens zijn verplicht. Upload een screenshot of vul de gegevens handmatig in.');
        return;
    }

    // Show loading
    document.getElementById('generateLoading').style.display = 'block';
    document.getElementById('offerPreview').style.display = 'none';

    try {
        // Generate offer
        const generatedOffer = await API.generateOffer({
            crm_data: currentCrmData,
            training_data: currentTrainingData,
            intake_data: currentIntakeData
        });

        offerData = generatedOffer;

        // Display offer preview
        displayOfferPreview(generatedOffer);

        // Hide loading and show preview
        document.getElementById('generateLoading').style.display = 'none';
        document.getElementById('offerPreview').style.display = 'block';

        // Scroll to preview
        document.getElementById('offerPreview').scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error('Error generating offer:', error);
        alert('Fout bij het genereren van de offerte: ' + error.message);
        document.getElementById('generateLoading').style.display = 'none';
    }
}

function displayOfferPreview(offer) {
    const fields = [
        'introduction', 'training_objectives', 'program_overview',
        'practical_arrangements', 'investment', 'next_steps'
    ];
    
    fields.forEach(field => {
        const textarea = document.getElementById(`edit_${field}`);
        if (textarea) {
            textarea.value = offer[field] || '';
            autoResizeTextarea(textarea);
        }
    });
}

// Download DOCX
async function handleDownloadDocx() {
    // Show loading
    document.getElementById('downloadLoading').style.display = 'block';

    try {
        // Get current data (including edited offer content)
        const currentOfferData = getOfferDataFromForm();
        const currentCrmData = getCRMDataFromForm();
        const currentTrainingData = getTrainingDataFromForm();
        const currentIntakeData = getIntakeDataFromForm();
        
        // Get selected template
        const templateSelect = document.getElementById('templateSelect');
        const templateId = templateSelect.value;

        // Create DOCX with selected template
        const result = await API.createDOCX(
            currentOfferData,
            currentCrmData,
            currentTrainingData,
            currentIntakeData,
            templateId !== 'default' ? templateId : null
        );

        // Download file
        const blob = await API.downloadFile(result.file_id);
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Hide loading
        document.getElementById('downloadLoading').style.display = 'none';

        alert('Offerte succesvol gedownload!');

    } catch (error) {
        console.error('Error downloading DOCX:', error);
        alert('Fout bij het downloaden van de offerte: ' + error.message);
        document.getElementById('downloadLoading').style.display = 'none';
    }
}

// Template management functions
async function loadTemplates() {
    try {
        const templates = await API.listTemplates();
        const select = document.getElementById('templateSelect');
        
        // Clear existing options except default
        select.innerHTML = '<option value="default">Standaard Syntra Bizz Template</option>';
        
        // Add uploaded templates
        templates.forEach(tpl => {
            if (tpl.id !== 'default') {
                const option = document.createElement('option');
                option.value = tpl.id;
                option.textContent = tpl.name;
                select.appendChild(option);
            }
        });
    } catch (error) {
        console.error('Error loading templates:', error);
    }
}

async function handleTemplateUpload(event) {
    const file = event.target.files[0];
    if (!file || !file.name.endsWith('.docx')) {
        alert('Selecteer een geldig DOCX bestand');
        return;
    }
    
    try {
        const result = await API.uploadTemplate(file);
        
        // Add to dropdown
        const select = document.getElementById('templateSelect');
        const option = document.createElement('option');
        option.value = result.template_id;
        option.textContent = file.name;
        option.selected = true;
        select.appendChild(option);
        
        alert('Template succesvol geüpload!');
    } catch (error) {
        console.error('Error uploading template:', error);
        alert('Fout bij uploaden template: ' + error.message);
    }
}

// Tab switching
function switchTab(tabName) {
    // Update tab buttons
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update tab content
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        if (content.id === `${tabName}-tab`) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

// Browser automation handlers
async function handleOpenCRM() {
    const crmUrl = document.getElementById('crmLoginUrl').value.trim();

    if (!crmUrl) {
        alert('Voer een CRM login URL in');
        return;
    }

    try {
        const result = await API.openCRMBrowser(crmUrl);
        
        // Show browser status
        document.getElementById('browserStatus').style.display = 'block';
        document.getElementById('ticketUrlGroup').style.display = 'block';
        document.getElementById('browserActions').style.display = 'flex';

        alert(result.message + '\n\nLogin in de geopende browser en navigeer naar uw ticket.');

    } catch (error) {
        console.error('Error opening CRM:', error);
        alert('Fout bij het openen van CRM: ' + error.message);
    }
}

async function handleNavigateTicket() {
    const ticketUrl = document.getElementById('ticketUrl').value.trim();

    if (!ticketUrl) {
        alert('Voer een ticket URL in');
        return;
    }

    try {
        const result = await API.navigateToTicket(ticketUrl);
        alert('Succesvol genavigeerd naar ticket');

    } catch (error) {
        console.error('Error navigating to ticket:', error);
        alert('Fout bij navigeren: ' + error.message);
    }
}

async function handleCaptureBrowser() {
    try {
        // Show loading
        document.getElementById('crmLoading').style.display = 'block';
        document.getElementById('crmDataPreview').style.display = 'none';

        // Capture and extract
        const extractedData = await API.captureBrowserScreenshot();
        crmData = extractedData;

        // Display extracted data
        displayCRMData(extractedData);

        // Hide loading
        document.getElementById('crmLoading').style.display = 'none';
        document.getElementById('crmDataPreview').style.display = 'block';

        alert('CRM gegevens succesvol geëxtraheerd!');

    } catch (error) {
        console.error('Error capturing browser:', error);
        alert('Fout bij het vastleggen van CRM gegevens: ' + error.message);
        document.getElementById('crmLoading').style.display = 'none';
    }
}

async function handleCloseBrowser() {
    try {
        await API.closeBrowser();
        
        // Hide browser controls
        document.getElementById('browserStatus').style.display = 'none';
        document.getElementById('ticketUrlGroup').style.display = 'none';
        document.getElementById('browserActions').style.display = 'none';

        alert('Browser gesloten');

    } catch (error) {
        console.error('Error closing browser:', error);
        alert('Fout bij het sluiten van de browser: ' + error.message);
    }
}

// Copy to clipboard functionality
function initializeCopyButtons() {
    document.querySelectorAll('.btn-copy-markdown').forEach(btn => {
        btn.addEventListener('click', handleCopyMarkdown);
    });
}

async function handleCopyMarkdown(event) {
    const button = event.currentTarget;
    const fieldName = button.dataset.field;
    const textarea = document.getElementById(`edit_${fieldName}`);
    
    if (!textarea) {
        console.error('Textarea not found for field:', fieldName);
        return;
    }
    
    const content = textarea.value;
    
    try {
        await navigator.clipboard.writeText(content);
        showCopyFeedback(button, true);
    } catch (err) {
        console.warn('Clipboard API failed, trying fallback:', err);
        fallbackCopyTextToClipboard(content, button);
    }
}

function fallbackCopyTextToClipboard(text, button) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        showCopyFeedback(button, successful);
    } catch (err) {
        console.error('Fallback copy failed:', err);
        showCopyFeedback(button, false);
    }
    
    document.body.removeChild(textArea);
}

function showCopyFeedback(button, success) {
    const originalHTML = button.innerHTML;
    
    if (success) {
        button.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg> Copied!`;
        button.classList.add('copied');
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('copied');
        }, 2000);
    } else {
        alert('Kopiëren mislukt. Probeer handmatig te selecteren en kopiëren.');
    }
}

// Auto-resize textarea functionality
function initializeTextareaResize() {
    document.querySelectorAll('.offer-edit-field').forEach(textarea => {
        textarea.addEventListener('input', () => autoResizeTextarea(textarea));
    });
}

function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

// Get offer data from edited form fields
function getOfferDataFromForm() {
    return {
        introduction: document.getElementById('edit_introduction')?.value || '',
        training_objectives: document.getElementById('edit_training_objectives')?.value || '',
        program_overview: document.getElementById('edit_program_overview')?.value || '',
        practical_arrangements: document.getElementById('edit_practical_arrangements')?.value || '',
        investment: document.getElementById('edit_investment')?.value || '',
        next_steps: document.getElementById('edit_next_steps')?.value || ''
    };
}

