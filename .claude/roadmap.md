# Slurm Tools Enhancement Roadmap

## Purpose
This file tracks feature planning, completed work, and future development priorities for the Slurm Tools project.

---

## Current State

### Existing Features (Production)
- ✅ **Base64 Encoder** - Text and file encoding with clipboard operations
- ✅ **Base64 Decoder** - Text and file decoding with clipboard operations
- ✅ **QR Code Generator** - Generate QR codes for text/URLs, WiFi, contacts (vCard), email, and SMS with customizable size and error correction
- ✅ **AES File Encryption** - Password-protected encryption with CSV preview
- ✅ **AES File Decryption** - Password-protected decryption with text/CSV preview (up to 8MB inline)
- ✅ **AES Text Encryption** - Quick text encryption with password protection and auto-encrypt
- ✅ **AES Text Decryption** - Quick text decryption with password protection
- ✅ **Password Generator** - Cryptographically secure random password generation with strength indicator
- ✅ **Progressive Web App** - Offline functionality via Service Worker
- ✅ **Responsive Layout** - Material Design UI adapting to mobile/tablet/desktop
- ✅ **Web Worker Integration** - Background crypto operations for file encryption/decryption
- ✅ **Data Table Display** - v-data-table for CSV previews with search
- ✅ **Three Theme System** - Default (light), Dark, and Slurm (retro cyan) themes with persistence

### Known Issues
- None currently identified

### Technical Debt
- 📝 No automated testing infrastructure (no Jest/Vitest)
- 📝 No TypeScript for type safety
- 📝 No formal state management (fine for current scope, but may need Pinia later)
- 📝 Minimal inline documentation/JSDoc comments
- 📝 CryptoJS loaded from CDN (external dependency risk)
- 📝 No CI/CD pipeline
- 📝 No formal accessibility audit (WCAG compliance)

---

## Phase 1: Code Cleanup & Quality (Priority: HIGH)

**Status**: ✅ Completed (2025-10-19)
**Actual Effort**: ~3 hours

### Features

- [x] **Remove Legacy Components** (30 min) - Priority 1
  - ✅ Deleted HelloWorld.vue, TheWelcome.vue, WelcomeItem.vue
  - ✅ Deleted icon components (IconCommunity, IconDocumentation, etc.)
  - ✅ Deleted unused App.vue component
  - ✅ Removed references from imports
  - **Benefit**: Cleaner codebase, reduced bundle size

- [x] **Gitignore Workspace Files** (10 min) - Priority 1
  - ✅ Added `*.code-workspace` to .gitignore
  - ✅ Removed src/gears.code-workspace from tracking
  - **Benefit**: Prevent personal workspace configs from cluttering repo

- [x] **Commit Service Worker Changes** (15 min) - Priority 1
  - ✅ Reviewed changes in public/sw.js
  - ✅ Tested offline functionality
  - ✅ Committed with descriptive message
  - **Benefit**: Clean working directory, version control SW updates

- [x] **Add JSDoc Comments** (2 hours) - Priority 2
  - ✅ Documented key methods in Base64Enc/Dec components
  - ✅ Documented AESEnc/Dec encryption/decryption flow
  - ✅ Added comments for worker message protocol
  - **Benefit**: Better code maintainability, IDE intellisense

- [x] **Error Handling Improvements** (1.5 hours) - Priority 2
  - ✅ Added try-catch blocks for file operations
  - ✅ Improved error messages for crypto failures
  - ✅ Enhanced clipboard operation error handling
  - ✅ Better user feedback for all operations
  - **Benefit**: More robust application, better UX

---

## Phase 2: UI Modernization (Priority: HIGH)

**Status**: ✅ Completed (2025-10-19)
**Actual Effort**: ~4 hours

### Features

- [x] **Color Palette Integration** (1.5 hours) - Priority 1
  - ✅ Created custom color palette from user-provided Coolors scheme
  - ✅ Integrated palette into theme.js (sage, coffee, royal blue, deep blue)
  - ✅ Applied semantic colors across all components
  - ✅ Consolidated color configuration into single theme file
  - **Benefit**: Modern, cohesive visual identity

- [x] **Component Modernization** (2 hours) - Priority 1
  - ✅ Redesigned app bar with gradient and badge
  - ✅ Enhanced navigation drawer with sections and icons
  - ✅ Updated all tool pages with avatar headers
  - ✅ Reorganized content into card sections
  - ✅ Created comprehensive About page
  - **Benefit**: Professional, polished appearance

- [x] **Responsive Design Improvements** (30 min) - Priority 2
  - ✅ Added responsive badge visibility (hidden on mobile)
  - ✅ Improved spacing and layout consistency
  - ✅ Enhanced mobile experience
  - **Benefit**: Better usability across devices

---

## Phase 3: UX Enhancements (Priority: HIGH)

**Status**: ✅ Completed (2025-10-19)
**Actual Effort**: ~2 hours

### Features

- [x] **Success Feedback System** (1 hour) - Priority 1
  - ✅ Added snackbar notifications to all components
  - ✅ Success messages for clipboard operations
  - ✅ Success/error messages for crypto operations
  - ✅ Consistent 3-second timeout with top positioning
  - **Benefit**: Clear user feedback for all actions

- [x] **Typography Improvements** (30 min) - Priority 1
  - ✅ Monospace fonts for encoded/encrypted text
  - ✅ Better letter-spacing and line-height
  - ✅ Improved readability for technical output
  - **Benefit**: Enhanced readability for Base64 and encrypted data

- [x] **Visual Polish** (30 min) - Priority 2
  - ✅ Created global-styles.css with reusable styles
  - ✅ Added smooth button hover animations
  - ✅ Enhanced focus states for accessibility
  - ✅ Improved page transitions (250ms timing)
  - ✅ Added max-width container (1400px) for large screens
  - **Benefit**: More polished, professional feel

---

## Phase 3.5: Offline Functionality & Code Quality (Priority: CRITICAL)

**Status**: ✅ Completed (2025-10-19)
**Actual Effort**: ~5 hours

### Features

- [x] **Service Worker Offline Caching** (2 hours) - Priority 1
  - ✅ Fixed service worker to cache Vite-generated assets with hashed filenames
  - ✅ Created automated build script (update-sw-cache.js) for post-build SW updates
  - ✅ Fixed CORS caching preventing CDN resources from being cached
  - ✅ Added `clients.claim()` for immediate service worker activation
  - ✅ Fixed null reference bug in accept header check
  - **Benefit**: 100% offline functionality, automatic cache updates

- [x] **Error Message Improvements** (1 hour) - Priority 1
  - ✅ Fixed "Decryption failed: undefined" error message
  - ✅ Added user-friendly error messages ("Wrong password" instead of undefined)
  - ✅ Improved worker error handling for string vs Error object exceptions
  - **Benefit**: Clear, actionable error messages for users

- [x] **Code Refactoring - Shared Utilities** (2 hours) - Priority 2
  - ✅ Created src/utils/fileDownload.js (19 lines)
  - ✅ Created src/utils/csvParser.js (67 lines)
  - ✅ Refactored AESEnc.vue and AESDec.vue to use shared utilities
  - ✅ Eliminated ~80 lines of duplicate code
  - **Benefit**: Better maintainability, DRY principles

- [x] **Documentation** (1 hour) - Priority 2
  - ✅ Created comprehensive OFFLINE-FUNCTIONALITY.md guide
  - ✅ Updated .claude/structure.md with new utilities and patterns
  - ✅ Updated .claude/memory.md with new coding patterns
  - **Benefit**: Clear documentation for future development

---

## Phase 4: Security & Validation (Priority: HIGH)

**Status**: ✅ Completed (7/7 features completed)
**Estimated Effort**: 13-17 hours
**Actual Effort**: 14.5 hours

### Features

- [x] **Password Strength Indicator** (2 hours) - Priority 1 ✅ COMPLETED
  - Add visual password strength meter (weak/medium/strong/very strong)
  - Show requirements (length, complexity)
  - Warn on weak passwords
  - **Benefit**: Improved security UX, educates users
  - **Completed**: 2025-10-20 (Commit: 17d43cd)

- [x] **File Size Validation** (1 hour) - Priority 2 ✅ COMPLETED
  - Created fileSizeValidator.js utility with configurable limits (50MB warning, 200MB max)
  - Integrated into all four components (Base64Enc, Base64Dec, AESEnc, AESDec)
  - Shows warning alert for large files (>50MB) with user-friendly messages
  - Blocks operations for files exceeding 200MB limit
  - Displays formatted file size in hint text
  - **Benefit**: Prevents browser crashes, better UX, clear user feedback
  - **Completed**: 2025-10-26

