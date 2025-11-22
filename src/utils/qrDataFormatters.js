/**
 * QR Data Formatters
 * Formats data for different QR code types (WiFi, vCard, Email, SMS)
 */

/**
 * Formats WiFi network data into MECARD WiFi format
 * @param {Object} data - WiFi configuration
 * @param {string} data.ssid - Network SSID
 * @param {string} data.password - Network password
 * @param {string} data.security - Security type (WPA, WEP, or nopass)
 * @param {boolean} data.hidden - Whether network is hidden
 * @returns {string} Formatted WiFi string
 */
export function formatWiFi(data) {
  const { ssid, password, security = 'WPA', hidden = false } = data;

  if (!ssid) {
    throw new Error('SSID is required for WiFi QR codes');
  }

  // WiFi format: WIFI:T:WPA;S:mynetwork;P:mypassword;H:false;;
  const parts = [
    `T:${security}`,
    `S:${escapeSpecialChars(ssid)}`,
  ];

  if (password && security !== 'nopass') {
    parts.push(`P:${escapeSpecialChars(password)}`);
  }

  if (hidden) {
    parts.push('H:true');
  }

  return `WIFI:${parts.join(';')};;`;
}

/**
 * Formats contact information into vCard format
 * @param {Object} data - Contact information
 * @param {string} data.name - Full name
 * @param {string} data.phone - Phone number
 * @param {string} data.email - Email address
 * @param {string} data.organization - Company/organization
 * @param {string} data.url - Website URL
 * @returns {string} Formatted vCard string
 */
export function formatVCard(data) {
  const { name, phone, email, organization, url } = data;

  if (!name && !phone && !email) {
    throw new Error('At least one field (name, phone, or email) is required for vCard');
  }

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
  ];

  if (name) {
    lines.push(`FN:${name}`);
  }

  if (phone) {
    lines.push(`TEL:${phone}`);
  }

  if (email) {
    lines.push(`EMAIL:${email}`);
  }

  if (organization) {
    lines.push(`ORG:${organization}`);
  }

  if (url) {
    lines.push(`URL:${url}`);
  }

  lines.push('END:VCARD');

  return lines.join('\n');
}

/**
 * Formats email data into mailto: URL
 * @param {Object} data - Email configuration
 * @param {string} data.to - Recipient email address
 * @param {string} data.subject - Email subject
 * @param {string} data.body - Email body
 * @returns {string} Formatted mailto URL
 */
export function formatEmail(data) {
  const { to, subject, body } = data;

  if (!to) {
    throw new Error('Recipient email address is required');
  }

  const params = [];

  if (subject) {
    params.push(`subject=${encodeURIComponent(subject)}`);
  }

  if (body) {
    params.push(`body=${encodeURIComponent(body)}`);
  }

  const queryString = params.length > 0 ? '?' + params.join('&') : '';
  return `mailto:${to}${queryString}`;
}

/**
 * Formats SMS data into sms: URL
 * @param {Object} data - SMS configuration
 * @param {string} data.phone - Phone number
 * @param {string} data.message - SMS message body
 * @returns {string} Formatted SMS URL
 */
export function formatSMS(data) {
  const { phone, message } = data;

  if (!phone) {
    throw new Error('Phone number is required for SMS');
  }

  // SMS format varies by platform, using standard format
  if (message) {
    return `sms:${phone}?body=${encodeURIComponent(message)}`;
  }

  return `sms:${phone}`;
}

/**
 * Formats phone number into tel: URL
 * @param {string} phone - Phone number
 * @returns {string} Formatted tel URL
 */
export function formatPhone(phone) {
  if (!phone) {
    throw new Error('Phone number is required');
  }

  return `tel:${phone}`;
}

/**
 * Validates and formats plain text/URL
 * @param {string} text - Plain text or URL
 * @returns {string} Formatted text
 */
export function formatPlainText(text) {
  if (!text || text.trim() === '') {
    throw new Error('Text cannot be empty');
  }

  return text.trim();
}

/**
 * Escapes special characters for WiFi MECARD format
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeSpecialChars(str) {
  // Escape special characters: \ " ; , :
  return str.replace(/([\\";,:])/g, '\\$1');
}

/**
 * Gets the formatter function for a given QR code type
 * @param {string} type - QR code type
 * @returns {Function} Formatter function
 */
export function getFormatter(type) {
  const formatters = {
    text: formatPlainText,
    wifi: formatWiFi,
    vcard: formatVCard,
    email: formatEmail,
    sms: formatSMS,
    phone: formatPhone,
  };

  return formatters[type] || formatPlainText;
}
