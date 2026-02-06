#!/usr/bin/env node

/**
 * Frontend Verification Script
 * 
 * Fast-fail verification that detects TypeScript compilation errors
 * before deployment, specifically targeting browser-incompatible typings.
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('');
  log(`${'='.repeat(60)}`, 'cyan');
  log(`  ${title}`, 'cyan');
  log(`${'='.repeat(60)}`, 'cyan');
  console.log('');
}

function checkForNodeJSTimeout() {
  logSection('Checking for NodeJS.Timeout usage');
  
  const appTsxPath = join(projectRoot, 'src', 'App.tsx');
  
  try {
    const content = readFileSync(appTsxPath, 'utf-8');
    
    if (content.includes('NodeJS.Timeout')) {
      log('❌ FAILED: Found browser-incompatible NodeJS.Timeout type', 'red');
      log('', 'reset');
      log('Location: frontend/src/App.tsx', 'yellow');
      log('Issue: NodeJS.Timeout is not available in browser environments', 'yellow');
      log('', 'reset');
      log('Fix: Replace with browser-safe timer types:', 'cyan');
      log('  - ReturnType<typeof setTimeout>', 'cyan');
      log('  - ReturnType<typeof setInterval>', 'cyan');
      log('  - number', 'cyan');
      return false;
    }
    
    log('✅ PASSED: No NodeJS.Timeout usage found', 'green');
    return true;
  } catch (error) {
    log(`⚠️  WARNING: Could not read App.tsx: ${error.message}`, 'yellow');
    return true; // Don't fail if file doesn't exist yet
  }
}

function runTypeCheck() {
  logSection('Running TypeScript Type Check');
  
  try {
    const output = execSync('npm run typescript-check', {
      cwd: projectRoot,
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    
    log('✅ PASSED: TypeScript compilation successful', 'green');
    return true;
  } catch (error) {
    log('❌ FAILED: TypeScript compilation errors detected', 'red');
    log('', 'reset');
    
    const output = error.stdout || error.stderr || '';
    
    // Check for specific error patterns
    if (output.includes('NodeJS.Timeout')) {
      log('Detected NodeJS.Timeout type error:', 'yellow');
      log('This is a browser-incompatible Node.js type.', 'yellow');
      log('', 'reset');
      log('Fix: Use browser-safe timer types instead:', 'cyan');
      log('  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);', 'cyan');
      log('  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);', 'cyan');
    }
    
    // Show relevant error output
    log('', 'reset');
    log('TypeScript Error Output:', 'red');
    log('─'.repeat(60), 'red');
    console.log(output);
    log('─'.repeat(60), 'red');
    
    return false;
  }
}

function checkAssetPaths() {
  logSection('Checking Asset Path References');
  
  const filesToCheck = [
    { path: 'src/App.tsx', patterns: ['/assets/generated/user-background.dim_1024x576.png'] },
    { path: 'index.html', patterns: ['/assets/generated/'] },
    { path: 'public/manifest.json', patterns: ['/assets/generated/'] },
    { path: 'public/service-worker.js', patterns: ['/assets/generated/user-background.dim_1024x576.png'] },
    { path: 'src/screens/SettingsAboutScreen.tsx', patterns: ['/assets/generated/user-background.dim_1024x576.png'] },
  ];
  
  let allPassed = true;
  
  for (const file of filesToCheck) {
    const filePath = join(projectRoot, file.path);
    
    try {
      const content = readFileSync(filePath, 'utf-8');
      const hasCorrectPaths = file.patterns.every(pattern => content.includes(pattern));
      
      // Check for old 1280x720 references
      const hasOldPath = content.includes('/assets/generated/user-background.dim_1280x720.png');
      
      if (hasOldPath) {
        log(`❌ ${file.path}: Still contains old 1280x720 background reference`, 'red');
        allPassed = false;
      } else if (hasCorrectPaths) {
        log(`✅ ${file.path}: Correct asset paths`, 'green');
      } else {
        log(`⚠️  ${file.path}: Missing expected asset paths`, 'yellow');
      }
    } catch (error) {
      log(`⚠️  ${file.path}: Could not verify (${error.message})`, 'yellow');
    }
  }
  
  return allPassed;
}

function main() {
  log('', 'reset');
  log('╔════════════════════════════════════════════════════════════╗', 'blue');
  log('║         Frontend Verification Script                      ║', 'blue');
  log('║         Checking for deployment-blocking issues           ║', 'blue');
  log('╚════════════════════════════════════════════════════════════╝', 'blue');
  
  const checks = [
    { name: 'NodeJS.Timeout Check', fn: checkForNodeJSTimeout },
    { name: 'TypeScript Compilation', fn: runTypeCheck },
    { name: 'Asset Path Verification', fn: checkAssetPaths },
  ];
  
  const results = checks.map(check => ({
    name: check.name,
    passed: check.fn(),
  }));
  
  logSection('Verification Summary');
  
  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    const color = result.passed ? 'green' : 'red';
    log(`${icon} ${result.name}`, color);
  });
  
  const allPassed = results.every(r => r.passed);
  
  log('', 'reset');
  log('─'.repeat(60), 'cyan');
  
  if (allPassed) {
    log('✅ ALL CHECKS PASSED - Ready for deployment', 'green');
    log('─'.repeat(60), 'cyan');
    process.exit(0);
  } else {
    log('❌ VERIFICATION FAILED - Fix errors before deploying', 'red');
    log('─'.repeat(60), 'cyan');
    process.exit(1);
  }
}

main();