- [x] **PasswordInput Component** (1.5 hours) - Priority 2 ✅ COMPLETED
  - Standardized password input with visibility toggle
  - Password confirmation matching with visual validation
  - Integration across all AES components
  - **Benefit**: Consistent UX, improved password handling
  - **Completed**: 2025-10-22 (Commit: 9d6d743)

- [x] **Crypto Provider Abstraction** (4 hours) - Priority 1 ✅ COMPLETED
  - Created pluggable crypto backend architecture (CryptoProvider.js)
  - Implemented JsAesCryptProvider (legacy compatibility)
  - Implemented WebCryptoProvider (native browser crypto, faster)
  - 63 additional tests for provider abstraction
  - **Benefit**: Flexible crypto backends, better performance, future-proof
  - **Completed**: 2025-10-30 (Commit: 04d6432)

- [x] **PWA Auto-Update System** (2 hours) - Priority 2 ✅ COMPLETED
  - useServiceWorkerUpdate composable for intelligent update detection
  - Offline detection with graceful degradation
  - User notification for available updates
  - **Benefit**: Improved PWA experience, seamless updates
  - **Completed**: 2025-10-24 (Commit: 4d6f952)

- [x] **Code Refactoring & Standardization** (2 hours) - Priority 1 ✅ COMPLETED
  - Created 5 composables, 4 shared components
  - Refactored all 7 tool components to Composition API
  - Fixed memory leak in worker lifecycle
  - **Benefit**: Eliminated 1,124 lines of duplicate code
  - **Completed**: 2025-11-01 (Commit: 25babb4)

- [x] **UI/UX Polish** (1 hour) - Priority 2 ✅ COMPLETED
  - FileUploadWithValidation: Dynamic tooltips based on validation state
  - FileUploadWithValidation: Button disabled when file too large
  - PasswordGenerator: Compact 2-column layout for better space utilization
  - PasswordGenerator: Added regenerate button for manual password refresh
  - Base64Dec: Fixed button enable/disable logic
  - **Benefit**: Improved user experience with better feedback and usability
  - **Completed**: 2025-11-01 (Commit: 25babb4)

---

## Phase 4.5: Performance Optimization & UI Polish (Priority: HIGH)

**Status**: ✅ Completed (4/4 features completed)
**Estimated Effort**: 6-8 hours
**Actual Effort**: 7 hours

### Features

- [x] **Bundle Size Optimization** (4 hours) - Priority 1 ✅ COMPLETED
  - Removed @mdi/font package (3.6MB savings)
  - Migrated to Lucide icons with tree-shaking (109 specific icon imports)
  - Implemented route-based code splitting with lazy loading
  - Main bundle reduced from 1.6MB to 528KB (67% reduction)
  - Total package size reduced from 6.1MB to 1.5MB (75% reduction)
  - All 20 lazy-loaded chunks pre-cached for full offline support
  - **Benefit**: Faster initial load, better performance, maintained offline functionality
  - **Completed**: 2025-11-23

- [x] **Icon Migration & Mapping** (2 hours) - Priority 1 ✅ COMPLETED
  - Created comprehensive MDI → Lucide icon mapping (109 icons)
  - Fixed missing theme toggle icons (Sun, Moon, Sparkles)
  - Fixed missing technology section icons (Vue.js, Material Design, Web Workers)
  - Added 48 EXIF metadata-specific icon mappings
  - Fixed Timestamps category icon (mdi-clock)
  - **Benefit**: Complete icon coverage, consistent visual design
  - **Completed**: 2025-11-23

- [x] **Metadata Editor Icon Cleanup** (30 min) - Priority 2 ✅ COMPLETED
  - Removed icon property from 100+ individual EXIF field definitions
  - Kept section category icons (Camera, Location, Timestamps, Author, Technical, Hidden)
  - Updated JSDoc documentation to reflect changes
  - **Benefit**: Cleaner UI, reduced visual clutter, easier maintenance
  - **Completed**: 2025-11-23

- [x] **File Upload Component Enhancement** (30 min) - Priority 2 ✅ COMPLETED
  - Removed duplicate file size display from filename
  - Implemented elegant filename truncation with ellipsis for long names
  - Applied to both field input and file chip display
  - File size now shown only in hint area below input
  - **Benefit**: Cleaner UI, better handling of long filenames, no ugly word wrapping
  - **Completed**: 2025-11-23

---

## Phase 5: Testing Infrastructure (Priority: MEDIUM)

**Status**: 🔄 In Progress (3/4 features completed)
**Estimated Effort**: 8-12 hours
**Actual Effort**: 10 hours

### Features

- [x] **Setup Vitest** (2 hours) - Priority 1 ✅ COMPLETED
  - Vitest configured with Vue plugin, jsdom, test scripts
  - **Completed**: 2025-10-26 (Commit: e541f4f)

- [x] **Unit Tests for Utilities** (4 hours) - Priority 2 ✅ COMPLETED
  - 94 utility tests (csvParser, fileDownload, passwordGenerator, passwordStrength)
  - **Completed**: 2025-10-27 (Commit: e541f4f)

- [x] **Component Tests** (4 hours) - Priority 2 ✅ COMPLETED
  - 266 component tests across 6 components
  - **Achievement**: 423 total passing tests, 95.45% coverage
  - **Completed**: 2025-11-01 (Commit: 00454ed)

- [ ] **E2E Tests** (6-10 hours) - Priority 1 🔥 **NEXT PRIORITY**
  - Install Playwright, test full workflows, offline PWA, clipboard ops
  - **Effort Updated**: Increased from 3h to 6-10h for comprehensive coverage

---

## Phase 6: Additional UX Features (Priority: MEDIUM)

**Status**: 🔄 In Progress (2/6 features completed)
**Estimated Effort**: 11-14 hours
**Actual Effort**: 5 hours (Theme Toggle + Password Session)

### Features

- [ ] **Drag & Drop File Upload** (2 hours) - Priority 1
  - Add drag-and-drop zones for file inputs
  - Visual feedback on hover
  - Support multiple files where applicable
  - **Benefit**: Modern UX, faster workflow

- [ ] **Progress Indicators for Large Files** (2.5 hours) - Priority 1
  - Show progress bar during encryption/decryption
  - Display percentage complete
  - Add cancel operation button
  - **Benefit**: User knows operation is progressing

- [x] **Theme Toggle System** (3 hours) - Priority 2 ✅ COMPLETED
  - Implemented three-theme system (Default, Dark, Slurm)
  - Added theme toggle buttons in app bar
  - localStorage persistence with error handling
  - **Benefit**: Accessibility, user preference, nostalgia (Slurm mode)
  - **Completed**: 2025-10-21 (Commit: a09172f)

- [ ] **Keyboard Shortcuts** (1.5 hours) - Priority 3
  - Add keyboard shortcuts (Ctrl+V for paste, Ctrl+C for copy, Escape to clear)
  - Display shortcut hints in tooltips
  - **Benefit**: Power user efficiency

- [ ] **Recently Used Tools** (2 hours) - Priority 3
  - Track last used tool in localStorage
  - Show "Continue" button on home page
  - Optional quick-access toolbar
  - **Benefit**: Faster access for repeat users

- [x] **Password Session Manager** (2 hours) - Priority 1 ✅ COMPLETED 🔥
  - "Remember password for this session" checkbox
  - Encrypt multiple files without re-entering password
  - Auto-clear on browser close or manual clear button
  - Privacy-safe: stored in sessionStorage (NOT localStorage)
  - Visual indicator when password is remembered
  - **Benefit**: Eliminate friction when encrypting multiple related files
  - **Use Case**: "Encrypting 10 company documents with same password - no re-typing"
  - **Privacy**: Memory-only, auto-clears on tab close
  - **Completed**: 2025-11-08

---

## Phase 7: New Tool Features (Priority: MEDIUM-LOW)

**Status**: 🔄 In Progress (2/12 features completed)
**Estimated Effort**: 30-42 hours
**Actual Effort**: 5 hours (Password Generator + Text AES Encryption)
**Trigger**: After completing Phase 4-6, or when user feedback indicates demand

### Core Tools (High Value)

- [x] **Password Generator** (2 hours) - Priority 1 ✅ COMPLETED
  - Generate strong random passwords with configurable length/complexity
  - Visual strength indicator integration
  - One-click copy to clipboard
  - Options: length (8-64 chars), include/exclude character types
  - **Benefit**: Natural pairing with encryption tools, fills workflow gap
  - **Use Case**: Users need strong passwords for AES encryption
  - **Completed**: 2025-10-28 (Commit: 7a3748d)

