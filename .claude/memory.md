# Slurm Tools Project Memory

## Purpose
This file contains code style preferences, coding patterns, and development practices for the Slurm Tools project.

---

## Code Style Preferences

### JavaScript/Vue 3
- ES6+ syntax (arrow functions, destructuring, template literals)
- `const` over `let`, avoid `var`
- **Vue 3 Composition API** for all components (migrated from Options API in 2025-11-01)
- Async operations use async/await pattern
- Standard debounce delays: 350ms (text operations), 800ms (crypto operations)

**Note**: Follows global code style preferences from `~/.claude/memory.md` unless noted otherwise.

**Detailed Standards**: See [CODING-STANDARDS.md](CODING-STANDARDS.md) for comprehensive coding guidelines established during Phase 4 refactoring.

### Project-Specific Style Overrides
- Vuetify components preferred over custom HTML/CSS
- Material Design Icons (`mdi-` prefix) for all icons
- Hash-based routing (`#/`) for SPA compatibility

### Formatting
- 2-space indentation (Vue/JavaScript standard)
- No specific line length limit (reasonable discretion)
- Formatting tools: Vite defaults, no explicit Prettier/ESLint config
- Single quotes for strings in JavaScript, no strict enforcement

### Comments
- Minimal comments - prefer self-documenting code with clear variable/function names
- JSDoc-style comments for public API methods
- Comment complex crypto operations and non-obvious browser API usage
- Document workarounds for browser compatibility issues

---

## Error Handling Patterns

### General Error Handling
- Try-catch blocks around file I/O operations
- User-friendly error messages displayed in Vuetify v-alert components
- Console.error for debugging (remove before commit)
- Graceful degradation for unsupported browser features
- **AES library throws strings (not Error objects)** - handle both types

### Error Display Pattern
```javascript
try {
  // risky operation
} catch (error) {
  // Handle both string and Error object exceptions
  const errorMessage = typeof error === 'string' ? error : (error.message || 'Unknown error');
  this.errorMessage = 'User-friendly error description'
  console.error('Technical details:', error)
}
```

### Worker Error Handling Pattern
```javascript
.catch((error) => {
  const errorMessage = typeof error === 'string' ? error : (error.message || 'Unknown error');

  // Transform technical errors to user-friendly messages
  let friendlyMessage = errorMessage;
  if (errorMessage.includes("Wrong password")) {
    friendlyMessage = "Incorrect password. Please check your password and try again.";
  } else if (errorMessage.includes("Bad HMAC")) {
    friendlyMessage = "File appears to be corrupted or tampered with.";
  }

  postMessage(["ERROR", friendlyMessage, "DECRYPT"]);
});
```

---

## Critical Coding Patterns

### Worker Communication Protocol
**WHY THIS MATTERS**: Web Workers don't share memory with main thread. Must use structured messaging.

Always use structured array messages:

```javascript
// Component → Worker
worker.postMessage(["ENCRYPT", fileData, password, fileName])
worker.postMessage(["DECRYPT", fileData, password, fileName])

// Worker → Component
self.postMessage(["ENCRYPT", encryptedData, outputFileName])
self.postMessage(["DECRYPT", decryptedData, outputFileName])
self.postMessage(["ERROR", errorMessage, operationType])
```

### Service Worker Auto-Updates
**WHY THIS MATTERS**: Vite generates hashed filenames. Manual SW edits break on every build.

Cache name automatically updated on each build by `scripts/update-sw-cache.js`:
- **NEVER manually edit** `CACHE_NAME` or `urlsToCache` in `public/sw.js`
- Build script automatically scans dist/ and updates cache list
- Ensures offline functionality works after each build

### Theme System
**WHY THIS MATTERS**: Must initialize before render to prevent flash of wrong theme (FOWT).

- Initialize theme immediately in component setup (not in `mounted()`)
- Use try-catch for localStorage (fails in private browsing)
- Three modes: DEFAULT (light), DARK, CRAZY (Slurm mode)
- Stored in localStorage as `'slurm-theme-preference'`

---

## Technology Stack

### Core Technologies
- **Vue 3**: v3.3.11 - Progressive JavaScript framework
- **Vite**: v5.0.10 - Build tool and dev server with HMR
- **Vuetify**: v3.4.8 - Material Design component framework

### Dependencies
- **Vue Router**: v4.2.5 - Client-side routing with hash history
- **CryptoJS**: v4.0.0 (CDN) - AES encryption/decryption
- **file-type**: v19.0.0 - File type detection from buffer
- **jsAesCrypt**: (vendored) - File-based AES encryption
- **Sharp**: v0.33.2 (dev) - Image processing for icon generation
- **@mdi/font**: v7.4.47 - Material Design Icons

### Browser APIs Used
- **Web Crypto API**: Used in jsAesCrypt for cryptographic operations
- **FileReader API**: Reading files in browser without upload
- **Clipboard API**: Copy/paste functionality
- **Service Worker API**: Offline caching and PWA functionality
- **Web Worker API**: Background thread for crypto operations

---

## Development Workflow

### Commands
```bash
npm install                # Install dependencies
npm run dev                # Start Vite dev server (port 5173)
npm run build              # Production build to ../slurm.it/
npm run preview            # Preview production build locally
npm run generate-icons     # Generate PNG icons from SVG
```

### Debugging Tools
- **Vue DevTools**: Browser extension for component inspection
- **Console logging**: Use console.error for debugging, remove before commit
- **Network tab**: Monitor Service Worker caching behavior
- **Application tab**: Inspect Service Worker, manifest, cache storage
- **Sources tab**: Debug Web Worker and Service Worker code

