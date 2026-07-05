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

const distPath = path.join(__dirname, '../deploy');
const swPath = path.join(distPath, 'sw.js');
const indexPath = path.join(distPath, 'index.html');
const assetsPath = path.join(distPath, 'assets');

console.log('🔧 Updating service worker cache list...\n');

// Scan all assets in the /assets folder
// This ensures lazy-loaded chunks are also cached for offline use
let jsFiles = [];
let cssFiles = [];
let fontFiles = [];

if (fs.existsSync(assetsPath)) {
    const assetFiles = fs.readdirSync(assetsPath);

    // Get all JavaScript files (including lazy-loaded chunks)
    jsFiles = assetFiles
        .filter(file => file.endsWith('.js'))
        .map(file => `/assets/${file}`);

    // Get all CSS files
    cssFiles = assetFiles
        .filter(file => file.endsWith('.css'))
        .map(file => `/assets/${file}`);

    // Get all font files
    fontFiles = assetFiles
        .filter(file => /\.(woff2?|ttf|eot)$/.test(file))
        .map(file => `/assets/${file}`);

    console.log('📦 Found JavaScript bundles:', jsFiles.length, 'files');
    console.log('🎨 Found CSS bundles:', cssFiles.length, 'files');
    console.log('🔤 Found font files:', fontFiles.length, 'files');
} else {
    console.warn('⚠️  Assets directory not found at:', assetsPath);
}

// Build the complete cache list
const cacheList = [
    '/',
    '/index.html',
    '/manifest.json',
    '/worker.js',
    // Favicon files
    '/favicon.svg',
    '/favicon.png',
    '/favicon.ico',
    '/favicon-32x32.png',
    // Icon files
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/icons/icon.svg',
    // Crypto libraries (all vendored locally)
    '/libs/crypto-js-core.min.js',
    '/libs/crypto-js-enc-utf16.min.js',
    '/libs/enc-uint8array.min.js',
    '/libs/aes_crypt.min.js',
    // Vite-generated assets
    ...jsFiles,
    ...cssFiles,
    ...fontFiles
];

console.log(`\n✅ Total files to cache: ${cacheList.length}\n`);

// Read the current service worker
let swContent = fs.readFileSync(swPath, 'utf-8');

// Disable debug mode in production
swContent = swContent.replace(
    /const DEBUG = true;/,
    'const DEBUG = false;'
);

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
