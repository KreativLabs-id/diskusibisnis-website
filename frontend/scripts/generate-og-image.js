/**
 * Generate Open Graph Image for Social Media Sharing
 * Size: 1200x630px (recommended by Facebook/Twitter)
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generateOGImage() {
  const width = 1200;
  const height = 630;
  
  // Create SVG template for OG image
  const svgImage = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
        </linearGradient>
        <!-- Pattern for texture -->
        <pattern id="pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="1" fill="white" opacity="0.1"/>
        </pattern>
      </defs>
      
      <!-- Background gradient -->
      <rect width="${width}" height="${height}" fill="url(#grad1)"/>
      
      <!-- Pattern overlay -->
      <rect width="${width}" height="${height}" fill="url(#pattern)"/>
      
      <!-- Logo circle background -->
      <circle cx="600" cy="220" r="80" fill="white" opacity="0.2"/>
      <circle cx="600" cy="220" r="70" fill="white"/>
      
      <!-- Logo icon (simplified) -->
      <g transform="translate(600, 220)">
        <circle r="50" fill="#10b981"/>
        <text x="0" y="0" text-anchor="middle" dominant-baseline="central" 
              font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white">DB</text>
      </g>
      
      <!-- Title -->
      <text x="600" y="350" text-anchor="middle" 
            font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="white">
        DiskusiBisnis
      </text>
      
      <!-- Subtitle -->
      <text x="600" y="420" text-anchor="middle" 
            font-family="Arial, sans-serif" font-size="32" font-weight="500" fill="white" opacity="0.95">
        Forum Q&amp;A UMKM Indonesia
      </text>
      
      <!-- Description -->
      <text x="600" y="480" text-anchor="middle" 
            font-family="Arial, sans-serif" font-size="24" fill="white" opacity="0.85">
        Platform diskusi untuk mengembangkan bisnis Anda
      </text>
      
      <!-- Decorative elements -->
      <circle cx="200" cy="150" r="30" fill="white" opacity="0.1"/>
      <circle cx="1000" cy="500" r="40" fill="white" opacity="0.1"/>
      <circle cx="150" cy="550" r="20" fill="white" opacity="0.15"/>
      <circle cx="1050" cy="130" r="25" fill="white" opacity="0.12"/>
    </svg>
  `;

  try {
    const outputPath = path.join(__dirname, '../public/icons/og-image.png');
    
    await sharp(Buffer.from(svgImage))
      .resize(width, height)
      .png()
      .toFile(outputPath);
    
    console.log('✅ OG Image generated successfully at:', outputPath);
    console.log('📐 Size: 1200x630px');
    console.log('🎨 Format: PNG');
    
    // Generate Twitter card variant (same size)
    const twitterCardPath = path.join(__dirname, '../public/icons/twitter-card.png');
    await sharp(Buffer.from(svgImage))
      .resize(width, height)
      .png()
      .toFile(twitterCardPath);
    
    console.log('✅ Twitter Card image generated at:', twitterCardPath);
    
  } catch (error) {
    console.error('❌ Error generating OG image:', error);
    process.exit(1);
  }
}

// Run the generator
generateOGImage();
