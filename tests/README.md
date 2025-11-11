# Testing Documentation

## Overview

This project uses a comprehensive testing strategy with two layers:
- **Vitest**: Fast unit tests (423 tests, 95.45% coverage)
- **Playwright**: End-to-end tests (47 tests, all critical paths)

## Test Structure

```
tests/
├── setup/
│   └── test-utils.js                # Shared test utilities and mocks (Vitest)
├── mocks/
│   └── WorkerMock.js                # Web Worker mock for Vitest
├── unit/                            # Unit tests (Vitest - 423 tests)
│   ├── utils/
│   │   ├── csvParser.spec.js
│   │   ├── fileDownload.spec.js
│   │   └── passwordGenerator.spec.js
│   ├── composables/
│   │   └── useAESWorker.spec.js
│   ├── crypto/
│   │   └── [3 crypto provider tests]
│   └── components/
│       └── [6 component tests]
├── e2e/                             # E2E tests (Playwright - 47 tests)
│   ├── base64.spec.js               # 6 Base64 encode/decode tests
│   ├── aes-text.spec.js             # 6 AES text encryption tests
│   ├── aes-file.spec.js             # 10 AES file encryption tests
│   ├── tools-and-theme.spec.js      # 13 password generator + theme tests
│   ├── offline-pwa.spec.js          # 12 offline PWA functionality tests
│   ├── helpers.js                   # Shared E2E test utilities
│   └── fixtures/                    # Test data files
│       ├── test.txt
│       └── test-data.csv
└── README.md                        # This file
```

## Running Tests

### Unit Tests (Vitest)

```bash
# Run all unit tests
npm run test

# Run unit tests in watch mode (auto-run on changes)
npm run test:watch

# Run unit tests with visual UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests (CLI - fastest)
npm run test:e2e

# Run E2E tests with visual runner (interactive, great for debugging)
npm run test:e2e:ui

# Debug E2E tests (step through with inspector)
npm run test:e2e:debug
```

### Pre-Deployment Workflow

```bash
# Always run this before deploying to gears.slurm.it
npm run test              # Unit tests (~30 sec)
npm run test:e2e          # E2E tests (~5-7 min)
npm run build
npm run preview           # Manual test of built version
```

## Test Coverage

**Current Status**: 423 tests passing (95.45% coverage)

### Unit Tests

#### **Utilities** (63 tests)
- ✅ **csvParser.js** (23 tests) - CSV parsing with various delimiters, encodings, edge cases
- ✅ **fileDownload.js** (12 tests) - File download functionality, blob handling
- ✅ **passwordGenerator.js** (28 tests) - Password generation, validation, randomness

#### **Composables** (31 tests)
- ✅ **useAESWorker.js** (31 tests) - Worker lifecycle, encryption/decryption, error handling

#### **Crypto Providers** (63 tests)
- ✅ **CryptoProvider.js** (17 tests) - Abstract provider interface
- ✅ **JsAesCryptProvider.js** (21 tests) - JsAesCrypt implementation
- ✅ **WebCryptoProvider.js** (25 tests) - WebCrypto API implementation

#### **Components** (266 tests)
- ✅ **PasswordInput.vue** (40 tests) - Password visibility toggle, confirmation matching, validation
- ✅ **PasswordStrengthIndicator.vue** (49 tests) - Strength calculation, requirements checklist, feedback
- ✅ **FileUploadWithValidation.vue** (40 tests) - File input, size validation, button states, tooltips
- ✅ **ToolPageHeader.vue** (36 tests) - Icon, title, description, avatar colors, typography
- ✅ **TextInputWithActions.vue** (57 tests) - Textarea, button visibility, loading state, events
- ✅ **SharedSnackbar.vue** (44 tests) - Visibility, colors, timeout, location, text content

## Writing Tests

### Basic Test Structure

```javascript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('ComponentName or FunctionName', () => {
  beforeEach(() => {
    // Setup before each test
  })

  afterEach(() => {
    // Cleanup after each test
  })

  it('should do something specific', () => {
    // Arrange
    const input = 'test'

    // Act
    const result = functionToTest(input)

    // Assert
    expect(result).toBe('expected output')
  })
})
```

### Testing Utilities

#### **File Operations**