- [x] **Text Encryption (AES)** (3 hours) - Priority 1 ✅ COMPLETED
  - Created text-based AES encryption/decryption (TextAESEnc.vue and TextAESDec.vue)
  - Password protection with strength indicator
  - Auto-encrypt on input with debouncing (350ms)
  - Copy encrypted/decrypted text to clipboard
  - Paste functionality for quick workflows
  - Tab interface for input/output in encryption tool
  - **Benefit**: Quick text encryption without file I/O overhead
  - **Use Case**: "I just want to encrypt this API key/secret quickly"
  - **Completed**: 2025-10-29 (Commit: 9755c9a)

### Developer Tools

- [ ] **JWT Decoder** (2.5 hours) - Priority 2
  - Decode and display JWT tokens
  - Show header, payload, signature in formatted JSON
  - Validate signature (optional, requires algorithm selection)
  - Copy decoded sections to clipboard
  - **Benefit**: Very popular developer tool (jwt.io gets millions of visits)
  - **Use Case**: Debugging authentication tokens

- [ ] **URL Encoder/Decoder** (2 hours) - Priority 2
  - Add URL encoding/decoding tool
  - Component-wise encoding option (encode only query params, etc.)
  - Copy encoded/decoded result to clipboard
  - **Benefit**: Common developer tool, fits toolkit theme

### Quality of Life Features

- [ ] **File History/Recent Operations** (2.5 hours) - Priority 2
  - Remember last 5-10 operations (filename, type, timestamp - NO content)
  - Show in sidebar or home page
  - Quick re-process same file with different settings
  - Clear history button
  - **Benefit**: Users often re-encrypt same file with different passwords
  - **Privacy**: Optional feature with clear opt-out, localStorage only
  - **Dependency**: Requires careful privacy consideration

- [x] **QR Code Generator** (2 hours) - Priority 3
  - ✅ Generate QR codes from text/URLs
  - ✅ Support for WiFi network credentials
  - ✅ Support for vCard contact information
  - ✅ Support for Email and SMS pre-fill
  - ✅ Download as PNG with configurable size (128px to 1024px)
  - ✅ Copy QR code to clipboard
  - ✅ Error correction levels (L/M/Q/H)
  - ✅ Real-time generation with debouncing
  - **Benefit**: Mobile-friendly way to transfer encrypted data, share WiFi, contacts
  - **Tech**: qrcode npm package
  - **Use Case**: Transfer encrypted text to mobile device, share WiFi credentials, share contact info
  - **Completed**: 2025-11-21

- [ ] **File Comparison Tool** (3 hours) - Priority 3
  - Compare two files byte-by-byte
  - Show if identical (useful after decrypt → re-encrypt roundtrip)
  - Visual diff for text files (side-by-side comparison)
  - Hash comparison mode (compare file hashes)
  - **Benefit**: Quality assurance - "Did my decrypt work correctly?"
  - **Use Case**: Verify encryption/decryption roundtrip accuracy

### Advanced Features

- [ ] **Compression Tool** (4 hours) - Priority 3
  - Compress files before encryption (gzip/brotli)
  - Decompress after decryption
  - Show compression ratio and size savings
  - **Benefit**: Smaller encrypted files = easier to share
  - **Use Case**: Encrypt large log files or datasets
  - **Tech**: Use pako.js for gzip compression

- [ ] **Export/Import Settings** (2 hours) - Priority 4
  - Export app settings (theme, preferences) to JSON
  - Import settings from file
  - **Benefit**: User convenience for multi-device usage

- [ ] **Batch File Operations** (6 hours) - Priority 4
  - Support multiple file uploads
  - Batch encode/decode/encrypt/decrypt with same password
  - Download as ZIP archive
  - Progress indicator for batch operations
  - **Benefit**: Efficiency for power users (10+ files)
  - **Dependency**: Requires significant UI/UX redesign, ZIP library integration

- [ ] **Steganography Mode** (6 hours) - Priority 4 🌟 **UNIQUE FEATURE**
  - Hide encrypted text inside PNG/JPG images using LSB (Least Significant Bit) steganography
  - Encrypt text → embed in image pixels (visually identical to human eye)
  - Extract hidden encrypted text from images
  - Adjustable capacity indicator (shows how much text fits in image)
  - Support for multiple image formats (PNG preferred for lossless)
  - **Benefit**: Next-level privacy - hide secrets in plain sight
  - **Use Case**: "Hide encrypted API keys in an innocent-looking vacation photo"
  - **Tech**: Canvas API for pixel manipulation, preserve image quality
  - **Marketing**: Unique feature rarely found in browser-based tools

- [ ] **Decryption Honeypot Mode** (3 hours) - Priority 4 🌟 **UNIQUE FEATURE**
  - Dual-password encryption: real password + decoy password
  - Wrong password decrypts to pre-set fake content (indistinguishable from real)
  - Plausible deniability under duress
  - Set decoy content during encryption
  - Visual indicator: "Honeypot mode enabled"
  - **Benefit**: Security researcher feature, protection against coercion
  - **Use Case**: "Under duress, provide decoy password revealing innocent document"
  - **Tech**: Dual-layer encryption with different keys
  - **Warning**: Add clear disclaimer about legal implications

---

## Phase 8: DevOps & Quality Assurance (Priority: HIGH)

**Status**: 🟡 In Progress (2025-11-11)
**Estimated Effort**: 10-15 hours
**Actual Effort**: 3-4 hours (Playwright E2E + GitHub Actions)
**Target**: Production-ready deployment with automated quality gates
**Trigger**: After Phase 5 E2E tests complete

### Features

- [x] **CI/CD Pipeline** (2-3 hours) - Priority 1 🔥 **CRITICAL**
  - ✅ Setup GitHub Actions workflow (.github/workflows/ci-cd.yml)
  - ✅ Automated testing on every commit (run all 423+ tests)
  - ✅ Automated E2E testing on every PR + main push
  - ✅ Automated builds for main branch
  - ✅ Deployment to production (gears.slurm.it) on main push
  - ✅ Lighthouse CI for PWA performance tracking
  - 📋 Badge displays (to be added to README)
  - **Benefit**: Prevent broken builds, automated deployment, confidence in releases
  - **ROI**: Extremely high - catches bugs before production
  - **Workflow**: 4 stages: Test & Build → E2E Tests → PWA Quality → Deploy

- [x] **E2E Tests with Playwright** (6-8 hours) - Priority 1 🔥 **MOVED FROM PHASE 5**
  - ✅ Install and configure Playwright with production settings
  - ✅ Test Base64 encode/decode workflows (6 tests)
  - ✅ Test AES file encryption/decryption (10 tests)
  - ✅ Test AES text encryption/decryption (6 tests)
  - ✅ Test offline PWA functionality and service worker (12 tests)
  - ✅ Test password generator and theme switching (10 tests)
  - ✅ Test session password manager (3 tests)
  - ✅ Run in CI/CD pipeline (E2E stage in workflow)
  - **Coverage**: 47 E2E tests across 5 test suites
  - **Benefit**: Test real user workflows, catch integration bugs
  - **Critical Gap Filled**: Now have full end-to-end testing

- [x] **Performance Monitoring** (1 hour) - Priority 2
  - ✅ Lighthouse CI integration for PWA score tracking
  - ✅ Performance budgets configured (85% perf, 90% a11y, 80% PWA)
  - 📋 Bundle size tracking (can be added to workflow later)
  - **Benefit**: Maintain fast app, catch performance regressions

- [ ] **Error Tracking & Monitoring** (2 hours) - Priority 3 **DEFERRED**
  - Sentry integration (or privacy-respecting alternative)
  - Client-side error reporting
  - Performance metrics collection
  - Offline-first error queue
  - **Note**: Must be privacy-conscious, opt-in only
  - **Status**: Can add after Phase 8 core features stable

### Implementation Details

**GitHub Actions Workflow Structure**:
- **Trigger Events**: PR, push to main
- **Stage 1 (Test & Build)**: Unit tests + coverage + build verification
- **Stage 2 (E2E)**: Playwright tests with 2 retries in CI
- **Stage 3 (PWA Quality)**: Lighthouse CI (main branch only)
- **Stage 4 (Deploy)**: Auto-deploy to gears.slurm.it (main branch only)

**Playwright Configuration**:
- Production-optimized settings
- HTML + JSON + JUnit reporting
- Screenshots/videos on failure
- Trace debugging enabled
- Chromium browser (single for speed)
- Test fixtures for file upload testing

---

## Phase 9: Modern UX Polish (Priority: MEDIUM)

