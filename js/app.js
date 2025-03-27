/**
 * Main application class
 */

import { DEBOUNCE_DELAY, ERROR_MESSAGES } from './constants.js';
import { handleImageUpload } from './fileHandler.js';
import { extractColorsFromImage } from './colorExtractor.js';
import { displayColorPalette, updateRangeInputDisplay, showNotification, setLoading } from './ui.js';
import { setupDragAndDrop } from './dragDrop.js';
import { debounce } from './utils.js';

export class ColorPaletteApp {
  constructor() {
    // DOM elements
    this.imageUpload = document.getElementById("imageUpload");
    this.imagePreview = document.getElementById("imagePreview");
    this.placeholderImage = document.getElementById("placeholderImage");
    this.colorCount = document.getElementById("colorCount");
    this.colorCountValue = document.getElementById("colorCountValue");
    this.colorPalette = document.getElementById("colorPalette");
    this.dropZone = document.getElementById("dropZone");
    
    // Color thief instance
    this.colorThief = new ColorThief();

    // Bind methods
    this.extractColors = this.extractColors.bind(this);
    this.handleImageUploadEvent = this.handleImageUploadEvent.bind(this);
    this.handleColorCountChange = this.handleColorCountChange.bind(this);
    
    // Setup debounced color count change handler
    this.debouncedColorCountChange = debounce(this.handleColorCountChange, DEBOUNCE_DELAY);
  }

  /**
   * Initialize the application
   */
  init() {
    // Setup event listeners
    this.imageUpload.addEventListener("change", this.handleImageUploadEvent);
    this.colorCount.addEventListener("input", this.debouncedColorCountChange);
    
    this.imagePreview.addEventListener("error", () => {
      showNotification(ERROR_MESSAGES.FILE_LOAD);
    });

    // Setup drag and drop
    this.dragDropCleanup = setupDragAndDrop(this.dropZone, this.imageUpload);

    // Initial UI update
    updateRangeInputDisplay(this.colorCount, this.colorCountValue);

    console.log("Color Palette Extractor initialized");
  }

  /**
   * Clean up the application (remove event listeners)
   */
  destroy() {
    // Remove event listeners
    this.imageUpload.removeEventListener("change", this.handleImageUploadEvent);
    this.colorCount.removeEventListener("input", this.debouncedColorCountChange);
    
    // Clean up drag and drop
    if (this.dragDropCleanup) {
      this.dragDropCleanup();
    }

    console.log("Color Palette Extractor destroyed");
  }

  /**
   * Handle image upload events
   * @param {Event} e - Change event
   */
  handleImageUploadEvent(e) {
    handleImageUpload(e, this.imagePreview, this.placeholderImage, this.extractColors);
  }

  /**
   * Handle color count change events
   */
  handleColorCountChange() {
    updateRangeInputDisplay(this.colorCount, this.colorCountValue);
    
    if (this.imagePreview.complete && this.imagePreview.naturalHeight !== 0) {
      this.extractColors();
    }
  }

  /**
   * Extract colors from the current image
   */
  extractColors() {
    try {
      setLoading(this.colorPalette, true);

      // Use setTimeout to ensure the loading state is visible
      setTimeout(() => {
        try {
          const palette = extractColorsFromImage(
            this.imagePreview, 
            this.colorCount.value,
            this.colorThief
          );
          
          if (palette.length > 0) {
            displayColorPalette(palette, this.colorPalette);
          }
        } catch (error) {
          console.error("Error in extractColors:", error);
        } finally {
          setLoading(this.colorPalette, false);
        }
      }, 0);
    } catch (error) {
      console.error("Error preparing for color extraction:", error);
    }
  }
}