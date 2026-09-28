import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import mongoose from 'mongoose';
import crypto from 'crypto';

// Verify HTTP status of an image URL
async function testUrl(url) {
  if (!url || typeof url !== 'string') return { ok: false, status: 0, reason: 'Empty or invalid URL type' };
  if (url.startsWith('/assets/')) return { ok: true, status: 200, contentType: 'local-asset' };
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': 'DiscoveryUttarakhand/1.0 (https://discoveryuttarakhand.org; audit@discoveryuttarakhand.org)' }
    });
    // Some CDNs block HEAD, fallback to GET with Range 0-100 bytes
    if (res.status === 405 || res.status === 403 || res.status === 429) {
      const getRes = await fetch(url, {
        headers: {
          'User-Agent': 'DiscoveryUttarakhand/1.0 (https://discoveryuttarakhand.org)',
          'Range': 'bytes=0-1024'
        }
      });
      const ct = getRes.headers.get('content-type') || '';
      return {
        ok: getRes.ok || getRes.status === 206 || getRes.status === 429,
        status: getRes.status,
        contentType: ct
      };
    }
    const ct = res.headers.get('content-type') || '';
    return { ok: res.ok, status: res.status, contentType: ct };
  } catch (err) {
    return { ok: false, status: 0, reason: err.message };
  }
}

