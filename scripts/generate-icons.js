const fs = require('fs');
const path = require('path');
const opentype = require('opentype.js');
const sharp = require('sharp');
const https = require('https');

// URL to the raw TTF file on Google Fonts GitHub repository
const FONT_URL = 'https://raw.githubusercontent.com/google/fonts/main/ofl/playfairdisplay/PlayfairDisplay%5Bwght%5D.ttf';

async function downloadFont() {
  return new Promise((resolve, reject) => {
    https.get(FONT_URL, (res) => {
      const data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => resolve(Buffer.concat(data)));
      res.on('error', reject);
    });
  });
}

async function main() {
  console.log('Downloading font TTF...');
  const fontBuffer = await downloadFont();
  
  // Parse TTF with opentype.js
  const font = opentype.parse(fontBuffer.buffer.slice(fontBuffer.byteOffset, fontBuffer.byteOffset + fontBuffer.byteLength));

  console.log('Generating SVG path...');
  const text = 'AS';
  const fontSize = 340;
  
  // Calculate text width to center it in 512x512
  const advanceWidth = font.getAdvanceWidth(text, fontSize);
  // Manual tweaking for visual center
  const x = (512 - advanceWidth) / 2 + 10;
  const y = 370; // Baseline

  const pathObj = font.getPath(text, x, y, fontSize);
  pathObj.fill = '#FFFFFF';
  const svgPathData = pathObj.toSVG();

  const svg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#000000" />
  ${svgPathData}
</svg>`;

  const svgBufferLocal = Buffer.from(svg);
  const iconsDir = path.join(__dirname, 'public', 'icons');
  
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
  
  console.log('Generating PNGs...');
  for (const size of sizes) {
    const filePath = path.join(iconsDir, `icon-${size}x${size}.png`);
    await sharp(svgBufferLocal)
      .resize(size, size)
      .png()
      .toFile(filePath);
    console.log(`Created icon-${size}x${size}.png`);
  }

  // Generate maskable icons
  await sharp(svgBufferLocal)
    .resize(192, 192)
    .png()
    .toFile(path.join(iconsDir, 'icon-maskable-192x192.png'));
    
  await sharp(svgBufferLocal)
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'icon-maskable-512x512.png'));

  console.log('All icons generated perfectly!');
}

main().catch(console.error);
