/**
 * Utility functions
 */

/**
 * Converts RGB color to HEX
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {string} - Hex color code
 */
export const rgbToHex = (r, g, b) => "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");

/**
 * Debounce function to limit how often a function runs
 * @param {Function} func - Function to debounce
 * @param {number} wait - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Read file as data URL
 * @param {File} file - File to read
 * @returns {Promise<string>} - Data URL of the file
 */
export const readFileAsDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};