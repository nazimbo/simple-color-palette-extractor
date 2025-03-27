/**
 * Application entry point
 */

import { ColorPaletteApp } from './app.js';

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new ColorPaletteApp();
  app.init();
  
  // Optional: Store the app instance in window for debugging
  window.colorPaletteApp = app;
});