const sharp = require('sharp');
const toIco = require('to-ico');
const fs = require('fs');
const path = require('path');

async function generateFavicon() {
  try {
    const publicDir = path.join(__dirname, '..', 'public');
    const appDir = path.join(__dirname, '..', 'app');
    const sourceFile = path.join(publicDir, 'favicondiskusibisnis.png');

    if (!fs.existsSync(sourceFile)) {
      console.error(`✗ Source file not found: ${sourceFile}`);
      return;
    }

    console.log(`Using source image: ${sourceFile}`);

    // Generate resized PNG favicons
    const iconSizes = [
      { name: 'favicon-16x16.png', size: 16 },
      { name: 'favicon-32x32.png', size: 32 },
      { name: 'favicon-48x48.png', size: 48 },
      { name: 'apple-touch-icon.png', size: 180 },
    ];

    const iconsDir = path.join(publicDir, 'icons');
    if (!fs.existsSync(iconsDir)) {
      fs.mkdirSync(iconsDir, { recursive: true });
    }

    const icoBuffers = [];

    for (const item of iconSizes) {
      const outputPath = path.join(iconsDir, item.name);
      const buffer = await sharp(sourceFile)
        .resize(item.size, item.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();

      fs.writeFileSync(outputPath, buffer);
      console.log(`✓ Generated ${outputPath} (${item.size}x${item.size})`);

      if (item.size <= 48) {
        icoBuffers.push(buffer);
      }
    }

    // Generate multi-resolution favicon.ico (16, 32, 48)
    const ico = await toIco(icoBuffers);

    const outputIcoPaths = [
      path.join(publicDir, 'favicon.ico'),
      path.join(appDir, 'favicon.ico'),
    ];

    for (const outputPath of outputIcoPaths) {
      fs.writeFileSync(outputPath, ico);
      console.log(`✓ favicon.ico generated successfully at ${outputPath}`);
    }

    console.log('✓ All favicon assets generated successfully from favicondiskusibisnis.png');
  } catch (error) {
    console.error('✗ Error generating favicon:', error.message);
    console.error(error);
  }
}

generateFavicon();
