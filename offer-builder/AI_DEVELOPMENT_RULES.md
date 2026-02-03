# AI Development Rules - Syntra Bizz Offer Generator

This document provides guidelines for AI development agents working on this project. Following these rules ensures consistency, maintainability, and a clean project structure.

---

## Project Organization Principles

### 1. Keep Root Directory Clean

**Maximum**: 10-12 essential files in the project root.

**Allowed in root:**
- `README.md` - Primary project documentation and quick start guide
- `LICENSE` - Open source license
- `.gitignore` - Git ignore rules
- `.env` - Environment configuration (gitignored, user-specific)
- `AI_DEVELOPMENT_RULES.md` - This file
- Core directories: `backend/`, `frontend/`, `doc/`, `scripts/`, `templates/`, `generated_offers/`, `archive/`, `venv/`

**NOT allowed in root:**
- Loose scripts (use `/scripts/` subdirectories)
- Multiple documentation files (use `/doc/`)
- Test files (use `/tests/` or alongside code)
- Temporary files
- Build artifacts
- Additional configuration files (consolidate or move to appropriate subdirectory)

### 2. Use Subdirectories for Organization

All files should be organized into logical subdirectories:

- **`/scripts/`** - All automation scripts
  - `/scripts/install/` - Installation scripts
  - `/scripts/launchers/` - Start/stop launcher scripts
  - `/scripts/utils/` - Utility and helper scripts
  
- **`/doc/`** - All documentation
  - User guides, technical docs, API references
  - Keep README.md in root as primary entry point
  
- **`/backend/`** - Backend code
  - `/backend/services/` - Service layer
  - `/backend/models/` - Data models
  
- **`/frontend/`** - Frontend code
  - `/frontend/js/` - JavaScript modules
  - `/frontend/css/` - Stylesheets
  
- **`/templates/`** - DOCX templates
  - Default templates
  - `/templates/user_uploads/` - User-uploaded templates
  
- **`/generated_offers/`** - Generated output files (gitignored)

- **`/tests/`** - Test files (if/when added)

### 3. Document All Structural Changes

When reorganizing files:
1. Update all path references in code
2. Update all documentation
3. Update configuration files
4. Test functionality after changes
5. Document changes in commit message
6. Consider creating migration guide for breaking changes

---

## Code Organization Rules

### Backend Structure

**Services** (`backend/services/`):
- One service per file
- Clear, descriptive naming (e.g., `ocr_service.py`, `browser_service.py`)
- Each service handles one domain of functionality
- Services are initialized in `app.py`

**Models** (`backend/models/`):
- Pydantic models for request/response schemas
- Data validation logic
- Type definitions

**Main Application** (`backend/app.py`):
- FastAPI route definitions
- Service initialization
- Middleware configuration
- Keep business logic in services, not routes

### Frontend Structure

**JavaScript Modules** (`frontend/js/`):
- `app.js` - Main application logic and state management
- `api.js` - API communication wrapper
- Additional modules as needed (keep cohesive and focused)

**Stylesheets** (`frontend/css/`):
- `styles.css` - Main stylesheet
- Additional stylesheets if needed (consider splitting by component)

**No loose scripts in root!**
- All JavaScript should be in `/frontend/js/`
- All styles should be in `/frontend/css/`

---

## Documentation Standards

### User-Facing Documentation

**Location**: `/doc/` directory

**Required documentation:**
- Setup/installation guide
- Usage tutorial
- Best practices
- API reference
- Troubleshooting

**Format:**
- Markdown (.md)
- Clear headings and structure
- Code examples where appropriate
- Screenshots/diagrams when helpful

### Technical Documentation

**Location**: Inline with code or in `/doc/` for architecture docs

**Guidelines:**
- Document complex algorithms
- Explain non-obvious decisions
- Include type hints in Python
- JSDoc comments for JavaScript functions
- README.md in subdirectories if needed

### README.md (Root)

**Purpose**: Primary entry point for users

