# Slurm-SPA Code Structure

## Purpose
This file documents the file organization, component responsibilities, and architectural layers of the Slurm Tools codebase.

**Last Updated**: 2025-11-08
**Total Files**: 93 (was 95, -2 from AES consolidation)
**Total Lines of Code**: ~4,815 lines (-285 net from consolidation)
**Tool Components**: 5 (Base64Encode, Base64Decode, AesEncrypt, AesDecrypt, PasswordGenerator)

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
├── main.js                  # Application entry point (62 lines)
├── theme.js                 # Vuetify theme system with 3 themes (172 lines)
├── Slurm.vue               # Root layout component with theme toggle (151 lines)
├── Home.vue                # Landing page with tool grid (103 lines, 2 AES tools consolidated)
├── Base64Encode.vue        # Base64 encoder page (252 lines)
├── Base64Decode.vue        # Base64 decoder page (226 lines)
├── AesEncrypt.vue          # AES encryption for files AND text (479 lines)
├── AesDecrypt.vue          # AES decryption for files AND text (620 lines)
├── PasswordGenerator.vue   # Password generator tool (257 lines)
├── About.vue               # About page (178 lines)
├── components/             # Reusable Vue components
│   ├── FileUploadWithValidation.vue   # File upload with validation (230 lines)
│   ├── PasswordStrengthIndicator.vue  # Password strength meter (140 lines)
│   ├── SharedSnackbar.vue             # Reusable snackbar (76 lines)
│   ├── TextInputWithActions.vue       # Text input with action buttons (265 lines)
│   └── ToolPageHeader.vue             # Standardized page header (65 lines)
├── composables/            # Reusable composition functions
│   ├── useAESWorker.js     # AES worker management with auto-cleanup (163 lines)
│   ├── useClipboard.js     # Clipboard operations (74 lines)
│   ├── useDebounce.js      # Debounced function calls (66 lines)
│   ├── useFileSizeValidation.js  # File size validation logic (99 lines)
│   ├── usePasswordSession.js    # Password session storage management (132 lines)
│   └── useSnackbar.js      # Snackbar state management (41 lines)
├── crypto/                 # Encryption provider abstraction layer (NEW - Phase 2)
│   ├── CryptoProvider.js   # Base provider interface and factory (157 lines)
│   └── providers/          # Concrete provider implementations
│       ├── JsAesCryptProvider.js   # jsAesCrypt wrapper (142 lines)
│       └── WebCryptoProvider.js    # Web Crypto API implementation (232 lines)
├── utils/                  # Shared utility functions
│   ├── fileDownload.js     # File download helper (19 lines)
│   ├── csvParser.js        # CSV parsing utilities (67 lines)
│   ├── passwordStrength.js # Password strength calculator (160 lines)
│   └── passwordGenerator.js # Cryptographic password generator (127 lines)
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
- **main.js** (62 lines) - Application initialization, router setup, Vuetify configuration, Service Worker registration
- **theme.js** (172 lines) - Theme system with 3 modes (Default, Dark, Slurm) and shared CSS variables
- **Slurm.vue** (151 lines) - Root layout with gradient app bar, theme toggle buttons, navigation drawer, localStorage persistence
- **Home.vue** (103 lines) - Landing page with modernized tool cards in responsive grid (5 tools: Base64 enc/dec, AES enc/dec, Password Gen, About)
- **Base64Encode.vue** (252 lines) - Text/file Base64 encoding with shared components, standardized patterns
- **Base64Decode.vue** (226 lines) - Text/file Base64 decoding with shared components, standardized patterns
- **AesEncrypt.vue** (479 lines) - Unified AES encryption for files AND text with auto-encryption, CSV preview, Base64 output, password strength
- **AesDecrypt.vue** (620 lines) - Unified AES decryption for files AND text with auto-decryption, CSV/text preview, Base64 input, password strength
- **PasswordGenerator.vue** (257 lines) - Compact 2-column layout with regenerate button
- **About.vue** (178 lines) - Comprehensive about page with privacy, security information
- **components/FileUploadWithValidation.vue** (230 lines) - Reusable file upload with size validation and dynamic tooltips
- **components/PasswordStrengthIndicator.vue** (140 lines) - Reusable password strength meter
- **components/SharedSnackbar.vue** (76 lines) - Centralized notification component
- **components/TextInputWithActions.vue** (265 lines) - Text area with configurable action buttons
- **components/ToolPageHeader.vue** (65 lines) - Standardized page headers with avatar and icon
- **composables/useAESWorker.js** (163 lines) - Web Worker lifecycle management with memory leak fix
- **composables/useClipboard.js** (74 lines) - Copy/paste operations with error handling
- **composables/useDebounce.js** (66 lines) - Debounced function calls with automatic cleanup
- **composables/useFileSizeValidation.js** (99 lines) - File size validation (50MB warning, 200MB max)
- **composables/useSnackbar.js** (41 lines) - Snackbar state management
- **utils/fileDownload.js** (19 lines) - Shared file download utility
- **utils/csvParser.js** (67 lines) - Shared CSV parsing with input validation
- **utils/passwordStrength.js** (160 lines) - Password strength calculation algorithm
- **utils/passwordGenerator.js** (127 lines) - Cryptographically secure password generation

