import { vi } from 'vitest'

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn(),
}

// Mock Blob if not available in test environment
if (typeof Blob === 'undefined') {
  global.Blob = class Blob {
    constructor(parts, options) {
      this.parts = parts
      this.options = options
      this.size = parts.reduce((acc, part) => acc + (part.length || 0), 0)
      this.type = options?.type || ''
    }
  }
}

// Mock File if not available in test environment
if (typeof File === 'undefined') {
  global.File = class File extends global.Blob {
    constructor(parts, filename, options) {
      super(parts, options)
      this.name = filename
      this.lastModified = Date.now()
    }
  }
}

// Mock URL.createObjectURL and revokeObjectURL
if (typeof URL.createObjectURL === 'undefined') {
  URL.createObjectURL = vi.fn(() => 'blob:mock-url')
  URL.revokeObjectURL = vi.fn()
}

// Mock document.createElement for download testing
const originalCreateElement = document.createElement.bind(document)
document.createElement = vi.fn((tagName) => {
  const element = originalCreateElement(tagName)
  if (tagName === 'a') {
    element.click = vi.fn()
  }
  return element
})

// Mock clipboard API
if (!navigator.clipboard) {
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: vi.fn(() => Promise.resolve()),
      readText: vi.fn(() => Promise.resolve('')),
    },
    writable: true,
  })
}

// Helper to create mock files for testing
export function createMockFile(content, filename = 'test.txt', type = 'text/plain') {
  const blob = new Blob([content], { type })
  return new File([blob], filename, { type })
}

// Helper to read blob as text
export async function readBlobAsText(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsText(blob)
  })
}

// Helper to read blob as ArrayBuffer
export async function readBlobAsArrayBuffer(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsArrayBuffer(blob)
  })
}

// Helper to wait for async operations
export function nextTick() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

// Helper to create mock CSV data
export function createMockCSV(rows) {
  return rows.map(row => row.join(',')).join('\n')
}