```javascript
import { createMockFile, readBlobAsText } from '../setup/test-utils'

const file = createMockFile('content', 'test.txt', 'text/plain')
const text = await readBlobAsText(blob)
```

#### **Async Operations**

```javascript
import { nextTick } from '../setup/test-utils'

await nextTick()  // Wait for async operations
```

#### **CSV Data**

```javascript
import { createMockCSV } from '../setup/test-utils'

const csv = createMockCSV([
  ['name', 'age'],
  ['Alice', '25']
])
```

### Mocking Web Workers

The project provides a comprehensive `WorkerMock` class for testing Web Worker functionality:

```javascript
import { createAESWorkerMock, createFailingAESWorkerMock, createErrorScenarioWorker } from '../mocks/WorkerMock'

// Mock successful worker
global.Worker = class MockedWorker {
  constructor() {
    return createAESWorkerMock()
  }
}

// Mock failing worker
global.Worker = class FailWorker {
  constructor() {
    return createFailingAESWorkerMock('Test error')
  }
}

// Mock specific error scenarios
global.Worker = class ErrorWorker {
  constructor() {
    return createErrorScenarioWorker('wrong-password')
  }
}
```

**Available Error Scenarios:**
- `'wrong-password'` - Wrong password error
- `'bad-hmac'` - Bad HMAC error
- `'corrupted'` - File corrupted error
- `'invalid-format'` - Invalid AES file format
- `'password-too-long'` - Password too long error

### Testing Composables

When testing Vue composables, be aware of Vue's reactivity system:

```javascript
import { useAESWorker } from '@/composables/useAESWorker'

it('should test composable', async () => {
  const onSuccess = vi.fn()
  const onError = vi.fn()

  const { isLoading, encrypt } = useAESWorker(onSuccess, onError)

  expect(isLoading.value).toBe(false)

  const fileData = new Blob(['test'])
  encrypt(fileData, 'password', 'file.txt')

  expect(isLoading.value).toBe(true)

  // Wait for async worker processing
  await new Promise(resolve => setTimeout(resolve, 20))

  expect(onSuccess).toHaveBeenCalled()
  expect(isLoading.value).toBe(false)
})
```

## Test Organization Best Practices

### 1. **Group Related Tests**

```javascript
describe('PasswordGenerator', () => {
  describe('validation', () => {
    it('should reject length < 8', () => { ... })
    it('should reject length > 64', () => { ... })
  })

  describe('character inclusion', () => {
    it('should include uppercase', () => { ... })
    it('should include lowercase', () => { ... })
  })
})
```

### 2. **Test Edge Cases**

Always test:
- Empty inputs (`''`, `null`, `undefined`)
- Boundary conditions (min/max values)
- Invalid types
- Error scenarios

### 3. **Use Descriptive Test Names**

```javascript
// ✅ Good
it('should throw error when password length exceeds 1024 characters', () => {})

// ❌ Bad
it('should validate password', () => {})
```

### 4. **Keep Tests Isolated**

Each test should:
- Not depend on other tests
- Clean up after itself
- Use fresh data

### 5. **Mock External Dependencies**

```javascript
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
})

afterEach(() => {
  vi.restoreAllMocks()
})
```

## Configuration

### Vitest Config (`vitest.config.js`)

```javascript
{
  globals: true,                    // Use global test functions
  environment: 'happy-dom',         // DOM environment
  setupFiles: ['./tests/setup/test-utils.js'],
  coverage: {
    provider: 'v8',
    exclude: [
      'node_modules/',
      'tests/',
      '*.config.js',
      'scripts/',
      'public/',
      'jsAesCrypt-main/',
    ]
  }
}
```

## Common Patterns

### Async Testing

```javascript
it('should handle async operation', async () => {
  const result = await asyncFunction()
  expect(result).toBe('expected')
})
```

### Error Testing

```javascript
it('should throw error', () => {
  expect(() => functionThatThrows()).toThrow('Error message')
})
```

### Spy Testing

```javascript
it('should call function', () => {
  const spy = vi.fn()
  componentThatCallsCallback(spy)

  expect(spy).toHaveBeenCalled()
  expect(spy).toHaveBeenCalledWith('arg1', 'arg2')
  expect(spy).toHaveBeenCalledTimes(1)
})
```

