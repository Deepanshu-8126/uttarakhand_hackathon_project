import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import mongoose from 'mongoose';
import { getDestinations } from '../controllers/destinationController.js';
import { getRentals } from '../controllers/rentalController.js';
import { getStays } from '../controllers/stayController.js';
import { getGuides } from '../controllers/guideController.js';

function createMockRes() {
  return {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    }
  };
}

async function testEndpoints() {
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
  console.log('✓ Connected to MongoDB for API endpoint verification\n');

  const results = {};

  // 1. GET /api/destinations
  try {
    const req = { query: { limit: 5 } };
    const res = createMockRes();
    await getDestinations(req, res);
    const docs = res.data?.data || res.data || [];
    const hasDbImages = docs.length > 0 && docs.every(d => d.coverImage?.url && typeof d.coverImage.url === 'string');
    results['/api/destinations'] = {
      status: res.statusCode,
      count: docs.length,
      sampleImage: docs[0]?.coverImage?.url,
      source: docs[0]?.coverImage?.source,
      pass: res.statusCode === 200 && hasDbImages
    };
  } catch (e) {
    results['/api/destinations'] = { pass: false, error: e.message };
  }

  // 2. GET /api/rentals
  try {
    const req = { query: { limit: 5 } };
    const res = createMockRes();
    await getRentals(req, res);
    const docs = res.data?.data || res.data || [];
    const hasDbImages = docs.length > 0 && docs.every(d => (d.images?.[0]?.url || d.vehicles?.[0]?.image?.url));
    results['/api/rentals'] = {
      status: res.statusCode,
      count: docs.length,
      sampleImage: docs[0]?.images?.[0]?.url || docs[0]?.vehicles?.[0]?.image?.url,
      source: docs[0]?.images?.[0]?.source || docs[0]?.vehicles?.[0]?.image?.source,
      pass: res.statusCode === 200 && hasDbImages
    };
  } catch (e) {
    results['/api/rentals'] = { pass: false, error: e.message };
  }

  // 3. GET /api/stays
  try {
    const req = { query: { limit: 5 } };
    const res = createMockRes();
    await getStays(req, res);
    const docs = res.data?.data || res.data || [];
    const hasDbImages = docs.length > 0 && docs.every(d => (d.images?.[0]?.url || d.image?.url || (typeof d.image === 'string' && d.image.length > 0)));
    results['/api/stays'] = {
      status: res.statusCode,
      count: docs.length,
      sampleImage: docs[0]?.images?.[0]?.url || docs[0]?.image?.url || docs[0]?.image,
      source: docs[0]?.images?.[0]?.source || docs[0]?.image?.source || docs[0]?.sourceName,
      pass: res.statusCode === 200 && hasDbImages
    };
  } catch (e) {
    results['/api/stays'] = { pass: false, error: e.message };
  }

  // 4. GET /api/guides
  try {
    const req = { query: { limit: 5 } };
    const res = createMockRes();
    await getGuides(req, res);
    const docs = res.data?.data || res.data || [];
    const hasDbImages = docs.length > 0 && docs.every(d => d.profileImage || d.avatar);
    results['/api/guides'] = {
      status: res.statusCode,
      count: docs.length,
      sampleImage: docs[0]?.profileImage || docs[0]?.avatar,
      pass: res.statusCode === 200 && hasDbImages
    };
  } catch (e) {
    results['/api/guides'] = { pass: false, error: e.message };
  }

  console.log('=== API ENDPOINT VERIFICATION RESULTS ===');
  for (const [endpoint, res] of Object.entries(results)) {
    console.log(`\nEndpoint:     ${endpoint}`);
    console.log(`Result:       ${res.pass ? 'PASS' : 'FAIL'}`);
    console.log(`HTTP Status:  ${res.status}`);
    console.log(`Record Count: ${res.count}`);
    console.log(`Sample Image: ${res.sampleImage}`);
    if (res.source) console.log(`Image Source: ${res.source}`);
  }

  await mongoose.disconnect();
}

testEndpoints().catch(err => {
  console.error('API Verification error:', err);
  process.exit(1);
});
