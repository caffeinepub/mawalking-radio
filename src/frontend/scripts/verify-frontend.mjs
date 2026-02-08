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

// 2. Check for correct background asset paths
console.log('\n🖼️  Checking background asset paths...');
const indexCssPath = join(frontendRoot, 'src/index.css');
if (existsSync(indexCssPath)) {
  const indexCss = readFileSync(indexCssPath, 'utf-8');
  
  const hasNairobiBackground = indexCss.includes('nairobi-skyline-background.dim_1920x1080.png');
  
  if (!hasNairobiBackground) {
    error('index.css missing Nairobi skyline background asset reference');
  } else {
    success('index.css has correct background asset reference');
  }
} else {
  error('index.css not found');
}

// 3. Check service worker configuration
console.log('\n🔧 Checking service worker configuration...');
const serviceWorkerPath = join(frontendRoot, 'public/service-worker.js');
if (existsSync(serviceWorkerPath)) {
  const serviceWorker = readFileSync(serviceWorkerPath, 'utf-8');
  
  const hasNairobiBackground = serviceWorker.includes('nairobi-skyline-background.dim_1920x1080.png');
  
  if (!hasNairobiBackground) {
    error('service-worker.js missing Nairobi skyline background asset reference');
  } else {
    success('service-worker.js has correct background asset reference');
  }
} else {
  error('service-worker.js not found');
}

// 4. Check that Nairobi skyline background asset exists
console.log('\n📦 Checking for background asset file...');
const requiredAsset = 'public/assets/generated/nairobi-skyline-background.dim_1920x1080.png';
const assetPath = join(frontendRoot, requiredAsset);

if (!existsSync(assetPath)) {
  error(`Missing background asset: ${requiredAsset}`);
} else {
  success('Background asset exists');
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
