const toIco = require('to-ico');
const fs = require('fs');
const path = require('path');

async function generateFavicon() {
  try {
    const publicDir = path.join(__dirname, '..', 'public');
    const appDir = path.join(__dirname, '..', 'app');
    
    const inputFiles = [
      path.join(publicDir, 'icons', 'favicon-16x16.png'),
      path.join(publicDir, 'icons', 'favicon-32x32.png'),
      path.join(publicDir, 'icons', 'favicon-48x48.png')
    ];

    // Check if files exist
    for (const file of inputFiles) {
      if (!fs.existsSync(file)) {
        console.error(`✗ File not found: ${file}`);
        return;
      }
    }

    const buffers = inputFiles.map(file => fs.readFileSync(file));
    
    const ico = await toIco(buffers);
    
    // Write to both locations
    const outputPaths = [
      path.join(publicDir, 'favicon.ico'),
      path.join(appDir, 'favicon.ico')
    ];
    
    for (const outputPath of outputPaths) {
      fs.writeFileSync(outputPath, ico);
      console.log(`✓ favicon.ico generated successfully at ${outputPath}`);
    }
  } catch (error) {
    console.error('✗ Error generating favicon.ico:', error.message);
    console.error(error);
  }
}

generateFavicon();
