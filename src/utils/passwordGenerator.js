/**
 * Password Generator Utility
 * Generates cryptographically secure random passwords with customizable options
 */

/**
 * Character sets for password generation
 */
const CHAR_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  special: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

/**
 * Generates a cryptographically secure random integer
 * @param {number} max - Maximum value (exclusive)
 * @returns {number} Random integer between 0 and max-1
 */
function getSecureRandomInt(max) {
  const randomBuffer = new Uint32Array(1);
  crypto.getRandomValues(randomBuffer);
  return randomBuffer[0] % max;
}

/**
 * Shuffles an array using Fisher-Yates algorithm with secure randomness
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
function secureShuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generates a cryptographically secure random password
 * @param {Object} options - Password generation options
 * @param {number} options.length - Password length (8-64 characters)
 * @param {boolean} options.includeUppercase - Include uppercase letters (A-Z)
 * @param {boolean} options.includeLowercase - Include lowercase letters (a-z)
 * @param {boolean} options.includeNumbers - Include numbers (0-9)
 * @param {boolean} options.includeSpecial - Include special characters (!@#$%...)
 * @returns {string} Generated password
 * @throws {Error} If no character types are selected or invalid length
 */
export function generatePassword(options) {
  const {
    length = 16,
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSpecial = true
  } = options;

  // Validate length
  if (length < 8 || length > 64) {
    throw new Error('Password length must be between 8 and 64 characters');
  }

  // Build character pool and track selected types
  let charPool = '';
  const selectedTypes = [];

  if (includeUppercase) {
    charPool += CHAR_SETS.uppercase;
    selectedTypes.push({ chars: CHAR_SETS.uppercase, name: 'uppercase' });
  }
  if (includeLowercase) {
    charPool += CHAR_SETS.lowercase;
    selectedTypes.push({ chars: CHAR_SETS.lowercase, name: 'lowercase' });
  }
  if (includeNumbers) {
    charPool += CHAR_SETS.numbers;
    selectedTypes.push({ chars: CHAR_SETS.numbers, name: 'numbers' });
  }
  if (includeSpecial) {
    charPool += CHAR_SETS.special;
    selectedTypes.push({ chars: CHAR_SETS.special, name: 'special' });
  }

  // Validate at least one character type is selected
  if (charPool.length === 0) {
    throw new Error('At least one character type must be selected');
  }

  // Generate password ensuring at least one character from each selected type
  const passwordArray = [];

  // First, add one character from each selected type
  for (const type of selectedTypes) {
    const randomIndex = getSecureRandomInt(type.chars.length);
    passwordArray.push(type.chars[randomIndex]);
  }

  // Fill remaining length with random characters from the full pool
  const remainingLength = length - selectedTypes.length;
  for (let i = 0; i < remainingLength; i++) {
    const randomIndex = getSecureRandomInt(charPool.length);
    passwordArray.push(charPool[randomIndex]);
  }

  // Shuffle the array to avoid predictable patterns
  // (e.g., guaranteed characters always appearing first)
  const shuffled = secureShuffleArray(passwordArray);

  return shuffled.join('');
}

/**
 * Gets the default password generation options
 * @returns {Object} Default options object
 */
export function getDefaultOptions() {
  return {
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSpecial: true
  };
}
