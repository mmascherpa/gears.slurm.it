/**
 * CSV Parsing Utilities
 * Converts CSV text into Vuetify data table format
 */

/**
 * Capitalizes first letter of a word
 * @param {string} word - Word to capitalize
 * @returns {string} Capitalized word
 */
export function capitalize(word) {
    if (!word || typeof word !== 'string') return '';
    return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Converts CSV rows to Vuetify data table format
 * @param {Array<string>} headersArray - Array of column headers
 * @param {Array<Array<string>>} rowsArray - Array of data rows
 * @returns {Object} { headers: Array, data: Array }
 */
export function convertToTableData(headersArray, rowsArray) {
    // Create Vuetify-style headers
    const headers = headersArray.map(header => ({
        title: capitalize(header),
        key: header,
    }));

    // Map each row to an object using headersArray as keys
    const data = rowsArray.map(row => {
        const obj = {};
        headersArray.forEach((key, i) => {
            obj[key] = row[i];
        });
        return obj;
    });

    return { headers, data };
}

/**
 * Parses CSV text into table-ready data structures
 * @param {string|Uint8Array} input - Raw CSV text or binary data
 * @returns {Object} { headers: Array, data: Array }
 */
export function parseCSV(input) {
    // Convert Uint8Array to string if needed
    let text = input;
    if (input instanceof Uint8Array) {
        text = new TextDecoder().decode(input);
    }

    if (!text || typeof text !== 'string') {
        console.warn('Invalid CSV input');
        return { headers: [], data: [] };
    }

    // Normalize line endings
    const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const rows = normalizedText.split("\n")
        .filter(row => row.trim()) // Remove empty rows
        .map(row => row.split(","));

    if (rows.length === 0) {
        console.warn('Empty CSV file');
        return { headers: [], data: [] };
    }

    return convertToTableData(rows[0] || [], rows.slice(1));
}
