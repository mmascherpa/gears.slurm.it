# Testing Documentation

## Overview

This project uses **Vitest** as the testing framework, providing fast and modern testing capabilities for Vue 3 applications.

## Test Structure

```
tests/
├── setup/
│   └── test-utils.js          # Shared test utilities and mocks
├── mocks/
│   └── WorkerMock.js           # Web Worker mock for testing
├── unit/
│   ├── utils/                  # Utility function tests
│   │   ├── csvParser.spec.js
│   │   ├── fileDownload.spec.js
│   │   └── passwordGenerator.spec.js
│   └── composables/            # Composable tests
│       └── useAESWorker.spec.js
└── integration/                # Integration tests (future)
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
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

## Future Work

### Integration Tests
- Component integration with encryption workflow
- File upload and encryption end-to-end
- Text encryption and clipboard interaction
- CSV parsing and preview

### E2E Tests (Optional)
- Full user workflows in real browser
- Offline functionality testing
- PWA installation and update flows

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

**Last Updated**: 2025-11-04
**Test Count**: 423 passing tests
**Coverage**: 95.45% overall (components: 91.66%, utilities: 93.78%, composables: 96.87%, crypto: 100%)
