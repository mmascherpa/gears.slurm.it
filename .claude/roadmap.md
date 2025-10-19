# Slurm Tools Enhancement Roadmap

## Overview
Slurm Tools is a privacy-focused Progressive Web Application providing client-side cryptographic utilities (Base64 encoding/decoding and AES encryption/decryption) with full offline support. This roadmap outlines potential improvements to enhance functionality, code quality, user experience, and maintainability.

---

## Current State

### Existing Features
- ✅ **Base64 Encoder** - Text and file encoding with clipboard operations
- ✅ **Base64 Decoder** - Text and file decoding with clipboard operations
- ✅ **AES File Encryption** - Password-protected encryption with CSV preview
- ✅ **AES File Decryption** - Password-protected decryption with CSV preview
- ✅ **Progressive Web App** - Offline functionality via Service Worker
- ✅ **Responsive Layout** - Material Design UI adapting to mobile/tablet/desktop
- ✅ **Web Worker Integration** - Background crypto operations
- ✅ **Data Table Display** - v-data-table for CSV previews with search

### Known Issues
- 🐛 Service Worker file modified but not committed (public/sw.js)
- 🐛 Untracked workspace file (src/gears.code-workspace) should be gitignored
- ⚠️ Legacy components still in repo (HelloWorld.vue, TheWelcome.vue, WelcomeItem.vue, icon components)
- ⚠️ App.vue component unused but still in codebase
- ⚠️ No error handling for unsupported file types in AES operations
- ⚠️ Password strength validation missing

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

**Status**: ⚪ Not Started
**Estimated Effort**: 3-5 hours

### Features

- [ ] **Remove Legacy Components** (30 min) - Priority 1
  - Delete HelloWorld.vue, TheWelcome.vue, WelcomeItem.vue
  - Delete icon components (IconCommunity, IconDocumentation, etc.)
  - Delete unused App.vue component
  - Remove references from imports
  - **Benefit**: Cleaner codebase, reduced bundle size

- [ ] **Gitignore Workspace Files** (10 min) - Priority 1
  - Add `*.code-workspace` to .gitignore
  - Remove src/gears.code-workspace from tracking
  - **Benefit**: Prevent personal workspace configs from cluttering repo

- [ ] **Commit Service Worker Changes** (15 min) - Priority 1
  - Review changes in public/sw.js
  - Test offline functionality
  - Commit with descriptive message
  - **Benefit**: Clean working directory, version control SW updates

- [ ] **Add JSDoc Comments** (2 hours) - Priority 2
  - Document key methods in Base64Enc/Dec components
  - Document AESEnc/Dec encryption/decryption flow
  - Add comments for worker message protocol
  - **Benefit**: Better code maintainability, IDE intellisense

- [ ] **Error Handling Improvements** (1.5 hours) - Priority 2
  - Add try-catch blocks for file type detection
  - Improve error messages for crypto failures
  - Handle unsupported file formats gracefully
  - Add timeout handling for worker operations
  - **Benefit**: More robust application, better UX

---

## Phase 2: Security & Validation (Priority: HIGH)

**Status**: ⚪ Not Started
**Estimated Effort**: 4-6 hours

### Features

- [ ] **Password Strength Indicator** (2 hours) - Priority 1
  - Add visual password strength meter (weak/medium/strong)
  - Show requirements (length, complexity)
  - Warn on weak passwords
  - **Benefit**: Improved security UX, educates users

- [ ] **File Size Validation** (1 hour) - Priority 2
  - Add max file size limits (configurable)
  - Show warning for large files (>50MB)
  - Display progress for large file operations
  - **Benefit**: Prevent browser crashes, better UX

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

## Phase 3: Testing Infrastructure (Priority: MEDIUM)

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

## Phase 4: User Experience Enhancements (Priority: MEDIUM)

**Status**: ⚪ Not Started
**Estimated Effort**: 6-10 hours

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

- [ ] **Dark Mode Support** (2 hours) - Priority 2
  - Add dark theme to theme.js
  - Implement theme toggle in app bar
  - Store preference in localStorage
  - **Benefit**: Accessibility, user preference

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

## Phase 5: New Features (Priority: LOW)

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

## Phase 6: TypeScript Migration (Priority: LOW)

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

## Phase 7: Accessibility & Internationalization (Priority: VERY LOW)

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

**Total Planned Features**: 36
**Completed**: 0 ✅
**In Progress**: 0 🔄
**Planned**: 36 📋

**Phase Completion**:
- Phase 1: 0% (0/5 features completed)
- Phase 2: 0% (0/4 features completed)
- Phase 3: 0% (0/4 features completed)
- Phase 4: 0% (0/5 features completed)
- Phase 5: 0% (0/6 features completed)
- Phase 6: 0% (0/3 features completed)
- Phase 7: 0% (0/2 features completed)

---

## Architecture Decisions

### Current Approach
- **Client-side only**: All operations in browser, no backend
- **Progressive Web App**: Service Worker for offline functionality
- **Component-based**: Vue 3 SFC with clear separation of concerns
- **Worker-based parallelism**: CPU-intensive crypto on background threads
- **Material Design**: Vuetify for consistent, professional UI

### Design Principles
- **Privacy First** - Never send user data to servers
- **Offline First** - Full functionality without internet
- **Progressive Enhancement** - Core features work, PWA enhances
- **Performance Conscious** - Non-blocking crypto operations
- **Mobile Responsive** - Adapts to all screen sizes

---

## Next Immediate Steps

**Current Focus**: Phase 1 - Code Cleanup & Quality

Next up:
1. **Remove Legacy Components** (30 min, Priority 1) - Clean up unused Vue components
2. **Gitignore Workspace Files** (10 min, Priority 1) - Prevent workspace files in repo
3. **Commit Service Worker Changes** (15 min, Priority 1) - Complete in-progress work

Then assess user priorities and continue with Phase 1 or jump to Phase 2 based on feedback.

---

## Notes & Decisions

### Completed Work

- **2025-10-18**: Initialized project documentation
  - Created `.claude/memory.md`, `.claude/structure.md`, `.claude/roadmap.md`
  - Analyzed codebase comprehensively
  - Documented architecture, tech stack, and current state

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

Last Updated: 2025-10-18 (Initial roadmap created)
