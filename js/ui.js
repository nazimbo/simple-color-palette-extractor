/**
 * UI-related functionality
 */

import { rgbToHex } from './utils.js';
import { ERROR_MESSAGES } from './constants.js';

/**
 * Shows a notification
 * @param {string} message - Message to show
 */
export const showNotification = (message) => {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.classList.add("show");

  // Set appropriate ARIA role based on message type
  notification.setAttribute("role", 
    message.startsWith("Error") || message.startsWith("Failed") ? "alert" : "status"
  );

  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
};

/**
 * Copies the color code to clipboard
 * @param {string} text - Text to copy
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    showNotification(`Copied ${text} to clipboard!`);
  } catch (err) {
    console.error("Failed to copy:", err);
    showNotification(ERROR_MESSAGES.CLIPBOARD);
  }
};

/**
 * Displays the extracted colors as a palette
 * @param {Array} palette - Array of RGB colors
 * @param {HTMLElement} colorPalette - Element to display colors in
 */
export const displayColorPalette = (palette, colorPalette) => {
  try {
    colorPalette.innerHTML = "";

    palette.forEach((color) => {
      const [r, g, b] = color;
      const hex = rgbToHex(r, g, b);
      const colorBox = document.createElement("div");

      colorBox.className = "color-box";
      colorBox.style.backgroundColor = `rgb(${r},${g},${b})`;
      colorBox.setAttribute("role", "button");
      colorBox.setAttribute("aria-label", `Color ${hex}. Click to copy`);
      colorBox.setAttribute("tabindex", "0");

      const hexSpan = document.createElement("span");
      hexSpan.className = "color-hex";
      hexSpan.textContent = hex;

      colorBox.appendChild(hexSpan);

      // Add keyboard support
      colorBox.addEventListener("click", () => copyToClipboard(hex));
      colorBox.addEventListener("keypress", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          copyToClipboard(hex);
        }
      });

      colorPalette.appendChild(colorBox);
    });
  } catch (error) {
    console.error("Error in displayColorPalette:", error);
    showNotification(ERROR_MESSAGES.GENERAL);
  }
};

/**
 * Updates the color count display
 * @param {HTMLInputElement} rangeInput - Range input element
 * @param {HTMLElement} displayElement - Element to display the value
 */
export const updateRangeInputDisplay = (rangeInput, displayElement) => {
  const value = rangeInput.value;
  displayElement.textContent = value;
  rangeInput.setAttribute("aria-valuenow", value);
};

/**
 * Sets the loading state for the color palette
 * @param {HTMLElement} element - Element to set loading state for
 * @param {boolean} isLoading - Whether element is loading
 */
export const setLoading = (element, isLoading) => {
  if (isLoading) {
    element.classList.add("loading");
    element.setAttribute("aria-busy", "true");
  } else {
    element.classList.remove("loading");
    element.setAttribute("aria-busy", "false");
  }
};