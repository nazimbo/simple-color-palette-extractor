/**
 * File handling operations
 */

import { ERROR_MESSAGES, MAX_FILE_SIZE, MAX_IMAGE_WIDTH } from './constants.js';
import { readFileAsDataUrl } from './utils.js';
import { showNotification } from './ui.js';

/**
 * Validate an image file
 * @param {File} file - File to validate
 * @returns {boolean} - Whether the file is valid
 */
export const validateImageFile = (file) => {
  // Validate file type
  if (!file.type.match(/^image\/(jpeg|png|gif)$/)) {
    showNotification(ERROR_MESSAGES.FILE_TYPE);
    return false;
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    showNotification(ERROR_MESSAGES.FILE_SIZE);
    return false;
  }

  return true;
};

/**
 * Load and process image
 * @param {string} imageUrl - URL of the image to load
 * @param {HTMLImageElement} imagePreview - Image element to display preview
 * @param {HTMLElement} placeholderImage - Placeholder element to hide
 * @param {Function} onImageLoaded - Callback to run when image loads
 * @returns {Promise<void>}
 */
export const loadAndProcessImage = (imageUrl, imagePreview, placeholderImage, onImageLoaded) => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Calculate scaled dimensions
        const scaleFactor = Math.min(1, MAX_IMAGE_WIDTH / img.width);
        canvas.width = img.width * scaleFactor;
        canvas.height = img.height * scaleFactor;

        // Draw scaled image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Update preview
        imagePreview.src = canvas.toDataURL("image/jpeg");
        imagePreview.style.display = "block";
        placeholderImage.style.display = "none";

        // Set ARIA labels
        imagePreview.setAttribute(
          "aria-label", 
          `Preview of uploaded image, ${canvas.width}x${canvas.height} pixels`
        );

        // Extract colors when image loads
        imagePreview.onload = () => {
          if (onImageLoaded) onImageLoaded();
          resolve();
        };
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error(ERROR_MESSAGES.FILE_LOAD));
    };

    img.src = imageUrl;
  });
};

/**
 * Handle the image upload process
 * @param {Event} e - Change event
 * @param {HTMLImageElement} imagePreview - Image element to display preview
 * @param {HTMLElement} placeholderImage - Placeholder element to hide
 * @param {Function} onImageLoaded - Callback to run when image loads
 * @returns {Promise<void>}
 */
export const handleImageUpload = async (e, imagePreview, placeholderImage, onImageLoaded) => {
  try {
    const file = e.target.files[0];
    if (!file) return;

    if (!validateImageFile(file)) return;

    const imageUrl = await readFileAsDataUrl(file);
    await loadAndProcessImage(imageUrl, imagePreview, placeholderImage, onImageLoaded);
  } catch (error) {
    console.error("Error in handleImageUpload:", error);
    showNotification(ERROR_MESSAGES.GENERAL);
  }
};