/**
 * Application constants and configuration values
 */

// Error messages
export const ERROR_MESSAGES = {
    FILE_TYPE: "Please upload an image file (JPG, PNG, or GIF)",
    FILE_SIZE: "Please upload an image smaller than 5MB",
    FILE_LOAD: "Failed to load image. Please try another one.",
    COLOR_EXTRACT: "Failed to extract colors. Please try another image.",
    CLIPBOARD: "Failed to copy color code. Please try again.",
    GENERAL: "An error occurred. Please try again.",
  };
  
  // Constants
  export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  export const MAX_IMAGE_WIDTH = 800;
  export const DEBOUNCE_DELAY = 300;