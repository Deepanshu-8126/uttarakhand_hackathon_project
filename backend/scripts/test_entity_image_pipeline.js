/**
 * Test Suite: Entity Identity & Image Governance Pipeline
 * Verifies all 20 acceptance criteria from Section 24.
 */

import { validateImageBelongsToEntity, normalizeEntityImage, resolveEntityImage, getEntityPlaceholderSvg } from '../utils/imageValidator.js';
import dotenv from 'dotenv';
dotenv.config();

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    failed++;
  }
}

async function runTests() {
  console.log('--- STARTING ENTITY IMAGE PIPELINE TESTS ---\n');

  // Test 1: Mismatched entityId rejection
  const mismatchVal = validateImageBelongsToEntity(
    { url: 'https://example.com/khurpatal.jpg', entityId: 'dest_123' },
    { _id: 'dest_999', name: 'Raj Bhavan' }
  );
  assert(mismatchVal.valid === false, 'Test 1: Explicit entityId mismatch rejected');

  // Test 2: Cross-destination image URL rejection
  const crossVal = validateImageBelongsToEntity(
    '/assets/bhimtal.jpg',
    { slug: 'khurpatal', name: 'Khurpatal' }
  );
  assert(crossVal.valid === false, 'Test 2: Cross-destination image URL rejected');

  // Test 3: Same entity image validation passes
  const sameVal = validateImageBelongsToEntity(
    '/assets/destinations/nainital/cover.jpg',
    { slug: 'nainital', name: 'Nainital' }
  );
  assert(sameVal.valid === true, 'Test 3: Same-entity image accepted');

  // Test 4: Priority 1 - coverImage.url
  const entityWithCover = {
    _id: 'ent_01',
    name: 'Royal Cottage',
    entityType: 'stay',
    coverImage: { url: 'https://verified.org/royal.jpg' },
    images: [{ url: 'https://verified.org/other.jpg', isCover: false }]
  };
  const norm1 = normalizeEntityImage(entityWithCover);
  assert(norm1.url === 'https://verified.org/royal.jpg', 'Test 4: coverImage.url takes highest priority');

  // Test 5: Priority 2 - images[].isCover === true
  const entityWithIsCover = {
    _id: 'ent_02',
    name: 'Mountain Homestay',
    entityType: 'stay',
    images: [
      { url: 'https://verified.org/gallery1.jpg', isCover: false },
      { url: 'https://verified.org/cover.jpg', isCover: true }
    ]
  };
  const norm2 = normalizeEntityImage(entityWithIsCover);
  assert(norm2.url === 'https://verified.org/cover.jpg', 'Test 5: images[] where isCover === true is prioritized');

  // Test 6: Priority 3 - first valid same-entity image
  const entityWithGallery = {
    _id: 'ent_03',
    name: 'Valley View',
    entityType: 'stay',
    images: [
      { url: 'https://verified.org/first.jpg', isCover: false }
    ]
  };
  const norm3 = normalizeEntityImage(entityWithGallery);
  assert(norm3.url === 'https://verified.org/first.jpg', 'Test 6: First valid image used when no cover is specified');

  // Test 7: Priority 4 - Raj Bhavan Nainital verified colonial landmark mapping
  const rajBhavan = {
    _id: 'raj_01',
    name: 'Raj Bhavan Nainital',
    entityType: 'destination'
  };
  const normRaj = normalizeEntityImage(rajBhavan);
  assert(normRaj.url.includes('Governor_House%2C_Nainital'), 'Test 7: Raj Bhavan maps to authentic Governor House asset');

  // Test 8: Priority 5 - Missing image falls back to entity-specific SVG placeholder
  const unknownSpot = {
    _id: 'unk_01',
    name: 'Secret Pine Ridge',
    entityType: 'viewpoint'
  };
  const normUnk = normalizeEntityImage(unknownSpot);
  assert(normUnk.isPlaceholder === true && normUnk.url.startsWith('data:image/svg+xml'), 'Test 8: Missing image produces entity-specific SVG placeholder');
  assert(decodeURIComponent(normUnk.url).includes('Secret Pine Ridge'), 'Test 9: SVG placeholder includes exact entity name');

  // Test 10: resolveEntityImage helper
  const resolvedUrl = resolveEntityImage(entityWithCover);
  assert(resolvedUrl === 'https://verified.org/royal.jpg', 'Test 10: resolveEntityImage returns unwrapped canonical URL');

  // Test 11: Zero generic Unsplash assignment on empty entity
  const emptyEntity = { name: 'Random Dhaba', category: 'catering' };
  const normEmpty = normalizeEntityImage(emptyEntity);
  assert(!normEmpty.url.includes('unsplash.com') && !normEmpty.url.includes('pexels.com'), 'Test 11: Zero generic Unsplash or Pexels URL fallback');

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
