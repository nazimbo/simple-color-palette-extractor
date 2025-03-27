/**
 * Color extraction functionality
 */

import { ERROR_MESSAGES } from './constants.js';
import { showNotification } from './ui.js';

/**
 * Extracts colors from an image
 * @param {HTMLImageElement} imageElement - Image to extract colors from
 * @param {number} colorCount - Number of colors to extract
 * @param {Object} colorThief - Color Thief instance
 * @returns {Array} - Array of RGB colors
 */
export const extractColorsFromImage = (imageElement, colorCount, colorThief) => {
  try {
    return colorThief.getPalette(imageElement, parseInt(colorCount));
  } catch (error) {
    console.error("Error extracting colors:", error);
    showNotification(ERROR_MESSAGES.COLOR_EXTRACT);
    return [];
  }
};