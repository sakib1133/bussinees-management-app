# PWA Icon Generation Guide

## Quick Start

The application requires icons in the following sizes for full PWA support:

### Required Icon Sizes
- 72x72 (Android)
- 96x96 (Android)
- 128x128 (Small devices)
- 144x144 (Android)
- 152x152 (iPad Mini)
- 192x192 (Android, Web)
- 384x384 (High DPI)
- 512x512 (Splash screens, Web)

### Maskable Icons (for adaptive icons)
- 192x192 (Maskable)
- 512x512 (Maskable)

## Option 1: Using Online Tools (Recommended for Quick Setup)

1. **PWA Asset Generator**
   - Visit: https://www.pwabuilder.com/imageGenerator
   - Upload a square logo (at least 512x512)
   - Download all generated icons
   - Place them in `public/icons/` folder

2. **Favicon Generator**
   - Visit: https://realfavicongenerator.net
   - Upload your logo
   - Generate all sizes
   - Download and place in `public/icons/`

## Option 2: Using Command Line Tools

### Using ImageMagick (if installed)

```bash
# Generate all sizes from a source image
convert source-logo.png -define icon:auto-resize=72,96,128,144,152,192,384,512 public/icons/icon.png

# Or generate individual sizes
convert source-logo.png -resize 72x72 public/icons/icon-72x72.png
convert source-logo.png -resize 96x96 public/icons/icon-96x96.png
convert source-logo.png -resize 128x128 public/icons/icon-128x128.png
convert source-logo.png -resize 144x144 public/icons/icon-144x144.png
convert source-logo.png -resize 152x152 public/icons/icon-152x152.png
convert source-logo.png -resize 192x192 public/icons/icon-192x192.png
convert source-logo.png -resize 384x384 public/icons/icon-384x384.png
convert source-logo.png -resize 512x512 public/icons/icon-512x512.png
```

### Using GraphicsMagick

```bash
# Similar to ImageMagick but sometimes faster
gm convert source-logo.png -resize 192x192 public/icons/icon-192x192.png
```

## Option 3: Using Node.js Scripts

Create a file `generate-icons.js`:

```javascript
const fs = require('fs');
const sharp = require('sharp');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const sourceImage = 'source-logo.png';

async function generateIcons() {
  for (const size of sizes) {
    try {
      await sharp(sourceImage)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(`public/icons/icon-${size}x${size}.png`);
      console.log(`Generated icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`Failed to generate icon-${size}x${size}.png:`, error);
    }
  }
}

generateIcons();
```

Then run:
```bash
npm install sharp
node generate-icons.js
```

## Icon Requirements

- **Format**: PNG (32-bit with transparency support)
- **Background**: Transparent or white
- **Padding**: 5-10% padding around the logo for maskable icons
- **Design**: Simple, recognizable at all sizes
- **Color**: Should match your brand (recommended: solid colors work best)

## Maskable Icon Guidelines

Maskable icons are used on devices that support adaptive icons (mostly Android).

- Keep important content within a 66dp circle in the center
- Avoid critical content in corners
- Design should be visible with various mask shapes

## Screenshot Requirements

For enhanced installation prompts, add screenshots:

### Narrow Format (Mobile)
- Size: 540x720 or similar 3:4 ratio
- File: `public/screenshots/screenshot-540x720.png`
- Shows mobile interface

### Wide Format (Desktop/Tablet)
- Size: 1280x720 or similar 16:9 ratio
- File: `public/screenshots/screenshot-1280x720.png`
- Shows desktop interface

## Splash Screens (iOS)

Optional splash screens for iOS app experience:

- 640x1136 (iPhone 5)
- 750x1334 (iPhone 6/7/8)
- 1242x2208 (iPhone 6+/7+/8+)
- 1125x2436 (iPhone X/11 Pro)

Place in `public/screenshots/` folder.

## Current Setup Status

The application is configured with the following icon paths:

```
public/
├── icons/
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   ├── icon-512x512.png
│   ├── icon-maskable-192x192.png
│   └── icon-maskable-512x512.png
├── screenshots/
│   ├── screenshot-540x720.png
│   └── screenshot-1280x720.png
└── manifest.json
```

## Deployment Notes

- All icons must be placed before building for production
- Icons are referenced in `manifest.json` and `index.html`
- Ensure paths match exactly (case-sensitive on Linux/Mac)
- Test on https:// only (service workers require secure context)

## Testing Icons

After adding icons:

1. **Desktop (Chrome/Edge)**
   - Open DevTools → Application → Manifest
   - Check if all icons are loaded (green checkmarks)

2. **Android**
   - Install app and check home screen icon

3. **iOS**
   - Add to home screen and check icon

## Troubleshooting

### Icons not showing
- Verify file paths match manifest.json exactly
- Check file permissions
- Ensure PNG format with transparency support
- Verify file sizes are correct

### Maskable icons distorted
- Check if important content is within center circle
- Reduce critical content size
- Test with circle mask simulator

### iOS splash screen not showing
- Use exact resolutions specified
- Format must be PNG
- Meta tags must be in correct format in `index.html`