### Public Directory (`/public/`)
```
public/
├── index.html              # HTML template
├── favicon.ico             # Browser favicon
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker for offline caching (97 lines - enhanced)
├── worker.js               # Web Worker for AES operations (117 lines - provider-based)
├── providers/              # Worker-compatible crypto providers (NEW - Phase 2)
│   ├── JsAesCryptWorkerProvider.js  # jsAesCrypt worker provider (144 lines)
│   └── WebCryptoWorkerProvider.js   # Web Crypto worker provider (235 lines)
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

### Base64Encode.vue (Base64 Encoder)
**File**: [src/Base64Encode.vue](src/Base64Encode.vue)
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
- Router (/base64-encode route)

---

### Base64Decode.vue (Base64 Decoder)
**File**: [src/Base64Decode.vue](src/Base64Decode.vue)
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
- Router (/base64-decode route)

---

### AesEncrypt.vue (AES Encryption)
**File**: [src/AesEncrypt.vue](src/AesEncrypt.vue)
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
- Router (/aes-encrypt route)

---

### AesDecrypt.vue (AES Decryption)
**File**: [src/AesDecrypt.vue](src/AesDecrypt.vue)
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
- Router (/aes-decrypt route)

---

### PasswordGenerator.vue (Password Generator)
**File**: [src/PasswordGenerator.vue](src/PasswordGenerator.vue)
**Lines**: ~257
**Purpose**: Generate cryptographically secure random passwords with customizable options

**Key Methods/Functions**:
- `generateNewPassword()` - Creates new password using Web Crypto API with secure randomness
- `handleCopy()` - Copies password to clipboard with snackbar feedback

**Key Features**:
- Compact 2-column layout (50% less vertical space than original)
- Regenerate button with mdi-refresh icon (positioned left of password field)
- Real-time auto-generation on any option change
- Password length slider (8-64 characters, default 16)
- Character type toggles in 2x2 grid (uppercase, lowercase, numbers, special characters)
- Integrated PasswordStrengthIndicator for immediate feedback
- Icon-only copy button matching existing pattern
- Warning alert when no character types selected
- Monospace font for password display
- Vue watchers for automatic regeneration

**Dependencies**:
- passwordGenerator.js utility (Web Crypto API)
- PasswordStrengthIndicator.vue component
- useClipboard composable
- useSnackbar composable
- Vuetify components (v-card, v-text-field, v-slider, v-checkbox)
- Theme colors (primary)

**Used By**:
- Router (/password-generator route)

---

## Shared Components

### ToolPageHeader.vue
**File**: [src/components/ToolPageHeader.vue](src/components/ToolPageHeader.vue)
**Lines**: 65
**Purpose**: Standardized page header component used across all tool pages

**Props**:
- `title` (String, required) - Page title
- `description` (String, required) - Tool description
- `icon` (String, required) - Material Design Icon name
- `avatarColor` (String, default: 'primary') - Avatar background color

**Key Features**:
- Consistent layout with avatar, icon, title, and description
- Customizable avatar color for visual categorization
- Responsive design with proper spacing
- Material Design styling

**Used By**:
- All 5 tool pages (Base64Encode, Base64Decode, AesEncrypt, AesDecrypt, PasswordGenerator)

**Impact**: Saved ~72 lines of duplicated code

---

### SharedSnackbar.vue
**File**: [src/components/SharedSnackbar.vue](src/components/SharedSnackbar.vue)
**Lines**: 76
**Purpose**: Centralized notification component for displaying success/error messages

**Props**:
- `modelValue` (Boolean) - v-model for snackbar visibility
- `text` (String, required) - Message text to display
- `color` (String, default: 'success') - Snackbar color (success, error, warning, info)

**Emits**:
- `update:modelValue` - Updates visibility state

**Key Features**:
- Multi-line text support
- Configurable duration (4 seconds default)
- Top-right positioning
- Color-coded message types
- Consistent styling across all tools

**Used By**:
- All 7 tool pages for user feedback

**Usage Pattern**:
```vue
<SharedSnackbar
  v-model="snackbar"
  :text="snackbarText"
  :color="snackbarColor" />
