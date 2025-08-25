/**
 * Application entry point
 */

import { ColorPaletteApp } from './app.js';

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new ColorPaletteApp();
  app.init();
  
  // Optional: Store the app instance in window for debugging
  // Only expose in development (when hostname is localhost or file://)
  if (window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' || 
      window.location.protocol === 'file:') {
    window.colorPaletteApp = app;
  }
});