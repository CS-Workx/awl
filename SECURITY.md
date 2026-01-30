# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please:

1. **DO NOT** open a public issue
2. Email: steff@thehouseofcoaching.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact

You should receive a response within 48 hours.

## Security Best Practices for Self-Hosting

- Never commit `.env` files with real credentials
- Use app-specific passwords for SMTP (not your main password)
- Run behind HTTPS with valid SSL certificates
- Keep dependencies updated: `npm audit` regularly
- Restrict API keys to necessary scopes only
- Use firewall rules to limit access to your VPS