**Status**: ⚪ Not Started
**Estimated Effort**: 8-12 hours
**Target**: Modern web app standards and power-user features
**Trigger**: After Phase 6 partial completion

### Features

- [ ] **Keyboard Shortcuts** (3-4 hours) - Priority 1 🔥 **ELEVATED FROM PHASE 6**
  - Global shortcuts: `Ctrl+V` paste, `Ctrl+C` copy, `Esc` clear
  - Tool-specific shortcuts: `Ctrl+E` encrypt, `Ctrl+D` decrypt
  - Shortcut hints in tooltips and help dialog
  - Customizable shortcut settings (localStorage)
  - Visual shortcut legend (`?` key to display)
  - **Benefit**: Power user efficiency, modern app standard
  - **Priority Elevated**: This is expected in productivity tools

- [ ] **Undo/Redo Functionality** (2-3 hours) - Priority 2
  - Undo destructive actions (clear text, remove file)
  - Toast notifications with undo button
  - History stack (last 10 actions)
  - `Ctrl+Z` undo, `Ctrl+Shift+Z` redo
  - **Benefit**: User confidence, prevent accidental data loss

- [ ] **Auto Dark Mode Detection** (1 hour) - Priority 2
  - Detect system preference (`prefers-color-scheme`)
  - Auto-apply dark theme on first visit
  - Respect user override in settings
  - **Benefit**: Modern UX standard, better accessibility

- [ ] **File Preview Thumbnails** (2-3 hours) - Priority 3
  - Show image thumbnails before encryption
  - Preview first few lines of text files
  - File type icons for different formats
  - **Benefit**: User confidence in file selection

- [ ] **Advanced Progress Indicators** (2 hours) - Priority 3 **ENHANCED FROM PHASE 6**
  - Actual progress bar (0-100%) for large file operations
  - Time remaining estimate
  - Cancel operation button
  - **Current**: Only has loading spinner
  - **Upgrade**: True progress tracking with Web Worker updates

---

## Phase 10: Privacy & Forensics Tools (Priority: MEDIUM-HIGH)

**Status**: 🔄 In Progress (1/9 features completed)
**Estimated Effort**: 50-75 hours
**Actual Effort**: ~6 hours (Hex Viewer)
**Target Audience**: Privacy-conscious users, journalists, security professionals, forensic enthusiasts
**Trigger**: After Phase 6-7 partial completion, high user value features
**Note**: Time estimates corrected to reflect realistic complexity

### Core Privacy Tools (Highest Priority)

- [ ] **Metadata Editor & Steganography Tool** (12-18 hours) - Priority 1 🔥🔥🔥 **TOP PRIORITY**
  - **Full EXIF/metadata viewer and editor** for images (JPEG, PNG, HEIC, TIFF)
  - **View mode**: Display all metadata in organized sections (Camera, Location, Software, Timestamps, Copyright, etc.)
  - **Edit mode**: Modify any metadata field individually
    - Change GPS coordinates (latitude/longitude)
    - Modify timestamps (DateTimeOriginal, CreateDate, ModifyDate)
    - Edit camera info (Make, Model, LensModel)
    - Change author, copyright, software fields
    - Add/remove custom tags
  - **Strip mode**: One-click remove all metadata (privacy sanitization)
  - **Steganography mode**: Hide encrypted text in metadata fields
    - Embed data in EXIF Comment, UserComment, or ImageDescription fields
    - Obfuscation: Metadata appears normal but contains hidden messages
    - Combine with AES text encryption for double-layer protection
    - Warning: "Metadata steganography detected" when reading
  - **Before/After comparison**: Side-by-side view of original vs modified metadata
  - **Batch processing**: Apply same edits to multiple images at once
  - **Warning system**: Alert user if GPS coordinates present ("⚠️ Location data detected!")
  - **Presets**: Quick actions
    - "Sanitize for sharing" (remove all identifying metadata)
    - "Randomize timestamps" (preserve date but randomize time)
    - "Remove GPS only" (keep camera info, strip location)
    - "Photographer mode" (keep technical data, remove personal info)
  - **Export options**: Save as new file or overwrite original
  - **Visual indicators**: Icons showing which metadata sections are populated
  - **Benefit**: Privacy protection + creative data hiding + metadata manipulation
  - **Use Case 1 (Privacy)**: "Remove GPS coordinates from protest photos before sharing"
  - **Use Case 2 (Steganography)**: "Hide encrypted credentials in vacation photo metadata"
  - **Use Case 3 (Forensics)**: "Edit timestamp to match alibi" (ethical disclaimer required)
  - **Tech**: piexifjs library (~50KB, browser-compatible, works offline)
  - **Marketing**: Unique 3-in-1 feature rarely found in browser-based tools

- [x] **Hex Viewer & Binary Editor** (20-30 hours) - Priority 2 🔥🔥 **POWER USER FEATURE** ✅ COMPLETED
  - ✅ **Hex dump viewer**: Classic three-column layout (Offset | Hex | ASCII)
  - ✅ **Large file support**: Virtual scrolling for files up to 200MB without freezing browser
  - ✅ **Search functionality**: Find byte patterns, text strings, hex sequences
  - ✅ **Jump to offset**: Navigate directly to specific byte position (decimal or hex)
  - ✅ **Data interpretation panel**: View selected bytes as:
    - Signed/unsigned integers (8/16/32/64-bit, little/big endian)
    - Floating point (32/64-bit)
    - UTF-8/UTF-16/ASCII text
    - Unix timestamps
  - ✅ **Color coding**: Syntax highlighting
    - Printable ASCII (default color)
    - Control characters (grayed out)
    - Color-coded hex display
  - ✅ **Responsive design**: Mobile-optimized with smaller fonts and adaptive layout
  - ✅ **Copy functionality**: Copy hex or ASCII sections to clipboard
  - ✅ **File info display**: Show file name, size, and byte statistics
  - 📋 **Edit mode**: Future enhancement - click any byte to modify (hex or ASCII input)
  - 📋 **Binary diff**: Future enhancement - compare two files byte-by-byte
  - 📋 **Export selections**: Future enhancement - save specific byte ranges
  - 📋 **Bookmarks**: Future enhancement - mark important offsets with labels
  - **Benefit**: Forensic analysis, debugging encryption, understanding file formats
  - **Use Case 1**: "Inspect .aes file header structure to understand encryption format"
  - **Use Case 2**: "Examine binary file structure and data patterns"
  - **Use Case 3**: "Debug file format issues by viewing raw bytes"
  - **Tech**: Custom hex renderer with virtual scrolling composable, useHexViewer, useVirtualScroll
  - **Completed**: 2025-11-18 (Phase 10, first major forensics tool)

- [ ] **File Hash Generator & Integrity Verifier** (3 hours) - Priority 1 🔥 **ESSENTIAL TOOL**
  - **Hash generation**: Support multiple algorithms
    - SHA-256 (primary, most secure)
    - SHA-512 (extra security)
    - SHA-1 (legacy compatibility)
    - MD5 (legacy compatibility, warn about weakness)
  - **Multiple file hashing**: Upload multiple files, generate all hashes in batch
  - **Text hashing**: Hash text input directly (useful for password hashing preview)
  - **Checksum file support**: Import/export SHA256SUMS or MD5SUMS format
  - **Integrity verification**:
    - Paste expected hash + upload file → instant match/mismatch
    - Visual feedback: ✅ green checkmark (match) or ❌ red X (mismatch)
  - **Byte-by-byte file comparison**: Compare two files, show exact byte differences
  - **Text diff mode**: Side-by-side comparison with line-level highlighting for text files
  - **Roundtrip verification workflow**:
    - Hash original file
    - Encrypt → decrypt
    - Hash result → compare
    - Confirm no data loss
  - **Progress indicator**: Show hashing progress for large files (>50MB)
  - **Copy to clipboard**: One-click copy any hash for sharing
  - **Hash history**: Remember last 5 hashes for comparison
  - **Benefit**: Essential companion to encryption, verify file integrity, detect tampering
  - **Use Case 1**: "Verify downloaded file matches published SHA-256 hash"
  - **Use Case 2**: "Confirm encryption/decryption roundtrip didn't corrupt data"
  - **Use Case 3**: "Compare two file versions to detect changes"
  - **Tech**: Web Crypto API (crypto.subtle.digest), no dependencies, fully offline

### Data Analysis Tools (Medium Priority)

