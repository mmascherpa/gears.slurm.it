# Slurm-SPA Code Structure

## Purpose
This file documents the file organization, component responsibilities, and architectural layers of the Slurm Tools codebase.

**Last Updated**: 2025-10-21
**Total Files**: 77
**Total Lines of Code**: ~2,750 lines

---

## File Structure

### Root Directory
```
slurm-spa/
├── src/                      # Vue.js application source
├── public/                   # Static assets & PWA files
├── jsAesCrypt-main/         # External AES library (vendored)
├── scripts/                 # Build utilities
├── dist/                    # Production build output
├── index.html              # Root HTML entry point
├── vite.config.js          # Vite build configuration (19 lines)
├── jsconfig.json           # JavaScript path aliases
├── package.json            # Project metadata and dependencies
└── .claude/
    ├── memory.md           # Code style and architecture
    ├── structure.md        # This file
    └── roadmap.md          # Feature planning
```

### Source Directory (`/src/`)
```
src/
├── main.js                  # Application entry point (66 lines)
├── theme.js                 # Vuetify theme system with 3 themes (172 lines)
├── Slurm.vue               # Root layout component with theme toggle (145 lines)
├── Home.vue                # Landing page with tool grid (120 lines)
├── Base64Enc.vue           # Base64 encoder page (250 lines)
├── Base64Dec.vue           # Base64 decoder page (245 lines)
├── AESEnc.vue              # AES encryption page (340 lines - with password strength)
├── AESDec.vue              # AES decryption page (250 lines - with password strength)
├── About.vue               # About page (comprehensive info)
├── components/             # Reusable Vue components
│   └── PasswordStrengthIndicator.vue  # Password strength meter (140 lines)
├── utils/                  # Shared utility functions
│   ├── fileDownload.js     # File download helper (19 lines)
│   ├── csvParser.js        # CSV parsing utilities (67 lines)
│   └── passwordStrength.js # Password strength calculator (160 lines)
└── assets/                 # Static assets and utilities
    ├── base.css            # Global CSS variables
    ├── global-styles.css   # Global UX styles
    ├── logo.svg            # Vue logo
    └── util/               # Buffer utilities
        ├── util.js         # Stream/buffer operations
        └── support/        # Browser compatibility
            ├── isBuffer.js
            ├── isBufferBrowser.js
            └── types.js
```

**Purpose**: Contains all Vue.js source code, components, and application logic.

**Key Files**:
- **main.js** (66 lines) - Application initialization, router setup, Vuetify configuration, Service Worker registration
- **theme.js** (172 lines) - Theme system with 3 modes (Default, Dark, Slurm) and shared CSS variables
- **Slurm.vue** (145 lines) - Root layout with gradient app bar, theme toggle buttons, navigation drawer, localStorage persistence
- **Home.vue** (120 lines) - Landing page with modernized tool cards in responsive grid
- **Base64Enc.vue** (250 lines) - Text/file Base64 encoding with clipboard ops, snackbar feedback, monospace output
- **Base64Dec.vue** (245 lines) - Text/file Base64 decoding with clipboard ops, snackbar feedback, monospace output
- **AESEnc.vue** (340 lines) - Password-protected file encryption with Web Worker, CSV preview, password strength indicator
- **AESDec.vue** (250 lines) - Password-protected file decryption with CSV preview, password strength indicator
- **About.vue** - Comprehensive about page with privacy and security information
- **global-styles.css** - Global UX styles including monospace fonts, button animations, focus states
- **components/PasswordStrengthIndicator.vue** (140 lines) - Reusable password strength meter component
- **utils/fileDownload.js** - Shared file download utility
- **utils/csvParser.js** - Shared CSV parsing with input validation
- **utils/passwordStrength.js** (160 lines) - Password strength calculation algorithm

