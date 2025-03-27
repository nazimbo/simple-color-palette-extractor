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
 * Formats RGB color as a string
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {string} - RGB color string
 */
export const rgbToRgbString = (r, g, b) => `rgb(${r}, ${g}, ${b})`;

/**
 * Converts RGB color to HSL
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {string} - HSL color string
 */
export const rgbToHsl = (r, g, b) => {
  // Convert RGB to [0, 1] range
  r /= 255;
  g /= 255;
  b /= 255;

  // Find min and max values
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  
  let h, s, l = (max + min) / 2;

  if (max === min) {
    // Achromatic (gray)
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    // Calculate hue
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  // Convert to degrees and percentages
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `hsl(${h}, ${s}%, ${l}%)`;
};

/**
 * Convert RGB array to color string in specified format
 * @param {Array} rgb - RGB color array [r, g, b]
 * @param {string} format - Color format ('hex', 'rgb', or 'hsl')
 * @returns {string} - Formatted color string
 */
export const rgbToFormat = (rgb, format) => {
  const [r, g, b] = rgb;
  
  switch (format) {
    case 'hex': return rgbToHex(r, g, b);
    case 'rgb': return rgbToRgbString(r, g, b);
    case 'hsl': return rgbToHsl(r, g, b);
    default: return rgbToHex(r, g, b); // Default to HEX
  }
};

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