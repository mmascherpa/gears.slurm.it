# Slurm Tools

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests: 470](https://img.shields.io/badge/Tests-470-brightgreen.svg)](https://github.com/mmascherpa/slurm-spa)
[![Coverage: 95%](https://img.shields.io/badge/Coverage-95.45%-brightgreen.svg)](https://github.com/mmascherpa/slurm-spa)

Privacy-first cryptography tools in your browser. 100% client-side with full offline functionality.

**Live**: [gears.slurm.it](https://gears.slurm.it)

## Features

### Core Tools
- **Base64 Encoder** - Text and file encoding with clipboard operations
- **Base64 Decoder** - Text and file decoding with clipboard operations
- **File Encryption** - Password-protected encryption with AES-256 or Age
- **File Decryption** - Decrypt `.aes`, `.enc`, or `.age` encrypted files
- **Password Generator** - Cryptographically secure random password generation
- **File Preview** - CSV table and text preview for encrypted content

### Advanced Features
- 🔒 **Client-Side Only** - No data sent to servers
- 📴 **100% Offline** - Full offline functionality via Service Worker
- 🎨 **Three Themes** - Default (light), Dark, and Slurm (retro cyan)
- 💾 **Session Password Manager** - Remember password for multiple files
- 📊 **Large File Support** - Encrypt/decrypt up to 200MB files
- ⚡ **Web Workers** - Background crypto operations keep UI responsive
- 📱 **Progressive Web App** - Install as desktop/mobile app
- ♿ **Accessible** - WCAG 2.1 AA compliant

## Technology Stack

- **Frontend**: Vue 3 + Vuetify 3 + Vite
- **Encryption**: AES-256 (jsAesCrypt, Web Crypto API) + Age (rage-wasm)
- **PWA**: Service Worker with cache-first strategy
- **Testing**: Vitest (unit, 423 tests) + Playwright (E2E, 47 tests)
- **Deployment**: Manual to GitHub Pages (gears.slurm.it repo)

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

App will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Builds to `./deploy/` directory and auto-updates service worker cache.

### Testing

```bash
# Run unit tests
npm run test

# Run unit tests with UI
npm run test:ui

# Run E2E tests
npm run test:e2e

# Run E2E tests with Playwright UI
npm run test:e2e:ui

# Generate coverage report
npm run test:coverage
```

## Architecture

### File Structure

```
src/
├── main.js                 # Router and app initialization
├── Slurm.vue              # Root component
├── [Tool].vue             # Tool pages (Base64Encode, AesEncrypt, etc.)
├── components/            # Reusable components
├── composables/           # Vue 3 composables
├── utils/                 # Utility functions
├── theme.js               # Vuetify theme configuration
└── assets/

public/
├── sw.js                  # Service Worker (offline caching)
├── worker.js              # Web Worker (crypto operations)
└── manifest.json          # PWA manifest

tests/
├── unit/                  # Unit tests (423 tests, 95.45% coverage)
└── e2e/                   # E2E tests (47 tests, 5 suites)
```

### Key Components

**Worker Communication Protocol**:
```javascript
// Component → Worker
worker.postMessage(["ENCRYPT", fileData, password, fileName])
worker.postMessage(["DECRYPT", fileData, password, fileName])

// Worker → Component
self.postMessage(["ENCRYPT", encryptedData, outputFileName])
self.postMessage(["ERROR", errorMessage, operationType])
```

### Service Worker

Service Worker updates automatically on each build:
- `scripts/update-sw-cache.js` scans Vite build output
- Updates `public/sw.js` with exact asset hashes
- Implements cache-first strategy for offline functionality
- **Never manually edit** `public/sw.js` cache list

## Deployment Workflow

### Pre-Deployment Checklist

Before pushing to gears.slurm.it, run this checklist locally:

```bash
# 1. Run all tests
npm run test              # Unit tests (423 tests, ~30 sec)
npm run test:e2e          # E2E tests (47 tests, ~5-7 min)

# 2. Build for production
npm run build             # Builds to ./deploy/

# 3. Test the production build locally
npm run preview           # Test at localhost:4173

# 4. Quick manual spot-check (2 min)
# - Try one encryption/decryption
# - Go offline (DevTools → Network → Offline)
# - Verify offline mode works
# - Check theme persistence

# 5. If all green, deploy
cd ./deploy
git add .
git commit -m "Deploy: [description of changes]"
git push origin main
cd ../
```

**Total deployment time**: ~10 minutes (vs 30-40 before Phase 8)

### GitHub Actions (Optional Future Use)

A 4-stage GitHub Actions CI/CD pipeline is configured in `.github/workflows/ci-cd.yml` for future use if you decide to push this repository to GitHub. It will automatically:

1. Run all tests on pull requests
2. Block merges if tests fail
3. Auto-deploy to gears.slurm.it on merge to main
4. Run Lighthouse CI performance audits

**Currently**: This repository is local-only. To activate GitHub Actions:
1. Push this repo to GitHub
2. Add `DEPLOY_TOKEN` secret (personal access token)
3. Tests and deployment run automatically

## Testing

### Unit Tests (Vitest)

423 tests covering:
- Utilities (CSV parsing, file download, password generation)
- Crypto providers (Web Crypto, jsAesEncrypt)
- Composables (Web Worker integration)
- Components (Password input, strength indicator, file upload)

**Coverage**: 95.45%

**Run**:
```bash
npm run test
npm run test:watch
npm run test:coverage
```

### E2E Tests (Playwright)

47 tests across 5 suites:
1. **Base64** (6 tests) - Encode/decode workflows
2. **AES Text** (6 tests) - Text encryption/decryption
3. **AES File** (10 tests) - File handling and encryption
4. **Tools & Theme** (13 tests) - Password generator, theme switching, session manager
5. **Offline PWA** (12 tests) - Service worker, offline functionality

**Run**:
```bash
npm run test:e2e
npm run test:e2e:ui    # Interactive mode
npm run test:e2e:debug # Debug mode
```

## Security Considerations

### What Slurm Does
- ✅ Encrypts data locally in your browser
- ✅ All encryption happens client-side
- ✅ No data is transmitted to any server
- ✅ Works offline after initial load

### What Slurm Doesn't Do
- ❌ Does not store encryption keys
- ❌ Does not track usage
- ❌ Does not collect personal data
- ❌ Does not create accounts
- ❌ Does not transmit data over the network

### Recommendations
- ✅ Use strong, unique passwords
- ✅ Remember your password (no recovery available)
- ✅ Verify decryption works before deleting originals
- ✅ Test encrypted files thoroughly

## Performance

### Bundle Size
- Main app: ~300KB (gzipped)
- Service Worker: ~20KB (handles offline caching)
- Crypto libraries: Loaded on demand

### Large File Handling
- Web Workers prevent UI blocking
- Tested up to 200MB files
- Password-protected encryption/decryption
- Streaming for very large files

## Development Workflow

### Creating a Feature

1. Make changes to source code
2. Test locally with dev server: `npm run dev`
3. Before committing, run tests:
   ```bash
   npm run test              # Unit tests
   npm run test:e2e          # E2E tests (only if you changed user flows)
   ```
4. Fix any test failures
5. Commit and push to local repo
6. When ready to deploy, follow the [Pre-Deployment Checklist](#pre-deployment-checklist)

### Local Development Tips

- **Live reload**: `npm run dev` (rebuilds on file changes)
- **Watch tests**: `npm run test:watch` (runs unit tests on changes)
- **Visual E2E debugging**: `npm run test:e2e:ui` (interactive test runner with visual feedback)
- **Step through E2E**: `npm run test:e2e:debug` (debug mode for tricky tests)
- **Generate coverage**: `npm run test:coverage` (see uncovered code)
- **Offline testing**: Run `npm run dev`, then DevTools → Network → Offline
- **Service Worker**: Check DevTools → Application → Service Workers

### When to Run E2E Tests

- Always before deploying to production
- After changes to critical features (encryption, offline, file handling)
- When theme or UI state management changes
- Optional: While developing (slower than unit tests)

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers with Service Worker support

## Development Standards

### Code Style
See [.claude/CODING-STANDARDS.md](.claude/CODING-STANDARDS.md)

### Testing Requirements
- New features must include unit tests
- Critical user flows (encryption, offline, file handling) must have E2E tests
- Coverage must remain above 95%
- Run `npm run test:e2e` before deploying

### Pre-Deployment Requirements
1. All unit tests pass: `npm run test`
2. All E2E tests pass: `npm run test:e2e`
3. Build succeeds: `npm run build`
4. Manual spot-check (2-3 minutes)
5. No TypeScript/lint errors

## Project Status

- **Phase**: 8 (CI/CD & E2E Testing) - In Progress
- **Code Coverage**: 95.45%
- **Test Count**: 470 (423 unit + 47 E2E)
- **Production Ready**: Yes ✅

See [.claude/roadmap.md](.claude/roadmap.md) for detailed feature planning and progress.

## License

MIT License - see LICENSE file for details

## Support

For issues, feature requests, or questions:
- GitHub Issues: [mmascherpa/slurm-spa/issues](https://github.com/mmascherpa/slurm-spa/issues)
- Project Documentation: [.claude/roadmap.md](.claude/roadmap.md)

---

**Made with ❤️ for privacy-conscious developers**
