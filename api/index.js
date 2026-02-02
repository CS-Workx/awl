/**
 * Vercel Serverless Function - Express App Wrapper
 * This wraps the existing Express app for Vercel deployment
 */
const app = require('../src/server-app');

module.exports = app;