```

---

### TextInputWithActions.vue
**File**: [src/components/TextInputWithActions.vue](src/components/TextInputWithActions.vue)
**Lines**: 265
**Purpose**: Reusable text input component with configurable action buttons

**Props**:
- `modelValue` (String) - v-model for text content
- `label` (String, required) - Input label
- `placeholder` (String) - Placeholder text
- `rows` (Number, default: 8) - Number of textarea rows
- `isLoading` (Boolean) - Loading state
- `readonly` (Boolean) - Read-only mode
- `showPaste` (Boolean, default: true) - Show paste button
- `showClear` (Boolean, default: true) - Show clear button
- `showCopy` (Boolean, default: false) - Show copy button
- `showDownload` (Boolean, default: false) - Show download button
- `showSpacers` (Boolean, default: false) - Show spacers between buttons
- `downloadFilename` (String) - Filename for download
- `textareaClass` (String) - Custom CSS class for textarea
- `rowClass` (String) - Custom CSS class for row

**Emits**:
- `update:modelValue` - Text content updates
- `paste` - Paste button clicked
- `clear` - Clear button clicked
- `copy` - Copy button clicked
- `download` - Download button clicked

**Key Features**:
- Flexible action button configuration
- Consistent button styling across all tools
- Loading state with progress indicator
- Optional spacers for visual grouping
- Responsive 8-4 column layout (text area + buttons)
- Custom classes for styling

**Used By**:
- Base64Enc, Base64Dec, TextAESEnc, TextAESDec

**Impact**: Eliminated hundreds of lines of duplicated textarea/button code

---

### FileUploadWithValidation.vue
**File**: [src/components/FileUploadWithValidation.vue](src/components/FileUploadWithValidation.vue)
**Lines**: 230
**Purpose**: Reusable file upload component with built-in size validation and submit button

**Props**:
- `modelValue` (Array) - v-model for selected file(s)
- `label` (String, required) - File input label
- `accept` (String) - Accepted file types (e.g., '.txt,.pdf')
- `disabled` (Boolean) - Disabled state
- `buttonText` (String, required) - Submit button text
- `buttonIcon` (String, required) - Submit button icon
- `buttonColor` (String, default: 'primary') - Submit button color
- `canSubmit` (Boolean, required) - Whether submit should be enabled (external validation)

**Emits**:
- `update:modelValue` - File selection updates
- `submit` - Submit button clicked
- `validation-change` - File validation state changed

**Key Features**:
- **Automatic file size validation** (50MB warning, 200MB maximum)
- **Dynamic tooltips** based on validation state:
  - "Please select a file first" (no file)
  - "File is too large to process" (size invalid)
  - "Complete all required fields" (other validation failed)
  - "Click to [action]" (ready to submit)
- Error and warning alerts (dismissible)
- Formatted file size display in hint text
- Button automatically disabled when file too large
- Consistent layout (file input + button in 8-4 column split)
- Closable validation alerts

**Used By**:
- Base64Enc, Base64Dec, AESEnc, AESDec

**Validation Logic**:
```javascript
// Button disabled when:
// - File size invalid (!isFileSizeValid)
// - OR external validation failed (!canSubmit)
:disabled="!canSubmit || !isFileSizeValid"
```

**Impact**: Saved ~180 lines of duplicated file validation code

---

## Composables (Reusable Logic)

### useSnackbar.js
**File**: [src/composables/useSnackbar.js](src/composables/useSnackbar.js)
**Lines**: 41
**Purpose**: Centralized snackbar state management

**Exports**:
- `snackbar` (Ref<Boolean>) - Visibility state
- `snackbarText` (Ref<String>) - Message text
- `snackbarColor` (Ref<String>) - Message color
- `showSnackbar(text, color)` - Function to display notification

**Usage Pattern**:
```javascript
const { snackbar, snackbarText, snackbarColor, showSnackbar } = useSnackbar();

// Display success message
showSnackbar('✓ Operation successful!', 'success');

// Display error message
showSnackbar('❌ Operation failed', 'error');
```

**Used By**: All 7 tool pages

**Impact**: Saved ~120 lines across components

---

### useClipboard.js
**File**: [src/composables/useClipboard.js](src/composables/useClipboard.js)
**Lines**: 74
**Purpose**: Copy/paste operations with error handling

**Exports**:
- `copyToClipboard(text, onSuccess, onError)` - Copy text to clipboard
- `pasteFromClipboard(onSuccess, onError)` - Paste text from clipboard

**Key Features**:
- Browser compatibility checks
- Permission handling
- User-friendly error messages
- Callback-based success/error handling

**Usage Pattern**:
```javascript
const { copyToClipboard, pasteFromClipboard } = useClipboard();

// Copy
await copyToClipboard(
  encodedText.value,
  (message) => showSnackbar(message, 'success'),
  (message) => showSnackbar(message, 'error')
);