- [ ] **JSON/XML Formatter & Validator** (2-3 hours) - Priority 2
  - **JSON beautifier**: Auto-format with syntax highlighting and proper indentation
  - **JSON minifier**: Remove all whitespace for compact storage/transmission
  - **JSON validator**: Check syntax, show precise error location (line/column)
  - **JSONPath query**: Extract specific fields using query syntax ($.users[0].email)
  - **XML formatter**: Beautify XML with proper indentation
  - **JSON ↔ XML converter**: Transform between formats bidirectionally
  - **Tree view explorer**: Collapsible/expandable JSON structure visualization
  - **Diff mode**: Compare two JSON objects, highlight structural differences
  - **Copy path**: Click any field to copy its JSONPath to clipboard
  - **Schema validation**: Validate against JSON Schema (optional)
  - **Escape/unescape**: Convert special characters for embedding
  - **Benefit**: Essential for API work, config files, decrypted JSON data
  - **Use Case**: "Decrypt API response → format for readability → extract specific field"
  - **Tech**: JSON.parse + custom formatter, syntax highlighter (e.g., Prism.js or custom)

- [ ] **Text Diff & Comparison Tool** (3 hours) - Priority 2
  - **Side-by-side diff**: Two-pane view with synchronized scrolling
  - **Inline diff**: Single view with additions/deletions marked inline
  - **Character-level precision**: Highlight exact character changes within lines (not just line-level)
  - **Unified diff format**: Export as standard .patch/.diff file
  - **Context lines**: Configurable number of unchanged lines around diffs
  - **Ignore whitespace option**: Skip formatting differences (useful for code)
  - **Case-insensitive mode**: Compare ignoring letter case
  - **Line numbers**: Show original and new line numbers
  - **Copy differences**: Extract only added/removed lines
  - **Multi-file diff**: Compare two sets of files
  - **Statistics**: Show counts (lines added, removed, changed)
  - **Benefit**: Compare document versions, find what changed after decryption
  - **Use Case**: "Compare two contract versions after decryption to see edits"
  - **Tech**: diff-match-patch library (~20KB) or custom LCS algorithm

- [ ] **Regex Tester & Text Extractor** (2-3 hours) - Priority 3
  - **Live regex testing**: Real-time pattern matching with instant highlighting
  - **Pattern library**: Common presets
    - Email addresses: `[\w\.-]+@[\w\.-]+\.\w+`
    - Phone numbers (US, international formats)
    - IP addresses (IPv4, IPv6)
    - URLs (http/https)
    - Credit card numbers (with Luhn validation)
    - Social Security Numbers
  - **Extract mode**: Pull all matches into copyable list
  - **Replace mode**: Find-and-replace with regex (supports $1, $2 groups)
  - **Test cases**: Save patterns for reuse
  - **Capture groups**: Display numbered and named groups separately
  - **Flags support**: i (case-insensitive), g (global), m (multiline), s (dotall), u (unicode)
  - **Performance metrics**: Show match count and execution time
  - **Export results**: Copy matched text to clipboard or download as file
  - **Regex cheatsheet**: Built-in quick reference panel
  - **Benefit**: Data extraction from large decrypted texts, pattern validation
  - **Use Case**: "Extract all email addresses from 5MB CSV" OR "Find phone numbers in document"
  - **Tech**: Native JavaScript RegExp, no dependencies

### Advanced Privacy Features (Lower Priority)

- [ ] **Character Encoding Detective** (2 hours) - Priority 3
  - **Auto-detect encoding**: Identify character encoding automatically
    - UTF-8 (most common)
    - UTF-16 (LE/BE)
    - Latin-1 (ISO-8859-1)
    - Windows-1252
    - ASCII
    - Others (50+ encodings)
  - **Encoding converter**: Transform between any encodings
  - **Mojibake fixer**: Detect and repair double-encoded text (é → Ã© → fix)
  - **BOM detection**: Identify and handle byte-order marks
  - **Preview mode**: Show text in multiple encodings simultaneously for comparison
  - **Confidence scoring**: "90% confident this is UTF-16LE"
  - **Manual override**: Force specific encoding when auto-detect fails
  - **Benefit**: Fix garbled text after decryption when wrong encoding assumed
  - **Use Case**: "Decrypted file shows weird characters → auto-detect correct encoding"
  - **Tech**: TextDecoder API + encoding detection heuristics (or chardet library if needed)

- [ ] **File Entropy Analyzer** (2-3 hours) - Priority 3
  - **Entropy calculation**: Measure data randomness (Shannon entropy)
    - 0.0 = completely uniform (all same byte)
    - 8.0 = perfectly random (ideal for encrypted data)
  - **Visual histogram**: Show byte value distribution (0-255) as bar chart
  - **Detection capabilities**:
    - Identify if file is already compressed (high entropy)
    - Detect if file is encrypted (very high entropy)
    - Spot patterns (low entropy regions)
  - **Compression test**: Estimate size reduction with gzip/brotli
  - **Encryption overhead calculation**: Show size increase from AES encryption
  - **Chi-square test**: Statistical randomness test
  - **Recommendations**:
    - "This file is already compressed (entropy 7.8), skip compression step"
    - "Low entropy (2.3), compression will significantly reduce size"
  - **Benefit**: Optimize encryption workflow, forensic analysis, detect file types
  - **Use Case**: "Check if 50MB file worth compressing before encrypting"
  - **Tech**: Shannon entropy formula, browser Compression Streams API

- [ ] **Privacy Score Analyzer** (4 hours) - Priority 3 🌟 **UNIQUE FEATURE**
  - **Privacy audit**: Comprehensive analysis of uploaded file
  - **Scoring system**: 0-100 points (100 = perfectly private)
  - **Risk factors detected**:
    - **Metadata presence** (-20 pts): EXIF, GPS, timestamps
    - **Identifiable filename** (-10 pts): Contains names, dates, sensitive keywords
    - **Embedded personal info** (-15 pts): Author name, company, email in document properties
    - **Document metadata** (-15 pts): MS Office tracked changes, comments, hidden sheets
    - **Hidden data** (-20 pts): Steganography, alternate data streams
    - **File format** (-10 pts): Proprietary formats that leak info
    - **Timestamp leaks** (-10 pts): Creation/modification times reveal patterns
  - **Detailed report**: Line-by-line findings with severity (Critical/High/Medium/Low)
  - **Recommendations**: Actionable steps to improve score
    - "Remove GPS coordinates from EXIF (-20 pts) → use Metadata Editor"
    - "Filename 'secret-client-list.txt' reveals content (-10 pts) → rename to 'document-2024.txt'"
  - **Before/After comparison**: Show score improvement after applying fixes
  - **Export report**: PDF or text summary for compliance documentation
  - **Privacy checklist**: Interactive checklist of privacy best practices
  - **Benefit**: Comprehensive privacy check before encrypting and sharing files
  - **Use Case**: "Audit file before sharing with journalist to ensure no identifying info"
  - **Tech**: Multiple analyzers (EXIF reader, PDF metadata extractor, Office XML parser)

---

## Phase 11: TypeScript Migration (Priority: LOW)

**Status**: ⚪ Not Started
**Estimated Effort**: 10-15 hours
**Trigger**: When codebase grows beyond 5,000 lines

### Features

- [ ] **TypeScript Setup** (2 hours)
  - Install TypeScript and @types packages
  - Configure tsconfig.json
  - Update Vite config
  - Rename .js to .ts incrementally

- [ ] **Type Definitions** (6 hours)
  - Add types for component props
  - Type worker message protocol
  - Type crypto operations
  - Type router configuration

- [ ] **Strict Mode Migration** (4 hours)
  - Enable strict TypeScript mode
  - Fix type errors
  - Add generic types for reusable functions

---

## Phase 12: Accessibility & Internationalization (Priority: VERY LOW)

**Status**: ⚪ Not Started
**Estimated Effort**: 8-12 hours
**Trigger**: When user base expands internationally

### Features

- [ ] **WCAG 2.1 AA Compliance** (4 hours)
  - Audit with axe DevTools
  - Add ARIA labels and roles
  - Improve keyboard navigation
  - Ensure color contrast ratios
  - **Benefit**: Accessible to users with disabilities

- [ ] **Internationalization (i18n)** (6 hours)
  - Install vue-i18n
  - Extract strings to language files
  - Add language selector
  - Support English, Spanish, French (or user preference)
  - **Benefit**: Global audience reach

---

## Phase 13: Future Considerations (Priority: RESEARCH NEEDED)

**Status**: ⚪ Not Started
**Estimated Effort**: 10-12 hours
**Trigger**: When core features mature and user feedback indicates demand

### Features Requiring Design Work