### Public Directory (`/public/`)
```
public/
├── index.html              # HTML template
├── favicon.ico             # Browser favicon
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker for offline caching (97 lines - enhanced)
├── worker.js               # Web Worker for AES operations (73 lines - enhanced)
├── icons/                  # PWA app icons
│   ├── icon.svg
│   ├── icon-192x192.png
│   └── icon-512x512.png
└── libs/                   # Bundled crypto libraries
    ├── aes_crypt.min.js    # AES encryption library
    └── enc-uint8array.min.js # Uint8Array encoding
```

**Purpose**: Static assets served directly to browser, PWA configuration, and worker scripts.

**Key Files**:
- **sw.js** (97 lines) - Service Worker with CORS caching, improved error handling, immediate activation
- **worker.js** (73 lines) - Web Worker with user-friendly error messages for AES operations
- **manifest.json** - PWA manifest defining app metadata, icons, and installability

### External Library (`/jsAesCrypt-main/`)
```
jsAesCrypt-main/
├── src/
│   ├── aes_crypt.js          # AES implementation
│   ├── binary_stream.js      # Binary stream utilities
│   ├── enc-uint8array.js     # Uint8Array encoding
│   ├── file_bytes_reader.js  # File reading utilities
│   └── web_crypto_subtle.js  # Web Crypto API wrapper
└── demo/
```

**Purpose**: Vendored AES encryption library (jsAesCrypt) for file encryption/decryption.

### Build Scripts (`/scripts/`)
```
scripts/
├── generate-icons.js       # PNG icon generation from SVG using Sharp
└── update-sw-cache.js      # Auto-updates SW cache with Vite asset hashes (NEW - 97 lines)
```

**Purpose**: Build-time utilities for asset generation.

---

## Classes / Modules / Components

### Slurm.vue (Root Layout)
**File**: [src/Slurm.vue](src/Slurm.vue)
**Lines**: ~110
**Purpose**: Application shell providing consistent layout with navigation

**Key Features**:
- Gradient app bar with title and "Private & Offline" badge
- Navigation drawer with organized sections (Encoding, Encryption, Information)
- Material Design icons for all menu items
- Responsive badge visibility (hidden on mobile)
- Max-width container (1400px) for better readability
- Smooth page transitions (250ms fade)
- Router view for page content

**Dependencies**:
- Vue Router
- Vuetify (v-app, v-navigation-drawer, v-app-bar, v-chip)
- Material Design Icons

**Used By**:
- main.js (root component)

---

### Home.vue (Landing Page)
**File**: [src/Home.vue](src/Home.vue)
**Lines**: ~79
**Purpose**: Tool selection grid displaying available utilities

**Key Features**:
- Responsive 2-3 column grid layout
- 5 tool cards (Base64 Enc/Dec, AES Enc/Dec, About)
- Card-based navigation with icons and descriptions

**Dependencies**:
- Vue Router
- Vuetify (v-container, v-row, v-col, v-card)
- Material Design Icons

**Used By**:
- Router (/ route)

---

### Base64Enc.vue (Base64 Encoder)
**File**: [src/Base64Enc.vue](src/Base64Enc.vue)
**Lines**: ~250
**Purpose**: Encode text or files to Base64 format

**Key Methods/Functions**:
- `encode()` - Converts input text to Base64 with 350ms debounce
- `encodeFile()` - Reads file and encodes to Base64
- `copyToClipboard()` - Copies result to clipboard with snackbar feedback
- `pasteFromClipboard()` - Pastes text from clipboard with snackbar feedback
- `showSnackbar()` - Displays success/error messages to user

**Key Features**:
- Avatar header with icon and description
- Monospace font for encoded output
- Success/error snackbar notifications
- Comprehensive JSDoc documentation
- Enhanced error handling

**Dependencies**:
- Browser APIs: btoa, FileReader, Clipboard API
- Vuetify components (v-card, v-textarea, v-snackbar)
- global-styles.css for monospace styling

**Used By**:
- Router (/base64enc route)

---

### Base64Dec.vue (Base64 Decoder)
**File**: [src/Base64Dec.vue](src/Base64Dec.vue)
**Lines**: ~245
**Purpose**: Decode Base64 text or files to original format

