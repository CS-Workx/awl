# Contributing to AWL Scanner

Thank you for your interest in contributing!

## How to Contribute

1. Fork the repository on Codeberg
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test thoroughly
5. Commit with clear messages
6. Push and create a Pull Request

## Development Setup

```bash
cd awl
npm install
cp .env.example .env
# Fill in your API keys in .env
npm run dev
```

## Code Standards

- Use clear, descriptive variable names
- Follow existing code style
- Add comments for complex logic
- Keep commits focused and atomic

## Testing

Before submitting:
- Test image upload and processing
- Verify email sending works
- Check PWA installation on mobile
- Run `npm audit` for security issues

## Areas for Contribution

- Additional OCR improvements
- Better error handling
- UI/UX enhancements
- Multi-language support
- Alternative AI providers support

## Questions?

Open an issue or contact: steff@thehouseofcoaching.com
