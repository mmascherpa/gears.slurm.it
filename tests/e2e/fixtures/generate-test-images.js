#!/usr/bin/env node

/**
 * Generate minimal test images for E2E tests
 * Creates valid JPEG and PNG files with EXIF/metadata
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import piexif from 'piexifjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create minimal PNG with tEXt chunk
function createMinimalPng() {
  // PNG signature
  const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk (16x16 image)
  const ihdrData = new Uint8Array([
    0, 0, 0, 16, // Width: 16
    0, 0, 0, 16, // Height: 16
    8, // Bit depth: 8
    2, // Color type: RGB
    0, // Compression: deflate
    0, // Filter: adaptive
    0  // Interlace: none
  ]);
  const ihdr = createPngChunk('IHDR', ihdrData);

  // tEXt chunk with metadata
  const textChunk = createTextChunk('Title', 'Test PNG Image');
  const authorChunk = createTextChunk('Author', 'E2E Test Suite');

  // IDAT chunk (minimal compressed data for 16x16 red square)
  const idatData = new Uint8Array([
    0x78, 0x9c, // zlib header
    0xed, 0xc1, 0x01, 0x01, 0x00, 0x00, 0x00, 0x80, 0x90, 0xfe, 0xaf, 0xee,
    0x08, 0x0a, 0x00, 0x00, 0x00, 0x71, 0x00, 0x01
  ]);
  const idat = createPngChunk('IDAT', idatData);

  // IEND chunk
  const iend = createPngChunk('IEND', new Uint8Array(0));

  // Combine all chunks
  const chunks = [signature, ihdr, textChunk, authorChunk, idat, iend];
  const totalSize = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const png = new Uint8Array(totalSize);

  let offset = 0;
  for (const chunk of chunks) {
    png.set(chunk, offset);
    offset += chunk.length;
  }

  return Buffer.from(png);
}

function createPngChunk(type, data) {
  const length = data.length;
  const chunk = new Uint8Array(12 + length);
  const view = new DataView(chunk.buffer);

  // Length
  view.setUint32(0, length);

  // Type
  for (let i = 0; i < 4; i++) {
    chunk[4 + i] = type.charCodeAt(i);
  }

  // Data
  chunk.set(data, 8);

  // CRC
  const crcData = chunk.slice(4, 8 + length);
  const crc = crc32(crcData);
  view.setUint32(8 + length, crc);

  return chunk;
}

function createTextChunk(keyword, value) {
  const keywordBytes = new TextEncoder().encode(keyword);
  const valueBytes = new TextEncoder().encode(value);

  const data = new Uint8Array(keywordBytes.length + 1 + valueBytes.length);
  data.set(keywordBytes, 0);
  data[keywordBytes.length] = 0; // Null separator
  data.set(valueBytes, keywordBytes.length + 1);

  return createPngChunk('tEXt', data);
}

function crc32(data) {
  const crcTable = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[i] = c;
  }

  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc = crcTable[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Create minimal JPEG - simplest possible valid JPEG
function createMinimalJpeg() {
  // Minimal valid JPEG (1x1 pixel, grayscale)
  // This is a pre-encoded minimal JPEG that definitely works
  const minimalJpeg = Buffer.from([
    0xFF, 0xD8, // SOI
    0xFF, 0xE0, // APP0
    0x00, 0x10, // Length
    0x4A, 0x46, 0x49, 0x46, 0x00, // "JFIF\0"
    0x01, 0x01, // Version 1.1
    0x00, // Density units
    0x00, 0x01, 0x00, 0x01, // X/Y density
    0x00, 0x00, // Thumbnail size

    0xFF, 0xDB, // DQT
    0x00, 0x43, // Length
    0x00, // Table ID
    ...Array(64).fill(0x08), // Quantization table

    0xFF, 0xC0, // SOF0
    0x00, 0x0B, // Length
    0x08, // Precision
    0x00, 0x01, // Height: 1
    0x00, 0x01, // Width: 1
    0x01, // Components: 1
    0x01, 0x11, 0x00, // Component info

    0xFF, 0xC4, // DHT
    0x00, 0x14, // Length
    0x00, // Table ID
    0x01, ...Array(15).fill(0x00), // Bits
    0x00, // Symbols

    0xFF, 0xDA, // SOS
    0x00, 0x08, // Length
    0x01, // Components
    0x01, 0x00, // Component info
    0x00, 0x3F, 0x00, // Spectral

    0x00, // Scan data

    0xFF, 0xD9 // EOI
  ]);

  // Now add EXIF using piexifjs
  const base64Jpeg = minimalJpeg.toString('base64');
  const dataUri = 'data:image/jpeg;base64,' + base64Jpeg;

  try {
    const exifData = {
      '0th': {
        [piexif.ImageIFD.Make]: 'Test Camera',
        [piexif.ImageIFD.Model]: 'E2E Test Model'
      },
      'Exif': {
        [piexif.ExifIFD.DateTimeOriginal]: '2025:01:15 12:00:00'
      },
      'GPS': {},
      '1st': {},
      'thumbnail': null
    };

    const exifBytes = piexif.dump(exifData);
    const newDataUri = piexif.insert(exifBytes, dataUri);
    const newBase64 = newDataUri.replace('data:image/jpeg;base64,', '');

    return Buffer.from(newBase64, 'base64');
  } catch (error) {
    console.warn('Could not add EXIF, using minimal JPEG:', error.message);
    return minimalJpeg;
  }
}

// Generate files
try {
  console.log('Generating test images...');

  const pngBuffer = createMinimalPng();
  const pngPath = path.join(__dirname, 'test-png.png');
  fs.writeFileSync(pngPath, pngBuffer);
  console.log(`✓ Created ${pngPath} (${pngBuffer.length} bytes)`);

  const jpegBuffer = createMinimalJpeg();
  const jpegPath = path.join(__dirname, 'test-jpeg.jpg');
  fs.writeFileSync(jpegPath, jpegBuffer);
  console.log(`✓ Created ${jpegPath} (${jpegBuffer.length} bytes)`);

  console.log('\nTest images generated successfully!');
} catch (error) {
  console.error('Error generating test images:', error);
  process.exit(1);
}