**Key Methods/Functions**:
- `decode()` - Converts Base64 to original text with 350ms debounce
- `decodeFile()` - Reads and decodes Base64 file
- `copyToClipboard()` - Copies decoded result with snackbar feedback
- `pasteFromClipboard()` - Pastes Base64 text with snackbar feedback
- `showSnackbar()` - Displays success/error messages to user

**Key Features**:
- Avatar header with icon and description
- Monospace font for Base64 input
- Success/error snackbar notifications
- Comprehensive JSDoc documentation
- Enhanced error handling

**Dependencies**:
- Browser APIs: atob, FileReader, Clipboard API
- Vuetify components (v-card, v-textarea, v-snackbar)
- global-styles.css for monospace styling

**Used By**:
- Router (/base64dec route)

---

### AESEnc.vue (AES Encryption)
**File**: [src/AESEnc.vue](src/AESEnc.vue)
**Lines**: ~340
**Purpose**: Password-protected file encryption with CSV preview

**Key Methods/Functions**:
- `encryptFile()` - Validates password and initiates encryption via Web Worker
- `handleWorkerResponse()` - Processes encryption results with user-friendly error messages
- `handleFileUploadCSV()` - Handles CSV preview using shared utility
- `pasteFromClipboard()` - Pastes text with snackbar feedback
- `showSnackbar()` - Displays success/error messages to user

**Key Features**:
- Avatar header with encryption icon
- Password confirmation validation
- CSV file preview with search
- User-friendly error messages ("Password too long" not "undefined")
- Refactored to use shared utilities (fileDownload, csvParser)
- Comprehensive JSDoc documentation

**Dependencies**:
- Web Worker (public/worker.js)
- Shared utilities (utils/fileDownload.js, utils/csvParser.js)
- CryptoJS (from CDN)
- file-type library
- Vuetify data table, snackbar
- Theme colors (primary = sage green)

**Used By**:
- Router (/aesenc route)

---

### AESDec.vue (AES Decryption)
**File**: [src/AESDec.vue](src/AESDec.vue)
**Lines**: ~250
**Purpose**: Password-protected file decryption with CSV preview

**Key Methods/Functions**:
- `decryptFile()` - Initiates decryption via Web Worker
- `handleWorkerResponse()` - Processes decryption results with user-friendly error messages
- `showSnackbar()` - Displays success/error messages to user

**Key Features**:
- Avatar header with decryption icon
- Password input with validation
- CSV/text file preview with search
- User-friendly error messages ("Wrong password" not "Decryption failed: undefined")
- Refactored to use shared utilities (fileDownload, csvParser)
- Comprehensive JSDoc documentation

**Dependencies**:
- Web Worker (public/worker.js)
- Shared utilities (utils/fileDownload.js, utils/csvParser.js)
- CryptoJS (from CDN)
- file-type library
- Vuetify data table, snackbar
- Theme colors (primary-darken-1)

**Used By**:
- Router (/aesdec route)

---

### main.js (Application Entry)
**File**: [src/main.js](src/main.js)
**Lines**: ~65
**Purpose**: Application initialization and configuration

**Key Responsibilities**:
1. Create Vue app instance
2. Configure Vue Router with 6 routes
3. Initialize Vuetify with custom theme
4. Register Service Worker
5. Mount app to DOM

**Dependencies**:
- Vue 3
- Vue Router
- Vuetify
- Custom theme (theme.js)

---

### theme.js (Vuetify Theme)
**File**: [src/theme.js](src/theme.js)
**Lines**: ~85
**Purpose**: Custom Material Design theme configuration with integrated color palette

