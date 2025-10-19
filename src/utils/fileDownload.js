/**
 * File Download Utility
 * Triggers browser download of binary data
 */

/**
 * Downloads file to user's computer
 * @param {Blob|Uint8Array} data - File data to download
 * @param {string} name - Filename for download
 */
export function downloadFile(data, name) {
    const blob = new Blob([data], { type: "application/octet-stream" });
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style.display = "none";
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = name;
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
}
