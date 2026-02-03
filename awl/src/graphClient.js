/**
 * AWL Scanner - Microsoft Graph API Client voor Email Sending
 * Copyright (C) 2026 Steff Van Haverbeke / The House of Coaching
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

const msal = require('@azure/msal-node');
const axios = require('axios');

class GraphEmailClient {
  constructor() {
    this.clientId = process.env.MICROSOFT_CLIENT_ID;
    this.clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
    this.tenantId = process.env.MICROSOFT_TENANT_ID;
    this.senderEmail = process.env.SENDER_EMAIL;
    this.senderName = process.env.SENDER_NAME || 'AWL Scanner';
    
    // Validate config
    if (!this.clientId || !this.clientSecret || !this.tenantId) {
      throw new Error('Missing Microsoft Graph credentials in .env file');
    }
    
    // Initialize MSAL confidential client
    this.msalConfig = {
      auth: {
        clientId: this.clientId,
        authority: `https://login.microsoftonline.com/${this.tenantId}`,
        clientSecret: this.clientSecret
      }
    };
    
    this.msalClient = new msal.ConfidentialClientApplication(this.msalConfig);
    this.graphApiUrl = 'https://graph.microsoft.com/v1.0';
  }
  
  /**
   * Acquire access token via Client Credentials Flow
   */
  async getAccessToken() {
    try {
      const tokenRequest = {
        scopes: ['https://graph.microsoft.com/.default']
      };
      
      const response = await this.msalClient.acquireTokenByClientCredential(tokenRequest);
      
      if (!response || !response.accessToken) {
        throw new Error('Failed to acquire access token');
      }
      
      return response.accessToken;
    } catch (error) {
      console.error('Token acquisition error:', error);
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }
  
  /**
   * Send email with attachments via Graph API
   * 
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email
   * @param {string} options.subject - Email subject
   * @param {string} options.htmlBody - HTML body content
   * @param {Array} options.attachments - Array of {filename, content, contentType}
   *   - content can be Buffer or base64 string
   */
  async sendEmail({ to, subject, htmlBody, attachments = [] }) {
    try {
      const token = await this.getAccessToken();
      
      // Build attachments array
      const graphAttachments = attachments.map(att => {
        // Convert Buffer to base64 if needed
        let contentBytes;
        if (Buffer.isBuffer(att.content)) {
          contentBytes = att.content.toString('base64');
        } else if (typeof att.content === 'string') {
          // Assume already base64 or convert
          contentBytes = Buffer.from(att.content).toString('base64');
        } else {
          throw new Error(`Invalid attachment content type for ${att.filename}`);
        }
        
        return {
          '@odata.type': '#microsoft.graph.fileAttachment',
          name: att.filename,
          contentType: att.contentType || 'application/octet-stream',
          contentBytes: contentBytes
        };
      });
      
      // Build email message
      const message = {
        message: {
          subject: subject,
          body: {
            contentType: 'HTML',
            content: htmlBody
          },
          toRecipients: [
            {
              emailAddress: {
                address: to
              }
            }
          ],
          from: {
            emailAddress: {
              address: this.senderEmail,
              name: this.senderName
            }
          },
          attachments: graphAttachments
        },
        saveToSentItems: true
      };
      
      // Send via Graph API
      const endpoint = `${this.graphApiUrl}/users/${this.senderEmail}/sendMail`;
      
      const response = await axios.post(endpoint, message, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      
      console.log(`✓ Email sent successfully to ${to}`);
      return { success: true, to };
      
    } catch (error) {
      console.error(`✗ Email sending failed to ${to}:`, error.response?.data || error.message);
      
      // Better error messages
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Check Azure AD app permissions and credentials.');
      } else if (error.response?.status === 403) {
        throw new Error('Forbidden. Ensure Mail.Send permission is granted and admin consent is given.');
      } else if (error.response?.status === 404) {
        throw new Error(`Sender email ${this.senderEmail} not found. Verify SENDER_EMAIL in .env.`);
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error.message || 'Graph API error');
      } else {
        throw new Error(error.message);
      }
    }
  }
}

module.exports = GraphEmailClient;
