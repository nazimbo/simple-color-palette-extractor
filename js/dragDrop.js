/**
 * Drag and drop functionality
 */

import { ERROR_MESSAGES } from './constants.js';
import { showNotification } from './ui.js';

/**
 * Setup drag and drop functionality
 * @param {HTMLElement} dropZone - Drop zone element
 * @param {HTMLInputElement} fileInput - File input element
 */
export const setupDragAndDrop = (dropZone, fileInput) => {
  // Drag handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add("drag-over");
    dropZone.setAttribute("aria-label", "Release to upload image");
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove("drag-over");
    dropZone.setAttribute("aria-label", "Image upload area");
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    dropZone.classList.remove("drag-over");
    dropZone.setAttribute("aria-label", "Image upload area");

    try {
      const file = e.dataTransfer.files[0];

      if (!file || !file.type.startsWith("image/")) {
        showNotification(ERROR_MESSAGES.FILE_TYPE);
        return;
      }

      // Create a new FileList object
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      // Update the file input
      fileInput.files = dataTransfer.files;

      // Trigger the change event
      const event = new Event("change");
      fileInput.dispatchEvent(event);
    } catch (error) {
      console.error("Error in handleDrop:", error);
      showNotification(ERROR_MESSAGES.GENERAL);
    }
  };

  // Add event listeners
  dropZone.addEventListener("dragenter", handleDrag);
  dropZone.addEventListener("dragover", handleDragOver);
  dropZone.addEventListener("dragleave", handleDragLeave);
  dropZone.addEventListener("drop", handleDrop);

  // Return a cleanup function
  return () => {
    dropZone.removeEventListener("dragenter", handleDrag);
    dropZone.removeEventListener("dragover", handleDragOver);
    dropZone.removeEventListener("dragleave", handleDragLeave);
    dropZone.removeEventListener("drop", handleDrop);
  };
};