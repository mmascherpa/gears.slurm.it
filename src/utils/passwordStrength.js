/**
 * Password Strength Utility
 * Calculates password strength based on entropy (bits of randomness)
 *
 * Entropy thresholds based on current security best practices:
 * - < 35 bits: Weak (vulnerable to offline attacks)
 * - 35-60 bits: Medium (adequate for low-value accounts)
 * - 60-80 bits: Strong (good for most accounts)
 * - 80+ bits: Very Strong (excellent for high-security use)
 *
 * Reference: https://en.wikipedia.org/wiki/Password_strength#Entropy_as_a_measure_of_password_strength
 */

// Entropy thresholds (in bits) - calibrated to current best practices
const ENTROPY_THRESHOLDS = {
  WEAK: 35,      // Below this is weak
  MEDIUM: 60,    // Below this is medium
  STRONG: 80     // Below this is strong, above is very strong
};

/**
 * Calculates the entropy of a password based on its character set
 * @param {string} password - The password to analyze
 * @returns {Object} Object with entropy value and character set info
 */
export function calculatePasswordEntropy(password) {
  if (!password || password.length === 0) {
    return { entropy: 0, charsetSize: 0, length: 0 };
  }

  // Determine character set size based on what's actually in the password
  let charsetSize = 0;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[^A-Za-z0-9]/.test(password);

  if (hasLowercase) charsetSize += 26;
  if (hasUppercase) charsetSize += 26;
  if (hasNumbers) charsetSize += 10;
  if (hasSpecialChars) charsetSize += 32; // Common special characters

  // Entropy = length × log2(charset_size)
  const entropy = charsetSize > 0 ? password.length * Math.log2(charsetSize) : 0;

  return {
    entropy,
    charsetSize,
    length: password.length,
    hasLowercase,
    hasUppercase,
    hasNumbers,
    hasSpecialChars
  };
}

/**
 * Converts entropy to strength level, color, and percentage
 * @param {number} entropy - Entropy in bits
 * @returns {Object} Strength metadata (level, color, label, percentage)
 */
function getStrengthFromEntropy(entropy) {
  let level, color, label, percentage;

  if (entropy < ENTROPY_THRESHOLDS.WEAK) {
    level = 'weak';
    color = 'error';
    label = 'Weak';
    percentage = (entropy / ENTROPY_THRESHOLDS.WEAK) * 33;
  } else if (entropy < ENTROPY_THRESHOLDS.MEDIUM) {
    level = 'medium';
    color = 'warning';
    label = 'Medium';
    percentage = 33 + ((entropy - ENTROPY_THRESHOLDS.WEAK) / (ENTROPY_THRESHOLDS.MEDIUM - ENTROPY_THRESHOLDS.WEAK)) * 34;
  } else if (entropy < ENTROPY_THRESHOLDS.STRONG) {
    level = 'strong';
    color = 'success';
    label = 'Strong';
    percentage = 67 + ((entropy - ENTROPY_THRESHOLDS.MEDIUM) / (ENTROPY_THRESHOLDS.STRONG - ENTROPY_THRESHOLDS.MEDIUM)) * 23;
  } else {
    level = 'very-strong';
    color = 'success';
    label = 'Very Strong';
    percentage = 100;
  }

  return {
    level,
    color,
    label,
    percentage: Math.min(100, Math.round(percentage))
  };
}

/**
 * Generates improvement suggestions for a password
 * @param {Object} entropyInfo - Result from calculatePasswordEntropy
 * @param {number} entropy - Current entropy value
 * @returns {Array} Array of suggestion strings
 */
function getPasswordSuggestions(entropyInfo, entropy) {
  const suggestions = [];
  const { length, hasLowercase, hasUppercase, hasNumbers, hasSpecialChars } = entropyInfo;

  // Only show suggestions if password isn't already very strong
  if (entropy >= ENTROPY_THRESHOLDS.STRONG) {
    return suggestions;
  }

  // Length suggestions
  if (length < 12) {
    suggestions.push('Use at least 12 characters');
  } else if (length < 16 && entropy < ENTROPY_THRESHOLDS.MEDIUM) {
    suggestions.push('Consider using 16+ characters');
  }

  // Character variety suggestions
  if (!hasUppercase && !hasLowercase) {
    suggestions.push('Add letters to your password');
  } else if (!hasUppercase || !hasLowercase) {
    suggestions.push('Mix uppercase and lowercase letters');
  }

  if (!hasNumbers) {
    suggestions.push('Add numbers for more entropy');
  }

  if (!hasSpecialChars) {
    suggestions.push('Add special characters (!@#$%^&*)');
  }

  return suggestions;
}

/**
 * Evaluates password strength using entropy-based calculation
 * @param {string} password - The password to evaluate
 * @returns {Object} Object containing strength level, entropy, feedback, and requirements
 */
