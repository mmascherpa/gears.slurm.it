/**
 * Web Worker Mock for Testing
 * Simulates Web Worker behavior in Node.js test environment
 */

export class WorkerMock {
  constructor(scriptURL) {
    this.scriptURL = scriptURL
    this.onmessage = null
    this.onerror = null
    this.messageHandlers = []
    this.errorHandlers = []
    this.isTerminated = false
  }

  /**
   * Simulates worker.postMessage()
   * @param {any} message - Message to send to worker
   */
  postMessage(message) {
    if (this.isTerminated) {
      throw new Error('Worker has been terminated')
    }

    // Simulate async processing
    setTimeout(() => {
      if (this.mockHandler) {
        this.mockHandler(message)
      }
    }, 0)
  }

  /**
   * Simulates worker.addEventListener()
   * @param {string} event - Event type ('message' or 'error')
   * @param {Function} handler - Event handler
   */
  addEventListener(event, handler) {
    if (event === 'message') {
      this.messageHandlers.push(handler)
    } else if (event === 'error') {
      this.errorHandlers.push(handler)
    }
  }

  /**
   * Simulates worker.removeEventListener()
   * @param {string} event - Event type
   * @param {Function} handler - Handler to remove
   */
  removeEventListener(event, handler) {
    if (event === 'message') {
      const index = this.messageHandlers.indexOf(handler)
      if (index > -1) this.messageHandlers.splice(index, 1)
    } else if (event === 'error') {
      const index = this.errorHandlers.indexOf(handler)
      if (index > -1) this.errorHandlers.splice(index, 1)
    }
  }

  /**
   * Simulates worker.terminate()
   */
  terminate() {
    this.isTerminated = true
    this.messageHandlers = []
    this.errorHandlers = []
    this.onmessage = null
    this.onerror = null
  }

  /**
   * Test helper: Simulate receiving a message from the worker
   * @param {any} data - Message data
   */
  _simulateMessage(data) {
    const event = { data }

    // Call onmessage if set
    if (this.onmessage) {
      this.onmessage(event)
    }

    // Call all addEventListener handlers
    this.messageHandlers.forEach(handler => handler(event))
  }

  /**
   * Test helper: Simulate a worker error
   * @param {Error|string} error - Error to simulate
   */
  _simulateError(error) {
    const errorEvent = {
      message: typeof error === 'string' ? error : error.message,
      error: error
    }

    // Call onerror if set
    if (this.onerror) {
      this.onerror(errorEvent)
    }

    // Call all addEventListener handlers
    this.errorHandlers.forEach(handler => handler(errorEvent))
  }

  /**
   * Test helper: Set custom handler for postMessage
   * @param {Function} handler - Custom handler function
   */
  _setMockHandler(handler) {
    this.mockHandler = handler
  }
}

/**
 * Creates a mock Worker that simulates AES encryption/decryption
 * @returns {WorkerMock} Worker mock with AES simulation
 */
export function createAESWorkerMock() {
  const worker = new WorkerMock('/worker.js')

  // Set up default behavior that simulates the real worker
  worker._setMockHandler((message) => {
    const [action, fileData, password, fileName] = message

    // Simulate processing delay
    setTimeout(() => {
      if (action === 'ENCRYPT') {
        // Simulate successful encryption
        const mockEncryptedData = new Uint8Array([0x41, 0x45, 0x53, 0x01, 0x02])
        worker._simulateMessage(['ENCRYPT', mockEncryptedData, fileName + '.aes'])
      } else if (action === 'DECRYPT') {
        // Simulate successful decryption
        const mockDecryptedData = new Uint8Array([0x01, 0x02, 0x03])
        worker._simulateMessage(['DECRYPT', mockDecryptedData, fileName.replace('.aes', '')])
      }
    }, 10)
  })

  return worker
}

/**
 * Creates a mock Worker that simulates encryption errors
 * @param {string} errorMessage - Error message to simulate
 * @returns {WorkerMock} Worker mock that returns errors
 */
export function createFailingAESWorkerMock(errorMessage = 'Mock encryption error') {
  const worker = new WorkerMock('/worker.js')

  worker._setMockHandler((message) => {
    const [action] = message

    setTimeout(() => {
      worker._simulateMessage(['ERROR', errorMessage, action])
    }, 10)
  })

  return worker
}

/**
 * Creates a mock Worker for specific error scenarios
 * @param {string} scenario - Error scenario ('wrong-password', 'corrupted', 'invalid-format')
 * @returns {WorkerMock} Worker mock with specific error
 */
export function createErrorScenarioWorker(scenario) {
  const errorMessages = {
    'wrong-password': 'Wrong password',
    'bad-hmac': 'Bad HMAC',
    'corrupted': 'File corrupted',
    'invalid-format': 'not an AES Crypt file',
    'password-too-long': 'Password is too long'
  }

  return createFailingAESWorkerMock(errorMessages[scenario] || 'Unknown error')
}

/**
 * Global Worker mock for test environment
 */
export function setupWorkerMock() {
  if (typeof Worker === 'undefined') {
    global.Worker = WorkerMock
  }
}

/**
 * Cleanup Worker mock
 */
export function cleanupWorkerMock() {
  if (global.Worker === WorkerMock) {
    delete global.Worker
  }
}
