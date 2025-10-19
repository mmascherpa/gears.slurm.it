import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconSizes = [192, 512];
const faviconSizes = [16, 32, 48];
const iconSvgPath = path.join(__dirname, '../public/icons/icon.svg');
const faviconSvgPath = path.join(__dirname, '../public/favicon.svg');
const outputDir = path.join(__dirname, '../public/icons');
const publicDir = path.join(__dirname, '../public');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Generate PNG files for app icons
console.log('Generating app icons...');
iconSizes.forEach(size => {
    sharp(iconSvgPath)
        .resize(size, size)
        .png()
        .toFile(path.join(outputDir, `icon-${size}x${size}.png`))
        .then(() => console.log(`✓ Generated ${size}x${size} app icon`))
        .catch(err => console.error(`✗ Error generating ${size}x${size} icon:`, err));
});

// Generate favicon PNG files
console.log('\nGenerating favicon files...');
Promise.all(
    faviconSizes.map(size =>
        sharp(faviconSvgPath)
            .resize(size, size)
            .png()
            .toBuffer()
    )
).then(buffers => {
    // For now, just save the 32x32 as favicon.png
    // ICO files require a special format that sharp doesn't support natively
    return sharp(faviconSvgPath)
        .resize(32, 32)
        .png()
        .toFile(path.join(publicDir, 'favicon.png'))
        .then(() => console.log('✓ Generated favicon.png (32x32)'));
}).catch(err => {
    console.error('✗ Error generating favicon:', err);
}); 