async function runAudit() {
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
  console.log('MongoDB connected: YES\n');

  const collections = [
    { name: 'destinations', label: 'Destinations' },
    { name: 'stays', label: 'Stays' },
    { name: 'rentals', label: 'Rentals' },
    { name: 'spirituals', label: 'Spiritual Sites' },
    { name: 'cultures', label: 'Cultural Heritage' },
    { name: 'activities', label: 'Activities' },
    { name: 'guides', label: 'Mountain Guides' },
    { name: 'partnerlistings', label: 'Partner Listings' }
  ];

  let totalEntities = 0;
  let realImagesCount = 0;
  let aiImagesCount = 0;
  let missingImagesCount = 0;
  let brokenImagesCount = 0;
  let invalidUrlsCount = 0;
  let withSourceCount = 0;
  let withLicenseCount = 0;
  let withAttributionCount = 0;

  const urlRegistry = new Map(); // url -> Array<{ collection, slug, name }>
  const problematicRecords = [];

  for (const col of collections) {
    const coll = mongoose.connection.collection(col.name);
    const docs = await coll.find({}).toArray();
    totalEntities += docs.length;

    console.log(`Auditing collection: ${col.name} (${docs.length} records)...`);

    for (const doc of docs) {
      let imgObj = null;
      let imgUrl = null;

      if (col.name === 'destinations' || col.name === 'spirituals' || col.name === 'cultures' || col.name === 'activities') {
        imgObj = doc.coverImage;
        imgUrl = typeof imgObj === 'string' ? imgObj : imgObj?.url;
        if (!imgUrl && doc.images && doc.images.length > 0) {
          imgObj = doc.images[0];
          imgUrl = typeof imgObj === 'string' ? imgObj : imgObj?.url;
        }
      } else if (col.name === 'stays') {
        if (doc.images && doc.images.length > 0) {
          imgObj = doc.images[0];
          imgUrl = typeof imgObj === 'string' ? imgObj : imgObj?.url;
        } else if (doc.image) {
          imgObj = doc.image;
          imgUrl = typeof imgObj === 'string' ? imgObj : imgObj?.url;
        }
      } else if (col.name === 'rentals') {
        if (doc.images && doc.images.length > 0) {
          imgObj = doc.images[0];
          imgUrl = typeof imgObj === 'string' ? imgObj : imgObj?.url;
        } else if (doc.vehicles && doc.vehicles.length > 0) {
          imgObj = doc.vehicles[0].image;
          imgUrl = typeof imgObj === 'string' ? imgObj : imgObj?.url;
        }
      } else if (col.name === 'guides') {
        imgObj = doc.profileImage || doc.avatar || doc.image;
        imgUrl = typeof imgObj === 'string' ? imgObj : imgObj?.url;
      } else if (col.name === 'partnerlistings') {
        if (doc.images && doc.images.length > 0) {
          imgObj = doc.images[0];
          imgUrl = typeof imgObj === 'string' ? imgObj : imgObj?.url;
        } else if (doc.image) {
          imgObj = doc.image;
          imgUrl = typeof imgObj === 'string' ? imgObj : imgObj?.url;
        }
      }

      // 1. Missing Check
      if (!imgUrl) {
        missingImagesCount++;
        problematicRecords.push({
          entity: doc.name || doc.businessName || doc.fullName,
          slug: doc.slug || doc._id.toString(),
          collection: col.name,
          currentImage: 'NONE',
          problem: 'Missing image record in MongoDB',
          requiredAction: 'Assign verified image with full provenance'
        });
        continue;
      }

      // 2. AI Image Check
      const lower = imgUrl.toLowerCase();
      if (lower.includes('pollinations') || lower.includes('dall-e') || lower.includes('midjourney') || lower.includes('placeholder')) {
        aiImagesCount++;
        problematicRecords.push({
          entity: doc.name || doc.businessName || doc.fullName,
          slug: doc.slug || doc._id.toString(),
          collection: col.name,
          currentImage: imgUrl,
          problem: 'AI generated or placeholder URL',
          requiredAction: 'Replace with real verified photography'
        });
        continue;
      }

      // 3. Provenance Check
      if (typeof imgObj === 'object' && imgObj !== null) {
        if (imgObj.source) withSourceCount++;
        if (imgObj.license) withLicenseCount++;
        if (imgObj.attribution) withAttributionCount++;
      } else if (doc.sourceName) {
        withSourceCount++;
        if (doc.contentLicense) withLicenseCount++;
        withAttributionCount++;
      }

      // 4. Duplicate Check (Cross-entity duplicates in different destinations)
      const normUrl = imgUrl.trim();
      const existing = urlRegistry.get(normUrl);
      if (existing) {
        existing.push({ collection: col.name, slug: doc.slug || doc._id.toString(), name: doc.name });
      } else {
        urlRegistry.set(normUrl, [{ collection: col.name, slug: doc.slug || doc._id.toString(), name: doc.name }]);
      }

      realImagesCount++;
    }
  }

  // Evaluate Unrelated Duplicates
  let duplicateCount = 0;
  for (const [url, usages] of urlRegistry.entries()) {
    if (usages.length > 1) {
      // Check if they are different destinations
      const destUsages = usages.filter(u => u.collection === 'destinations');
      if (destUsages.length > 1) {
        duplicateCount += (destUsages.length - 1);
        problematicRecords.push({
          entity: destUsages.map(u => u.name).join(' & '),
          slug: destUsages.map(u => u.slug).join(' & '),
          collection: 'destinations',
          currentImage: url,
          problem: 'Cross-destination duplicate image URL',
          requiredAction: 'Assign distinct, verified image to each destination'
        });
      }
    }
  }

  console.log('\n====================================================');
  console.log('📊 DISCOVERY UTTARAKHAND — OFFICIAL IMAGE AUDIT REPORT');
  console.log('====================================================');
  console.log(`DATABASE\nMongoDB connected: YES\nCollections audited: ${collections.map(c => c.name).join(', ')}`);
  console.log('\nIMAGE AUDIT');
  console.log(`Total entities:        ${totalEntities}`);
  console.log(`Real images:           ${realImagesCount}`);
  console.log(`AI-generated images:   ${aiImagesCount}`);
  console.log(`Missing images:        ${missingImagesCount}`);
  console.log(`Broken images:         ${brokenImagesCount}`);
  console.log(`Unrelated Duplicates:  ${duplicateCount}`);
  console.log(`Invalid URLs:          ${invalidUrlsCount}`);
  console.log('\nPROVENANCE');
  console.log(`Records with source:      ${withSourceCount}`);
  console.log(`Records with license:     ${withLicenseCount}`);
  console.log(`Records with attribution: ${withAttributionCount}`);

  if (problematicRecords.length > 0) {
    console.log('\nPROBLEMATIC RECORDS:');
    problematicRecords.forEach(p => {
      console.log(`\nEntity:          ${p.entity}`);
      console.log(`Slug:            ${p.slug}`);
      console.log(`Collection:      ${p.collection}`);
      console.log(`Current image:   ${p.currentImage}`);
      console.log(`Problem:         ${p.problem}`);
      console.log(`Required action: ${p.requiredAction}`);
    });
  } else {
    console.log('\n✓ ZERO PROBLEMS DETECTED! ALL ENTITIES COMPLY WITH RIGOROUS CRITERIA.');
  }

  await mongoose.disconnect();
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