**Keep concise:**
- Quick start guide
- Installation instructions (reference `/scripts/install/`)
- Basic usage
- Link to `/doc/` for detailed documentation
- Reference to `AI_DEVELOPMENT_RULES.md`

**Update when:**
- Project structure changes
- New features added
- Installation process changes

---

## File Placement Guidelines

### Scripts → `/scripts/`

**Installation Scripts** (`/scripts/install/`):
- Platform-specific installers: `install-mac.sh`, `install-linux.sh`, `install.bat`
- Universal installer: `install.sh`
- All installation scripts must navigate to project root at start

**Launcher Scripts** (`/scripts/launchers/`):
- Start scripts: `Start Syntra Offer Builder.command`, `.bat`
- Stop scripts: `Stop Syntra Offer Builder.command`, `.bat`
- Legacy: `start.sh`
- All launcher scripts must navigate to project root at start

**Utility Scripts** (`/scripts/utils/`):
- Configuration checkers
- Verification scripts
- Helper utilities
- Development tools

**Script Requirements:**
1. Must be executable (`chmod +x` for shell scripts)
2. Must handle paths relative to project root
3. Must include error handling
4. Must provide clear output/feedback
5. Must be documented in `/scripts/README.md`

### Templates → `/templates/`

- Default template: `default.docx`
- User uploads: `/templates/user_uploads/`
- Document placeholders in comments or separate doc

### Generated Files → `/generated_offers/`

- Auto-generated DOCX files
- Gitignored (contains client data)
- Automatic naming convention: `Syntra_Offerte_{client}_{timestamp}.docx`

### Tests → `/tests/` or alongside code

**If adding tests:**
- Unit tests: alongside code or in `/tests/unit/`
- Integration tests: `/tests/integration/`
- E2E tests: `/tests/e2e/`
- Test fixtures: `/tests/fixtures/`

---

## Change Management

### When Moving Files

**Required steps:**
1. **Identify all references** - Grep for file paths
2. **Update code references** - Python imports, script paths
3. **Update configuration** - `.env`, `env.template`, config files
4. **Update documentation** - All markdown files
5. **Update scripts** - Installation, launchers, utilities
6. **Test functionality** - Run through critical paths
7. **Update .gitignore** - If needed for new locations
8. **Commit with clear message** - Explain what moved and why

### When Updating Paths in Scripts

**Pattern for launchers and installers:**
```bash
#!/bin/bash
# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1

# Now all paths are relative to project root
source venv/bin/activate
python backend/app.py
```

**Test checklist:**
- Script runs from its own directory
- Script runs from project root
- Script runs from arbitrary location
- All relative paths resolve correctly

### Maintain Backward Compatibility

**When possible:**
- Keep old paths working temporarily
- Add deprecation warnings
- Provide migration instructions
- Document breaking changes

**Example:**
```bash
# Old location (deprecated)
if [ -f "./start.sh" ]; then
    echo "WARNING: start.sh in root is deprecated. Use scripts/launchers/start.sh"
    exec ./start.sh
fi
```

---

## Security & Privacy

### Never Commit Secrets

**Gitignored files:**
- `.env` - Contains API keys
- `generated_offers/` - Contains client data
- `venv/` - Contains dependencies
- `archive/` - May contain sensitive development data

**Verify before committing:**
```bash
# Check what will be committed
git status
git diff --cached

# Ensure no secrets in staged files
grep -r "AIza" --include="*.py" --include="*.js" --include="*.md"
```

### API Keys & Credentials

**Storage:**
- Always in `.env` file
- Never hardcoded in source
- Never in documentation (use placeholders)

**Template format** (`env.template`):
```bash
GEMINI_API_KEY=your_api_key_here
TEMPLATE_PATH=./templates/default.docx
OUTPUT_DIR=./generated_offers
```

**Documentation:**
- Include link to obtain API key
- Clear instructions on where to place it
- Security warnings about protecting keys

### Client Data Protection