## E2E Tests (Playwright)

### Overview

E2E tests verify full user workflows without mocks. They test the real browser, service worker, and offline functionality. **47 tests across 5 suites** cover all critical paths.

### Running E2E Tests

```bash
# Fast CLI mode (recommended for pre-deployment)
npm run test:e2e

# Interactive visual mode (great for development/debugging)
npm run test:e2e:ui

# Step-through debug mode
npm run test:e2e:debug
```

### Test Suites

**1. Base64 Encode/Decode** (6 tests)
- Text encoding to Base64
- Base64 decoding to text
- Clipboard copy/paste
- Special character handling
- Round-trip verification

**2. AES Text Encryption/Decryption** (6 tests)
- Plain text encryption with password
- Base64 text decryption with password
- Password validation
- Error handling (wrong password)
- Unicode support

**3. AES File Encryption/Decryption** (10 tests)
- File upload and encryption
- CSV file preview on encryption
- Password confirmation validation
- File size validation (60MB warning, 200MB limit)
- Download trigger
- Clear/reset functionality

**4. Tools & Theme Switching** (13 tests)
- Password generator (generate, regenerate, copy)
- Password strength indicator
- Theme switching (Default, Dark, Slurm)
- Theme persistence via localStorage
- Session password manager
- Character type toggles

**5. Offline PWA Functionality** (12 tests) - **Critical**
- Service worker registration
- Asset caching on first visit
- Encryption works offline
- Decryption works offline
- All pages accessible offline
- Theme persists offline
- State survives offline/online transitions
- Manifest.json validation
- Cache updates handling

### E2E Test Structure

```javascript
import { test, expect } from '@playwright/test'

test('should describe the user workflow', async ({ page }) => {
  // Navigate to page
  await page.goto('/#/aes-encrypt')
  await page.waitForLoadState('networkidle')

  // Interact with page
  await page.locator('textarea').fill('test data')
  await page.locator('button:has-text("Encrypt")').click()

  // Verify results
  const output = page.locator('[data-testid="output"]')
  await expect(output).toContainText('encrypted')
})
```

### Best Practices for E2E Tests

1. **Use data-testid attributes** for reliable element selection
2. **Wait for network** (`waitForLoadState('networkidle')`)
3. **Test real user flows** - don't test implementation details
4. **Handle timing** - use `waitFor()` instead of arbitrary delays
5. **Test critical paths** - encryption, offline, file handling
6. **Test error cases** - wrong password, invalid file, missing input

## Future Work

### Additional Unit Tests
- More edge cases for crypto providers
- Performance benchmarking tests
- Memory leak detection for long-running operations

### Integration Tests
- Component integration with encryption workflow (beyond E2E)
- Multi-file encryption workflows
- Large file handling benchmarks (100MB+)

### E2E Test Enhancements
- PWA installation and update flow testing
- Browser compatibility matrix (Chrome, Firefox, Safari)
- Mobile-specific E2E tests (touch interactions, small screens)
- Performance budgets for E2E operations

## Troubleshooting

### Tests Fail with "Worker is not defined"

Make sure you're properly mocking the Worker in your beforeEach:

```javascript
beforeEach(() => {
  global.Worker = class MockedWorker {
    constructor() {
      return createAESWorkerMock()
    }
  }
})
```

### Async Tests Timeout

Increase the timeout or check your async handling:

```javascript
it('should handle slow operation', async () => {
  await new Promise(resolve => setTimeout(resolve, 100))
}, 10000) // 10 second timeout
```

### Blob/File Not Available

The test-utils.js file provides polyfills. If you still have issues:

```javascript
if (typeof Blob === 'undefined') {
  global.Blob = require('node:buffer').Blob
}
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Testing Library](https://testing-library.com/)
- [Vitest UI](https://vitest.dev/guide/ui.html)

---

**Last Updated**: 2025-11-11
**Unit Tests**: 423 passing tests (95.45% coverage)
**E2E Tests**: 47 passing tests (all critical paths covered)
**Total Tests**: 470 tests
**Coverage**: 95.45% overall (components: 91.66%, utilities: 93.78%, composables: 96.87%, crypto: 100%)