export function calculatePasswordStrength(password) {
  if (!password || password.length === 0) {
    return {
      level: 'empty',
      score: 0,
      entropy: 0,
      color: 'grey',
      label: 'Enter password',
      percentage: 0,
      feedback: [],
      requirements: getRequirements(password, null)
    };
  }

  // Calculate entropy
  const entropyInfo = calculatePasswordEntropy(password);
  const { entropy, hasLowercase, hasUppercase, hasNumbers, hasSpecialChars } = entropyInfo;

  // Get strength level from entropy
  const strengthMeta = getStrengthFromEntropy(entropy);

  // Generate suggestions
  const suggestions = getPasswordSuggestions(entropyInfo, entropy);

  // Detect common patterns (add warnings but don't affect entropy)
  const hasSequential = /abc|bcd|cde|123|234|345|456|567|678|789/i.test(password);
  const hasRepeating = /(.)\1{2,}/.test(password);

  if (hasSequential) {
    suggestions.unshift('Avoid sequential characters (abc, 123)');
  }
  if (hasRepeating) {
    suggestions.unshift('Avoid repeating characters (aaa, 111)');
  }

  // Build character checks for requirements
  const charChecks = { hasLowercase, hasUppercase, hasNumbers, hasSpecialChars };

  return {
    level: strengthMeta.level,
    score: Math.round(entropy), // Keep score for backwards compatibility
    entropy: Math.round(entropy * 10) / 10,
    color: strengthMeta.color,
    label: strengthMeta.label,
    percentage: strengthMeta.percentage,
    feedback: strengthMeta.level === 'very-strong' || strengthMeta.level === 'strong' ? [] : suggestions,
    requirements: getRequirements(password, charChecks)
  };
}

/**
 * Returns password requirements checklist with met/unmet status
 * @param {string} password - The password to check
 * @param {Object|null} charChecks - Pre-computed character checks (or null to compute)
 * @returns {Array} Array of requirement objects with met status
 */
function getRequirements(password, charChecks) {
  const pwd = password || '';

  if (!charChecks) {
    charChecks = {
      hasLowercase: /[a-z]/.test(pwd),
      hasUppercase: /[A-Z]/.test(pwd),
      hasNumbers: /\d/.test(pwd),
      hasSpecialChars: /[^A-Za-z0-9]/.test(pwd)
    };
  }

  const hasBothCases = charChecks.hasLowercase && charChecks.hasUppercase;
  const lengthMet = pwd.length >= 12;

  return [
    {
      text: 'At least 12 characters',
      met: lengthMet,
      icon: lengthMet ? 'mdi-check-circle' : 'mdi-circle-outline'
    },
    {
      text: 'Uppercase and lowercase letters',
      met: hasBothCases,
      icon: hasBothCases ? 'mdi-check-circle' : 'mdi-circle-outline'
    },
    {
      text: 'At least one number',
      met: charChecks.hasNumbers,
      icon: charChecks.hasNumbers ? 'mdi-check-circle' : 'mdi-circle-outline'
    },
    {
      text: 'At least one special character',
      met: charChecks.hasSpecialChars,
      icon: charChecks.hasSpecialChars ? 'mdi-check-circle' : 'mdi-circle-outline'
    }
  ];
}

/**
 * Simple check if password meets minimum security requirements
 * @param {string} password - The password to check
 * @returns {boolean} True if password meets minimum requirements (60+ bits entropy)
 */
export function isPasswordSecure(password) {
  const { entropy } = calculatePasswordEntropy(password);
  return entropy >= ENTROPY_THRESHOLDS.MEDIUM;
}

/**
 * Calculates strength based on entropy bits with optional suggestions
 * Used for passphrases where entropy is pre-calculated
 * @param {number} entropy - Entropy in bits
 * @param {Array} suggestions - Optional array of improvement suggestions
 * @returns {Object} Strength object with level, color, label, percentage, entropy
 */
export function calculateEntropyStrength(entropy, suggestions = []) {
  const strengthMeta = getStrengthFromEntropy(entropy);

  return {
    level: strengthMeta.level,
    color: strengthMeta.color,
    label: strengthMeta.label,
    percentage: strengthMeta.percentage,
    entropy: Math.round(entropy * 10) / 10,
    feedback: strengthMeta.level === 'very-strong' || strengthMeta.level === 'strong' ? [] : suggestions
  };
}

/**
 * Generates improvement suggestions for a passphrase configuration
 * @param {Object} options - Passphrase options
 * @param {number} entropy - Current entropy value
 * @returns {Array} Array of suggestion strings
 */
export function getPassphraseSuggestions(options, entropy) {
  const suggestions = [];
  const { wordCount, appendNumber, specialPosition } = options;

  // Only show suggestions if not already very strong
  if (entropy >= ENTROPY_THRESHOLDS.STRONG) {
    return suggestions;
  }

  if (wordCount < 5) {
    suggestions.push('Add more words for stronger security');
  }

  if (!appendNumber) {
    suggestions.push('Enable numbers for extra entropy');
  }

  if (specialPosition === 'none') {
    suggestions.push('Add special characters for additional security');
  }

  return suggestions;
}
