const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Ukuran icon yang dibutuhkan untuk PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  const inputFile = path.join(__dirname, '..', 'public', 'logodiskusibisnis.png');
  const outputDir = path.join(__dirname, '..', 'public', 'icons');

  // Pastikan direktori icons ada
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Generating PWA icons...');

  for (const size of sizes) {
    const outputFile = path.join(outputDir, `icon-${size}x${size}.png`);
    
    try {
      await sharp(inputFile)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputFile);
      
      console.log(`✓ Generated ${size}x${size} icon`);
    } catch (error) {
      console.error(`✗ Error generating ${size}x${size} icon:`, error.message);
    }
  }

  // Generate favicon sizes
  const faviconSizes = [16, 32, 48];
  for (const size of faviconSizes) {
    const outputFile = path.join(outputDir, `favicon-${size}x${size}.png`);
    
    try {
      await sharp(inputFile)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputFile);
      
      console.log(`✓ Generated ${size}x${size} favicon`);
    } catch (error) {
      console.error(`✗ Error generating ${size}x${size} favicon:`, error.message);
    }
  }

  // Generate apple touch icon
  try {
    await sharp(inputFile)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(outputDir, 'apple-touch-icon.png'));
    
    console.log('✓ Generated Apple Touch Icon');
  } catch (error) {
    console.error('✗ Error generating Apple Touch Icon:', error.message);
  }

  console.log('\n✨ All icons generated successfully!');
}

generateIcons().catch(console.error);
