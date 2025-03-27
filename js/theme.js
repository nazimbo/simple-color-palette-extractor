/**
 * Theme switching functionality
 */

/**
 * Initialize theme switcher
 */
export const initThemeSwitcher = () => {
    const themeToggle = document.getElementById('themeToggle');
    
    // Check for saved theme preference or respect OS setting
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const storedTheme = localStorage.getItem('theme');
    
    // Set initial theme based on stored preference or OS setting
    if (storedTheme === 'dark' || (!storedTheme && prefersDarkScheme.matches)) {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggle.checked = true;
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      themeToggle.checked = false;
    }
    
    // Toggle theme when switch is clicked
    themeToggle.addEventListener('change', function() {
      if (this.checked) {
        // Dark mode
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
      } else {
        // Light mode
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
      }
    });
    
    // Listen for OS theme changes
    prefersDarkScheme.addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        // Only auto-switch if user hasn't manually set a preference
        if (e.matches) {
          document.documentElement.setAttribute('data-theme', 'dark');
          themeToggle.checked = true;
        } else {
          document.documentElement.setAttribute('data-theme', 'light');
          themeToggle.checked = false;
        }
      }
    });
  };