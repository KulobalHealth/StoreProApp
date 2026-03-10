#!/bin/bash

# Script to create awosel app icons for Tauri
# This script uses ImageMagick or sips (macOS built-in)

ICON_DIR="src-tauri/icons"
mkdir -p "$ICON_DIR"

# Create a temporary SVG of the awosel logo
SVG_TEMP="/tmp/awosel-logo.svg"

cat > "$SVG_TEMP" << 'EOF'
<svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
  <!-- Yellow background -->
  <rect width="256" height="256" fill="#FFD700"/>
  
  <!-- Text: awosel -->
  <text x="128" y="100" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="#000000">awosel</text>
  
  <!-- Curved arrow/smile line -->
  <path d="M 40 160 Q 30 150 40 145 Q 128 180 216 160 Q 226 150 216 145" 
        stroke="#000000" 
        stroke-width="20" 
        fill="none" 
        stroke-linecap="round" 
        stroke-linejoin="round"/>
</svg>
EOF

# Check for ImageMagick
if command -v convert &> /dev/null; then
    echo "Using ImageMagick..."
    
    # Generate PNG icons
    convert "$SVG_TEMP" -resize 32x32 "$ICON_DIR/32x32.png"
    convert "$SVG_TEMP" -resize 128x128 "$ICON_DIR/128x128.png"
    convert "$SVG_TEMP" -resize 256x256 "$ICON_DIR/128x128@2x.png"
    
    # Generate ICO for Windows
    convert "$SVG_TEMP" -resize 256x256 "$ICON_DIR/icon.ico"
    
    # Generate ICNS for Mac (requires iconutil or png2icns)
    if command -v iconutil &> /dev/null; then
        ICONSET_DIR="/tmp/awosel.iconset"
        rm -rf "$ICONSET_DIR"
        mkdir -p "$ICONSET_DIR"
        
        convert "$SVG_TEMP" -resize 16x16 "$ICONSET_DIR/icon_16x16.png"
        convert "$SVG_TEMP" -resize 32x32 "$ICONSET_DIR/icon_16x16@2x.png"
        convert "$SVG_TEMP" -resize 32x32 "$ICONSET_DIR/icon_32x32.png"
        convert "$SVG_TEMP" -resize 64x64 "$ICONSET_DIR/icon_32x32@2x.png"
        convert "$SVG_TEMP" -resize 128x128 "$ICONSET_DIR/icon_128x128.png"
        convert "$SVG_TEMP" -resize 256x256 "$ICONSET_DIR/icon_128x128@2x.png"
        convert "$SVG_TEMP" -resize 256x256 "$ICONSET_DIR/icon_256x256.png"
        convert "$SVG_TEMP" -resize 512x512 "$ICONSET_DIR/icon_256x256@2x.png"
        convert "$SVG_TEMP" -resize 512x512 "$ICONSET_DIR/icon_512x512.png"
        convert "$SVG_TEMP" -resize 1024x1024 "$ICONSET_DIR/icon_512x512@2x.png"
        
        iconutil -c icns "$ICONSET_DIR" -o "$ICON_DIR/icon.icns"
        rm -rf "$ICONSET_DIR"
    fi
    
elif command -v sips &> /dev/null; then
    echo "Using sips (macOS)..."
    
    # First, we need to create a PNG from SVG - use Python or create PNG directly
    # For now, let's create PNG files using a simple method
    python3 << 'PYTHON_SCRIPT'
from PIL import Image, ImageDraw, ImageFont
import os

def create_awosel_icon(size):
    # Create image with yellow background
    img = Image.new('RGB', (size, size), color='#FFD700')
    draw = ImageDraw.Draw(img)
    
    # Try to use a bold font
    try:
        font_size = int(size * 0.25)
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
    except:
        font = ImageFont.load_default()
    
    # Draw text
    text = "awosel"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    text_x = (size - text_width) / 2
    text_y = size * 0.35
    draw.text((text_x, text_y), text, fill='#000000', font=font)
    
    # Draw curved line
    line_width = max(2, int(size * 0.08))
    curve_y = size * 0.65
    padding = size * 0.15
    
    # Create curved path
    points = []
    for i in range(0, size - 2 * padding):
        x = padding + i
        # Smile/arrow curve
        y_offset = int((i / (size - 2 * padding) - 0.5) ** 2 * size * 0.15)
        y = curve_y + y_offset
        points.append((x, y))
    
    if len(points) > 1:
        draw.line(points, fill='#000000', width=line_width)
    
    return img

# Create icons
icon_dir = "src-tauri/icons"
os.makedirs(icon_dir, exist_ok=True)

for size in [32, 128, 256]:
    img = create_awosel_icon(size)
    if size == 256:
        img.save(f"{icon_dir}/128x128@2x.png")
    else:
        img.save(f"{icon_dir}/{size}x{size}.png")
    print(f"Created {size}x{size}.png")

# Create ICO (Windows) - save as PNG for now, will need conversion
img = create_awosel_icon(256)
img.save(f"{icon_dir}/icon.ico", format='ICO')
print("Created icon.ico")

# Note: ICNS creation requires iconutil on macOS
print("\nTo create icon.icns, run:")
print("mkdir -p /tmp/awosel.iconset")
print("# Copy PNG files to iconset with proper naming")
print("iconutil -c icns /tmp/awosel.iconset -o src-tauri/icons/icon.icns")
PYTHON_SCRIPT

else
    echo "Neither ImageMagick nor sips found. Please install ImageMagick or use the HTML generator."
    echo "Opening HTML generator..."
    open generate-icons.html 2>/dev/null || xdg-open generate-icons.html 2>/dev/null || echo "Please open generate-icons.html in your browser"
fi

echo "Icons created in $ICON_DIR"

