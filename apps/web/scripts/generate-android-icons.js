/**
 * Android Icon Generation Script
 * 
 * Generates Android launcher icons from PWA icons
 * Creates icons in all required Android densities
 */

import { copyFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const publicDir = join(__dirname, '../public');
const androidResDir = join(__dirname, '../../mobile-shell/android/app/src/main/res');

// Android density map: density name -> pixel size
const androidDensities = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

/**
 * Generate Android icon in specific density
 */
async function generateAndroidIcon(sourcePath, density, size, outputDir) {
  const iconPath = join(outputDir, 'ic_launcher.png');
  const iconRoundPath = join(outputDir, 'ic_launcher_round.png');
  
  // Ensure output directory exists
  await mkdir(outputDir, { recursive: true });
  
  try {
    // Generate square launcher icon
    await sharp(sourcePath)
      .resize(size, size)
      .png()
      .toFile(iconPath);
    
    // Generate round launcher icon (same as square for now)
    // In production, you might want to create a properly rounded version
    await sharp(sourcePath)
      .resize(size, size)
      .png()
      .toFile(iconRoundPath);
    
    console.log(`✓ Generated ${density} icons (${size}x${size})`);
  } catch (error) {
    console.error(`✗ Error generating ${density} icons:`, error.message);
  }
}

/**
 * Generate foreground icon (for adaptive icons)
 */
async function generateForegroundIcon(sourcePath, density, size, outputDir) {
  const foregroundPath = join(outputDir, 'ic_launcher_foreground.png');
  
  try {
    // For adaptive icons, the foreground should have padding (safe zone)
    // Typically use 66% of the icon size to ensure content fits in safe zone
    const safeSize = Math.floor(size * 0.66);
    const padding = Math.floor((size - safeSize) / 2);
    
    await sharp(sourcePath)
      .resize(safeSize, safeSize)
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
      })
      .png()
      .toFile(foregroundPath);
    
    console.log(`✓ Generated ${density} foreground icon (${size}x${size})`);
  } catch (error) {
    console.error(`✗ Error generating ${density} foreground:`, error.message);
  }
}

/**
 * Main generation function
 */
async function generateAndroidIcons() {
  console.log('Generating Android launcher icons...\n');
  
  const sourceIcon = join(publicDir, 'pwa-512x512.png');
  
  if (!existsSync(sourceIcon)) {
    console.error('✗ Source icon not found:', sourceIcon);
    console.error('   Please generate PWA icons first: pnpm generate-icons');
    process.exit(1);
  }
  
  try {
    // Generate icons for each density
    for (const [density, size] of Object.entries(androidDensities)) {
      const mipmapDir = join(androidResDir, density);
      
      // Generate launcher icons
      await generateAndroidIcon(sourceIcon, density, size, mipmapDir);
      
      // Generate foreground icons (for adaptive icons)
      await generateForegroundIcon(sourceIcon, density, size, mipmapDir);
    }
    
    console.log('\n✅ All Android icons generated successfully!');
    console.log('\nNote: The adaptive icon background is already configured in');
    console.log('android/app/src/main/res/drawable/ic_launcher_background.xml');
  } catch (error) {
    console.error('Error generating Android icons:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAndroidIcons();
}

