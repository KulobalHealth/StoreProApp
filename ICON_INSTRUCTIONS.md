# Creating awosel App Icons

To replace the app icon with the awosel logo, you have several options:

## Option 1: Use the HTML Generator (Easiest)

1. Open `generate-icons.html` in your web browser
2. Click "Generate All Icons" to see previews
3. Click the download buttons for each size:
   - Download 32x32
   - Download 128x128  
   - Download 256x256
4. Save the downloaded files to `src-tauri/icons/`:
   - `32x32.png`
   - `128x128.png`
   - `128x128@2x.png` (use the 256x256 file and rename it)

## Option 2: Install ImageMagick and Use Script

```bash
# Install ImageMagick (macOS)
brew install imagemagick

# Run the script
./create-icons.sh
```

## Option 3: Manual Creation

Create the following files in `src-tauri/icons/`:

### Required Files:
- `32x32.png` - 32x32 pixels
- `128x128.png` - 128x128 pixels  
- `128x128@2x.png` - 256x256 pixels (retina)
- `icon.icns` - Mac icon bundle
- `icon.ico` - Windows icon

### Creating icon.icns (Mac):

1. Create an iconset directory:
```bash
mkdir -p /tmp/awosel.iconset
```

2. Create PNG files in various sizes:
```bash
# You can use the HTML generator or any image editor
# Create these sizes:
# - icon_16x16.png
# - icon_16x16@2x.png (32x32)
# - icon_32x32.png
# - icon_32x32@2x.png (64x64)
# - icon_128x128.png
# - icon_128x128@2x.png (256x256)
# - icon_256x256.png
# - icon_256x256@2x.png (512x512)
# - icon_512x512.png
# - icon_512x512@2x.png (1024x1024)
```

3. Convert to ICNS:
```bash
iconutil -c icns /tmp/awosel.iconset -o src-tauri/icons/icon.icns
```

### Creating icon.ico (Windows):

You can use online converters or ImageMagick:
```bash
convert 128x128.png icon.ico
```

## Quick Start (Recommended)

1. **Open `generate-icons.html` in your browser**
2. **Download the three PNG sizes**
3. **Place them in `src-tauri/icons/` with the correct names**
4. **For icon.icns and icon.ico, you can:**
   - Use online converters (search "png to icns converter" or "png to ico converter")
   - Or use the system tools mentioned above

The HTML generator will create icons matching the awosel logo design:
- Bright yellow (#FFD700) background
- Black "awosel" text
- Black curved arrow/smile line beneath

