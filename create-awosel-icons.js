// Simple script to create awosel icons using Node.js
// This creates SVG files that can be converted to PNG

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconDir = path.join(__dirname, 'src-tauri', 'icons');
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

function createSVG(size) {
  const fontSize = Math.round(size * 0.25);
  const textY = Math.round(size * 0.4);
  const curveY = Math.round(size * 0.65);
  const padding = Math.round(size * 0.15);
  const lineWidth = Math.max(2, Math.round(size * 0.08));
  
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#FFD700"/>
  <text x="${size/2}" y="${textY}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" text-anchor="middle" fill="#000000">awosel</text>
  <path d="M ${padding} ${curveY} Q ${padding - size*0.05} ${curveY - size*0.05} ${padding} ${curveY - size*0.08} Q ${size/2} ${curveY + size*0.15} ${size - padding} ${curveY} Q ${size - padding + size*0.05} ${curveY - size*0.05} ${size - padding} ${curveY - size*0.08}" 
        stroke="#000000" 
        stroke-width="${lineWidth}" 
        fill="none" 
        stroke-linecap="round" 
        stroke-linejoin="round"/>
</svg>`;
}

// Create temporary SVG files
const sizes = [32, 128, 256];
const tempFiles = [];

sizes.forEach(size => {
  const svg = createSVG(size);
  const tempFile = `/tmp/awosel-${size}.svg`;
  fs.writeFileSync(tempFile, svg);
  tempFiles.push(tempFile);
  
  const outputFile = size === 256
    ? path.join(iconDir, '128x128@2x.png')
    : path.join(iconDir, `${size}x${size}.png`);
  
  // Try to convert using sips (macOS) - but sips doesn't support SVG
  // So we'll use a workaround with qlmanage or create instructions
  console.log(`Created SVG for ${size}x${size}`);
});

console.log('\n✅ SVG files created in /tmp/');
console.log('\nTo convert to PNG, you can:');
console.log('1. Use the HTML generator (generate-icons.html) - RECOMMENDED');
console.log('2. Install ImageMagick: brew install imagemagick');
console.log('3. Then run: convert /tmp/awosel-*.svg src-tauri/icons/*.png');
console.log('\nOr open generate-icons.html in your browser to download PNG files directly!');

