/**
 * Password Strength Utility
 * Calculates password strength based on length, complexity, and character variety
 */

/**
 * Evaluates password strength and returns detailed metrics
 * @param {string} password - The password to evaluate
 * @returns {Object} Object containing strength level, score, feedback, and requirements
 */
export function calculatePasswordStrength(password) {
  if (!password || password.length === 0) {
    return {
      level: 'empty',
      score: 0,
      color: 'grey',
      label: 'Enter password',
      percentage: 0,
      feedback: [],
      requirements: getRequirements(password, null)
    };
  }

  let score = 0;
  const feedback = [];

  // Length scoring (0-40 points) - Linear progression to ensure adding chars always increases score
  // Give 2 points per character up to 20 characters
  const lengthScore = Math.min(40, password.length * 2);
  score += lengthScore;

  // Character variety checks - compute once and reuse
  const charChecks = {
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChars: /[^A-Za-z0-9]/.test(password)
  };

  // Character variety scoring (0-60 points)
  if (charChecks.hasLowercase) score += 10;
  if (charChecks.hasUppercase) score += 15;
  if (charChecks.hasNumbers) score += 15;
  if (charChecks.hasSpecialChars) score += 20;

  // Detect common patterns - these add feedback but DON'T reduce score
  // This ensures adding any character never decreases the score
  const hasSequential = /abc|bcd|cde|123|234|345|456|567|678|789/i.test(password);
  const hasRepeating = /(.)\1{2,}/.test(password);

  if (hasSequential) {
    feedback.push('Avoid sequential characters (abc, 123)');
  }
  if (hasRepeating) {
    feedback.push('Avoid repeating characters (aaa, 111)');
  }

  // Add specific feedback
  if (password.length < 12) {
    feedback.push('Use at least 12 characters for better security');
  }
  if (!charChecks.hasUppercase || !charChecks.hasLowercase) {
    feedback.push('Include both uppercase and lowercase letters');
  }
  if (!charChecks.hasNumbers) {
    feedback.push('Add numbers to strengthen your password');
  }
  if (!charChecks.hasSpecialChars) {
    feedback.push('Include special characters (!@#$%^&*)');
  }

  // Determine strength level and color - AFTER penalties applied
  let level, color, label, percentage;

  // Check if all requirements are met for "Very Strong"
  const hasAllRequirements = charChecks.hasLowercase &&
                             charChecks.hasUppercase &&
                             charChecks.hasNumbers &&
                             charChecks.hasSpecialChars &&
                             password.length >= 12;

  // Always mark as weak if password is too short (less than 12 characters)
  if (password.length < 12) {
    level = 'weak';
    color = 'error';
    label = 'Weak';
    percentage = (password.length / 12) * 33; // Scale 0-33% based on length progress to 12 chars
    if (!feedback.includes('Password is too weak')) {
      feedback.push('Password is too weak');
    }
  } else if (score < 30) {
    level = 'weak';
    color = 'error';
    label = 'Weak';
    percentage = (score / 30) * 33; // 0-33% for weak
    feedback.push('Password is too weak');
  } else if (score < 60) {
    level = 'medium';
    color = 'warning';
    label = 'Medium';
    percentage = 33 + ((score - 30) / 30) * 34; // 33-67% for medium
    feedback.push('Consider making your password stronger');
  } else if (score < 80 || !hasAllRequirements) {
    // Even if score is high, without all requirements it's only "Strong"
    level = 'strong';
    color = 'success';
    label = 'Strong';
    percentage = Math.min(90, 67 + ((score - 60) / 40) * 23); // 67-90% for strong (capped at 90%)
  } else {
    // Very Strong requires: score >= 80 AND all character types AND length >= 12
    level = 'very-strong';
    color = 'success';
    label = 'Very Strong';
    percentage = 100; // Always 100% for very strong passwords
  }

  return {
    level,
    score,
    color,
    label,
    percentage: Math.min(100, Math.round(percentage)),
    feedback: level === 'very-strong' || level === 'strong' ? [] : feedback,
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
  // If charChecks not provided, compute them
  if (!charChecks) {
    charChecks = {
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChars: /[^A-Za-z0-9]/.test(password)
    };
  }

  const hasBothCases = charChecks.hasLowercase && charChecks.hasUppercase;
  const lengthMet = password.length >= 12;

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
 * @returns {boolean} True if password meets minimum requirements
 */
export function isPasswordSecure(password) {
  const strength = calculatePasswordStrength(password);
  return strength.score >= 60; // At least "strong"
}
