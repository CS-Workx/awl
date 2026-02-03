# Migration Guide - Project Reorganization

## Summary of Changes

This guide documents the structural reorganization of the Syntra Bizz Offer Generator project completed on 2026-01-28. The main goals were to:

1. Create AI development rules for future maintainability
2. Clean up the root directory
3. Organize scripts into logical subdirectories
4. Move documentation files to `/doc/`
5. Relocate template file to `/templates/`

---

## What Changed

### Directory Structure

**New directory created:**
- `/scripts/` - All automation and utility scripts
  - `/scripts/install/` - Installation scripts
  - `/scripts/launchers/` - Start/stop scripts
  - `/scripts/utils/` - Utility scripts

**Files moved:**

| Old Location (Root) | New Location | Type |
|---------------------|--------------|------|
| `install.sh` | `/scripts/install/install.sh` | Installation |
| `install-mac.sh` | `/scripts/install/install-mac.sh` | Installation |
| `install-linux.sh` | `/scripts/install/install-linux.sh` | Installation |
| `install.bat` | `/scripts/install/install.bat` | Installation |
| `Start Syntra Offer Builder.command` | `/scripts/launchers/Start...` | Launcher |
| `Start Syntra Offer Builder.bat` | `/scripts/launchers/Start...` | Launcher |
| `Stop Syntra Offer Builder.command` | `/scripts/launchers/Stop...` | Launcher |
| `Stop Syntra Offer Builder.bat` | `/scripts/launchers/Stop...` | Launcher |
| `start.sh` | `/scripts/launchers/start.sh` | Launcher |
| `check-config.sh` | `/scripts/utils/check-config.sh` | Utility |
| `verification.py` | `/scripts/utils/verification.py` | Utility |
| `2026_xxx_MP_klant_blanco...docx` | `/templates/default.docx` | Template |
| `CLEANUP_SUMMARY.md` | `/doc/CLEANUP_SUMMARY.md` | Documentation |
| `INSTALLATION.md` | `/doc/INSTALLATION.md` | Documentation |
| `INSTALLATION_SYSTEM_COMPLETE.md` | `/doc/INSTALLATION_SYSTEM_COMPLETE.md` | Documentation |
| `PROJECT_STRUCTURE.md` | `/doc/PROJECT_STRUCTURE.md` | Documentation |

**New files created:**
- `/AI_DEVELOPMENT_RULES.md` - Guidelines for AI development agents
- `/scripts/README.md` - Scripts documentation
- `/doc/MIGRATION_GUIDE.md` - This file

**Root directory count:**
- **Before**: 26 items
- **After**: 12 items

---

## Action Required

### 1. Update Your `.env` File

**IMPORTANT**: If you have an existing `.env` file, you need to update the template path.

**Change this:**
```bash
TEMPLATE_PATH=./2026_xxx_MP_klant_blanco bizz offerte caroline-nieuwe versie.docx
```

**To this:**
```bash
TEMPLATE_PATH=./templates/default.docx
```

**Full recommended `.env` format:**
```bash
GEMINI_API_KEY=your_actual_api_key_here
ALLOWED_ORIGINS=http://localhost:8766,http://127.0.0.1:8766
TEMPLATE_PATH=./templates/default.docx
OUTPUT_DIR=./generated_offers
TEMPLATES_DIR=./templates
```

### 2. Update Bookmarks/Shortcuts

If you have bookmarks or shortcuts to scripts, update them:

**Old:**
- `./Start Syntra Offer Builder.command`
- `./install-mac.sh`

**New:**
- `./scripts/launchers/Start Syntra Offer Builder.command`
- `./scripts/install/install-mac.sh`

**Note**: All scripts have been updated internally to navigate to the project root automatically, so they will work from their new locations.

### 3. Update Any Custom Scripts

If you have created custom scripts that reference project files, you may need to update paths.

---

## No Action Needed

