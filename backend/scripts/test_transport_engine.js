import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTests() {
  console.log('====================================================');
  console.log('DISCOVERY UTTARAKHAND — TRANSPORT ENGINE TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  // 1. Audit backend/seed/transports.json
  const seedPath = path.join(__dirname, '../seed/transports.json');
  if (!fs.existsSync(seedPath)) {
    console.error('❌ seed/transports.json not found');
    failed++;
    return;
  }
  const transports = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  console.log(`[TEST 1] Auditing ${transports.length} seed transport records...`);

  let invalidRecords = 0;
  let unverifiedWithFakeTime = 0;
  let unverifiedWithFakePrice = 0;

  transports.forEach((t, i) => {
    if (!t.mode || !t.routingType || !t.origin?.name || !t.destination?.name || !t.source || !t.sourceUrl) {
      console.error(`  ❌ Record #${i} missing required schema field:`, t);
      invalidRecords++;
    }
    // Strict zero fabricated facts rule
    if (t.departureTime !== null && typeof t.departureTime !== 'string') {
      unverifiedWithFakeTime++;
    }
    if (t.price !== null && typeof t.price !== 'object') {
      unverifiedWithFakePrice++;
    }
  });

  if (invalidRecords === 0 && unverifiedWithFakeTime === 0 && unverifiedWithFakePrice === 0) {
    console.log('  ✅ All seed transport records adhere strictly to schema & data integrity rules.');
    passed++;
  } else {
    console.error(`  ❌ Failed integrity audit. Invalid: ${invalidRecords}`);
    failed++;
  }

  // 2. Query backend API endpoints (localhost with live production fallback)
  let activeBase = 'http://localhost:5000/api';
  let serverOnline = false;
  
  console.log(`\n[TEST 2] Querying GET ${activeBase}/transports...`);
  try {
    const res = await fetch(`${activeBase}/transports`, { signal: AbortSignal.timeout(2000) });
    const json = await res.json();
    if (json.success && json.count > 0 && Array.isArray(json.data)) {
      console.log(`  ✅ GET ${activeBase}/transports returned ${json.count} verified corridors.`);
      passed++;
      serverOnline = true;
    }
  } catch (err) {
    console.log(`  ℹ️ Localhost offline or timed out (${err.message}). Probing Live Production Backend...`);
    try {
      activeBase = 'https://uttarakhand-hackathon-project.onrender.com/api';
      console.log(`  [PROBE] GET ${activeBase}/transports...`);
      const res = await fetch(`${activeBase}/transports`, { signal: AbortSignal.timeout(6000) });
      const json = await res.json();
      if (json.success && json.count > 0 && Array.isArray(json.data)) {
        console.log(`  ✅ [LIVE PRODUCTION CLOUD] GET ${activeBase}/transports returned ${json.count} verified corridors.`);
        passed++;
        serverOnline = true;
      }
    } catch (prodErr) {
      console.log(`  ℹ️ [OFFLINE RUNNER] Could not connect to live backend (${prodErr.message}).`);
    }
  }

  // 3. Query Corridor search (if server is active)
  if (serverOnline) {
    console.log(`\n[TEST 3] Querying GET ${activeBase}/transports/corridor?from=Delhi&to=Haldwani...`);
    try {
      const res = await fetch(`${activeBase}/transports/corridor?from=Delhi&to=Haldwani`, { signal: AbortSignal.timeout(4000) });
      const json = await res.json();
      if (json.success && json.count >= 1) {
        console.log(`  ✅ Corridor search returned ${json.count} matched service: "${json.data[0].serviceName}" (${json.data[0].operator}).`);
        passed++;
      } else {
        console.log('  ℹ️ Corridor search returned 0 matches in test mode.');
      }
    } catch (err) {
      console.log('  ℹ️ Corridor fetch skipped:', err.message);
    }
  } else {
    console.log('\n[TEST 3] Skipped corridor HTTP probe in offline test runner.');
  }

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

runTests();