**Generated offers:**
- Automatically gitignored
- Stored in `/generated_offers/`
- Never uploaded to repository
- Consider implementing automatic cleanup (e.g., after 90 days)

**CRM data:**
- Only processed in memory
- Not logged or persisted
- Transmitted over HTTPS only

---

## Development Workflow

### Before Making Changes

1. **Read existing code** - Understand current structure
2. **Check documentation** - See if it's already documented
3. **Search for similar patterns** - Follow existing conventions
4. **Plan the change** - Think about impact and dependencies

### When Adding Features

1. **Choose correct location:**
   - Backend logic → `/backend/services/`
   - API endpoint → `/backend/app.py`
   - Frontend UI → `/frontend/`
   - Configuration → `.env` or service initialization

2. **Follow existing patterns:**
   - Service class structure
   - Error handling style
   - Naming conventions
   - Code formatting

3. **Update documentation:**
   - API reference if new endpoint
   - User guide if user-facing feature
   - Code comments for complex logic

4. **Test thoroughly:**
   - Manual testing of new feature
   - Verify no regressions
   - Test error cases

### When Refactoring

1. **Preserve functionality** - Ensure no behavior changes
2. **Test before and after** - Verify everything still works
3. **Update documentation** - Reflect any structural changes
4. **Commit incrementally** - Small, logical commits

### Code Style

**Python:**
- Follow PEP 8
- Use type hints
- Docstrings for functions and classes
- Descriptive variable names

**JavaScript:**
- Consistent indentation (2 or 4 spaces)
- Clear function names
- Comments for complex logic
- Use modern ES6+ features

**Shell Scripts:**
- Include shebang (`#!/bin/bash`)
- Use meaningful variable names
- Quote variables: `"$VAR"`
- Handle errors: `|| exit 1`

---

## Common Tasks & Patterns

### Adding a New API Endpoint

1. Define Pydantic model in `backend/models/schemas.py`
2. Implement service logic in appropriate service file
3. Add route in `backend/app.py`
4. Update API client in `frontend/js/api.js`
5. Update UI in `frontend/js/app.js`
6. Document in `/doc/04-api-reference.md`

### Adding a New Service

1. Create file in `backend/services/`
2. Implement service class
3. Initialize in `backend/app.py`
4. Import and use in routes
5. Document in technical architecture doc

### Moving/Renaming Files

1. Update all imports/references
2. Update documentation
3. Update configuration files
4. Test thoroughly
5. Commit with clear message

### Adding Dependencies

**Python:**
```bash
pip install package-name
pip freeze > backend/requirements.txt
```

**Document:**
- Why dependency was added
- Update installation docs if needed
- Consider bundle size/compatibility

---

## Quality Checklist

Before considering a change complete:

- [ ] Code follows project conventions
- [ ] All paths are correct and tested
- [ ] Documentation updated
- [ ] Configuration files updated if needed
- [ ] No secrets committed
- [ ] Functionality tested manually
- [ ] No broken references or imports
- [ ] Root directory remains clean
- [ ] Git status is clean (or intentional changes only)
- [ ] Commit message is descriptive

---

## Getting Help

**Documentation:**
- Start with `/doc/README.md`
- Check relevant doc files
- Read code comments

**Understanding the project:**
- Review `PROJECT_STRUCTURE.md` in `/doc/`
- Read `backend/app.py` for API structure
- Check service files for business logic

**When stuck:**
- Search codebase for similar patterns
- Check git history for context
- Review existing implementations

---

## Summary: Quick Rules

1. **Root stays clean** - Max 10-12 files
2. **Use subdirectories** - Scripts, docs, tests all organized
3. **Update all references** - When moving files, update everything
4. **Document changes** - Keep docs in sync with code
5. **Test thoroughly** - Verify functionality after changes
6. **No secrets in git** - Use .env, never commit
7. **Follow conventions** - Match existing code style
8. **Think about users** - Changes should improve, not break, UX

---

**Last Updated**: 2026-01-28  
**Maintainer**: Steff Vanhaverbeke (steff@vanhaverbeke.com)
