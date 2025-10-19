# Slurm Tools Project Memory

## Project Overview
Slurm Tools is a Progressive Web Application (PWA) providing browser-based cryptographic and encoding utilities. The toolkit offers Base64 encoding/decoding and AES file encryption/decryption, with full offline functionality via Service Worker. Built for privacy-conscious users who need client-side encryption without server uploads.

---

## Code Style Preferences

### JavaScript/Vue 3
- Use ES6+ syntax (arrow functions, destructuring, template literals)
- Prefer `const` over `let`, avoid `var`
- Component methods use regular function syntax (not arrow functions) to preserve `this` context
- Async operations use async/await pattern
- 350ms debounce for real-time encoding operations

**Note**: Follows global code style preferences from `~/.claude/memory.md` unless noted otherwise below.

### Project-Specific Style Overrides
- Vue components use Composition API style where appropriate
- Vuetify components preferred over custom HTML/CSS
- Material Design Icons (`mdi-` prefix) for all icons
- Hash-based routing (`#/`) for SPA compatibility

---

## Comments
- Minimal comments - prefer self-documenting code with clear variable/function names
- Add comments for complex crypto operations or non-obvious browser API usage
- Use JSDoc-style comments for public API methods
- Document workarounds for browser compatibility issues

---

## Formatting
- 2-space indentation (Vue/JavaScript standard)
- No specific line length limit (reasonable discretion)
- Formatting tools: Vite defaults, no explicit Prettier/ESLint config
- Single quotes for strings in JavaScript, no strict enforcement

---

## Error Handling
- Try-catch blocks around file I/O operations
- Web Worker errors caught and sent via postMessage
- User-friendly error messages displayed in Vuetify v-alert components
- Console.error for debugging, v-alert for user feedback
- Graceful degradation for unsupported browser features

**Error Display Pattern**:
```javascript
try {
  // risky operation
} catch (error) {
  this.errorMessage = 'User-friendly error description'
  console.error('Technical details:', error)
}
```

---

## Project Architecture

### Design Principles
- **Privacy First**: All crypto operations client-side, no server uploads
- **Offline First**: Full functionality without internet via Service Worker
- **Progressive Enhancement**: Core features work, PWA features enhance experience
- **Performance Conscious**: CPU-intensive tasks on Web Workers to avoid UI blocking
- **Mobile Responsive**: Material Design with breakpoints for all screen sizes

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

### APIs / External Services
- **Web Crypto API**: Used in jsAesCrypt for cryptographic operations
- **FileReader API**: Reading files in browser without upload
- **Clipboard API**: Copy/paste functionality
- **Service Worker API**: Offline caching and PWA functionality
- **Web Worker API**: Background thread for crypto operations
- **CryptoJS CDN**: https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/crypto-js.min.js

---

## Code Structure

**See [structure.md](.claude/structure.md) for detailed file organization and class responsibilities.**

### High-Level Organization
- `/src/` - Vue components, application entry point, theme configuration
- `/public/` - Static files (Service Worker, Web Worker, manifest, icons, crypto libs)
- `/scripts/` - Build utilities (icon generation)
- `/.claude/` - Project documentation (memory, structure, roadmap)

### Entry Points
- **index.html** → **main.js** - Main application entry
- **public/sw.js** - Service Worker (PWA caching)
- **public/worker.js** - Web Worker (crypto operations)

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

---

## Development Workflow

### Local Development
```bash
npm install          # Install dependencies
npm run dev          # Start Vite dev server (usually port 5173)
npm run build        # Production build to ../slurm.it/
npm run preview      # Preview production build locally
npm run generate-icons  # Generate PNG icons from SVG
```

### Debugging
- **Vue DevTools**: Browser extension for component inspection
- **Console logging**: Use console.error for debugging, remove before commit
- **Network tab**: Monitor Service Worker caching behavior
- **Application tab**: Inspect Service Worker, manifest, cache storage
- **Sources tab**: Debug Web Worker and Service Worker code

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
- **Lazy loading**: Router uses hash-based navigation with component lazy load

---

## User Experience Priorities

1. **Privacy**: All operations client-side, no data leaves device
2. **Offline functionality**: Works without internet after initial load
3. **Mobile responsive**: Adapts to phone, tablet, desktop screens
4. **Clear feedback**: Loading indicators, error messages, success confirmations
5. **Accessibility**: Semantic HTML, ARIA labels where needed

---

## Deployment

### Build Process
```bash
npm run build
```
- Vite builds and minifies assets
- Output directory: `../slurm.it/` (external folder)
- Service Worker and Web Worker copied to output
- Hashed filenames for cache busting
- Minified JS/CSS bundles

### Build Configuration
- **Environment variables**: None currently (no backend)
- **Build artifacts**: index.html, /assets/, /libs/, sw.js, worker.js, manifest.json, /icons/

### Hosting
- **Current deployment**: Built to `../slurm.it/` directory
- **Hosting requirements**: Static file hosting (no server-side processing)
- **Suggested platforms**: GitHub Pages, Netlify, Vercel, any static host
- **URLs**: No production URL in code currently

---

## Current Phase

**Focus**: Stabilization and UI refinement

### Active Goals
- Improve responsive layout for small screens
- Refine data table display for CSV previews
- Optimize PWA caching strategy
- Bug fixes and edge case handling

### Known Limitations
- No automated testing infrastructure
- No TypeScript type safety
- Legacy Vue template components (HelloWorld, etc.) still in repo
- No formal state management (fine for current scope)
- Limited accessibility features (could expand ARIA labels)

---

## Project-Specific Guidelines

### Worker Communication Pattern
Always use structured messages with `type` field:
```javascript
// Component to Worker
worker.postMessage({ type: 'encrypt', file: fileData, password: pwd })

// Worker to Component
self.postMessage({ success: true, result: encryptedData })
self.postMessage({ success: false, error: 'Error message' })
```

### File Download Pattern
Use Blob URLs for downloads:
```javascript
const blob = new Blob([data], { type: mimeType })
const url = URL.createObjectURL(blob)
const link = document.createElement('a')
link.href = url
link.download = filename
link.click()
URL.revokeObjectURL(url)
```

### Service Worker Updates
Cache version must be updated when static assets change:
```javascript
const CACHE_NAME = 'slurm-tools-v1'  // Increment version on changes
```

---

## References
- [Roadmap](.claude/roadmap.md) - Feature planning and progress
- [Structure](.claude/structure.md) - Detailed code organization
- [Global Preferences](~/.claude/memory.md) - Global code style preferences
- [Vue 3 Docs](https://vuejs.org/)
- [Vuetify Docs](https://vuetifyjs.com/)
- [CryptoJS Docs](https://cryptojs.gitbook.io/)

---

Last Updated: 2025-10-18
