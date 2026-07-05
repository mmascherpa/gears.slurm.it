# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Slurm Tools** - Privacy-focused Progressive Web Application for browser-based cryptography and utilities (Base64 encoding/decoding, QR code generation, AES/Age file encryption/decryption, metadata editing). 100% client-side with full offline functionality.

**Stack**: Vue 3, Vuetify, Vite
**Encryption**: Supports AES-256 (via jsAesCrypt/WebCrypto) and Age encryption (via rage-wasm)

## Essential Commands

```bash
# Development
npm install                # Install dependencies
npm run dev                # Start dev server (port 5173)

# Production
npm run build              # Build to ./deploy/ + auto-update service worker
npm run preview            # Preview production build

# Utilities
npm run generate-icons     # Generate PNG icons from SVG
```

## Critical Build Process

**Important**: Service worker cache is auto-updated on each build by `scripts/update-sw-cache.js`. This scans Vite-generated hashed filenames (e.g., `index-WGGwRhsH.js`) and updates `public/sw.js` cache list for offline functionality.

**Never manually edit** the `CACHE_NAME` or `urlsToCache` in `public/sw.js` - they're auto-generated.

## Architecture Quick Reference

### Core Patterns

**Component-Based**: Vue 3 SFCs, each tool is a standalone page component

**Worker-Based Parallelism**:
- **Classic Web Worker** (`public/worker.js`) - jsAesCrypt encryption/decryption (locally vendored libraries)
- **ES Module Web Worker** (`src/workers/cryptoWorker.js`) - WebCrypto/Age encryption (Vite-bundled with rage-wasm)
- **Service Worker** (`public/sw.js`) - Offline caching with cache-first strategy

**Note**: The application uses two different worker types because:
- jsAesCrypt requires classic worker with `importScripts()` for its non-module libraries
- Age encryption requires ES module worker for proper WASM bundling via Vite
- The correct worker is automatically selected based on the chosen algorithm

**Worker Communication Protocol**:
```javascript
// Component → Worker
worker.postMessage(["ENCRYPT", fileData, password, fileName, algorithm])
worker.postMessage(["DECRYPT", fileData, password, fileName, algorithm])

// Worker → Component
self.postMessage(["ENCRYPT", encryptedData, outputFileName])
self.postMessage(["ERROR", errorMessage, operationType])
```

**Provider Pattern** (Pluggable Encryption Backends):
- **jsAesCrypt** - AES-256-CBC (.aes files) compatible with AES Crypt format
- **WebCrypto** - Browser-native AES-256-GCM (.enc files)
- **Age** - Modern age encryption (.age files) compatible with age CLI tools

Each provider implements: `encrypt()`, `decrypt()`, `getInfo()`, `normalizeError()`, `validatePassword()`

### Entry Points

1. **Main App**: `index.html` → `src/main.js` (router, Vuetify, Vue setup)
2. **Service Worker**: `public/sw.js` (offline caching, auto-updated on build)
3. **Web Workers**:
   - **Classic Worker**: `public/worker.js` (jsAesCrypt operations only)
   - **ES Module Worker**: `src/workers/cryptoWorker.js` (WebCrypto/Age operations)
4. **Encryption Providers**:
   - **Classic Worker Provider** (in `public/providers/`):
     - `JsAesCryptWorkerProvider.js` - AES-256-CBC (.aes files)
   - **ES Module Worker Providers** (in `src/workers/providers/`):
     - `WebCryptoWorkerProvider.js` - Browser-native AES-256-GCM (.enc files)
     - `AgeWorkerProvider.js` - Modern age encryption (.age files)

### Key Constraints

- Must work entirely client-side (no backend)
- Must function offline after initial load
- Must handle large files without blocking UI (use Web Workers)
- Encryption libraries may throw strings (not Error objects) - handle both types
- WASM modules (like rage-wasm) load asynchronously - handle loading states

## Where to Find Detailed Information

- **[.claude/memory.md](.claude/memory.md)** - Code style, patterns, how to write code for this project
- **[.claude/structure.md](.claude/structure.md)** - File organization, what each component does, detailed architecture
- **[.claude/roadmap.md](.claude/roadmap.md)** - Feature planning, completed work, what's next


## Quick Patterns Reference

### Shared Utilities
```javascript
import { downloadFile } from '@/utils/fileDownload';
import { parseCSV } from '@/utils/csvParser';
import { calculatePasswordStrength } from '@/utils/passwordStrength';
import { generateQrCode } from '@/utils/qrCodeGenerator';
import { formatWiFi, formatVCard } from '@/utils/qrDataFormatters';
```

### Error Handling
```javascript
try {
  // operation
} catch (error) {
  const errorMessage = typeof error === 'string' ? error : (error.message || 'Unknown error');
  this.errorMessage = 'User-friendly message'
  console.error('Technical details:', error)
}
```

### Password Strength
```vue
<v-text-field v-model="password" type="password" />
<PasswordStrengthIndicator :password="password" :show-requirements="true" />
```

## Current Development Status

**Phase 4 - Security & Validation** (1/4 complete)
- ✅ Password Strength Indicator
- Next: File Size Validation, Input Sanitization

See [roadmap.md](.claude/roadmap.md) for detailed progress and next steps.

---

**Last Updated**: 2026-01-12 (Completed Age encryption integration with dual-worker architecture)
