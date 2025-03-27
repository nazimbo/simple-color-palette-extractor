/**
 * UI-related functionality
 */

import { rgbToHex, rgbToFormat } from './utils.js';
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
 * @param {string} format - Color format to display ('hex', 'rgb', 'hsl')
 */
export const displayColorPalette = (palette, colorPalette, format = 'hex') => {
  try {
    colorPalette.innerHTML = "";

    palette.forEach((color) => {
      const [r, g, b] = color;
      const backgroundStyle = `rgb(${r},${g},${b})`;
      const colorString = rgbToFormat(color, format);
      
      const colorBox = document.createElement("div");
      colorBox.className = "color-box";
      colorBox.style.backgroundColor = backgroundStyle;
      colorBox.setAttribute("role", "button");
      colorBox.setAttribute("aria-label", `Color ${colorString}. Click to copy`);
      colorBox.setAttribute("tabindex", "0");
      colorBox.dataset.rgb = JSON.stringify(color); // Store original RGB values

      const colorSpan = document.createElement("span");
      colorSpan.className = "color-hex"; // Keep the class name for consistency
      colorSpan.textContent = colorString;

      colorBox.appendChild(colorSpan);

      // Add keyboard support
      colorBox.addEventListener("click", () => copyToClipboard(colorString));
      colorBox.addEventListener("keypress", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          copyToClipboard(colorString);
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
 * Updates color format for existing palette
 * @param {HTMLElement} colorPalette - Element containing the color palette
 * @param {string} format - Color format to update to ('hex', 'rgb', 'hsl')
 */
export const updateColorFormat = (colorPalette, format) => {
  try {
    const colorBoxes = colorPalette.querySelectorAll('.color-box');
    
    colorBoxes.forEach(box => {
      if (box.dataset.rgb) {
        const rgb = JSON.parse(box.dataset.rgb);
        const colorString = rgbToFormat(rgb, format);
        
        // Update the displayed color code
        const colorSpan = box.querySelector('.color-hex');
        if (colorSpan) {
          colorSpan.textContent = colorString;
        }
        
        // Update aria-label
        box.setAttribute("aria-label", `Color ${colorString}. Click to copy`);
        
        // Update click handler
        const newClickHandler = () => copyToClipboard(colorString);
        
        // Remove old handlers and add new one
        const newBox = box.cloneNode(true);
        newBox.addEventListener("click", newClickHandler);
        newBox.addEventListener("keypress", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            newClickHandler();
          }
        });
        
        box.parentNode.replaceChild(newBox, box);
      }
    });
  } catch (error) {
    console.error("Error in updateColorFormat:", error);
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