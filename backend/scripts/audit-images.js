import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedDir = path.join(__dirname, '../seed');

// Load files
const files = [
  { name: 'destinations', file: 'destinations.json', type: 'destination' },
  { name: 'spiritual', file: 'spiritual.json', type: 'spiritual' },
  { name: 'culture', file: 'culture.json', type: 'culture' },
  { name: 'activities', file: 'activities.json', type: 'activity' },
  { name: 'stays', file: 'stays.json', type: 'stay' },
  { name: 'rentals', file: 'rentals.json', type: 'rental' },
  { name: 'guides', file: 'guides.json', type: 'guide' }
];

console.log('=== STARTING IMAGE INTEGRITY AUDIT ===\n');

const report = [];

for (const { name, file, type } of files) {
  const filePath = path.join(seedDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`Missing file: ${filePath}`);
    continue;
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  const items = JSON.parse(raw);
  
  console.log(`Auditing ${name} (${items.length} records)...`);
  
  for (const item of items) {
    const entityId = item._id || item.slug || item.id;
    const entityName = item.name || item.title;
    
    // Check coverImage, gallery, images, image, profileImage, vehicles
    const checkImage = (img, fieldName) => {
      if (!img) return;
      let url = null;
      let imgEntityId = null;
      let imgEntityType = null;
      let alt = null;
      if (typeof img === 'string') {
        url = img;
      } else if (typeof img === 'object') {
        url = img.url;
        imgEntityId = img.entityId;
        imgEntityType = img.entityType;
        alt = img.alt;
      }
      
      if (!url) return;
      
      // Determine if image matches entity
      let match = true;
      let reason = 'OK';
      
      // If img has explicit entityId, it must match
      if (imgEntityId && imgEntityId !== entityId && imgEntityId !== item.slug) {
        match = false;
        reason = `Image entityId (${imgEntityId}) does not match record entityId (${entityId})`;
      }
      
      // Check for obvious cross-destination or contamination in URL or alt
      const urlLower = url.toLowerCase();
      const altLower = (alt || '').toLowerCase();
      const nameLower = (entityName || '').toLowerCase();
      const slugLower = (item.slug || '').toLowerCase();
      
      // Known key destinations
      const keyPlaces = [
        'kedarnath', 'badrinath', 'nainital', 'khurpatal', 'bhimtal',
        'mussoorie', 'rishikesh', 'auli', 'chopta', 'valley_of_flowers',
        'gangotri', 'yamunotri', 'haridwar', 'munsiyari', 'almora', 'kausani'
      ];
      
      // If the entity is NOT kedarnath, but image alt/url says kedarnath explicitly
      for (const kp of keyPlaces) {
        const cleanKp = kp.replace(/_/g, ' ');
        if (!nameLower.includes(cleanKp) && !slugLower.includes(kp) && !slugLower.includes(kp.replace(/_/g, '-'))) {
          // If url explicitly points to /assets/<kp>.jpg or mentions kp specifically in alt
          if (urlLower.includes(`/assets/${kp}.jpg`) || (altLower.includes(`${cleanKp} temple`) || altLower.includes(`${cleanKp} dham`))) {
            match = false;
            reason = `Entity is "${entityName}" (${slugLower}), but image is clearly for "${cleanKp}" (${url})`;
          }
        }
      }
      
      report.push({
        entityType: type,
        entityId: entityId || 'N/A',
        entityName: entityName || 'N/A',
        field: fieldName,
        imageUrl: url,
        imageEntityId: imgEntityId || 'implicit',
        match,
        reason
      });
    };
    
    checkImage(item.coverImage, 'coverImage');
    if (Array.isArray(item.gallery)) {
      item.gallery.forEach((g, idx) => checkImage(g, `gallery[${idx}]`));
    }
    if (Array.isArray(item.images)) {
      item.images.forEach((img, idx) => checkImage(img, `images[${idx}]`));
    }
    checkImage(item.image, 'image');
    checkImage(item.profileImage, 'profileImage');
    if (Array.isArray(item.vehicles)) {
      item.vehicles.forEach((v, idx) => checkImage(v.image, `vehicles[${idx}].image`));
    }
  }
}

const mismatches = report.filter(r => !r.match);
console.log(`\n=== AUDIT RESULTS ===`);
console.log(`Total image associations checked: ${report.length}`);
console.log(`Mismatches found: ${mismatches.length}`);

if (mismatches.length > 0) {
  console.log('\n--- MISMATCHES ---');
  mismatches.forEach(m => {
    console.log(`[${m.entityType}] ID: ${m.entityId} | Name: ${m.entityName} | Field: ${m.field}`);
    console.log(`  Image URL: ${m.imageUrl}`);
    console.log(`  Reason: ${m.reason}\n`);
  });
}

// Write report to json
fs.writeFileSync(path.join(__dirname, 'image-audit-report.json'), JSON.stringify({ total: report.length, mismatchesCount: mismatches.length, mismatches, all: report }, null, 2));
console.log('Saved full report to backend/scripts/image-audit-report.json');