- [ ] **Encrypted Shareable Links via WebRTC P2P** (6 hours) - Priority TBD
  - Generate one-time shareable link using WebRTC peer-to-peer
  - Encrypt text/file → create local network link
  - Recipient on same network clicks link → auto-decrypts
  - No server, completely peer-to-peer via WebRTC
  - Self-destructs after one view
  - **Benefit**: Share encrypted files in same office without USB/email
  - **Use Case**: "Share confidential file with colleague without leaving digital trace"
  - **Challenges**: Requires both parties online simultaneously, network discovery UX
  - **Research Needed**: Workflow design, user discovery mechanism, fallback methods

- [ ] **Offline Device Sync via QR Codes** (4 hours) - Priority TBD
  - Export settings/presets as QR code
  - Scan QR with mobile device to import
  - Transfers theme, presets, history (NOT sensitive data)
  - Works completely offline, no cloud
  - **Benefit**: Multi-device configuration without betraying privacy principles
  - **Use Case**: "Configure desktop, scan QR, mobile has same settings"
  - **Dependency**: Requires more settings/presets to be worth implementing
  - **Research Needed**: What data is valuable enough to sync? Security of QR transfer?

---

## Removed/Reconsidered Features

### ❌ Not Pursuing

- **Backend API Integration** - Violates privacy-first principle (client-side only)
- **Cloud Storage Integration** - Same privacy concern, defeats offline-first design
- **User Accounts/Authentication** - Unnecessary for stateless tool, adds complexity
- **Analytics Integration** - Privacy concern, not aligned with project values

---

## Progress Summary

**Total Planned Features**: 69
- Phase 1: 5, Phase 2: 3, Phase 3: 3, Phase 3.5: 4
- Phase 4: 7 (was 4, +3 discovered), Phase 5: 4, Phase 6: 6 (was 5), Phase 7: 12 (was 13)
- Phase 8: 4 (NEW), Phase 9: 5 (NEW), Phase 10: 9 (was Phase 11), Phase 11-13: 7

**Completed**: 30 ✅ (43% of total)
- Phases 1-4: 22 features (100% complete)
- Phase 5: 3 features (75% complete)
- Phase 6-7: 4 features (partial)
- Phase 10: 1 feature (Hex Viewer)

**In Progress**: 4 🔄 (Phases 5, 6, 7, 10)
**Planned**: 39 📋
**Research Needed**: 2 🔬 (Phase 13)

**Phase Completion**:
- Phase 1 (Code Cleanup): ✅ 100% (5/5)
- Phase 2 (UI Modernization): ✅ 100% (3/3)
- Phase 3 (UX Enhancements): ✅ 100% (3/3)
- Phase 3.5 (Offline & Code Quality): ✅ 100% (4/4)
- Phase 4 (Security & Validation): ✅ 100% (7/7) **+3 features discovered**
- Phase 5 (Testing): 🔄 75% (3/4) **423 passing tests**
- Phase 6 (Additional UX): 🔄 33% (2/6)
- Phase 7 (New Tool Features): 🔄 17% (2/12)
- Phase 8 (DevOps & QA): ✅ 100% (4/4) **COMPLETED**
- Phase 9 (Modern UX Polish): 0% (0/5)
- Phase 10 (Privacy & Forensics): 🔄 11% (1/9) **← Hex Viewer completed**
- Phase 11 (TypeScript): 0% (0/3)
- Phase 12 (Accessibility/i18n): 0% (0/2)
- Phase 13 (Future): 0% (0/2)

---

## Next Immediate Steps

**Current Focus**: Production-Ready Quality → Modern UX → Advanced Features

**Completed Phases**:
- ✅ Phase 1: Code Cleanup & Quality (5/5)
- ✅ Phase 2: UI Modernization (3/3)
- ✅ Phase 3: UX Enhancements (3/3)
- ✅ Phase 3.5: Offline & Code Quality (4/4)
- ✅ Phase 4: Security & Validation (7/7) **+3 discovered features**
- 🔄 Phase 5: Testing (3/4) **423 tests passing!**

**Recommended Priority Order (Based on Audit)**:

**Phase 8: Production Readiness (CRITICAL - Do First)** 🔥🔥🔥
1. **CI/CD Pipeline** (3-4 hours) - Automated testing, prevent broken builds, huge ROI
2. **E2E Tests** (6-10 hours) - Complete Phase 5, test real workflows (you have 423 unit tests but no E2E!)
3. **Performance Monitoring** (2-3 hours) - Lighthouse CI, bundle budgets

**Phase 9: Modern UX Standards (HIGH - Do Second)** 🔥🔥
4. **Keyboard Shortcuts** (3-4 hours) - Expected in productivity tools, power-user essential
5. **Undo/Redo** (2-3 hours) - Modern standard, prevent data loss
6. **Auto Dark Mode** (1 hour) - System preference detection

**Phase 10: Privacy & Forensics (MEDIUM-HIGH - User Requested)** 🔥
7. **Metadata Editor & Steganography** (12-18 hours) - TOP user request, unique feature
8. **Hex Viewer & Binary Editor** (20-30 hours) - Power user favorite, major undertaking
9. **File Hash Verifier** (3 hours) - Essential integrity checks

**Phase 6 & 7: Remaining UX/Tools (MEDIUM):**
10. **Drag & Drop** (Phase 6, 2 hours) - Modern UX standard
11. **JWT Decoder** (Phase 7, 2.5 hours) - Developer tool
12. **JSON Formatter** (Phase 10, 2-3 hours) - Data analysis

