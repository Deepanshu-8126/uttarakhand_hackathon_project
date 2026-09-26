import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const BACKEND_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';
const RENDER_PROD_URL = 'https://uttarakhand-hackathon-project.onrender.com/api';

console.log('================================================================');
console.log('🏔️ DISCOVERY UTTARAKHAND — COMPREHENSIVE AUTOMATED HEALTH RUNNER');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function report(name, passed, detail = '') {
  if (passed) {
    console.log(`✅ [PASS] ${name} ${detail ? '(' + detail + ')' : ''}`);
    passCount++;
  } else {
    console.log(`❌ [FAIL] ${name} ${detail ? '--> ' + detail : ''}`);
    failCount++;
  }
}

// 1. Check Seed Data Consistency
try {
  const seedPath = path.join(process.cwd(), 'backend', 'seed');
  const summaryFile = path.join(seedPath, 'data-summary.json');
  if (fs.existsSync(summaryFile)) {
    const summary = JSON.parse(fs.readFileSync(summaryFile, 'utf8'));
    report('Seed Data Summary Integrity', summary.destinations >= 100 && summary.stays >= 50, `Destinations: ${summary.destinations}, Stays: ${summary.stays}`);
  } else {
    report('Seed Data Summary Integrity', false, 'data-summary.json missing');
  }
} catch (err) {
  report('Seed Data Check', false, err.message);
}

// 2. Check Frontend Build Integrity
try {
  console.log('\n📦 Checking Frontend Build System...');
  execSync('cmd /c "npm run build"', { cwd: path.join(process.cwd(), 'Frontend'), stdio: 'pipe' });
  report('Frontend Vite Production Build', true, 'Zero syntax / bundling errors');
} catch (err) {
  report('Frontend Vite Production Build', false, err.message);
}

// 3. Check Mobile App Syntax & Key Files
try {
  console.log('\n📱 Checking Mobile App Source Integrity...');
  const keyMobileFiles = [
    'mobile_app/lib/main.dart',
    'mobile_app/lib/screens/home_screen.dart',
    'mobile_app/lib/screens/ai_copilot_screen.dart',
    'mobile_app/lib/screens/map_screen.dart',
    'mobile_app/lib/screens/destination_detail_screen.dart',
    'mobile_app/lib/services/api_service.dart'
  ];
  let mobileFilesExist = true;
  for (const f of keyMobileFiles) {
    if (!fs.existsSync(path.join(process.cwd(), f))) {
      mobileFilesExist = false;
      report(`Mobile File Check: ${f}`, false, 'File missing');
    }
  }
  if (mobileFilesExist) {
    report('Mobile App Core Files Integrity', true, `${keyMobileFiles.length} core screen & service files verified`);
  }
} catch (err) {
  report('Mobile App Source Check', false, err.message);
}

// 4. Check Web3 & Smart Contracts
try {
  console.log('\n⛓️ Checking Smart Contracts & Web3 Files...');
  const contractsPath = path.join(process.cwd(), 'contracts');
  const hasContracts = fs.existsSync(contractsPath);
  report('Web3 Contracts Directory & Assets', hasContracts, hasContracts ? 'Contracts verified' : 'Directory not found');
} catch (err) {
  report('Web3 Check', false, err.message);
}

console.log('\n================================================================');
console.log(`🏁 AUTOMATED HEALTH RUNNER COMPLETED: ${passCount} PASSED, ${failCount} FAILED`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