**Color Palette** (from Coolors):
- **Sage** (#73877B): Primary color for encryption tools
- **Coffee** (#402E2A): Dark brown accent
- **Royal Blue** (#4464AD): Secondary color for encoding tools
- **Deep Blue** (#3943B7): Deeper blue variant
- **Silver** (#BDBBB6): Neutral gray
- **Semantic colors**: Success, warning, error, info

**Theme Structure**:
- COLOR_PALETTE constant with all brand colors
- Primary/secondary color mappings
- Light theme configuration
- Dark theme disabled (not implemented yet)

**Dependencies**:
- Vuetify themes API

---

## Component Hierarchy

### Application Structure
```
Slurm.vue (Root Layout)
├── v-app-bar (Navigation)
├── v-navigation-drawer (Menu)
└── router-view (Page Content)
    ├── Home.vue (Landing)
    ├── Base64Enc.vue (Base64 Encoder)
    ├── Base64Dec.vue (Base64 Decoder)
    ├── AESEnc.vue (AES Encryption)
    ├── AESDec.vue (AES Decryption)
    └── About.vue (About Page)
```

### Data Flow
1. User selects tool from Home.vue → Router navigates to feature page
2. User uploads file → FileReader processes → Feature component handles operation
3. AES operations → Component sends to Web Worker → Worker performs crypto → Results returned to component
4. Results → Display in UI → User downloads/copies output

### Worker Communication
```
AESEnc.vue/AESDec.vue
    ↓ postMessage({type, file, password})
Web Worker (worker.js)
    ↓ loads CryptoJS from CDN
    ↓ performs encryption/decryption
    ↓ postMessage({success, result/error})
AESEnc.vue/AESDec.vue
    ↓ handleWorkerMessage()
    ↓ display results/errors
```

---

## Architectural Layers

### Presentation Layer (Vue Components)
**Responsibility**: User interface, user interactions, visual presentation

**Components**:
- `Slurm.vue` - Application shell
- `Home.vue` - Tool selection
- `Base64Enc.vue`, `Base64Dec.vue` - Base64 tools
- `AESEnc.vue`, `AESDec.vue` - AES tools

**Rules**:
- No direct cryptographic operations (delegated to workers/libraries)
- Handles file I/O via FileReader API
- Manages local component state
- Validates user input (password confirmation, file selection)

---

### Business Logic Layer (Workers & Libraries)
**Responsibility**: CPU-intensive operations, cryptographic processing

**Components**:
- `worker.js` - AES encryption/decryption worker
- CryptoJS - Encryption library (CDN)
- jsAesCrypt - File encryption library (vendored)

**Rules**:
- Runs on separate thread (Web Worker)
- No direct DOM access
- Communicates via postMessage
- Handles actual crypto operations

---

### Service Layer (PWA Infrastructure)
**Responsibility**: Offline functionality, caching, installability

**Components**:
- `sw.js` - Service Worker
- `manifest.json` - PWA manifest

**Rules**:
- Cache-first strategy for static assets
- Enables offline usage
- Manages app installation

---

## Separation of Concerns

### Strict Boundaries
- **DOM Manipulation**: Only in Vue components (Presentation Layer)
- **Cryptographic Operations**: Only in Web Workers and crypto libraries
- **File I/O**: Only in Vue components via FileReader API
- **Routing**: Only in main.js and router configuration
- **Caching**: Only in Service Worker (sw.js)

### Communication Patterns
- **Component to Worker**: postMessage API with structured messages
- **Worker to Component**: postMessage callbacks with success/error results
- **Component to Component**: Vue Router navigation
- **User to Component**: Event handlers (@click, @change, @input)
- **Component to Browser**: Native APIs (Clipboard, FileReader, download links)

### Error Propagation
- **Worker errors**: Caught in try-catch, sent via postMessage to component
- **Component errors**: Caught in try-catch, displayed in v-alert components
- **File errors**: FileReader error events, displayed to user
- **Validation errors**: Inline error messages in forms

---

## Utility Functions / Helpers

### Shared Utilities (NEW)
**Directory**: [src/utils/](src/utils/)

**fileDownload.js** (19 lines):
- `downloadFile(data, name)` - Triggers browser download of binary data
- Creates blob URL, initiates download, cleans up resources
- Used by both AESEnc.vue and AESDec.vue

**csvParser.js** (67 lines):
- `parseCSV(input)` - Parses CSV text/binary into Vuetify table format
- `convertToTableData(headers, rows)` - Converts arrays to table objects
- `capitalize(word)` - Capitalizes first letter with null guards
- Handles line ending normalization and empty row filtering
- Used by both AESEnc.vue and AESDec.vue

**passwordStrength.js** (160 lines):
- `calculatePasswordStrength(password)` - Evaluates password strength with scoring algorithm
- `getRequirements(password, charChecks)` - Returns requirements checklist with met/unmet status
- `isPasswordSecure(password)` - Simple boolean check for minimum security requirements
- Scores based on length (2 points per char, max 40) and character variety (max 60)
- Monotonically increasing scores (adding characters never decreases score)
- Detects patterns (sequential, repeating) without score penalties
- Very Strong requires all requirements: 12+ chars, upper, lower, numbers, special chars
- Used by PasswordStrengthIndicator.vue component

### Buffer Utilities
**File**: [src/assets/util/util.js](src/assets/util/util.js)

**Functions**:
- Buffer conversion utilities
- Stream handling helpers
- Browser compatibility checks

**Support Files**: [src/assets/util/support/](src/assets/util/support/)
- `isBuffer.js` - Buffer type checking
- `isBufferBrowser.js` - Browser-specific buffer detection
- `types.js` - Type utilities

---

## Configuration

### Build Configuration
**File**: [vite.config.js](vite.config.js)
**Purpose**: Vite build tool configuration

**Key Settings**:
- Vue plugin enabled
- Output directory: `../slurm.it/` (external deployment folder)
- Path aliases: `@/` → `./src/`

### Path Aliases
**File**: [jsconfig.json](jsconfig.json)
**Purpose**: IDE/editor path resolution

**Aliases**:
- `@/*` → `src/*`

### PWA Manifest
**File**: [public/manifest.json](public/manifest.json)
**Purpose**: PWA configuration for installability

**Settings**:
- App name, icons, theme colors
- Display mode: standalone
- Start URL, scope

---

## Entry Points

### Main Application
**File**: [index.html](index.html) → [src/main.js](src/main.js)
**Purpose**: Application initialization and bootstrap

**Initialization Flow**:
1. Load HTML template (index.html)
2. Execute main.js
3. Create Vue app with Slurm.vue root component
4. Configure Vue Router with hash-based routing
5. Initialize Vuetify with custom theme
6. Register Service Worker (if supported)
7. Mount app to `#app` div

### Service Worker
**File**: [public/sw.js](public/sw.js)
**Purpose**: PWA offline functionality

**Initialization**:
1. Install event: Cache static assets
2. Activate event: Clean old caches
3. Fetch event: Cache-first strategy

### Web Worker
**File**: [public/worker.js](public/worker.js)
**Purpose**: Background crypto operations

**Initialization**:
1. Listen for postMessage events
2. Load CryptoJS from CDN
3. Process encryption/decryption requests
4. Return results via postMessage

---

## Code Organization Principles

### Current Approach
- **Component-based architecture**: Each tool is a standalone Vue component
- **Single Responsibility**: Each component handles one tool/page
- **Worker-based parallelism**: CPU-intensive tasks offloaded to Web Workers
- **PWA-first**: Built for offline-first usage with Service Worker
- **Material Design**: Consistent Vuetify UI components

### File Naming Conventions
- **PascalCase for Vue components**: `Base64Enc.vue`, `AESEnc.vue`
- **camelCase for JavaScript**: `main.js`, `theme.js`, `worker.js`
- **kebab-case for web files**: `sw.js`, `manifest.json`
- **Descriptive names**: Component names reflect functionality clearly

### Directory Organization
- `/src/` - Application source code (Vue components, entry point)
- `/public/` - Static assets served directly (no processing)
- `/scripts/` - Build-time utilities
- `/dist/` - Production build output (generated)
- `/.claude/` - Project documentation and planning

---

## Build / Bundle Output

### Development Build
- Command: `npm run dev`
- Server: Vite dev server with HMR
- Port: Default Vite port (usually 5173)

### Production Build
- Command: `npm run build`
- Output: `../slurm.it/` directory (external folder)
- Minified and optimized assets
- Service Worker and Web Worker copied to output

**Build Artifacts**:
- `index.html` - Entry HTML
- `/assets/` - Bundled JS/CSS with hashed filenames
- `/libs/` - Crypto libraries (copied from public/)
- `sw.js` - Service Worker
- `worker.js` - Web Worker
- `manifest.json` - PWA manifest
- `/icons/` - App icons

---

## Notes

### Recent Structural Changes
- **2025-10-20**: Password Strength Indicator (Phase 4, Task #1)
  - Created src/utils/passwordStrength.js with monotonically increasing scoring algorithm
  - Created src/components/PasswordStrengthIndicator.vue reusable component
  - Integrated password strength indicator into AESEnc.vue and AESDec.vue
  - Implemented visual progress bar with color-coded strength levels (Weak/Medium/Strong/Very Strong)
  - Added requirements checklist with real-time validation feedback
  - Very Strong passwords require all security features (12+ chars, upper, lower, numbers, special chars)
  - Progress bar capped at 90% for Strong, 100% only for Very Strong
  - Applied code review fixes: eliminated regex duplication, removed dead code, improved performance

- **2025-10-19**: Offline Functionality & Error Message Enhancements
  - Fixed service worker to cache Vite-generated assets with hashed filenames
  - Created automated build script (update-sw-cache.js) to update SW cache list
  - Fixed CORS caching for CDN resources (CryptoJS libraries)
  - Added `clients.claim()` for immediate service worker activation
  - Improved worker error handling with user-friendly messages
  - Refactored AES components to use shared utilities (eliminated ~80 lines of duplication)
  - Created src/utils/fileDownload.js and src/utils/csvParser.js
  - Fixed null reference bug in service worker accept header check
  - Enhanced build process to automatically update service worker on each build

- **2025-10-19**: Completed Phase 3 - UX Enhancements
  - Added global-styles.css with monospace fonts, animations, focus states
  - Implemented snackbar feedback system across all components
  - Added max-width container and responsive design improvements

- **2025-10-19**: Completed Phase 2 - UI Modernization
  - Integrated custom color palette into theme.js
  - Redesigned all components with avatar headers and modern cards
  - Enhanced navigation drawer with organized sections
  - Created comprehensive About page

- **2025-10-19**: Completed Phase 1 - Code Cleanup
  - Removed all legacy components (HelloWorld, TheWelcome, WelcomeItem, icons)
  - Added comprehensive JSDoc comments to all key methods
  - Improved error handling across all components
  - Cleaned up .gitignore and committed Service Worker changes

- **2025-10-18**: Layout improvements for small screens (commit a3b5812)
- **Recent**: Updated deployment directory to `../slurm.it/`
- **Recent**: Adopted v-data-table for CSV display in AES components

### Future Structural Considerations
- Add TypeScript for type safety (Phase 8 - when codebase grows)
- Implement dark mode support (Phase 6)
- Add password strength indicator (Phase 4)
- Setup testing infrastructure with Vitest (Phase 5)
- Could extract shared logic into composables
- May need state management (Pinia) if more complex features added

---

## References
- [Memory](.claude/memory.md) - Code style and architecture principles
- [Roadmap](.claude/roadmap.md) - Feature planning and progress
- [Main codebase](../) - Link to code files

---

**Maintenance Note**: Update this file whenever:
- New files or directories are added
- Components are refactored or renamed
- Architecture layers change
- File sizes grow significantly (>200 line change)
- Organizational patterns evolve

**Last Updated**: 2025-10-20 (Updated for password strength indicator feature)
