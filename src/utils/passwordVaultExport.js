/**
 * Password Vault Export Utilities
 * Handles formatting password data for CSV and JSON export
 */

/**
 * Export entries to CSV format
 * Compatible with common password manager import formats
 *
 * @param {Array} entries - Array of password entries
 * @returns {string} CSV formatted string
 */
export function exportToCSV(entries) {
  if (!entries || entries.length === 0) {
    return 'name,username,email,url,password,totp,note,created_at,updated_at\n';
  }

  const headers = ['name', 'username', 'email', 'url', 'password', 'totp', 'note', 'created_at', 'updated_at'];
  const rows = [headers.join(',')];

  entries.forEach(entry => {
    const row = headers.map(header => {
      const key = header === 'created_at' ? 'createdAt' :
                  header === 'updated_at' ? 'updatedAt' : header;
      const value = entry[key] || '';
      return escapeCSVField(value);
    });
    rows.push(row.join(','));
  });

  return rows.join('\n');
}

/**
 * Escape a CSV field value
 * Wraps in quotes if contains comma, quote, or newline
 *
 * @param {string} value - Field value
 * @returns {string} Escaped field
 */
function escapeCSVField(value) {
  if (value === null || value === undefined) {
    return '';
  }

  const str = String(value);

  // Check if escaping is needed
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    // Escape quotes by doubling them
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  return str;
}

/**
 * Export entries to JSON format
 *
 * @param {Array} entries - Array of password entries
 * @param {boolean} pretty - Whether to format with indentation
 * @returns {string} JSON formatted string
 */
export function exportToJSON(entries, pretty = true) {
  if (!entries) {
    entries = [];
  }

  // Export in a clean format (without internal IDs)
  const exportData = entries.map(entry => ({
    name: entry.name || '',
    username: entry.username || '',
    email: entry.email || '',
    url: entry.url || '',
    password: entry.password || '',
    totp: entry.totp || '',
    note: entry.note || '',
    created_at: entry.createdAt || '',
    updated_at: entry.updatedAt || ''
  }));

  return pretty
    ? JSON.stringify(exportData, null, 2)
    : JSON.stringify(exportData);
}

/**
 * Generate a timestamped export filename
 *
 * @param {string} format - 'csv' or 'json'
 * @returns {string} Filename like 'slurm-passwords-2024-01-15.csv'
 */
export function getExportFilename(format) {
  const date = new Date().toISOString().split('T')[0];
  const extension = format === 'json' ? 'json' : 'csv';
  return `slurm-passwords-${date}.${extension}`;
}
