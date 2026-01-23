/**
 * Passphrase Generator Utility
 * Generates cryptographically secure memorable passphrases using EFF word list
 */

import { EFF_WORDLIST, WORDLIST_SIZE, BITS_PER_WORD } from '@/data/effWordlist';

/**
 * Separator options for passphrases
 */
export const SEPARATORS = {
  HYPHEN: '-',
  SPACE: ' ',
  PERIOD: '.',
  UNDERSCORE: '_',
  NONE: ''
};

/**
 * Capitalization options for words
 */
export const CAPITALIZATION = {
  TITLE_CASE: 'title',
  LOWERCASE: 'lower',
  UPPERCASE: 'upper',
  RANDOM: 'random'
};

/**
 * Special character position options
 */
export const SPECIAL_POSITION = {
  NONE: 'none',
  START: 'start',
  END: 'end'
};

/**
 * Special characters pool for passphrase enhancement
 */
const SPECIAL_CHARS = '!@#$%^&*';

/**
 * Generates a cryptographically secure random index
 * @param {number} max - Maximum value (exclusive)
 * @returns {number} Random index between 0 and max-1
 */
function getSecureRandomIndex(max) {
  const randomBuffer = new Uint32Array(1);
  crypto.getRandomValues(randomBuffer);
  return randomBuffer[0] % max;
}

/**
 * Applies capitalization to a word
 * @param {string} word - Word to capitalize
 * @param {string} style - Capitalization style from CAPITALIZATION
 * @returns {string} Capitalized word
 */
function capitalizeWord(word, style) {
  switch (style) {
    case CAPITALIZATION.TITLE_CASE:
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    case CAPITALIZATION.UPPERCASE:
      return word.toUpperCase();
    case CAPITALIZATION.LOWERCASE:
      return word.toLowerCase();
    case CAPITALIZATION.RANDOM:
      return getSecureRandomIndex(2) === 0 ? word.toUpperCase() : word.toLowerCase();
    default:
      return word;
  }
}

/**
 * Generates a cryptographically secure random number with specified digits
 * @param {number} digits - Number of digits (1-8)
 * @returns {string} Random number string with leading zeros if needed
 */
function generateRandomNumber(digits) {
  const max = Math.pow(10, digits);
  const num = getSecureRandomIndex(max);
  return num.toString().padStart(digits, '0');
}

/**
 * Generates a cryptographically secure random special character string
 * @param {number} count - Number of special characters (1-8)
 * @returns {string} Random special characters
 */
function generateSpecialChars(count) {
  let result = '';
  for (let i = 0; i < count; i++) {
    const index = getSecureRandomIndex(SPECIAL_CHARS.length);
    result += SPECIAL_CHARS[index];
  }
  return result;
}

/**
 * Generates a memorable passphrase using EFF word list
 * @param {Object} options - Generation options
 * @param {number} options.wordCount - Number of words (3-8, default 4)
 * @param {string} options.separator - Word separator (default '-')
 * @param {string} options.capitalization - Word capitalization style (default 'title')
 * @param {boolean} options.appendNumber - Whether to append a number (default false)
 * @param {number} options.numberDigits - Number of digits to append (1-8, default 4)
 * @param {string} options.specialPosition - Where to add special chars: 'none', 'start', 'end' (default 'none')
 * @param {number} options.specialCount - Number of special characters (1-8, default 2)
 * @returns {string} Generated passphrase
 * @throws {Error} If options are invalid
 */
export function generatePassphrase(options = {}) {
  const {
    wordCount = 4,
    separator = SEPARATORS.HYPHEN,
    capitalization = CAPITALIZATION.TITLE_CASE,
    appendNumber = false,
    numberDigits = 4,
    specialPosition = SPECIAL_POSITION.NONE,
    specialCount = 2
  } = options;

  // Validation
  if (wordCount < 3 || wordCount > 8) {
    throw new Error('Word count must be between 3 and 8');
  }
  if (numberDigits < 1 || numberDigits > 8) {
    throw new Error('Number of digits must be between 1 and 8');
  }
  if (specialCount < 1 || specialCount > 8) {
    throw new Error('Special character count must be between 1 and 8');
  }

  // Select random words from the word list
  const words = [];
  for (let i = 0; i < wordCount; i++) {
    const index = getSecureRandomIndex(WORDLIST_SIZE);
    const word = capitalizeWord(EFF_WORDLIST[index], capitalization);
    words.push(word);
  }

  // Build passphrase
  let passphrase = words.join(separator);

  // Append number if requested
  if (appendNumber) {
    const number = generateRandomNumber(numberDigits);
    passphrase += separator + number;
  }

  // Add special characters if requested
  if (specialPosition !== SPECIAL_POSITION.NONE) {
    const specials = generateSpecialChars(specialCount);
    if (specialPosition === SPECIAL_POSITION.START) {
      passphrase = specials + separator + passphrase;
    } else if (specialPosition === SPECIAL_POSITION.END) {
      passphrase = passphrase + separator + specials;
    }
  }

  return passphrase;
}

/**
 * Calculates entropy for a passphrase configuration
 * @param {Object} options - Same options as generatePassphrase
 * @returns {number} Entropy in bits
 */
export function calculatePassphraseEntropy(options = {}) {
  const {
    wordCount = 4,
    appendNumber = false,
    numberDigits = 4,
    capitalization = CAPITALIZATION.TITLE_CASE,
    specialPosition = SPECIAL_POSITION.NONE,
    specialCount = 2
  } = options;

  // Base word entropy (~12.925 bits per word from EFF list)
  let entropy = wordCount * BITS_PER_WORD;

  // Number entropy (~3.32 bits per digit)
  if (appendNumber) {
    entropy += numberDigits * Math.log2(10);
  }

  // Special character entropy (~3 bits per character from 8-char pool)
  if (specialPosition !== SPECIAL_POSITION.NONE) {
    entropy += specialCount * Math.log2(SPECIAL_CHARS.length);
  }

  // Capitalization entropy (only for random case - 1 bit per word)
  if (capitalization === CAPITALIZATION.RANDOM) {
    entropy += wordCount;
  }

  return entropy;
}

/**
 * Gets default passphrase generation options
 * @returns {Object} Default options
 */
export function getDefaultPassphraseOptions() {
  return {
    wordCount: 5,
    separator: SEPARATORS.HYPHEN,
    capitalization: CAPITALIZATION.TITLE_CASE,
    appendNumber: true,
    numberDigits: 4,
    specialPosition: SPECIAL_POSITION.END,
    specialCount: 2
  };
}
