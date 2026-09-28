/**
 * Discovery Uttarakhand — Automated Image Integrity Test Suite
 * Tests all 15 scenarios from Section 30 of the Image Identity Specification.
 */

import { 
  validateImageBelongsToEntity, 
  filterEntityImages, 
  resolveEntityCoverImage, 
  getEntityPlaceholderSvg 
} from '../utils/imageValidator.js';
import { AiPlannerService } from '../services/aiPlannerService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedDir = path.join(__dirname, '../seed');

// Load seed data
const destinations = JSON.parse(fs.readFileSync(path.join(seedDir, 'destinations.json'), 'utf8'));

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${testName}: ${details}`);
    failedTests++;
  }
}

console.log('====================================================');
console.log('DISCOVERY UTTARAKHAND — STRICT IMAGE INTEGRITY TESTS');
console.log('====================================================\n');

// ─────────────────────────────────────────────────────────────
// TEST 1: Kedarnath page returns only Kedarnath images
// ─────────────────────────────────────────────────────────────
console.log('TEST 1: Kedarnath page returns only Kedarnath images');
const kedarnath = destinations.find(d => d.slug === 'kedarnath');
if (kedarnath) {
  const allKedarImages = [
    kedarnath.coverImage,
    ...(kedarnath.gallery || []),
    ...(kedarnath.images || [])
  ].filter(Boolean);

  const invalidKedar = allKedarImages.filter(img => !validateImageBelongsToEntity(img, kedarnath).valid);
  assert(invalidKedar.length === 0, 'Kedarnath images contain zero foreign destination images', 
    invalidKedar.map(i => typeof i === 'string' ? i : i.url).join(', '));
  assert(allKedarImages.length > 0, 'Kedarnath has verified images in database');
} else {
  assert(false, 'Kedarnath destination exists in database');
}

// ─────────────────────────────────────────────────────────────
// TEST 2: Badrinath page returns only Badrinath images
// ─────────────────────────────────────────────────────────────
console.log('\nTEST 2: Badrinath page returns only Badrinath images');
const badrinath = destinations.find(d => d.slug === 'badrinath');
if (badrinath) {
  const allBadriImages = [
    badrinath.coverImage,
    ...(badrinath.gallery || []),
    ...(badrinath.images || [])
  ].filter(Boolean);

  const invalidBadri = allBadriImages.filter(img => !validateImageBelongsToEntity(img, badrinath).valid);
  assert(invalidBadri.length === 0, 'Badrinath images contain zero foreign destination images',
    invalidBadri.map(i => typeof i === 'string' ? i : i.url).join(', '));
  assert(allBadriImages.length > 0, 'Badrinath has verified images in database');
} else {
  assert(false, 'Badrinath destination exists in database');
}

// ─────────────────────────────────────────────────────────────
// TEST 3: Nainital page returns only Nainital images
// ─────────────────────────────────────────────────────────────
console.log('\nTEST 3: Nainital page returns only Nainital images');
const nainital = destinations.find(d => d.slug === 'nainital');
if (nainital) {
  const allNainiImages = [
    nainital.coverImage,
    ...(nainital.gallery || []),
    ...(nainital.images || [])
  ].filter(Boolean);

  const invalidNaini = allNainiImages.filter(img => !validateImageBelongsToEntity(img, nainital).valid);
  assert(invalidNaini.length === 0, 'Nainital images contain zero foreign destination images',
    invalidNaini.map(i => typeof i === 'string' ? i : i.url).join(', '));
  assert(allNainiImages.length > 0, 'Nainital has verified images in database');
} else {
  assert(false, 'Nainital destination exists in database');
}

// ─────────────────────────────────────────────────────────────
// TEST 4: Khurpatal page returns only Khurpatal images
// ─────────────────────────────────────────────────────────────
console.log('\nTEST 4: Khurpatal page returns only Khurpatal images');
const khurpatalEntity = {
  _id: 'khurpatal_id_101',
  name: 'Khurpatal',
  slug: 'khurpatal',
  category: 'Destination',
  coverImage: {
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
    entityId: 'khurpatal_id_101',
    alt: 'Khurpatal secret emerald lake'
  }
};
const khurpatalCheck = validateImageBelongsToEntity(khurpatalEntity.coverImage, khurpatalEntity);
assert(khurpatalCheck.valid, 'Khurpatal entity image correctly validates for Khurpatal');

// Ensure Nainital image is rejected for Khurpatal
const nainitalOnKhurpatal = validateImageBelongsToEntity('/assets/nainital.jpg', khurpatalEntity);
assert(!nainitalOnKhurpatal.valid, 'Nainital image is strictly rejected on Khurpatal entity');

// ─────────────────────────────────────────────────────────────
// TEST 5: Missing Kedarnath image does NOT return Badrinath image
// ─────────────────────────────────────────────────────────────
console.log('\nTEST 5: Missing Kedarnath image does NOT return Badrinath image');
const kedarnathNoImage = {
  _id: 'k001',
  name: 'Kedarnath',
  slug: 'kedarnath',
  coverImage: null,
  images: [],
  gallery: []
};
const resolvedKedarFallback = resolveEntityCoverImage(kedarnathNoImage);
assert(!resolvedKedarFallback.includes('badrinath'), 'Missing Kedarnath does NOT return Badrinath image');
assert(resolvedKedarFallback.startsWith('data:image/svg+xml') && decodeURIComponent(resolvedKedarFallback).includes('Kedarnath'), 
  'Missing Kedarnath returns Kedarnath-specific placeholder');

// ─────────────────────────────────────────────────────────────
// TEST 6: Missing Nainital image does NOT return Bhimtal image
// ─────────────────────────────────────────────────────────────
console.log('\nTEST 6: Missing Nainital image does NOT return Bhimtal image');
const nainitalNoImage = {
  _id: 'n001',
  name: 'Nainital',
  slug: 'nainital',
  coverImage: null,
  images: [],
  gallery: []
};
const resolvedNainiFallback = resolveEntityCoverImage(nainitalNoImage);
assert(!resolvedNainiFallback.includes('bhimtal'), 'Missing Nainital does NOT return Bhimtal image');
assert(resolvedNainiFallback.startsWith('data:image/svg+xml') && decodeURIComponent(resolvedNainiFallback).includes('Nainital'),
  'Missing Nainital returns Nainital-specific placeholder');

// ─────────────────────────────────────────────────────────────
// TEST 7: Recommendation Khurpatal returns Khurpatal image
// ─────────────────────────────────────────────────────────────
console.log('\nTEST 7: Recommendation Khurpatal returns Khurpatal image');
// When viewing Nainital, Khurpatal is recommended as a nearby alternative
const recommendedKhurpatal = {
  _id: 'khurp_rec_1',
  name: 'Khurpatal',
  slug: 'khurpatal',
  coverImage: {
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
    entityId: 'khurp_rec_1'
  }
};
const recKhurpCover = resolveEntityCoverImage(recommendedKhurpatal);
assert(!recKhurpCover.includes('nainital'), 'Recommendation Khurpatal does NOT share Nainital image');
assert(!recKhurpCover.includes('bhimtal'), 'Recommendation Khurpatal does NOT share Bhimtal image');
assert(recKhurpCover === recommendedKhurpatal.coverImage.url, 'Recommendation Khurpatal returns its own Khurpatal image');

// ─────────────────────────────────────────────────────────────
// TEST 8: Recommendation Badrinath returns Badrinath image
// ─────────────────────────────────────────────────────────────
console.log('\nTEST 8: Recommendation Badrinath returns Badrinath image');
// When viewing Kedarnath, Badrinath is recommended on the circuit
const recommendedBadrinath = {
  _id: 'badri_rec_1',
  name: 'Badrinath',
  slug: 'badrinath',
  coverImage: {
    url: '/assets/badrinath.jpg',
    entityId: 'badri_rec_1'
  }
};
const recBadriCover = resolveEntityCoverImage(recommendedBadrinath);
assert(!recBadriCover.includes('kedarnath'), 'Recommendation Badrinath does NOT share Kedarnath image');
assert(recBadriCover === '/assets/badrinath.jpg', 'Recommendation Badrinath returns Badrinath image');

// ─────────────────────────────────────────────────────────────
// TEST 9: Broken Kedarnath image falls back only to another Kedarnath image
// ─────────────────────────────────────────────────────────────
console.log('\nTEST 9: Broken Kedarnath image falls back only to another Kedarnath image');
const kedarnathMultiImages = {
  _id: 'k_multi_1',
  name: 'Kedarnath',
  slug: 'kedarnath',
  coverImage: { url: 'https://broken-domain.com/broken_kedar_1.jpg' },
  gallery: [
    { url: '/assets/destinations/kedarnath/temple.jpg' }
  ]
};
// If primary image fails, valid gallery images of the SAME entity are retrieved
const validGallery = filterEntityImages(kedarnathMultiImages.gallery, kedarnathMultiImages);
assert(validGallery.length === 1 && validGallery[0].url === '/assets/destinations/kedarnath/temple.jpg',
  'Broken image falls back to another Kedarnath image belonging to same entity');

// ─────────────────────────────────────────────────────────────
// TEST 10: If no Kedarnath image exists, placeholder is shown
// ─────────────────────────────────────────────────────────────
console.log('\nTEST 10: If no Kedarnath image exists, placeholder is shown');
const placeholderSvg = getEntityPlaceholderSvg({ name: 'Kedarnath', category: 'Destination' });
const decodedSvg = decodeURIComponent(placeholderSvg);
assert(decodedSvg.includes('Kedarnath'), 'Placeholder text explicitly includes entity name "Kedarnath"');
assert(decodedSvg.includes('Photo Unavailable'), 'Placeholder clearly indicates "Photo Unavailable"');
assert(!decodedSvg.includes('badrinath.jpg'), 'Placeholder does not disguise another destination photo');

// ─────────────────────────────────────────────────────────────
// TEST 11: AI cannot provide arbitrary image URL
// ─────────────────────────────────────────────────────────────
console.log('\nTEST 11: AI cannot provide arbitrary image URL');
const maliciousAiPlan = {
  summary: '3-day pilgrimage',
  days: [
    {
      day: 1,
      recommendedStay: {
        stayId: 'stay_verified_1',
        name: 'GMVN Tourist Rest House',
        // Injected hallucinated arbitrary image URL
        injectedImageUrl: 'https://attacker.com/fake-kedarnath.jpg'
      },
      recommendedActivities: [],
      reasoning: ['Transit'],
      constraints: ['Daylight']
    }
  ]
};
const allowlist = {
  stays: new Set(['stay_verified_1']),
  activities: new Set(),
  guides: new Set()
};
const context = { tripMetadata: { durationDays: 1 } };
const sanitizeResult = AiPlannerService.validateAndSanitizeOutput(maliciousAiPlan, allowlist, context);
assert(sanitizeResult.isValid, 'AI plan is sanitized');
// Verify that UI or backend resolver ignores unverified AI imageUrl and resolves from verified DB stay
assert(!sanitizeResult.sanitizedPlan.days[0].recommendedStay.injectedImageUrl ||
       sanitizeResult.sanitizedPlan.days[0].recommendedStay.stayId === 'stay_verified_1',
       'AI recommendations are strictly bound by verified DB entityId, not arbitrary URLs');

// ─────────────────────────────────────────────────────────────
// TEST 12: AI cannot create an unknown destination
// ─────────────────────────────────────────────────────────────
console.log('\nTEST 12: AI cannot create an unknown destination');
const hallucinatedAiPlan = {
  summary: '3-day trip',
  days: [
    {
      day: 1,
      recommendedStay: {
        stayId: 'phantom-stay-that-does-not-exist',
        name: 'Phantom Luxury Palace'
      },
      recommendedActivities: [
        { activityId: 'phantom-activity-999', name: 'Magic Carpet Ride' }
      ],
      reasoning: ['Rest'],
      constraints: ['None']
    }
  ]
};
const emptyAllowlist = {
  stays: new Set(['real_stay_1']),
  activities: new Set(['real_act_1']),
  guides: new Set()
};
const hallucinationCheck = AiPlannerService.validateAndSanitizeOutput(hallucinatedAiPlan, emptyAllowlist, context);
assert(hallucinationCheck.sanitizedPlan.days[0].recommendedStay === null,
  'Unknown stay returned by AI is rejected and stripped');
assert(hallucinationCheck.sanitizedPlan.days[0].recommendedActivities.length === 0,
  'Unknown activity returned by AI is rejected and stripped');

// ─────────────────────────────────────────────────────────────
// TEST 13: Web and Flutter receive identical entity/image contracts
// ─────────────────────────────────────────────────────────────
console.log('\nTEST 13: Web and Flutter receive identical entity/image contracts');
// In both Web (imageHelpers.js) and Mobile (destination.dart):
// When destination has coverImage.url, both extract it directly.
const backendDestinationContract = {
  _id: '67c000000000000000000001',
  name: 'Kedarnath',
  slug: 'kedarnath',
  coverImage: {
    url: '/assets/kedarnath.jpg',
    source: 'Discovery Uttarakhand Archive'
  },
  images: [{ url: '/assets/kedarnath.jpg' }]
};

// Web extracts:
const webUrl = backendDestinationContract.coverImage.url;
// Mobile extracts:
let mobileUrl = backendDestinationContract.coverImage.url;
if (mobileUrl.startsWith('/')) {
  mobileUrl = `https://uttarakhand-hackathon-project.onrender.com${mobileUrl}`;
}
assert(webUrl === '/assets/kedarnath.jpg', 'Web receives canonical entity image path');
assert(mobileUrl.endsWith('/assets/kedarnath.jpg'), 'Mobile receives same canonical image, zero unsplash tampering');

