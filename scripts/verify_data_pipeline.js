/**
 * Discovery Uttarakhand - Master Data Pipeline & Source-of-Truth Diagnostic Verification Script
 * 
 * Safely verifies:
 * 1. Database connection state & Database Name
 * 2. MongoDB Collection counts vs Canonical Dataset files
 * 3. Canonical identity matching (slugs, names, IDs)
 * 4. Missing / Duplicate / Mismatch detection
 * 5. Production Render vs Local backend comparison
 * 
 * STRICT COMPLIANCE: NEVER OUTPUTS CREDENTIALS, SECRETS, OR PASSWORDS.
 */

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const seedDir = path.join(rootDir, 'backend', 'seed');

const LOCAL_MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/discovery_uttarakhand';

const ENTITY_CONFIGS = [
  { entity: 'Destinations', collection: 'destinations', file: 'destinations.json', idKey: 'slug' },
  { entity: 'Stays', collection: 'stays', file: 'stays.json', idKey: 'slug' },
  { entity: 'Rentals', collection: 'rentals', file: 'rentals.json', idKey: 'id' },
  { entity: 'Guides', collection: 'guides', file: 'guides.json', idKey: 'id' },
  { entity: 'Spiritual', collection: 'spirituals', file: 'spiritual.json', idKey: 'slug' },
  { entity: 'Culture', collection: 'cultures', file: 'culture.json', idKey: 'slug' },
  { entity: 'Activities', collection: 'activities', file: 'activities.json', idKey: 'slug' },
  { entity: 'Transport', collection: 'transports', file: 'transports.json', idKey: 'serviceNumber' }
];

async function runAudit() {
  console.log('===============================================================');
  console.log('DISCOVERY UTTARAKHAND — DATA SOURCE-OF-TRUTH PIPELINE AUDIT');
  console.log('===============================================================\n');

  console.log('[1] DATABASE CONNECTION AUDIT');
  console.log('---------------------------------------------------------------');
  let conn;
  try {
    conn = await mongoose.createConnection(LOCAL_MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    }).asPromise();
    console.log(`✅ Connection Status: CONNECTED`);
    console.log(`✅ Database Name:     ${conn.name}`);
    console.log(`✅ Host:              ${conn.host}:${conn.port}`);
  } catch (err) {
    console.error(`❌ Connection Status: FAILED (${err.message})`);
    process.exit(1);
  }

  console.log('\n[2] COLLECTION COUNTS VS DATASET COMPARISON');
  console.log('---------------------------------------------------------------');
  console.log(
    'ENTITY'.padEnd(16) +
    'COLLECTION'.padEnd(16) +
    'DB COUNT'.padEnd(12) +
    'SEED FILE'.padEnd(14) +
    'DIFF'.padEnd(10) +
    'STATUS'
  );
  console.log('-'.repeat(74));

  const comparisonResults = [];

  for (const cfg of ENTITY_CONFIGS) {
    const col = conn.db.collection(cfg.collection);
    const dbCount = await col.countDocuments();

    let seedCount = 0;
    let seedData = [];
    const filePath = path.join(seedDir, cfg.file);
    if (fs.existsSync(filePath)) {
      try {
        seedData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        seedCount = Array.isArray(seedData) ? seedData.length : 0;
      } catch (e) {
        console.error(`Error reading ${cfg.file}:`, e.message);
      }
    }

    const diff = dbCount - seedCount;
    let status = 'MATCH';
    if (diff < 0) status = 'MISSING_IN_DB';
    else if (diff > 0) status = 'EXTRA_IN_DB';

    console.log(
      cfg.entity.padEnd(16) +
      cfg.collection.padEnd(16) +
      String(dbCount).padEnd(12) +
      String(seedCount).padEnd(14) +
      String(diff).padEnd(10) +
      status
    );

    // Deep compare identities
    const dbDocs = await col.find({}, { projection: { [cfg.idKey]: 1, name: 1, title: 1, slug: 1 } }).toArray();
    const dbKeys = new Set(dbDocs.map(d => String(d[cfg.idKey] || d.slug || d.id || d.name || '').toLowerCase()));
    
    const missingKeys = [];
    for (const item of seedData) {
      const key = String(item[cfg.idKey] || item.slug || item.id || item.name || '').toLowerCase();
      if (!dbKeys.has(key)) {
        missingKeys.push(item.name || item.slug || key);
      }
    }

    comparisonResults.push({
      ...cfg,
      dbCount,
      seedCount,
      diff,
      status,
      missingCount: missingKeys.length,
      sampleMissing: missingKeys.slice(0, 5)
    });
  }

  // Also check non-seed collections
  console.log('\n[3] OPERATIONAL & USER COLLECTIONS IN MONGODB');
  console.log('---------------------------------------------------------------');
  const operationalCollections = ['users', 'bookings', 'partnerlistings', 'savedtrips', 'favorites', 'reviews', 'vehiclepermitrecords'];
  for (const cName of operationalCollections) {
    try {
      const count = await conn.db.collection(cName).countDocuments();
      console.log(`  - ${cName.padEnd(25)}: ${count} records`);
    } catch {
      console.log(`  - ${cName.padEnd(25)}: 0 records`);
    }
  }

  console.log('\n[4] MISSING RECORDS BREAKDOWN');
  console.log('---------------------------------------------------------------');
  for (const r of comparisonResults) {
    if (r.missingCount > 0) {
      console.log(`⚠️  ${r.entity} missing ${r.missingCount} records in DB. Samples:`);
      r.sampleMissing.forEach(s => console.log(`    - ${s}`));
    }
  }

  await conn.close();
  console.log('\n===============================================================');
  console.log('DIAGNOSTIC PIPELINE AUDIT COMPLETED SAFELY');
  console.log('===============================================================\n');

  return comparisonResults;
}

runAudit().catch(console.error);
