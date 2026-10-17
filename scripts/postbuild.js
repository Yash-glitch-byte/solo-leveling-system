import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

console.log('[POSTBUILD] Synchronizing production bundle to repository root...');

// Create version.json for in-app update checks
const versionInfo = {
  version: '2.7.0',
  timestamp: Date.now(),
  channel: 'production',
  protocol: 'HUNTER PROTOCOL v2.7.0 (HOLOGRAPHIC VOICE GUIDE & LOADOUT MATRIX)'
};
fs.writeFileSync(path.resolve(rootDir, 'version.json'), JSON.stringify(versionInfo, null, 2), 'utf-8');
if (fs.existsSync(distDir)) {
  fs.writeFileSync(path.resolve(distDir, 'version.json'), JSON.stringify(versionInfo, null, 2), 'utf-8');
}

// 1. Process and normalize index.html
const builtHtml = path.resolve(distDir, 'index.dev.html');
const targetRootHtml = path.resolve(rootDir, 'index.html');
const targetDistHtml = path.resolve(distDir, 'index.html');

let htmlContent = '';
if (fs.existsSync(builtHtml)) {
  htmlContent = fs.readFileSync(builtHtml, 'utf-8');
} else if (fs.existsSync(targetDistHtml)) {
  htmlContent = fs.readFileSync(targetDistHtml, 'utf-8');
}

if (htmlContent) {
  // Normalize manifest link to always point to root ./manifest.json
  htmlContent = htmlContent.replace(/<link rel="manifest" href="[^"]*"\s*\/?>/i, '<link rel="manifest" href="./manifest.json" />');
  fs.writeFileSync(targetRootHtml, htmlContent, 'utf-8');
  fs.writeFileSync(targetDistHtml, htmlContent, 'utf-8');
  console.log('✓ Successfully wrote normalized production index.html (pointing to ./manifest.json)');
}

// 2. Copy dist/assets to root assets
const distAssets = path.resolve(distDir, 'assets');
const rootAssets = path.resolve(rootDir, 'assets');

if (fs.existsSync(distAssets)) {
  if (!fs.existsSync(rootAssets)) {
    fs.mkdirSync(rootAssets, { recursive: true });
  }
  const files = fs.readdirSync(distAssets);
  for (const file of files) {
    fs.copyFileSync(path.resolve(distAssets, file), path.resolve(rootAssets, file));
  }
  console.log(`✓ Copied ${files.length} production asset files to root assets/`);
}

// 3. Ensure icons exist in BOTH root and assets/ to prevent any 404s
const iconFiles = ['icon.svg', 'icon-192.png', 'icon-512.png'];
for (const icon of iconFiles) {
  const rootIcon = path.resolve(rootDir, icon);
  const distIcon = path.resolve(distDir, icon);
  const rootAssetIcon = path.resolve(rootAssets, icon);
  const distAssetIcon = path.resolve(distAssets, icon);

  if (fs.existsSync(rootIcon)) {
    fs.copyFileSync(rootIcon, rootAssetIcon);
    if (fs.existsSync(distDir)) fs.copyFileSync(rootIcon, distIcon);
    if (fs.existsSync(distAssets)) fs.copyFileSync(rootIcon, distAssetIcon);
  }
}
console.log('✓ Replicated icons across root and assets/ for fail-safe manifest resolution');

// 4. Ensure sw.js, manifest.json, version.json are in root
const filesToSync = ['sw.js', 'manifest.json', 'version.json', 'icon.svg', 'icon-192.png', 'icon-512.png'];
for (const file of filesToSync) {
  const distFile = path.resolve(distDir, file);
  const rootFile = path.resolve(rootDir, file);
  if (fs.existsSync(distFile) && !fs.existsSync(rootFile)) {
    fs.copyFileSync(distFile, rootFile);
    console.log(`✓ Synchronized ${file} to root`);
  }
}

console.log('[POSTBUILD] Repository root is fully prepared for fail-safe PWA WebAPK generation on GitHub Pages.');
