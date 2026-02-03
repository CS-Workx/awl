/**
 * Syntra Bizz Offer Generator - API Client
 * 
 * Copyright (c) 2026 Steff Vanhaverbeke for Syntra Bizz
 * Licensed under the MIT License - see LICENSE file for details
 */

// Detect if running in production (HTTPS domain) or local development
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8765/api'
    : `${window.location.protocol}//${window.location.host}/offer-builder/api`;

class API {
    static async extractCRM(imageBase64) {
        const response = await fetch(`${API_BASE}/extract-crm`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image_base64: imageBase64 })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to extract CRM data');
        }

        return await response.json();
    }

    static async extractTraining(url) {
        const response = await fetch(`${API_BASE}/extract-training`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to extract training data');
        }

        return await response.json();
    }

    static async extractTrainingDocument(file) {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${API_BASE}/extract-training-document`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to extract training document');
        }

        return await response.json();
    }

    static async generateOffer(data) {
        const response = await fetch(`${API_BASE}/generate-offer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to generate offer');
        }

        return await response.json();
    }

    static async createDOCX(offerData, crmData, trainingData, intakeData, templateId = null) {
        const url = templateId ? `${API_BASE}/create-docx?template_id=${templateId}` : `${API_BASE}/create-docx`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                offer_data: offerData,
                crm_data: crmData,
                training_data: trainingData,
                intake_data: intakeData
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to create DOCX');
        }

        return await response.json();
    }

    static async downloadFile(fileId) {
        const response = await fetch(`${API_BASE}/download/${fileId}`);

        if (!response.ok) {
            throw new Error('Failed to download file');
        }

        const blob = await response.blob();
        return blob;
    }

    // Template management endpoints
    static async uploadTemplate(file) {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${API_BASE}/upload-template`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Template upload failed');
        }

        return await response.json();
    }

    static async listTemplates() {
        const response = await fetch(`${API_BASE}/templates`);
        
        if (!response.ok) {
            throw new Error('Failed to load templates');
        }

        return await response.json();
    }

    static async deleteTemplate(templateId) {
        const response = await fetch(`${API_BASE}/templates/${templateId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to delete template');
        }

        return await response.json();
    }

    // Browser automation endpoints
    static async openCRMBrowser(crmUrl) {
        const response = await fetch(`${API_BASE}/browser/open-crm`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ crm_url: crmUrl })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to open CRM browser');
        }

        return await response.json();
    }

    static async navigateToTicket(ticketUrl) {
        const response = await fetch(`${API_BASE}/browser/navigate-ticket`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ticket_url: ticketUrl })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to navigate to ticket');
        }

        return await response.json();
    }

    static async captureBrowserScreenshot() {
        const response = await fetch(`${API_BASE}/browser/capture-screenshot`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to capture screenshot');
        }

        return await response.json();
    }

    static async getBrowserStatus() {
        const response = await fetch(`${API_BASE}/browser/status`);

        if (!response.ok) {
            throw new Error('Failed to get browser status');
        }

        return await response.json();
    }

    static async closeBrowser() {
        const response = await fetch(`${API_BASE}/browser/close`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to close browser');
        }

        return await response.json();
    }

    static async viewTrainingUrl(url) {
        const response = await fetch(`${API_BASE}/browser/open-training-url`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to view training URL');
        }

        return await response.json();
    }
}

