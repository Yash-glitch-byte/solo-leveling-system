import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

console.log('[POSTBUILD] Synchronizing production bundle to repository root...');

// 1. Copy dist/index.dev.html to root index.html and dist/index.html
const builtHtml = path.resolve(distDir, 'index.dev.html');
const targetRootHtml = path.resolve(rootDir, 'index.html');
const targetDistHtml = path.resolve(distDir, 'index.html');

if (fs.existsSync(builtHtml)) {
  const content = fs.readFileSync(builtHtml, 'utf-8');
  fs.writeFileSync(targetRootHtml, content, 'utf-8');
  fs.writeFileSync(targetDistHtml, content, 'utf-8');
  console.log('✓ Successfully wrote production index.html to repository root and dist/');
} else if (fs.existsSync(targetDistHtml)) {
  const content = fs.readFileSync(targetDistHtml, 'utf-8');
  fs.writeFileSync(targetRootHtml, content, 'utf-8');
  console.log('✓ Copied dist/index.html to repository root');
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

// 3. Ensure sw.js, manifest.json, icon.svg are in root
const filesToSync = ['sw.js', 'manifest.json', 'icon.svg'];
for (const file of filesToSync) {
  const distFile = path.resolve(distDir, file);
  const rootFile = path.resolve(rootDir, file);
  if (fs.existsSync(distFile)) {
    fs.copyFileSync(distFile, rootFile);
    console.log(`✓ Synchronized ${file} to root`);
  }
}

console.log('[POSTBUILD] Repository root is now fully prepared for direct GitHub Pages static hosting.');
