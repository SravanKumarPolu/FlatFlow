/**
 * Icon Generation Script
 * 
 * Generates PWA icons from SVG source using sharp (if available)
 * Falls back to creating simple placeholder PNGs if sharp is not available
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const publicDir = join(__dirname, '../public');

// Simple SVG icon source
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <!-- FlatFlow icon: Simple house/flow icon in brand color #0ea5e9 -->
  <rect width="100" height="100" rx="20" fill="#0ea5e9"/>
  <path d="M50 25 L75 45 L75 75 L25 75 L25 45 Z" fill="#ffffff"/>
  <path d="M35 65 L35 50 L50 50 L50 65 Z" fill="#0ea5e9"/>
  <circle cx="65" cy="55" r="5" fill="#ffffff"/>
</svg>`;

// Try to use sharp for high-quality PNG generation
let sharp;
try {
  sharp = (await import('sharp')).default;
  console.log('✓ Using sharp for icon generation');
} catch (e) {
  console.warn('⚠ sharp not available, creating simple placeholder icons');
}

/**
 * Generate PNG icon from SVG
 */
async function generatePngIcon(size, filename) {
  const outputPath = join(publicDir, filename);
  
  if (sharp) {
    // Use sharp for high-quality rendering
    const svgBuffer = Buffer.from(iconSvg);
    await sharp(svgBuffer, { density: 300 })
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`✓ Generated ${filename} (${size}x${size})`);
  } else {
    // Fallback: Create a simple PNG using a data URL approach
    // Since we can't use canvas in Node without canvas package, we'll create a minimal valid PNG
    // This is a very basic 1x1 transparent PNG - actual icons should be generated with proper tools
    console.warn(`⚠ Skipping ${filename} - install sharp for proper icon generation`);
    console.warn(`   Run: pnpm add -D sharp`);
  }
}

/**
 * Generate ICO file (favicon)
 */
async function generateFavicon() {
  const outputPath = join(publicDir, 'favicon.ico');
  
  if (sharp) {
    const svgBuffer = Buffer.from(iconSvg);
    // Generate 32x32 and 16x16 sizes for ICO
    const png32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
    // ICO format requires special handling - for now, just create a PNG with .ico extension
    // Proper ICO generation would require additional libraries
    await sharp(svgBuffer).resize(32, 32).png().toFile(outputPath);
    console.log('✓ Generated favicon.ico (32x32)');
  } else {
    console.warn('⚠ Skipping favicon.ico - install sharp for proper icon generation');
  }
}

/**
 * Main generation function
 */
async function generateIcons() {
  console.log('Generating PWA icons...\n');
  
  try {
    // Generate PNG icons
    await generatePngIcon(192, 'pwa-192x192.png');
    await generatePngIcon(512, 'pwa-512x512.png');
    await generatePngIcon(180, 'apple-touch-icon.png');
    
    // Generate favicon
    await generateFavicon();
    
    if (!sharp) {
      console.log('\n⚠ Icon generation incomplete - sharp package not found');
      console.log('   To generate proper icons, install sharp:');
      console.log('   pnpm add -D sharp');
      console.log('   Then run this script again: pnpm generate-icons');
      console.log('\n   Alternatively, use online tools:');
      console.log('   - https://realfavicongenerator.net/');
      console.log('   - https://www.pwabuilder.com/imageGenerator');
    } else {
      console.log('\n✅ All icons generated successfully!');
    }
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateIcons();
}

