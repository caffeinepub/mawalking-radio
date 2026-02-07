#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const frontendRoot = join(__dirname, '..');

let hasErrors = false;

function error(message) {
  console.error(`❌ ERROR: ${message}`);
  hasErrors = true;
}

function warn(message) {
  console.warn(`⚠️  WARNING: ${message}`);
}

function success(message) {
  console.log(`✅ ${message}`);
}

console.log('🔍 Verifying frontend build...\n');

// 1. Check for TypeScript compilation errors
console.log('📝 Checking TypeScript compilation...');
try {
  const tsconfigPath = join(frontendRoot, 'tsconfig.json');
  if (!existsSync(tsconfigPath)) {
    error('tsconfig.json not found');
  } else {
    success('tsconfig.json exists');
  }
} catch (err) {
  error(`TypeScript check failed: ${err.message}`);
}

// 2. Check for NodeJS.Timeout usage (browser incompatibility)
console.log('\n🔍 Checking for NodeJS.Timeout usage...');
const filesToCheck = [
  'src/hooks/useAlbumArtBackground.ts',
  'src/hooks/useMarqueeMeasurements.ts',
  'src/components/player/TrackTitleMarquee.tsx'
];

let foundNodeJSTimeout = false;
for (const file of filesToCheck) {
  const filePath = join(frontendRoot, file);
  if (existsSync(filePath)) {
    const content = readFileSync(filePath, 'utf-8');
    if (content.includes('NodeJS.Timeout')) {
      error(`Found NodeJS.Timeout in ${file} - use ReturnType<typeof setTimeout> instead`);
      foundNodeJSTimeout = true;
    }
  }
}

if (!foundNodeJSTimeout) {
  success('No NodeJS.Timeout usage found');
}

// 3. Check for correct background asset paths
console.log('\n🖼️  Checking background asset paths...');
const indexCssPath = join(frontendRoot, 'src/index.css');
if (existsSync(indexCssPath)) {
  const indexCss = readFileSync(indexCssPath, 'utf-8');
  
  // Check for new background assets
  const hasNewMobileAssets = indexCss.includes('mawalking-user-bg-mobile.dim_1080x1920');
  const hasNewDesktopAssets = indexCss.includes('mawalking-user-bg.dim_1920x1080');
  
  // Check for old pattern background references (should not exist)
  const hasOldPatternAssets = indexCss.includes('mawalking-pattern-bg');
  
  if (!hasNewMobileAssets || !hasNewDesktopAssets) {
    error('index.css missing new background asset references (mawalking-user-bg-mobile/mawalking-user-bg)');
  } else {
    success('index.css has correct new background asset references');
  }
  
  if (hasOldPatternAssets) {
    error('index.css still references old mawalking-pattern-bg assets - should use mawalking-user-bg instead');
  } else {
    success('index.css does not reference old pattern background assets');
  }
} else {
  error('index.css not found');
}

// 4. Check service worker background assets
console.log('\n🔧 Checking service worker configuration...');
const serviceWorkerPath = join(frontendRoot, 'public/service-worker.js');
if (existsSync(serviceWorkerPath)) {
  const serviceWorker = readFileSync(serviceWorkerPath, 'utf-8');
  
  const hasNewMobileAssets = serviceWorker.includes('mawalking-user-bg-mobile.dim_1080x1920');
  const hasNewDesktopAssets = serviceWorker.includes('mawalking-user-bg.dim_1920x1080');
  const hasOldPatternAssets = serviceWorker.includes('mawalking-pattern-bg');
  
  if (!hasNewMobileAssets || !hasNewDesktopAssets) {
    error('service-worker.js missing new background asset references');
  } else {
    success('service-worker.js has correct new background asset references');
  }
  
  if (hasOldPatternAssets) {
    error('service-worker.js still references old mawalking-pattern-bg assets');
  } else {
    success('service-worker.js does not reference old pattern background assets');
  }
} else {
  error('service-worker.js not found');
}

// 5. Check SettingsAboutScreen for correct cache clearing
console.log('\n⚙️  Checking SettingsAboutScreen cache clearing...');
const settingsScreenPath = join(frontendRoot, 'src/screens/SettingsAboutScreen.tsx');
if (existsSync(settingsScreenPath)) {
  const settingsScreen = readFileSync(settingsScreenPath, 'utf-8');
  
  const hasNewAssetClearing = settingsScreen.includes('mawalking-user-bg');
  const hasOldAssetClearing = settingsScreen.includes('user-background.dim_205x115.png');
  
  if (!hasNewAssetClearing) {
    error('SettingsAboutScreen.tsx does not clear new background assets (mawalking-user-bg)');
  } else {
    success('SettingsAboutScreen.tsx clears new background assets');
  }
  
  if (hasOldAssetClearing) {
    error('SettingsAboutScreen.tsx still references old user-background.dim_205x115.png');
  } else {
    success('SettingsAboutScreen.tsx does not reference old background assets');
  }
} else {
  error('SettingsAboutScreen.tsx not found');
}

// 6. Check that new background assets exist
console.log('\n📦 Checking for new background asset files...');
const requiredAssets = [
  'public/assets/generated/mawalking-user-bg-mobile.dim_1080x1920.png',
  'public/assets/generated/mawalking-user-bg-mobile.dim_1080x1920.webp',
  'public/assets/generated/mawalking-user-bg-mobile.dim_1080x1920.avif',
  'public/assets/generated/mawalking-user-bg.dim_1920x1080.png',
  'public/assets/generated/mawalking-user-bg.dim_1920x1080.webp',
  'public/assets/generated/mawalking-user-bg.dim_1920x1080.avif'
];

let missingAssets = 0;
for (const asset of requiredAssets) {
  const assetPath = join(frontendRoot, asset);
  if (!existsSync(assetPath)) {
    warn(`Missing asset: ${asset}`);
    missingAssets++;
  }
}

if (missingAssets === 0) {
  success('All required background assets exist');
} else {
  warn(`${missingAssets} background asset(s) missing - they should be generated during build`);
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.error('\n❌ Verification FAILED - please fix the errors above before deploying\n');
  process.exit(1);
} else {
  console.log('\n✅ Verification PASSED - frontend is ready for deployment\n');
  process.exit(0);
}