// Paste
await pasteFromClipboard(
  (text) => {
    plainText.value = text;
    showSnackbar('Text pasted!', 'success');
  },
  (message) => showSnackbar(message, 'error')
);
```

**Used By**: Base64Encode, Base64Decode, AesEncrypt, AesDecrypt, PasswordGenerator

**Impact**: Saved ~150 lines

---

### useDebounce.js
**File**: [src/composables/useDebounce.js](src/composables/useDebounce.js)
**Lines**: 66
**Purpose**: Debounced function calls with automatic cleanup

**Exports**:
- `debounce` - Debounced version of provided function
- `cancel` - Cancel pending execution

**Standard Delays**:
- **Text operations** (Base64 encode/decode): 350ms
- **Crypto operations** (AES encrypt/decrypt): 800ms
- **Password generation**: No debounce (instant)

**Key Features**:
- Automatic cleanup on component unmount
- Cancellation support
- Configurable delay

**Usage Pattern**:
```javascript
// For crypto operations (800ms)
const { debounce: debouncedEncrypt, cancel: cancelEncryption } = useDebounce(() => {
  // encryption logic
}, 800);

// For text operations (350ms)
const { debounce: debouncedEncode } = useDebounce(() => {
  // encoding logic
}, 350);

// Use in watcher
watch(plainText, () => {
  if (plainText.value) {
    debouncedEncode();
  }
});
```

**Used By**: Base64Encode, Base64Decode, AesEncrypt, AesDecrypt

**Impact**: Consistent debouncing, automatic cleanup

---

### useFileSizeValidation.js
**File**: [src/composables/useFileSizeValidation.js](src/composables/useFileSizeValidation.js)
**Lines**: 99
**Purpose**: File size validation with warning/error thresholds

**Constants**:
- `FILE_SIZE_WARNING` - 50MB (52,428,800 bytes)
- `FILE_SIZE_MAX` - 200MB (209,715,200 bytes)

**Exports**:
- `isFileSizeValid` (Ref<Boolean>) - Whether file size is within limits
- `showFileSizeWarning` (Ref<Boolean>) - Whether to show warning
- `fileSizeWarningMessage` (Ref<String>) - Warning message text
- `fileSizeError` (Ref<String>) - Error message text
- `fileSizeHint` (Computed<String>) - Hint text for file input
- `handleFileSelection(file)` - Validates file and returns result
- `clearFileValidation()` - Clears validation state

**Validation Logic**:
```javascript
// Returns:
{
  isValid: true/false,      // false if > 200MB
  hasWarning: true/false,   // true if > 50MB
  message: "...",           // User-friendly message
  formattedSize: "75.50 MB" // Formatted file size
}
```

**Usage Pattern**:
```javascript
const {
  isFileSizeValid,
  showFileSizeWarning,
  fileSizeWarningMessage,
  fileSizeError,
  fileSizeHint,
  handleFileSelection,
  clearFileValidation
} = useFileSizeValidation();

// On file selection
const handleFileChange = (files) => {
  if (files && files.length > 0) {
    const result = handleFileSelection(files[0]);
    emit('validation-change', result);
  }
};
```

**Used By**: FileUploadWithValidation component

**Impact**: Saved ~180 lines, prevents browser crashes from large files

---

### useAESWorker.js
**File**: [src/composables/useAESWorker.js](src/composables/useAESWorker.js)
**Lines**: 163
**Purpose**: Web Worker lifecycle management with memory leak fix

**Exports**:
- `worker` (Ref<Worker>) - Worker instance
- `isProcessing` (Ref<Boolean>) - Processing state
- `progress` (Ref<Number>) - Progress percentage (0-100)
- `encryptFile(file, password, onSuccess, onError)` - Encrypt file
- `decryptFile(file, password, onSuccess, onError)` - Decrypt file
- `terminateWorker()` - Manual worker termination

**Key Features**:
- **Memory leak fix**: Automatically terminates worker on component unmount using `onBeforeUnmount`
- User-friendly error message mapping (e.g., "Password too long" instead of "undefined")
- Progress tracking (simulated for now)
- Consistent error handling
- Worker message protocol handling

**Error Message Mapping**:
```javascript
'Unsupported format' → 'File format not supported'
'undefined' → 'Decryption failed. Check your password.'
'Password too long' → 'Password too long (max 1024 characters)'
```

**Usage Pattern**:
```javascript
const { worker, isProcessing, encryptFile, decryptFile } = useAESWorker();

// Encrypt
encryptFile(
  file,
  password,
  (encryptedData, outputFileName) => {
    // Handle success
    downloadFile(encryptedData, outputFileName);
    showSnackbar('✓ File encrypted!', 'success');
  },
  (errorMessage) => {
    // Handle error
    showSnackbar(`❌ ${errorMessage}`, 'error');
  }
);
```

**Used By**: AesEncrypt, AesDecrypt

**Impact**: Fixed critical memory leak affecting all AES components

---

### usePasswordSession.js
**File**: [src/composables/usePasswordSession.js](src/composables/usePasswordSession.js)
**Lines**: 132
**Purpose**: Session-based password memory for multi-file encryption/decryption workflows

**Exports**:
- `rememberPassword` (Ref<Boolean>) - Checkbox v-model state
- `isPasswordRemembered` (Ref<Boolean>) - Visual indicator state
- `saveSessionPassword(password)` - Save password to sessionStorage
- `getSessionPassword()` - Retrieve password from sessionStorage
- `clearSessionPassword()` - Clear password from sessionStorage
- `autoLoadPassword()` - Auto-load saved password on component mount

**Key Features**:
- **Separate contexts**: Uses different storage keys for 'encrypt' vs 'decrypt'
- **Privacy-first**: sessionStorage only (memory-only, tab-scoped, never persisted)
- **Auto-clear**: Browser clears sessionStorage when tab/window closes
- **Manual clear**: Checkbox watcher clears storage when unchecked
- **Error handling**: Comprehensive try-catch for storage operations

**Storage Keys**:
```javascript
'slurm_aes_encrypt_session_password'  // Encryption context
'slurm_aes_decrypt_session_password'  // Decryption context
```

**Usage Pattern**:
```javascript
const {
  rememberPassword,
  isPasswordRemembered,
  saveSessionPassword,
  clearSessionPassword,
  autoLoadPassword
} = usePasswordSession('encrypt');

