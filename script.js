// DOM elements
const imageUpload = document.getElementById("imageUpload");
const imagePreview = document.getElementById("imagePreview");
const placeholderImage = document.getElementById("placeholderImage");
const colorCount = document.getElementById("colorCount");
const colorCountValue = document.getElementById("colorCountValue");
const colorPalette = document.getElementById("colorPalette");
const notification = document.getElementById("notification");
const dropZone = document.getElementById("dropZone");
const colorThief = new ColorThief();

// Error messages
const ERROR_MESSAGES = {
  FILE_TYPE: 'Please upload an image file (JPG, PNG, or GIF)',
  FILE_SIZE: 'Please upload an image smaller than 5MB',
  FILE_LOAD: 'Failed to load image. Please try another one.',
  COLOR_EXTRACT: 'Failed to extract colors. Please try another image.',
  CLIPBOARD: 'Failed to copy color code. Please try again.',
  GENERAL: 'An error occurred. Please try again.'
};

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGE_WIDTH = 800;
const DEBOUNCE_DELAY = 300;

// Handles the image upload
const handleImageUpload = async (e) => {
  try {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.match(/^image\/(jpeg|png|gif)$/)) {
      showNotification(ERROR_MESSAGES.FILE_TYPE);
      return;
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      showNotification(ERROR_MESSAGES.FILE_SIZE);
      return;
    }

    const imageUrl = await readFileAsDataUrl(file);
    await loadAndProcessImage(imageUrl);
  } catch (error) {
    console.error('Error in handleImageUpload:', error);
    showNotification(ERROR_MESSAGES.GENERAL);
  }
};

// Read file as data URL
const readFileAsDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

// Load and process image
const loadAndProcessImage = (imageUrl) => {
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
        imagePreview.setAttribute('aria-label', `Preview of uploaded image, ${canvas.width}x${canvas.height} pixels`);
        
        // Extract colors when image loads
        imagePreview.onload = () => {
          extractColors();
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

// Debounce function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Updates the displayed color count and extracts colors
const updateColorCount = debounce(() => {
  const value = colorCount.value;
  colorCountValue.textContent = value;
  colorCount.setAttribute('aria-valuenow', value);
  
  if (imagePreview.complete && imagePreview.naturalHeight !== 0) {
    extractColors();
  }
}, DEBOUNCE_DELAY);

// Extracts colors from the image using Color Thief
const extractColors = async () => {
  try {
    colorPalette.classList.add('loading');
    colorPalette.setAttribute('aria-busy', 'true');
    
    // Use setTimeout to ensure the loading state is visible
    setTimeout(() => {
      try {
        const palette = colorThief.getPalette(imagePreview, parseInt(colorCount.value));
        displayColorPalette(palette);
      } catch (error) {
        console.error('Error extracting colors:', error);
        showNotification(ERROR_MESSAGES.COLOR_EXTRACT);
      } finally {
        colorPalette.classList.remove('loading');
        colorPalette.setAttribute('aria-busy', 'false');
      }
    }, 0);
  } catch (error) {
    console.error('Error in extractColors:', error);
    showNotification(ERROR_MESSAGES.GENERAL);
  }
};

// Displays the extracted colors as a palette
const displayColorPalette = (palette) => {
  try {
    colorPalette.innerHTML = "";
    
    palette.forEach((color, index) => {
      const [r, g, b] = color;
      const hex = rgbToHex(r, g, b);
      const colorBox = document.createElement("div");
      
      colorBox.className = "color-box";
      colorBox.style.backgroundColor = `rgb(${r},${g},${b})`;
      colorBox.setAttribute('role', 'button');
      colorBox.setAttribute('aria-label', `Color ${hex}. Click to copy`);
      colorBox.setAttribute('tabindex', '0');
      
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
    console.error('Error in displayColorPalette:', error);
    showNotification(ERROR_MESSAGES.GENERAL);
  }
};

// Converts RGB color to HEX
const rgbToHex = (r, g, b) => 
  "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");

// Copies the color code to clipboard
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    showNotification(`Copied ${text} to clipboard!`);
  } catch (err) {
    console.error('Failed to copy:', err);
    showNotification(ERROR_MESSAGES.CLIPBOARD);
  }
};

// Shows a notification
const showNotification = (message) => {
  notification.textContent = message;
  notification.classList.add("show");
  
  // Set appropriate ARIA role based on message type
  notification.setAttribute('role', 
    message.startsWith('Error') || message.startsWith('Failed') 
      ? 'alert' 
      : 'status'
  );
  
  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
};

// Drag and drop handlers
const handleDrag = (e) => {
  e.preventDefault();
  e.stopPropagation();
};

const handleDragOver = (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.add('drag-over');
  dropZone.setAttribute('aria-label', 'Release to upload image');
};

const handleDragLeave = (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove('drag-over');
  dropZone.setAttribute('aria-label', 'Image upload area');
};

const handleDrop = async (e) => {
  e.preventDefault();
  e.stopPropagation();
  
  dropZone.classList.remove('drag-over');
  dropZone.setAttribute('aria-label', 'Image upload area');

  try {
    const file = e.dataTransfer.files[0];
    
    if (!file || !file.type.startsWith('image/')) {
      showNotification(ERROR_MESSAGES.FILE_TYPE);
      return;
    }
    
    // Create a new FileList object
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    
    // Update the file input
    imageUpload.files = dataTransfer.files;
    
    // Trigger the change event
    const event = new Event('change');
    imageUpload.dispatchEvent(event);
  } catch (error) {
    console.error('Error in handleDrop:', error);
    showNotification(ERROR_MESSAGES.GENERAL);
  }
};

// Event listeners
imageUpload.addEventListener("change", handleImageUpload);
colorCount.addEventListener("input", updateColorCount);
imagePreview.addEventListener("error", () => {
  showNotification(ERROR_MESSAGES.FILE_LOAD);
});

// Drag and drop event listeners
dropZone.addEventListener('dragenter', handleDrag);
dropZone.addEventListener('dragover', handleDragOver);
dropZone.addEventListener('dragleave', handleDragLeave);
dropZone.addEventListener('drop', handleDrop);