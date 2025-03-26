import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [192, 512];
const svgPath = path.join(__dirname, '../public/icons/icon.svg');
const outputDir = path.join(__dirname, '../public/icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Generate PNG files for each size
sizes.forEach(size => {
    sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(path.join(outputDir, `icon-${size}x${size}.png`))
        .then(() => console.log(`Generated ${size}x${size} icon`))
        .catch(err => console.error(`Error generating ${size}x${size} icon:`, err));
}); 