// Auto-load on mount
const storedPassword = autoLoadPassword();
if (storedPassword) {
  password.value = storedPassword;
}

// Watch password changes to save
watch(password, (newPassword) => {
  if (rememberPassword.value && newPassword) {
    saveSessionPassword(newPassword);
  }
});
```

**Used By**: AesEncrypt, AesDecrypt

**Impact**: Eliminates password re-entry for multi-file operations

---

## Encryption Provider Abstraction (Phase 2)

### CryptoProvider (Base Interface)
**File**: [src/crypto/CryptoProvider.js](src/crypto/CryptoProvider.js)
**Lines**: 157
**Purpose**: Defines standard interface for encryption providers, enabling decoupling from specific crypto libraries

**Key Components**:

1. **ErrorCodes** - Standardized error codes:
   - `WRONG_PASSWORD` - Incorrect decryption password
   - `PASSWORD_TOO_LONG` - Password exceeds provider limits
   - `CORRUPTED_DATA` - Data integrity check failed
   - `INVALID_FORMAT` - Unrecognized file format
   - `ENCRYPTION_FAILED` / `DECRYPTION_FAILED` - Operation failures
   - `UNKNOWN_ERROR` - Unexpected errors

2. **CryptoProvider Base Class**:
   ```javascript
   class CryptoProvider {
     async encrypt(data, password) // Must implement
     async decrypt(data, password) // Must implement
     getInfo() // Returns { name, version, maxPasswordLength, fileExtension }
     normalizeError(error) // Maps errors to standard format
     validatePassword(password) // Checks password requirements
   }
   ```

3. **CryptoProviderFactory**:
   - `register(name, providerClass)` - Register new provider
   - `create(name, options)` - Create provider instance
   - `getAvailableProviders()` - List registered providers

**Usage Pattern**:
```javascript
import { CryptoProviderFactory } from '@/crypto/CryptoProvider';
import { JsAesCryptProvider } from '@/crypto/providers/JsAesCryptProvider';

// Register provider
CryptoProviderFactory.register('jsAesCrypt', JsAesCryptProvider);

// Create instance
const provider = CryptoProviderFactory.create('jsAesCrypt');

// Use provider
const encrypted = await provider.encrypt(data, password);
const info = provider.getInfo(); // { name: 'jsAesCrypt', fileExtension: '.aes', ... }
```

**Benefits**:
- Consistent error handling across all providers
- Easy provider switching (jsAesCrypt ↔ WebCrypto ↔ future providers)
- Testable abstraction (mock providers for testing)
- Extensible architecture (add new providers without touching core code)

---

### JsAesCryptProvider
**File**: [src/crypto/providers/JsAesCryptProvider.js](src/crypto/providers/JsAesCryptProvider.js)
**Lines**: 142
**Purpose**: Wraps jsAesCrypt library to conform to CryptoProvider interface

**Key Features**:
- **Algorithm**: AES-256 CBC with HMAC-SHA256 authentication
- **File Format**: AES Crypt format v2 (.aes files)
- **Password Limit**: 1024 characters
- **Compatibility**: Compatible with desktop AES Crypt tools

**Error Mapping**:
```javascript
'Wrong password' → WRONG_PASSWORD
'Bad HMAC' → WRONG_PASSWORD
'Password is too long' → PASSWORD_TOO_LONG
'corrupted' → CORRUPTED_DATA
'not an AES Crypt' → INVALID_FORMAT
```

**Usage**:
```javascript
const provider = new JsAesCryptProvider();
provider.setLibrary(aesCrypt); // Set jsAesCrypt instance