The following continue to work without changes:

✅ **Functionality** - All features work exactly as before  
✅ **API endpoints** - No API changes  
✅ **Generated files** - Still output to `/generated_offers/`  
✅ **Frontend** - No changes to the UI  
✅ **Backend** - Updated to use new template path automatically  
✅ **Documentation** - Still accessible in `/doc/`  

---

## Script Path Changes

### Installation Scripts

**Old Usage:**
```bash
bash install-mac.sh
```

**New Usage:**
```bash
bash scripts/install/install-mac.sh
```

### Launcher Scripts

**Old Usage:**
```bash
./Start\ Syntra\ Offer\ Builder.command
```

**New Usage:**
```bash
./scripts/launchers/Start\ Syntra\ Offer\ Builder.command
```

Or double-click in Finder/Explorer as before (just in the new location).

### Utility Scripts

**Old Usage:**
```bash
bash check-config.sh
```

**New Usage:**
```bash
bash scripts/utils/check-config.sh
```

---

## Breaking Changes

### None Expected

This reorganization was designed to be **non-breaking**:

- All scripts updated to navigate to project root automatically
- Backend code updated to use new template path
- Configuration template updated
- All relative paths preserved

### Potential Issues

If you experience issues:

1. **"Template not found" error**
   - Update your `.env` file as described above
   - Verify template exists: `ls templates/default.docx`

2. **Scripts not working**
   - Ensure you're using the new paths
   - Check that scripts are executable: `chmod +x scripts/launchers/*.command`

3. **Documentation links broken**
   - Documentation moved to `/doc/` folder
   - Update any external links to point to `/doc/`

---

## Benefits of This Reorganization

### For Users

- **Cleaner root directory** - Easier to navigate
- **Organized scripts** - Know where to find installation/launch scripts
- **Better documentation** - All docs in one place (`/doc/`)
- **Consistent structure** - Follows industry best practices

### For Developers

- **AI Development Rules** - Clear guidelines in `/AI_DEVELOPMENT_RULES.md`
- **Maintainability** - Easier to find and update files
- **Scalability** - Clear structure for future additions
- **Professional** - Industry-standard project organization

---

## Testing Checklist

After migrating, verify these functions still work:

- [ ] **Installation** - Run installer from new location
- [ ] **Start application** - Use launcher from new location
- [ ] **CRM extraction** - Upload screenshot, verify extraction
- [ ] **Training extraction** - Enter URL, verify data extraction
- [ ] **Offer generation** - Generate offer, verify content
- [ ] **DOCX creation** - Download DOCX, verify template is applied
- [ ] **Stop application** - Stop script terminates processes
- [ ] **Browser automation** - Open CRM, capture screenshot (if using)

---

## Rollback Procedure

If you need to revert these changes:

1. **Via Git:**
   ```bash
   git log --oneline  # Find commit before reorganization
   git checkout <commit-hash>
   ```

2. **Manual:**
   - Move files back from `/scripts/` to root
   - Move template back to root
   - Restore old file names
   - Restore original `.env` paths
   - Update backend/app.py template path

---

## Support

If you encounter issues after this migration:

1. **Check `.env` file** - Ensure paths are updated
2. **Verify file locations** - Run `ls -R` to confirm structure
3. **Review error messages** - Check for path-related errors
4. **Consult documentation** - See `/doc/` for detailed guides
5. **Contact support** - steff@vanhaverbeke.com

---

## Future Guidelines

For future AI development agents and developers:

- **Read** `/AI_DEVELOPMENT_RULES.md` before making changes
- **Keep root clean** - New files go in appropriate subdirectories
- **Update paths** - When moving files, update all references
- **Test thoroughly** - Verify functionality after structural changes
- **Document** - Update relevant documentation files

---

**Migration Date**: 2026-01-28  
**Project**: Syntra Bizz Offer Generator  
**Version**: 1.1.0 (post-reorganization)
