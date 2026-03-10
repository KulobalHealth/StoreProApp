const fs = require('fs');
const path = require('path');

// Simple approach: Create SVG icons and convert using system tools
// Or create a simple script that generates the icons

const iconDir = path.join(__dirname, 'src-tauri', 'icons');
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

// Create SVG template
function createSVG(size) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Yellow background -->
  <rect width="${size}" height="${size}" fill="#FFD700"/>
  
  <!-- Text: awosel -->
  <text x="${size/2}" y="${size*0.4}" font-family="Arial, sans-serif" font-size="${size*0.25}" font-weight="bold" text-anchor="middle" fill="#000000">awosel</text>
  
  <!-- Curved arrow/smile line -->
  <path d="M ${size*0.15} ${size*0.65} Q ${size*0.12} ${size*0.6} ${size*0.15} ${size*0.57} Q ${size*0.5} ${size*0.7} ${size*0.85} ${size*0.65} Q ${size*0.88} ${size*0.6} ${size*0.85} ${size*0.57}" 
        stroke="#000000" 
        stroke-width="${size*0.08}" 
        fill="none" 
        stroke-linecap="round" 
        stroke-linejoin="round"/>
</svg>`;
}

// Generate SVG files
const sizes = [32, 128, 256];
sizes.forEach(size => {
  const svg = createSVG(size);
  if (size === 256) {
    fs.writeFileSync(path.join(iconDir, '128x128@2x.png.svg'), svg);
  } else {
    fs.writeFileSync(path.join(iconDir, `${size}x${size}.png.svg`), svg);
  }
});

console.log('SVG files created. Converting to PNG using sips...');

// Use sips to convert SVG to PNG (macOS)
const { execSync } = require('child_process');
try {
  sizes.forEach(size => {
    const svgFile = size === 256 
      ? path.join(iconDir, '128x128@2x.png.svg')
      : path.join(iconDir, `${size}x${size}.png.svg`);
    const pngFile = size === 256
      ? path.join(iconDir, '128x128@2x.png')
      : path.join(iconDir, `${size}x${size}.png`);
    
    // sips doesn't support SVG directly, so we need another approach
    // Let's use a different method
  });
  console.log('Note: sips cannot convert SVG directly. Please use the HTML generator or install ImageMagick.');
} catch (error) {
  console.log('Conversion failed. Please use the HTML generator (generate-icons.html) in your browser.');
}

