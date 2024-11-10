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

// Handles the image upload
const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  // Add file type validation
  if (!file.type.startsWith('image/')) {
    showNotification('Please upload an image file');
    return;
  }
  
  // Add file size check
  if (file.size > 5 * 1024 * 1024) {
    showNotification('Please upload an image smaller than 5MB');
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const MAX_WIDTH = 800;
      const scaleFactor = MAX_WIDTH / img.width;
      canvas.width = MAX_WIDTH;
      canvas.height = img.height * scaleFactor;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      imagePreview.src = canvas.toDataURL("image/jpeg");
      imagePreview.style.display = "block";
      placeholderImage.style.display = "none";
      imagePreview.onload = extractColors;
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
};

// Updates the displayed color count and extracts colors
const updateColorCount = () => {
  colorCountValue.textContent = colorCount.value;
  if (imagePreview.complete && imagePreview.naturalHeight !== 0) {
    extractColors();
  }
};

// Extracts colors from the image using Color Thief
const extractColors = () => {
  const palette = colorThief.getPalette(imagePreview, parseInt(colorCount.value));
  displayColorPalette(palette);
};

// Displays the extracted colors as a palette
const displayColorPalette = (palette) => {
  colorPalette.innerHTML = "";
  palette.forEach((color) => {
    const [r, g, b] = color;
    const hex = rgbToHex(r, g, b);
    const colorBox = document.createElement("div");
    colorBox.className = "color-box";
    colorBox.style.backgroundColor = `rgb(${r},${g},${b})`;
    colorBox.innerHTML = `<span class="color-hex">${hex}</span>`;
    colorBox.addEventListener("click", () => copyToClipboard(hex));
    colorPalette.appendChild(colorBox);
  });
};

// Converts RGB color to HEX
const rgbToHex = (r, g, b) => 
  "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");

// Copies the color code to clipboard
const copyToClipboard = (text) => {
  navigator.clipboard
    .writeText(text)
    .then(() => showNotification(`Copied ${text} to clipboard!`))
    .catch((err) => console.error("Failed to copy: ", err));
};

// Shows a notification
const showNotification = (message) => {
  notification.textContent = message;
  notification.classList.add("show");
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
};

const handleDragLeave = (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove('drag-over');
};

const handleDrop = (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove('drag-over');

  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    // Create a new FileList object
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    
    // Update the file input
    imageUpload.files = dataTransfer.files;
    
    // Trigger the change event
    const event = new Event('change');
    imageUpload.dispatchEvent(event);
  } else {
    showNotification('Please drop an image file');
  }
};

// Event listeners
imageUpload.addEventListener("change", handleImageUpload);
colorCount.addEventListener("input", updateColorCount);
imagePreview.addEventListener("load", extractColors);

// Drag and drop event listeners
dropZone.addEventListener('dragenter', handleDrag);
dropZone.addEventListener('dragover', handleDragOver);
dropZone.addEventListener('dragleave', handleDragLeave);
dropZone.addEventListener('drop', handleDrop);