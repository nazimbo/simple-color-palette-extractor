/**
 * Main application class
 */

import { DEBOUNCE_DELAY, ERROR_MESSAGES } from './constants.js';
import { handleImageUpload } from './fileHandler.js';
import { extractColorsFromImage } from './colorExtractor.js';
import { displayColorPalette, updateRangeInputDisplay, showNotification, setLoading, updateColorFormat } from './ui.js';
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
    this.formatInputs = document.querySelectorAll('input[name="colorFormat"]');
    
    // Color thief instance
    this.colorThief = new ColorThief();
    
    // Current color format
    this.currentFormat = 'hex'; // Default format

    // Bind methods
    this.extractColors = this.extractColors.bind(this);
    this.handleImageUploadEvent = this.handleImageUploadEvent.bind(this);
    this.handleColorCountChange = this.handleColorCountChange.bind(this);
    this.handleFormatChange = this.handleFormatChange.bind(this);
    
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
    
    // Setup format change listeners
    this.formatInputs.forEach(input => {
      input.addEventListener("change", this.handleFormatChange);
    });
    
    this.imagePreview.addEventListener("error", () => {
      showNotification(ERROR_MESSAGES.FILE_LOAD);
    });

    // Setup drag and drop
    this.dragDropCleanup = setupDragAndDrop(this.dropZone, this.imageUpload);

    // Initial UI update
    updateRangeInputDisplay(this.colorCount, this.colorCountValue);
  }

  /**
   * Clean up the application (remove event listeners)
   */
  destroy() {
    // Remove event listeners
    this.imageUpload.removeEventListener("change", this.handleImageUploadEvent);
    this.colorCount.removeEventListener("input", this.debouncedColorCountChange);
    
    // Remove format change listeners
    this.formatInputs.forEach(input => {
      input.removeEventListener("change", this.handleFormatChange);
    });
    
    // Clean up drag and drop
    if (this.dragDropCleanup) {
      this.dragDropCleanup();
    }
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
  async handleColorCountChange() {
    updateRangeInputDisplay(this.colorCount, this.colorCountValue);
    
    if (this.imagePreview.complete && this.imagePreview.naturalHeight !== 0) {
      await this.extractColors();
    }
  }
  
  /**
   * Handle color format change events
   * @param {Event} e - Change event
   */
  handleFormatChange(e) {
    const newFormat = e.target.value;
    
    if (newFormat !== this.currentFormat) {
      this.currentFormat = newFormat;
      
      // If we have colors already extracted, update their format
      if (this.colorPalette.children.length > 0) {
        updateColorFormat(this.colorPalette, this.currentFormat);
      }
    }
  }

  /**
   * Extract colors from the current image
   */
  async extractColors() {
    try {
      setLoading(this.colorPalette, true);

      // Use requestAnimationFrame to ensure the loading state is visible
      await new Promise(resolve => requestAnimationFrame(resolve));

      const palette = extractColorsFromImage(
        this.imagePreview, 
        this.colorCount.value,
        this.colorThief
      );
      
      if (palette.length > 0) {
        displayColorPalette(palette, this.colorPalette, this.currentFormat);
      }
    } catch (error) {
      // Error in extractColors - handled by UI notification
    } finally {
      setLoading(this.colorPalette, false);
    }
  }
}