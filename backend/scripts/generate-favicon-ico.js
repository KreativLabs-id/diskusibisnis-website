const toIco = require('to-ico');
const fs = require('fs');
const path = require('path');

async function generateFavicon() {
  try {
    const inputFiles = [
      path.join(__dirname, '..', 'public', 'icons', 'favicon-16x16.png'),
      path.join(__dirname, '..', 'public', 'icons', 'favicon-32x32.png'),
      path.join(__dirname, '..', 'public', 'icons', 'favicon-48x48.png')
    ];

    const buffers = inputFiles.map(file => fs.readFileSync(file));
    
    const ico = await toIco(buffers);
    
    const outputPath = path.join(__dirname, '..', 'public', 'favicon.ico');
    fs.writeFileSync(outputPath, ico);
    
    console.log('✓ favicon.ico generated successfully!');
  } catch (error) {
    console.error('✗ Error generating favicon.ico:', error.message);
  }
}

generateFavicon();