### Build Process
```bash
npm run build
```
- Vite builds and minifies assets
- **Automated post-build**: `scripts/update-sw-cache.js` runs automatically
  - Scans `dist/` for generated asset filenames
  - Updates service worker cache list with correct hashed filenames
  - Updates cache name with timestamp for versioning
- Output directory: `../slurm.it/` (external folder)

---

## Testing Approach

### Strategy
- **Manual testing** in multiple browsers (Chrome, Firefox, Safari, Edge)
- Focus on edge cases: large files, invalid passwords, corrupt data
- Test offline functionality by disabling network
- No automated test suite currently implemented

### Key Test Cases
- Base64 encoding/decoding with Unicode characters
- AES encryption/decryption with various file sizes (small, medium, large)
- Clipboard operations across browsers
- Offline functionality after Service Worker activation
- Password mismatch validation
- Invalid file format handling
- CSV parsing with different delimiters and encodings

### Offline Testing
1. Chrome DevTools → Network tab → Check "Offline"
2. Reload page
3. Verify all features work (especially AES encryption with CryptoJS from cache)

---

## Performance Considerations

### Critical Performance Requirements
- Must work offline after first load
- Crypto operations must not block UI (use Web Workers)
- File encoding/decoding should handle files up to 100MB+
- Initial page load < 3 seconds on 3G
- Responsive interactions < 100ms (debounced input at 350ms)

### Optimization Strategies
- **Web Workers**: Offload AES encryption/decryption
- **Debouncing**: 350ms delay for real-time Base64 encoding
- **CryptoJS from CDN**: Reduce main bundle size, leverage browser cache
- **Service Worker caching**: Cache-first strategy for static assets
- **Code splitting**: Vite automatically splits vendor chunks

---

## Design Principles

### Core Principles
1. **Privacy First**: All crypto operations client-side, no server uploads
2. **Offline First**: Full functionality without internet via Service Worker
3. **Progressive Enhancement**: Core features work, PWA features enhance experience
4. **Performance Conscious**: CPU-intensive tasks on Web Workers to avoid UI blocking
5. **Mobile Responsive**: Material Design with breakpoints for all screen sizes

### Architectural Patterns
- **Component-Based Architecture**: Vue 3 single-file components with clear responsibilities
- **Worker-Based Parallelism**: Web Workers for encryption/decryption to keep UI responsive
- **Cache-First PWA**: Service Worker caches assets for offline usage
- **Hash-Based Routing**: Client-side routing without server-side configuration

### Key Constraints
- Must work entirely client-side (no backend)
- Must function offline after initial load
- Must handle large files without blocking UI
- Must support modern browsers (Chrome, Firefox, Safari, Edge)
- Crypto libraries loaded from CDN to reduce bundle size

---

## User Experience Priorities

1. **Privacy**: All operations client-side, no data leaves device
2. **Offline functionality**: Works without internet after initial load
3. **Mobile responsive**: Adapts to phone, tablet, desktop screens
4. **Clear feedback**: Loading indicators, error messages, success confirmations
5. **Accessibility**: Semantic HTML, ARIA labels where needed

---

## Known Limitations

- No automated testing infrastructure
- No TypeScript type safety
- No formal state management (fine for current scope)
- Limited accessibility features (could expand ARIA labels)
- CSV parser is basic (doesn't handle quoted fields with commas)

---

## Architecture Notes

### Composables Pattern (2025-11-01)
**WHY THIS MATTERS**: Eliminates code duplication, provides automatic cleanup, ensures consistent behavior.

- **Extract reusable logic** to `src/composables/` directory
- **Available composables**:
  - `useSnackbar()` - Centralized notification state
  - `useClipboard()` - Copy/paste with error handling
  - `useDebounce()` - Debounced functions with auto-cleanup
  - `useFileSizeValidation()` - File size validation (50MB warning, 200MB max)
  - `useAESWorker()` - Web Worker lifecycle with memory leak fix
- **Critical**: `useAESWorker` automatically terminates workers on unmount (fixes memory leak)
- All composables use `onBeforeUnmount` for cleanup
- See [structure.md](structure.md) for usage patterns

### Shared Components Pattern (2025-11-01)
**WHY THIS MATTERS**: DRY principle, consistent UX, reduced maintenance burden.

- **Reusable components** in `src/components/` directory
- **Available shared components**:
  - `ToolPageHeader.vue` - Standardized page headers
  - `SharedSnackbar.vue` - Centralized notifications
  - `TextInputWithActions.vue` - Text input with configurable buttons
  - `FileUploadWithValidation.vue` - File upload with size validation and dynamic tooltips
- All tool pages use these components for consistency
- See [structure.md](structure.md) for props and usage

### Shared Utilities Pattern (2025-10-19)
- Extract common logic to `src/utils/` directory
- See [structure.md](structure.md) for available utilities
- Utilities are self-documenting with JSDoc comments

---

## References

- [CLAUDE.md](../CLAUDE.md) - Quick start guide for Claude Code instances
- [CODING-STANDARDS.md](CODING-STANDARDS.md) - Comprehensive coding guidelines (NEW)
- [structure.md](structure.md) - Detailed code organization
- [roadmap.md](roadmap.md) - Feature planning and progress
- [Vue 3 Docs](https://vuejs.org/)
- [Vuetify Docs](https://vuetifyjs.com/)
- [CryptoJS Docs](https://cryptojs.gitbook.io/)

---

**Last Updated**: 2025-11-01 (Added composables pattern, shared components pattern, Vue 3 Composition API migration, CODING-STANDARDS.md reference)
