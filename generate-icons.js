#!/usr/bin/env node

/**
 * PWA Icon Generator
 * 
 * Usage:
 * node generate-icons.js <source-image> [output-folder]
 * 
 * Example:
 * node generate-icons.js logo.png public/icons
 * 
 * Requirements:
 * npm install sharp
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is installed
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('Error: sharp package is not installed.');
  console.error('Please install it with: npm install sharp');
  process.exit(1);
}

// Configuration
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const MASKABLE_SIZES = [192, 512];
const DEFAULT_OUTPUT = 'public/icons';
const DEFAULT_SOURCE = 'logo.png';

// Get arguments
const sourceImage = process.argv[2] || DEFAULT_SOURCE;
const outputFolder = process.argv[3] || DEFAULT_OUTPUT;

async function generateIcons() {
  // Check if source image exists
  if (!fs.existsSync(sourceImage)) {
    console.error(`Error: Source image not found: ${sourceImage}`);
    console.error('Usage: node generate-icons.js <source-image> [output-folder]');
    process.exit(1);
  }

  // Create output folder if it doesn't exist
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
    console.log(`Created folder: ${outputFolder}`);
  }

  console.log(`\nGenerating PWA icons from: ${sourceImage}`);
  console.log(`Output folder: ${outputFolder}\n`);

  try {
    // Generate regular icons
    console.log('Generating regular icons...');
    for (const size of ICON_SIZES) {
      const outputPath = path.join(outputFolder, `icon-${size}x${size}.png`);
      
      await sharp(sourceImage)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`  ✓ Generated: icon-${size}x${size}.png`);
    }

    // Generate maskable icons (with padding for adaptive icon safe zone)
    console.log('\nGenerating maskable icons...');
    for (const size of MASKABLE_SIZES) {
      const outputPath = path.join(outputFolder, `icon-maskable-${size}x${size}.png`);
      const paddedSize = Math.floor(size * 0.8); // 20% padding for safe zone
      
      await sharp(sourceImage)
        .resize(paddedSize, paddedSize, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .extend({
          top: Math.floor((size - paddedSize) / 2),
          bottom: Math.floor((size - paddedSize) / 2),
          left: Math.floor((size - paddedSize) / 2),
          right: Math.floor((size - paddedSize) / 2),
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`  ✓ Generated: icon-maskable-${size}x${size}.png`);
    }

    console.log('\n✅ All icons generated successfully!');
    console.log(`\nGenerated files:`);
    console.log(`  • ${ICON_SIZES.length} regular icons`);
    console.log(`  • ${MASKABLE_SIZES.length} maskable icons`);
    console.log(`\nNext steps:`);
    console.log(`1. Add your logo/source image to the project`);
    console.log(`2. Run: node generate-icons.js <logo-file>`);
    console.log(`3. Verify icons in: ${outputFolder}`);
    console.log(`4. Test PWA installation on a device`);

  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

// Run
generateIcons();
