import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Only use media folders that belong natively to 'anushka ka surprise'
const itemsToCopy = [
  'photos_data.js',
  'script.js',
  'assets_manifest.json',
  'anushka cute pics',
  'anushka funny pics',
  'message by akshaj',
  'message by ammar',
  'message by arnima',
  'message by pragati',
  'message by vaishnavi',
  'audio message by normal insaan',
  'audio rap song'
];

itemsToCopy.forEach(item => {
  const src = path.join(__dirname, item);
  const dest = path.join(distDir, item);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
    console.log(`✓ Copied ${item} to dist/`);
  } else {
    console.warn(`Warning: ${item} not found.`);
  }
});

console.log('✓ All authentic assets successfully copied to dist for production deployment!');