const encrypted = await provider.encrypt(fileData, 'password123');
// Returns Uint8Array in .aes format
```

**Worker Integration**: [public/providers/JsAesCryptWorkerProvider.js](public/providers/JsAesCryptWorkerProvider.js) (144 lines)

---

### WebCryptoProvider
**File**: [src/crypto/providers/WebCryptoProvider.js](src/crypto/providers/WebCryptoProvider.js)
**Lines**: 232
**Purpose**: Browser-native encryption using Web Crypto API (SubtleCrypto)

**Key Features**:
- **Algorithm**: AES-256-GCM with PBKDF2 key derivation
- **File Format**: Custom format (.enc files) - NOT compatible with .aes
- **Password Limit**: 1024 characters (practical limit)
- **No Dependencies**: Uses only browser-native APIs

**File Format**:
```
[salt (16 bytes)][IV (12 bytes)][encrypted data]
```

**Key Derivation**:
- **Algorithm**: PBKDF2 with SHA-256
- **Iterations**: 100,000 (configurable)
- **Salt**: Random 128-bit per encryption
- **IV**: Random 96-bit per encryption (GCM recommended size)

**Advantages**:
- No external dependencies (no CDN, no vendored libraries)
- Faster than jsAesCrypt (native implementation)
- Smaller bundle size
- Built-in authenticated encryption (GCM mode)

**Disadvantages**:
- Not compatible with .aes file format
- Cannot decrypt files from desktop AES Crypt tools

**Usage**:
```javascript
const provider = new WebCryptoProvider({ iterations: 100000 });

const encrypted = await provider.encrypt(fileData, 'password123');
// Returns Uint8Array in custom .enc format

const decrypted = await provider.decrypt(encrypted, 'password123');
// Returns original Uint8Array
```

**Worker Integration**: [public/providers/WebCryptoWorkerProvider.js](public/providers/WebCryptoWorkerProvider.js) (235 lines)

---

### Worker Provider Architecture
**Files**:
- [public/worker.js](public/worker.js) (117 lines - provider-based)
- [public/providers/JsAesCryptWorkerProvider.js](public/providers/JsAesCryptWorkerProvider.js) (144 lines)
- [public/providers/WebCryptoWorkerProvider.js](public/providers/WebCryptoWorkerProvider.js) (235 lines)

**Purpose**: Enable dynamic provider switching in Web Worker context

**Key Features**:
1. **Dynamic Provider Loading**: Worker loads both providers on initialization
2. **Provider Switching**: Can switch providers mid-session
3. **Backward Compatible**: Defaults to jsAesCrypt (existing behavior)
4. **Error Normalization**: Providers normalize errors before sending to main thread

**Message Protocol**:
```javascript
// Initialize provider
postMessage(['INIT', 'webCrypto']);
// Response: ['INIT_SUCCESS', 'webCrypto']

// Encrypt with specific provider
postMessage(['ENCRYPT', fileData, password, fileName, 'webCrypto']);
// Response: ['ENCRYPT', encryptedData, 'file.enc']

// Encrypt with default provider (jsAesCrypt)
postMessage(['ENCRYPT', fileData, password, fileName]);
// Response: ['ENCRYPT', encryptedData, 'file.aes']
```

**Provider Selection Logic**:
```javascript
// In worker.js
function setProvider(providerType) {
  if (providerType === 'jsAesCrypt') {
    provider = new JsAesCryptWorkerProvider(aesCrypt);
  } else if (providerType === 'webCrypto') {
    provider = new WebCryptoWorkerProvider();
  }
}
```

**Error Handling**:
```javascript
// Worker normalizes errors using provider
.catch((error) => {
  const normalizedError = provider.normalizeError(error);
  postMessage(['ERROR', normalizedError.userMessage, operation]);
});
```

---

### Provider Testing
**Files**:
- [tests/unit/crypto/CryptoProvider.spec.js](tests/unit/crypto/CryptoProvider.spec.js) (17 tests)
- [tests/unit/crypto/JsAesCryptProvider.spec.js](tests/unit/crypto/JsAesCryptProvider.spec.js) (21 tests)
- [tests/unit/crypto/WebCryptoProvider.spec.js](tests/unit/crypto/WebCryptoProvider.spec.js) (25 tests)

**Total Tests**: 157 tests (up from 94)

**Test Coverage**:
- ✅ Base provider interface contract
- ✅ Error normalization for all providers
- ✅ Password validation
- ✅ Encryption/decryption round-trips
- ✅ File format compatibility
- ✅ Large file handling (1MB+ test)
- ✅ Wrong password detection
- ✅ Corrupted data detection
- ✅ Provider factory registration

**Key Test Scenarios**:
```javascript
// Round-trip encryption
const encrypted = await provider.encrypt(originalData, password);
const decrypted = await provider.decrypt(encrypted, password);
expect(decrypted).toEqual(originalData);

// Error normalization
const error = provider.normalizeError('Wrong password');
expect(error.code).toBe(ErrorCodes.WRONG_PASSWORD);
expect(error.userMessage).toContain('Incorrect password');

