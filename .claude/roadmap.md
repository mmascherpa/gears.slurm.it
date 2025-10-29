# Slurm Tools Enhancement Roadmap

## Purpose
This file tracks feature planning, completed work, and future development priorities for the Slurm Tools project.

---

## Current State

### Existing Features (Production)
- ✅ **Base64 Encoder** - Text and file encoding with clipboard operations
- ✅ **Base64 Decoder** - Text and file decoding with clipboard operations
- ✅ **AES File Encryption** - Password-protected encryption with CSV preview
- ✅ **AES File Decryption** - Password-protected decryption with CSV preview
- ✅ **Progressive Web App** - Offline functionality via Service Worker
- ✅ **Responsive Layout** - Material Design UI adapting to mobile/tablet/desktop
- ✅ **Web Worker Integration** - Background crypto operations
- ✅ **Data Table Display** - v-data-table for CSV previews with search

### Known Issues
- ⚠️ Password strength validation missing
- ⚠️ File size validation missing (large files could crash browser)

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

**Status**: 🔄 In Progress (2/4 features completed)
**Estimated Effort**: 4-6 hours
**Actual Effort**: 3 hours (Tasks #1-2)

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

- [ ] **Input Sanitization** (1 hour) - Priority 2
  - Validate filename characters for downloads
  - Sanitize CSV parsing to prevent injection
  - Add Content Security Policy headers
  - **Benefit**: Enhanced security posture

- [ ] **Self-Hosted CryptoJS** (1.5 hours) - Priority 3
  - Download and vendor CryptoJS library
  - Remove CDN dependency
  - Update worker.js to use local version
  - Update Service Worker cache
  - **Benefit**: Eliminates external dependency, works fully offline, security control
  - **Dependency**: Requires testing offline functionality

---

## Phase 5: Testing Infrastructure (Priority: MEDIUM)

**Status**: ⚪ Not Started
**Estimated Effort**: 8-12 hours

### Features

- [ ] **Setup Vitest** (2 hours) - Priority 1
  - Install Vitest and @vue/test-utils
  - Configure vite.config.js for tests
  - Add npm test script
  - Setup test file structure
  - **Benefit**: Foundation for automated testing

- [ ] **Unit Tests for Utilities** (3 hours) - Priority 2
  - Test buffer utilities (src/assets/util/)
  - Test base64 encoding/decoding logic
  - Test CSV parsing functions
  - **Benefit**: Catch regressions early

- [ ] **Component Tests** (4 hours) - Priority 2
  - Test Base64Enc/Dec components
  - Test AESEnc/Dec components
  - Test Home.vue navigation
  - **Benefit**: Ensure UI behaves correctly

- [ ] **E2E Tests** (3 hours) - Priority 3
  - Install Playwright or Cypress
  - Test full encryption/decryption workflow
  - Test offline PWA functionality
  - Test clipboard operations
  - **Benefit**: Confidence in production builds
  - **Dependency**: Requires Phase 3.1 and 3.2 completion

---

## Phase 6: Additional UX Features (Priority: MEDIUM)

**Status**: 🔄 In Progress (1/5 features completed)
**Estimated Effort**: 6-10 hours
**Actual Effort**: 3 hours (Theme Toggle)

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

---

## Phase 7: New Features (Priority: LOW)

**Status**: ⚪ Not Started
**Estimated Effort**: 12-20 hours
**Trigger**: When user feedback indicates demand

### Features

- [ ] **Hash Generator Tool** (3 hours) - Priority 1
  - Add new page for SHA-256, SHA-512, MD5 hashing
  - File and text hashing support
  - Compare hashes functionality
  - **Benefit**: Expands toolkit, common use case

- [ ] **Text Encryption (AES)** (3 hours) - Priority 2
  - Add text-based AES encryption (in addition to files)
  - Password protection
  - Copy encrypted text to clipboard
  - **Benefit**: Quick text encryption without file I/O

- [ ] **URL Encoder/Decoder** (2 hours) - Priority 2
  - Add URL encoding/decoding tool
  - Component-wise encoding option
  - **Benefit**: Common developer tool

- [ ] **JWT Decoder** (2.5 hours) - Priority 3
  - Decode and display JWT tokens
  - Show header, payload, signature
  - Validate signature (optional)
  - **Benefit**: Useful for developers

- [ ] **Export/Import Settings** (2 hours) - Priority 3
  - Export app settings to JSON
  - Import settings from file
  - **Benefit**: User convenience for multi-device usage

- [ ] **Batch File Operations** (4 hours) - Priority 4
  - Support multiple file uploads
  - Batch encode/decode/encrypt/decrypt
  - Download as ZIP
  - **Benefit**: Efficiency for power users
  - **Dependency**: Requires significant UI/UX redesign

---

## Phase 8: TypeScript Migration (Priority: LOW)

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

## Phase 9: Accessibility & Internationalization (Priority: VERY LOW)

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

## Removed/Reconsidered Features

### ❌ Not Pursuing

- **Backend API Integration** - Violates privacy-first principle (client-side only)
- **Cloud Storage Integration** - Same privacy concern, defeats offline-first design
- **User Accounts/Authentication** - Unnecessary for stateless tool, adds complexity
- **Analytics Integration** - Privacy concern, not aligned with project values

---

## Progress Summary

**Total Planned Features**: 49
**Completed**: 19 ✅
**In Progress**: 2 🔄 (Phase 4, Phase 6)
**Planned**: 30 📋

**Phase Completion**:
- Phase 1 (Code Cleanup): ✅ 100% (5/5 features completed)
- Phase 2 (UI Modernization): ✅ 100% (3/3 features completed)
- Phase 3 (UX Enhancements): ✅ 100% (3/3 features completed)
- Phase 3.5 (Offline & Code Quality): ✅ 100% (4/4 features completed)
- Phase 4 (Security): 🔄 25% (1/4 features completed)
- Phase 5 (Testing): 0% (0/4 features completed)
- Phase 6 (Additional UX): 🔄 20% (1/5 features completed)
- Phase 7 (New Features): 0% (0/6 features completed)
- Phase 8 (TypeScript): 0% (0/3 features completed)
- Phase 9 (Accessibility/i18n): 0% (0/2 features completed)

---

## Next Immediate Steps

**Current Focus**: Phase 4 - Security & Validation

**Completed Phases**:
- ✅ Phase 1: Code Cleanup & Quality (5/5 features)
- ✅ Phase 2: UI Modernization (3/3 features)
- ✅ Phase 3: UX Enhancements (3/3 features)
- ✅ Phase 3.5: Offline Functionality & Code Quality (4/4 features)

**Recommended Next Steps**:
1. **Password Strength Indicator** (Phase 4, 2 hours) - Improve security UX
2. **File Size Validation** (Phase 4, 1 hour) - Prevent browser crashes
3. **Self-Hosted CryptoJS** (Phase 4, 1.5 hours) - Eliminate external dependency (partially addressed by Phase 3.5 CORS caching)

Or assess user priorities for additional features from Phase 6+ based on feedback.

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

### Key Insights
- **Well-structured foundation**: Current codebase is clean and focused
- **Scope management**: Avoiding feature creep by maintaining privacy/offline-first principles
- **Testing gap**: No automated tests is biggest technical debt item
- **Security focus**: Password validation and self-hosted crypto lib are high-value wins

---

## References
- [Project Memory](.claude/memory.md) - Code style and architecture guidelines
- [Code Structure](.claude/structure.md) - Current codebase organization
- [Main Application Files](../) - Link to main code files

Last Updated: 2025-10-21 (Completed Phase 6, Task #3 - Theme Toggle System)