**Why This Order?**
- **CI/CD first**: Protect quality as codebase grows (you're at 4,815 lines with 423 tests - automate it!)
- **E2E tests next**: Complete Phase 5 testing suite (the gap identified in audit)
- **Modern UX**: Keyboard shortcuts and undo are table stakes for productivity tools
- **Then advanced features**: Privacy tools after production quality is locked in

---

## Notes & Decisions

### Completed Work

- **2025-10-18**: Initialized project documentation
  - Created `.claude/memory.md`, `.claude/structure.md`, `.claude/roadmap.md`
  - Analyzed codebase comprehensively
  - Documented architecture, tech stack, and current state

- **2025-10-19**: Completed Phase 1 - Code Cleanup & Quality
  - Removed all legacy components (HelloWorld, TheWelcome, WelcomeItem, icon components)
  - Added `*.code-workspace` to .gitignore
  - Committed Service Worker changes
  - Added comprehensive JSDoc comments to all key methods
  - Improved error handling across all components

- **2025-10-19**: Completed Phase 2 - UI Modernization
  - Integrated custom color palette (sage, coffee, royal blue, deep blue)
  - Consolidated color configuration into theme.js
  - Redesigned app bar, navigation drawer, and all tool pages
  - Created comprehensive About page
  - Improved responsive design

- **2025-10-19**: Completed Phase 3 - UX Enhancements
  - Added snackbar success/error feedback to all components
  - Implemented monospace fonts for encoded/encrypted text
  - Created global-styles.css with animations and polish
  - Added max-width container for better readability
  - Improved page transitions and button hover effects

- **2025-10-20**: Completed Phase 4, Task #1 - Password Strength Indicator (Commit: 17d43cd)
  - Created PasswordStrengthIndicator.vue reusable component with progress bar, strength labels, and requirements checklist
  - Implemented passwordStrength.js with monotonically increasing scoring algorithm
  - Integrated into AESEnc.vue (full display) and AESDec.vue (minimal display)
  - Very Strong passwords require all security features (12+ chars, upper, lower, numbers, special chars)
  - Progress bar: Weak (0-33%), Medium (33-67%), Strong (67-90%), Very Strong (100%)
  - Applied code review optimizations: eliminated regex duplication, removed dead code
  - Performance improvement: 2x faster by computing regex patterns once

- **2025-10-19**: Completed Phase 3.5 - Offline Functionality & Code Quality (Commit: 334ca44)
  - Fixed service worker to properly cache all Vite-generated assets
  - Created automated build script for SW cache list updates
  - Fixed CORS caching for CDN crypto libraries (enables full offline functionality)
  - Added user-friendly error messages for AES operations
  - Refactored AES components with shared utilities (eliminated 80 lines duplication)
  - Created comprehensive offline functionality documentation

- **2025-10-21**: Completed Phase 6, Task #3 - Theme Toggle System (Commit: a09172f)
  - Implemented three-theme system: Default (light), Dark (Material Design), Slurm (original bright cyan)
  - Added square theme toggle buttons in app bar with icons (sun, moon, sparkle)
  - localStorage persistence with error handling for private browsing/quota issues
  - Theme initializes before render to prevent flash of wrong theme (FOWT)
  - Extracted COMMON_VARIABLES to eliminate duplication (DRY principle)
  - Code review applied: localStorage error handling, removed redundant helper functions
  - Updated documentation: .claude/structure.md and .claude/memory.md with theme patterns
  - Total changes: +303 lines, -81 lines (net +222 lines)

- **2025-10-28**: Completed Phase 7, Task #1 - Password Generator (Commit: 7a3748d)
  - Created PasswordGenerator.vue component (280 lines) with real-time auto-generation
  - Implemented passwordGenerator.js utility (127 lines) using Web Crypto API for secure randomness
  - Configurable options: length (8-64 chars), character types (uppercase, lowercase, numbers, special)
  - Password auto-regenerates on any option change (no manual button needed)
  - Integrated existing PasswordStrengthIndicator component for immediate feedback
  - Copy to clipboard with icon-only button matching existing pattern
  - Added to navigation drawer, home page grid, and About page
  - Design consistent with other tool pages (primary color theme, avatar header, card sections)
  - Uses Fisher-Yates shuffle algorithm to prevent predictable character patterns
  - Guarantees at least one character from each selected type
  - Total changes: +435 lines across 6 files (2 new, 4 modified)

- **2025-10-29**: Completed Phase 7, Task #2 - AES Text Encryption (Commit: 9755c9a)
  - Created TextAESEnc.vue (323 lines) and TextAESDec.vue (322 lines) components
  - Implemented auto-encryption with debouncing (350ms) for smooth UX
  - Password confirmation field with visual validation
  - Tab interface for input/output management in encryption tool
  - Integrated PasswordStrengthIndicator for security feedback
  - Copy/paste functionality using shared composables
  - Uses Web Crypto API directly (no worker needed for small text operations)
  - Added routes to main.js and navigation drawer
  - Total changes: +645 lines across 4 files (2 new, 2 modified)

- **2025-11-01**: Completed Phase 4, Tasks #3-4 - Major Refactoring & Standardization (Commit: 25babb4)
  - **Created 5 Composables**: Eliminated massive code duplication
    - useSnackbar.js (41 lines) - Centralized notification management, saves ~120 lines
    - useClipboard.js (74 lines) - Copy/paste with error handling, saves ~150 lines
    - useDebounce.js (66 lines) - Debounced functions with auto-cleanup, saves ~60 lines
    - useFileSizeValidation.js (99 lines) - File validation logic, saves ~180 lines
    - useAESWorker.js (163 lines) - Worker lifecycle management, saves ~200 lines, **FIXES MEMORY LEAK**
  - **Created 4 Shared Components**: Unified UI patterns
    - ToolPageHeader.vue (65 lines) - Standardized page headers, saves ~72 lines
    - SharedSnackbar.vue (76 lines) - Reusable snackbar
    - TextInputWithActions.vue (265 lines) - Text areas with action buttons
    - FileUploadWithValidation.vue (230 lines) - File upload with size validation and dynamic tooltips
  - **Refactored All 7 Components**: Converted to Composition API and standardized
    - TextAESEnc.vue: 466→323 lines (-31%)
    - TextAESDec.vue: 444→322 lines (-27%)
    - AESEnc.vue: 418→346 lines (-17%)
    - AESDec.vue: 491→426 lines (-13%)
    - Base64Enc.vue: 322→252 lines (-22%)
    - Base64Dec.vue: 305→226 lines (-26%)
    - PasswordGenerator.vue: 281→257 lines (-9%)
  - **Established Coding Standards**: Created comprehensive documentation
    - .claude/CODING-STANDARDS.md - Variable naming, import ordering, function organization
    - .claude/STANDARDIZATION-PROGRESS.md - Detailed progress tracking
  - **Code Quality Improvements**:
    - Eliminated ~1,124 lines of duplicated code
    - Fixed critical memory leak in AES components (workers now auto-terminate)
    - Standardized import ordering (Vue → utils → composables → components)
    - Consistent variable naming (is*, can*, handle* prefixes)
    - Unified error handling patterns
    - Consistent debounce timing (350ms text, 800ms crypto)
    - Added JSDoc comments for all functions
    - Organized return objects with section comments
  - **UI Enhancements**:
    - FileUploadWithValidation: Dynamic tooltips ("File too large", "Complete all fields", etc.)
    - FileUploadWithValidation: Button auto-disables when file exceeds size limit
    - PasswordGenerator: Compact 2-column layout (50% less vertical space)
    - PasswordGenerator: Added regenerate button with refresh icon
    - Base64Dec: Fixed button enable/disable logic (was broken with null vs array)
  - **Total Impact**: +2,792 insertions, -2,185 deletions (net +607 lines, but component code reduced by 472 lines)

- **2025-11-02**: Added 6 new creative features to roadmap
  - **Phase 6 (Usability)**: Password Session Manager, Smart Content Detection
  - **Phase 7 (Unique Features)**: Steganography Mode, Decryption Honeypot
  - **Phase 10 (Future Research)**: Encrypted Shareable Links (WebRTC P2P), Offline Device Sync (QR codes)
  - Updated progress statistics: 54 → 60 total planned features
  - Reorganized "Next Steps" by priority hierarchy: Usability → Functionality → Uniqueness
  - Reflects user priorities: privacy-conscious users and aficionados with usability as top concern

- **2025-11-08**: Consolidated AES Tools (4 → 2 components)
  - **Merged functionality**: Combined text and file AES encryption/decryption into unified tools
  - **AESEnc.vue enhanced** (+159 lines):
    - Added text output display with Base64 encoding
    - Auto-encryption with 800ms debounce for text input
    - Copy-to-clipboard functionality for encrypted text
    - Mutual exclusion: text disables file input, file disables text input
  - **AESDec.vue enhanced** (+180 lines):
    - Added encrypted text input section (paste Base64)
    - Auto-decryption with 800ms debounce for text input
    - Copy-to-clipboard functionality for decrypted text
    - Base64-to-binary conversion for text decryption
  - **Deleted redundant components**: TextAESEnc.vue (307 lines), TextAESDec.vue (317 lines)
  - **Updated navigation**:
    - main.js: Removed 2 routes (/textaesenc, /textaesdec)
    - Home.vue: Reduced from 4 to 2 AES menu items
    - Slurm.vue: Updated navigation drawer (4 → 2 AES tools)
  - **Net impact**: -285 lines total, cleaner menu, preserved all 4 workflows
  - **UX improvement**: Users can now switch between file/text encryption without navigation
  - **Rationale**: Reduces menu clutter while maintaining full functionality in fewer, more versatile components

- **2025-11-08**: Naming Convention Standardization
  - **Renamed components** to follow Vue.js best practices (multi-word PascalCase):
    - AESEnc.vue → AesEncrypt.vue
    - AESDec.vue → AesDecrypt.vue
    - Base64Enc.vue → Base64Encode.vue
    - Base64Dec.vue → Base64Decode.vue
  - **Updated component name exports** in all 4 renamed files
  - **Refactored route URLs** to kebab-case for SEO and readability:
    - /aesenc → /aes-encrypt
    - /aesdec → /aes-decrypt
    - /base64enc → /base64-encode
    - /base64dec → /base64-decode
  - **Updated all references** in main.js (imports + routes), Home.vue (menu items), Slurm.vue (navigation drawer)
  - **Benefits**: Better code maintainability, SEO-friendly URLs, follows industry standards

- **2025-11-08**: Password Session Manager (Phase 6, Task #6) ✅ COMPLETED
  - **Created usePasswordSession.js composable** (132 lines):
    - Manages sessionStorage with separate keys for encrypt/decrypt contexts
    - Provides reactive state for checkbox and visual indicator
    - Auto-loads saved password on component mount
    - Comprehensive error handling for storage operations
    - Auto-clears when checkbox unchecked (via watcher)
  - **Integrated into AesEncrypt.vue** (+28 lines):
    - Added "Remember password for this session" checkbox with hint text
    - Visual chip indicator with close button when password remembered
    - Password auto-saved to session when checkbox enabled
    - Modified clearInputs() to preserve password if session enabled
    - Watcher saves password on change when checkbox checked
  - **Integrated into AesDecrypt.vue** (+28 lines):
    - Same UI additions as AesEncrypt
    - Separate session storage key (prevents cross-contamination)
    - Password watcher saves to session when enabled
  - **Privacy-first implementation**:
    - sessionStorage only (memory-only, never persisted to disk)
    - Tab-scoped isolation (each tab has independent session)
    - Auto-clears on tab/window close (browser-handled)
    - Manual clear button always available
    - Opt-in only (checkbox unchecked by default)
  - **User experience improvements**:
    - Eliminate password re-entry for multi-file operations
    - Visual confirmation when password is remembered
    - Clear warning: "Password will be cleared when you close this tab"
    - One-click manual clear via chip close button
  - **Total changes**: +188 lines (1 new composable, 2 modified components)
  - **Use case**: "Encrypting 10 company documents with same password - no re-typing"

- **2025-11-09**: Roadmap Reorganization - Added Phase 11 Privacy & Forensics Tools
  - **Added new Phase 11**: Privacy & Forensics Tools (9 features, 26-34 hours total)
    - Priority 1: Metadata Editor & Steganography Tool (5-6 hours) 🔥🔥🔥 TOP PRIORITY
    - Priority 2: Hex Viewer & Binary Editor (6-7 hours) 🔥🔥 POWER USER FEATURE
    - Priority 1: File Hash Generator & Integrity Verifier (3 hours) 🔥 ESSENTIAL
    - Plus 6 more analysis/privacy features
  - **Removed features**:
    - Smart Content Detection (Phase 6) - Low ROI for CSV/text-only detection
    - Hash Generator (Phase 7) - Moved to Phase 11 with enhanced features
  - **Renumbered phases**: Phase 8 → 12 (TypeScript), Phase 9 → 13 (Accessibility), Phase 10 → 14 (Future)
  - **Updated statistics**: 60 → 67 total features (net +7 after removals)
  - **Reprioritized recommendations**: Privacy & Forensics tools now highest priority
  - **Rationale**: Focus on high-impact privacy features that align with target audience (privacy-conscious users, journalists, security professionals)
  - **Metadata Editor innovation**: Combines privacy sanitization + steganography + forensic editing in one tool
  - **Hex Editor scope**: Full binary editing with forensic features, inspired by CyberChef/ImHex
  - **Target audience shift**: Emphasize power users who need forensic/privacy tools over basic utility users

- **2025-11-09**: Comprehensive Roadmap Rationalization
  - **Audit findings**:
    - Phase 5 was 75% complete but marked 0% (423 passing tests discovered!)
    - 3 missing features added to Phase 4 (PasswordInput, CryptoProvider, PWA Auto-Update)
    - Feature counts corrected: Phase 6 (1/5→2/6), Phase 7 (2/13→2/12), Phase 4 (4→7)
    - Total features: 67→69 (accurate count), Completed: 23→29 (42%)
  - **Added new phases**:
    - Phase 8: DevOps & Quality (CI/CD, E2E tests, performance monitoring) - HIGH PRIORITY
    - Phase 9: Modern UX Polish (keyboard shortcuts, undo/redo, auto dark mode) - MEDIUM PRIORITY
  - **Renumbered for sequential order**: Phase 11-14 → Phase 10-13
  - **Time estimates corrected**:
    - Metadata Editor: 5-6h → 12-18h (realistic for 3-in-1 feature)
    - Hex Editor: 6-7h → 20-30h (realistic for complex binary editor)
    - Phase 10 total: 26-34h → 50-75h
  - **Priority reordering**: Production quality (CI/CD + E2E) now highest priority over new features
  - **Rationale**: With 423 tests and 4,815 lines of code, need CI/CD automation before adding complexity

- **2025-11-22**: Home Page Redesign - Compact Icon Grid Layout (Phase 2 Enhancement)
  - **Redesigned Home.vue** (315 lines → more compact):
    - Replaced large card grid (9 cards, 800px+ height) with compact icon grid (200-250px height)
    - 70%+ reduction in vertical space - all 8 tools visible without scrolling
    - Icon-based design: 3 category sections (Security, Encoding, Privacy & Analysis)
    - Uniform icon sizing: All tools use `size="x-large"` (64px) and icon `size="36"` for consistency
    - Rich tooltips (desktop only): Hover shows tool details without blocking navigation
    - One-click access: Click icon navigates directly (desktop and mobile)
    - Mobile-optimized: Tooltips disabled, direct tap-to-navigate
    - Removed "Featured" labels and hint text for cleaner design
    - Used Vuetify centralized theming (removed redundant `variant` and `size` props)
  - **Enhanced About.vue**:
    - Removed "Available Tools" section (redundant with improved home page)
    - Added "How It Works" section: Explains client-side processing, Web Workers, Service Workers, no-backend architecture
    - Added "Common Use Cases" section: 5 expandable panels with real-world examples
    - Added "FAQ" section: 6 common questions with detailed answers
    - Fixed file size limits to match actual implementation (200 MB general, 10 MB Base64 encode, 15 MB Base64 decode, 50 MB warning threshold)
    - Used centralized Vuetify theming for all chips
  - **UX Improvements**:
    - Progressive disclosure: Basics visible, details on demand (hover)
    - Category organization: Tools grouped logically by function
    - Consistent visual language: All icons same size, proper spacing
    - Desktop/mobile optimization: Different interactions per platform
  - **Code Quality**:
    - Followed coding standards: Centralized Vuetify styling, no redundant props
    - Theme variables for colors: `rgb(var(--v-theme-on-surface))`
    - Custom CSS only for layout (grid, flexbox, transitions)
  - **Total Impact**: Significantly improved first-impression UX, reduced home page complexity
  - **Benefit**: Faster tool discovery, cleaner modern design, better mobile experience

- **2025-11-18**: Hex Viewer & Code Restructuring (Phase 10 - First Major Feature)
  - **New Tool: Hex Viewer** (HexViewer.vue, 742 lines):
    - Three-column hex dump layout (Offset | Hex | ASCII)
    - Virtual scrolling for large files (up to 200MB) using custom composables
    - Search functionality: hex patterns, text strings, with navigation
    - Jump to offset: decimal or hex navigation
    - Data interpretation panel: integers, floats, text, timestamps in multiple formats
    - Color-coded display: printable vs. control characters
    - Copy to clipboard: hex and ASCII sections
    - File statistics: size, printable/control byte counts
    - Mobile-responsive with optimized font sizes and layout
  - **New Composables** (867 lines total):
    - `useHexViewer.js` (352 lines): Hex display logic, search, data interpretation
    - `useVirtualScroll.js` (164 lines): Performance optimization for large files
  - **New Utilities** (351 lines total):
    - `byteConverter.js` (222 lines): Data type conversions (int, float, text)
    - `hexFormatter.js` (129 lines): Hex/ASCII formatting and validation
  - **New Shared Components** (336 lines total):
    - `CardSectionHeader.vue` (79 lines): Reusable card section headers
    - `FileUpload.vue` (257 lines): Simplified file upload component
  - **Test Coverage**:
    - E2E tests: `hex-viewer.spec.js` (519 lines) - 35 test cases
    - Unit tests: `byteConverter.test.js` (273 lines), `hexFormatter.test.js` (249 lines)
    - 20 test fixture files for comprehensive testing
    - Total: 1,041 lines of test code
  - **Code Organization**:
    - Restructured: Moved all page components from `src/` to `src/views/` directory
    - Better separation: Views, components, composables, utils clearly organized
    - Updated imports in main.js and navigation
  - **Enhanced Responsive Layout** (Phase 2 Enhancement):
    - **App Bar (Slurm.vue)**: Mobile theme toggle (cycling button), responsive chip visibility
    - **Home & About**: Responsive typography (`text-h4` on xs, `text-sm-h3` on sm+), icon sizing
    - **Hex Viewer**: Controls stack vertically on mobile, responsive column layout
    - **Metadata Editor**: Table on desktop (`d-none d-sm-table`), card layout on mobile (`d-sm-none`)
    - **Benefit**: All pages adapt to smaller screens without stretching or overflow
  - **Total Impact**: +3,485 insertions, -347 deletions across 42 files
  - **Significance**: First major Phase 10 (Privacy & Forensics) tool completed

### Key Insights
- **Exceptional test coverage**: 423 passing tests with 95.45% coverage - significantly above industry standard
- **Well-structured foundation**: Modular architecture with composables, shared components, crypto provider abstraction
- **Production-ready gaps**: No CI/CD pipeline or E2E tests - critical for maintaining quality at scale
- **Modern UX opportunities**: Keyboard shortcuts and undo/redo missing - expected in productivity tools
- **Security focus**: Password validation, crypto provider flexibility, offline-first architecture
- **Feature priorities**: Production quality first, modern UX second, unique features third
- **Target audience**: Privacy-conscious power users value reliability and polish over novelty

---

## References
- [Project Memory](.claude/memory.md) - Code style and architecture guidelines
- [Code Structure](.claude/structure.md) - Current codebase organization
- [Main Application Files](../) - Link to main code files

Last Updated: 2025-11-09 (Comprehensive rationalization: Fixed all counts, added missing features, restructured phases 8-13, corrected time estimates, reprioritized for production quality)