// Large file handling
const largeData = new Uint8Array(1024 * 1024); // 1MB
const encrypted = await provider.encrypt(largeData, password);
const decrypted = await provider.decrypt(encrypted, password);
expect(decrypted).toEqual(largeData);
```

---

### Provider Comparison Matrix

| Feature | JsAesCryptProvider | WebCryptoProvider |
|---------|-------------------|-------------------|
| **Algorithm** | AES-256-CBC + HMAC | AES-256-GCM |
| **File Extension** | .aes | .enc |
| **Dependencies** | jsAesCrypt library | None (browser native) |
| **CDN Required** | Yes (CryptoJS) | No |
| **Desktop Compat** | ✅ Yes (AES Crypt tools) | ❌ No |
| **Bundle Size** | Larger (~200KB libs) | Smaller (0KB extra) |
| **Performance** | Slower (JS library) | Faster (native) |
| **Password Limit** | 1024 chars | 1024 chars |
| **Key Derivation** | Built into format | PBKDF2 (100K iterations) |
| **Authentication** | HMAC-SHA256 | GCM built-in |
| **Browser Support** | All (uses polyfills) | Modern browsers only |

**Recommendation**:
- Use **JsAesCryptProvider** for compatibility with desktop tools
- Use **WebCryptoProvider** for performance and reduced dependencies

---

### Future Provider Ideas
**Potential Additions**:
1. **LibSodiumProvider** - NaCl/libsodium.js wrapper (ChaCha20-Poly1305)
2. **GPGProvider** - OpenPGP.js wrapper for PGP compatibility
3. **AgeProvider** - age encryption format
4. **Custom7ZProvider** - 7z AES encryption format

**Adding a New Provider**:
```javascript
// 1. Implement provider
class MyCustomProvider extends CryptoProvider {
  async encrypt(data, password) { /* ... */ }
  async decrypt(data, password) { /* ... */ }
  getInfo() { return { name: 'MyCustom', fileExtension: '.custom', ... }; }
  normalizeError(error) { /* ... */ }
}

// 2. Create worker version (no ES6 imports)
class MyCustomWorkerProvider { /* ... */ }

// 3. Register provider
CryptoProviderFactory.register('myCustom', MyCustomProvider);

// 4. Update worker.js to load provider
self.importScripts('/providers/MyCustomWorkerProvider.js');
function setProvider(type) {
  if (type === 'myCustom') {
    provider = new MyCustomWorkerProvider();
  }
}