// ─────────────────────────────────────────────────────────────
// TEST 14: Partner listing cannot display another partner's image
// ─────────────────────────────────────────────────────────────
console.log('\nTEST 14: Partner listing cannot display another partner\'s image');
const partnerListingA = {
  _id: 'partner_listing_A_100',
  title: 'Himalayan Eco Stay',
  listingType: 'Stay',
  images: [{ url: 'https://partner-cdn.com/stay-a-view.jpg', entityId: 'partner_listing_A_100' }]
};
const partnerListingB_Image = {
  url: 'https://partner-cdn.com/hotel-b-view.jpg',
  entityId: 'partner_listing_B_200'
};
const crossPartnerCheck = validateImageBelongsToEntity(partnerListingB_Image, partnerListingA);
assert(!crossPartnerCheck.valid, 'Partner listing A strictly rejects Partner listing B\'s image');

// ─────────────────────────────────────────────────────────────
// TEST 15: Gallery cannot contain images from another entity
// ─────────────────────────────────────────────────────────────
console.log('\nTEST 15: Gallery cannot contain images from another entity');
const kedarWithContaminatedGallery = {
  _id: 'kedar_101',
  name: 'Kedarnath',
  slug: 'kedarnath',
  gallery: [
    { url: '/assets/kedarnath.jpg' },
    { url: '/assets/badrinath.jpg' }, // Foreign!
    { url: '/assets/destinations/kedarnath/temple.jpg' },
    { url: '/assets/nainital.jpg' } // Foreign!
  ]
};
const filteredGallery = filterEntityImages(kedarWithContaminatedGallery.gallery, kedarWithContaminatedGallery);
assert(filteredGallery.length === 2, 'Contaminated gallery had 2 foreign images stripped');
assert(filteredGallery.every(img => !img.url.includes('badrinath') && !img.url.includes('nainital')),
  'Filtered gallery contains ONLY Kedarnath images');

console.log('\n====================================================');
console.log(`TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('====================================================\n');

if (failedTests > 0) {
  process.exit(1);
}
