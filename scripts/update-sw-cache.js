/**
 * Service Worker Cache Update Script
 *
 * This script runs after Vite build to automatically update the service worker
 * with the correct hashed filenames for assets.
 *
 * Problem it solves:
 * - Vite generates files like index-WGGwRhsH.js with content hashes
 * - These filenames change on every build
 * - Service worker needs to know the exact filenames to cache them
 *
 * This script:
 * 1. Reads the built index.html to find asset references
 * 2. Scans the dist/assets folder for all generated files
 * 3. Updates the service worker's cache list with exact filenames
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, '../dist');
const swPath = path.join(distPath, 'sw.js');
const indexPath = path.join(distPath, 'index.html');
const assetsPath = path.join(distPath, 'assets');

console.log('🔧 Updating service worker cache list...\n');

// Read the built index.html to extract asset references
const indexHtml = fs.readFileSync(indexPath, 'utf-8');

// Extract JS and CSS files from index.html
const jsMatches = indexHtml.match(/src="(\/assets\/[^"]+\.js)"/g) || [];
const cssMatches = indexHtml.match(/href="(\/assets\/[^"]+\.css)"/g) || [];

const jsFiles = jsMatches.map(match => match.match(/src="([^"]+)"/)[1]);
const cssFiles = cssMatches.map(match => match.match(/href="([^"]+)"/)[1]);

console.log('📦 Found JavaScript bundles:', jsFiles);
console.log('🎨 Found CSS bundles:', cssFiles);

// Get all font files (Material Design Icons)
let fontFiles = [];
if (fs.existsSync(assetsPath)) {
    const assetFiles = fs.readdirSync(assetsPath);
    fontFiles = assetFiles
        .filter(file => /\.(woff2?|ttf|eot)$/.test(file))
        .map(file => `/assets/${file}`);

    console.log('🔤 Found font files:', fontFiles.length);
}

// Build the complete cache list
const cacheList = [
    '/',
    '/index.html',
    '/manifest.json',
    '/worker.js',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/libs/enc-uint8array.min.js',
    '/libs/aes_crypt.min.js',
    ...jsFiles,
    ...cssFiles,
    ...fontFiles,
    // CDN dependencies
    'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/core.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/enc-utf16.min.js'
];

console.log(`\n✅ Total files to cache: ${cacheList.length}\n`);

// Read the current service worker
let swContent = fs.readFileSync(swPath, 'utf-8');

// Update the cache version to force update
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
swContent = swContent.replace(
    /const CACHE_NAME = '[^']+';/,
    `const CACHE_NAME = 'slurm-cache-${timestamp}';`
);

// Replace the urlsToCache array
const urlsToCache = cacheList.map(url => `    '${url}'`).join(',\n');
swContent = swContent.replace(
    /const urlsToCache = \[[^\]]+\];/s,
    `const urlsToCache = [\n${urlsToCache}\n];`
);

// Write the updated service worker
fs.writeFileSync(swPath, swContent);

console.log('✨ Service worker updated successfully!');
console.log(`📝 Cache name: slurm-cache-${timestamp}`);
console.log(`💾 Updated: ${swPath}\n`);