// 5. Use in components
const { encrypt } = useAESWorker(onSuccess, onError, { providerType: 'myCustom' });
```

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
    ├── PasswordGenerator.vue (Password Generator)
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

**fileSizeValidator.js** (110 lines):
- `validateFileSize(file)` - Validates file size and returns validation result
- `formatFileSize(bytes, decimals)` - Formats bytes to human-readable size (e.g., "50.00 MB")
- `isFileSizeValid(file)` - Simple boolean check if file is within limits
- `shouldWarnFileSize(file)` - Checks if file should trigger warning
- `FILE_SIZE_LIMITS` - Constants (50MB warning threshold, 200MB max)
- Returns validation object with isValid, hasWarning, message, formattedSize
- Used by all file upload components (Base64Enc, Base64Dec, AESEnc, AESDec)

**passwordStrength.js** (160 lines):
- `calculatePasswordStrength(password)` - Evaluates password strength with scoring algorithm
- `getRequirements(password, charChecks)` - Returns requirements checklist with met/unmet status
- `isPasswordSecure(password)` - Simple boolean check for minimum security requirements
- Scores based on length (2 points per char, max 40) and character variety (max 60)
- Monotonically increasing scores (adding characters never decreases score)
- Detects patterns (sequential, repeating) without score penalties
- Very Strong requires all requirements: 12+ chars, upper, lower, numbers, special chars
- Used by PasswordStrengthIndicator.vue component

**passwordGenerator.js** (127 lines):
- `generatePassword(options)` - Generates cryptographically secure random passwords
- `getDefaultOptions()` - Returns default password generation options
- `getSecureRandomInt(max)` - Uses crypto.getRandomValues() for secure random numbers
- `secureShuffleArray(array)` - Fisher-Yates shuffle with secure randomness
- Configurable length (8-64 characters) and character types (uppercase, lowercase, numbers, special)
- Guarantees at least one character from each selected type
- Uses Web Crypto API (crypto.getRandomValues) for true randomness, NOT Math.random()
- Validates options and throws errors for invalid input
- Used by PasswordGenerator.vue component

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
- Output directory: `./deploy/` (external deployment folder)
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
- Output: `./deploy/` directory (external folder)
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
- **2025-11-02**: Phase 2 - Encryption Abstraction (COMPLETED)
  - **Created crypto provider abstraction layer** to decouple from jsAesCrypt:
    - src/crypto/CryptoProvider.js (157 lines) - Base interface, error codes, factory pattern
    - src/crypto/providers/JsAesCryptProvider.js (142 lines) - jsAesCrypt wrapper
    - src/crypto/providers/WebCryptoProvider.js (232 lines) - Browser-native Web Crypto API
    - public/providers/JsAesCryptWorkerProvider.js (144 lines) - Worker-compatible jsAesCrypt
    - public/providers/WebCryptoWorkerProvider.js (235 lines) - Worker-compatible WebCrypto
  - **Updated Web Worker** (public/worker.js: 73→117 lines):
    - Added dynamic provider loading and switching
    - Supports both jsAesCrypt and WebCrypto providers
    - Backward compatible (defaults to jsAesCrypt)
    - Error normalization handled by providers
  - **Enhanced useAESWorker composable**:
    - Added optional provider configuration parameter
    - Error handling simplified (providers normalize errors)
    - Maintains backward compatibility
  - **Comprehensive test suite** (+63 tests):
    - tests/unit/crypto/CryptoProvider.spec.js (17 tests) - Interface contract
    - tests/unit/crypto/JsAesCryptProvider.spec.js (21 tests) - jsAesCrypt wrapper
    - tests/unit/crypto/WebCryptoProvider.spec.js (25 tests) - WebCrypto provider
    - Total tests: 94→157 (67% increase)
    - All tests passing ✅
  - **Benefits achieved**:
    - ✅ Decoupled from jsAesCrypt (can swap providers without touching components)
    - ✅ Browser-native encryption option (WebCrypto - no dependencies)
    - ✅ Standardized error handling across all providers
    - ✅ Extensible architecture (add new providers easily)
    - ✅ Full backward compatibility (existing code works unchanged)
  - **Provider comparison**:
    - JsAesCryptProvider: .aes files, desktop tool compatible, uses external library
    - WebCryptoProvider: .enc files, faster, no dependencies, browser-native
  - Total impact: +1,336 lines across 12 files (7 new provider files, 3 updated, 3 new test files)

- **2025-11-01**: Major Refactoring - Composables & Shared Components (Phase 4 completion)
  - **Created 5 composables** (443 total lines):
    - useSnackbar.js (41 lines) - Centralized notification management, saved ~120 lines
    - useClipboard.js (74 lines) - Copy/paste operations, saved ~150 lines
    - useDebounce.js (66 lines) - Debounced function calls with auto-cleanup
    - useFileSizeValidation.js (99 lines) - File size validation, saved ~180 lines
    - useAESWorker.js (163 lines) - **Fixed critical memory leak**, auto-terminates workers
  - **Created 4 shared components** (636 total lines):
    - ToolPageHeader.vue (65 lines) - Standardized headers, saved ~72 lines
    - SharedSnackbar.vue (76 lines) - Reusable notifications
    - TextInputWithActions.vue (265 lines) - Configurable text input with action buttons
    - FileUploadWithValidation.vue (230 lines) - File upload with dynamic tooltips, saved ~180 lines
  - **Refactored all 5 tool components** to use composables and shared components:
    - Base64Encode.vue: 322→252 lines (-22%)
    - Base64Decode.vue: 305→226 lines (-26%)
    - AesEncrypt.vue: 418→346 lines (-17%) [later enhanced with text encryption functionality]
    - AesDecrypt.vue: 491→426 lines (-13%) [later enhanced with text decryption functionality]
    - PasswordGenerator.vue: 281→257 lines (-9%)
  - **Created .claude/CODING-STANDARDS.md**: Comprehensive coding standards documentation
  - **Code quality improvements**:
    - Eliminated ~1,124 lines of duplicated code
    - Fixed memory leaks in all AES components (workers not terminated on unmount)
    - Standardized variable naming (is*, can*, handle* prefixes)
    - Consistent import order (Vue → utils → composables → components)
    - Unified debounce timing (350ms text, 800ms crypto)
    - Standardized error handling patterns
  - **UI/UX enhancements**:
    - Dynamic file upload tooltips (context-aware feedback)
    - Password confirmation visual feedback alignment
    - Compact Password Generator layout (50% less vertical space)
    - Regenerate password button with mdi-refresh icon
  - Total impact: +2,792 insertions, -2,185 deletions across 16 files (9 new, 7 modified)

- **2025-10-28**: Password Generator (Phase 7, Task #1)
  - Created src/PasswordGenerator.vue (280 lines) with real-time auto-generation UI
  - Created src/utils/passwordGenerator.js (127 lines) with Web Crypto API for secure randomness
  - Configurable options: length slider (8-64 chars), character type toggles
  - Auto-regeneration using Vue watchers (no manual button required)
  - Integrated existing PasswordStrengthIndicator component
  - Uses Fisher-Yates shuffle algorithm to prevent predictable patterns
  - Guarantees at least one character from each selected type
  - Copy to clipboard with icon-only button matching existing patterns
  - Updated main.js (+2 lines), Home.vue (+8 lines), Slurm.vue (+6 lines), About.vue (+13 lines)
  - Total changes: +435 lines across 6 files (2 new, 4 modified)

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
- **Recent**: Updated deployment directory to `./deploy/`
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

**Last Updated**: 2025-11-08 (AES consolidation: 4→2 components; Naming standardization: PascalCase components, kebab-case URLs)
