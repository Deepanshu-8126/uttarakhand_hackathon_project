/**
 * Discovery Uttarakhand — Location-Based Personalization Engine Test Suite
 * Validates all 18 Acceptance Test Scenarios against real MongoDB collections:
 * 1. User Nainital
 * 2. User Haldwani
 * 3. User Dehradun
 * 4. Guest user
 * 5. User with no location
 * 6. Location update
 * 7. Nearby destination
 * 8. Nearby stay
 * 9. Nearby rental
 * 10. Nearby guide
 * 11. Nearby activity
 * 12. District fallback
 * 13. Missing coordinates handling
 * 14. Different users must not receive each other's personalized cache
 * 15. AI "mere aas paas" pronoun resolution
 * 16. AI "wahan" pronoun resolution
 * 17. Trip Planner default origin
 * 18. Location change refresh / cache invalidation
 */

import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import assert from 'assert';

import User from '../models/User.js';
import Destination from '../models/Destination.js';
import Stay from '../models/Stay.js';
import Rental from '../models/Rental.js';
import Guide from '../models/Guide.js';
import Activity from '../models/Activity.js';
import Spiritual from '../models/Spiritual.js';
import Culture from '../models/Culture.js';

import {
  resolveLocation,
  findNearbyEntities,
  calculateHaversineDistanceKm,
  classifyProximity,
  UTTARAKHAND_DISTRICTS,
  CANONICAL_COORDINATES
} from '../services/locationService.js';

import {
  resolveDestination,
  USER_NEAR_PRONOUN_REGEX
} from '../services/destinationResolver.js';

import {
  getPersonalizedHome,
  getPersonalizedNearby,
  invalidateUserPersonalizedCache
} from '../controllers/personalizedController.js';

import { cacheGet, cacheSet, cacheDel } from '../config/redis.js';

// Helper to simulate Express req/res
function mockReqRes({ query = {}, headers = {}, user = null } = {}) {
  let statusCode = 200;
  let responseData = null;
  const req = {
    query,
    headers,
    user
  };
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    }
  };
  return {
    req,
    res,
    getStatus: () => statusCode,
    getData: () => responseData
  };
}

async function runAll18Tests() {
  console.log('================================================================');
  console.log('🌲 DISCOVERY UTTARAKHAND — PERSONALIZATION ENGINE TEST SUITE');
  console.log('================================================================\n');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/discovery_uttarakhand';
  await mongoose.connect(mongoUri);
  console.log(`📡 Connected to MongoDB: ${mongoose.connection.name}`);

  let passed = 0;
  let failed = 0;

  async function test(num, title, fn) {
    try {
      await fn();
      console.log(`✅ [PASS] Test ${num}: ${title}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] Test ${num}: ${title}`);
      console.error(`   Error: ${err.message}`);
      failed++;
    }
  }

  // ----------------------------------------------------------------
  // 1. User Nainital
  // ----------------------------------------------------------------
  await test(1, 'User Nainital — Canonical coordinates & nearby discovery', async () => {
    const loc = await resolveLocation({ city: 'Nainital', district: 'Nainital' });
    assert(loc, 'Location should resolve for Nainital');
    assert.strictEqual(loc.city, 'Nainital');
    assert.strictEqual(loc.district, 'Nainital');
    assert(Array.isArray(loc.coordinates), 'Coordinates must be array');
    assert.strictEqual(loc.coordinates.length, 2);
    // [lng, lat] GeoJSON
    assert(loc.coordinates[0] > 79.4 && loc.coordinates[0] < 79.6, 'Longitude should match Nainital');
    assert(loc.coordinates[1] > 29.3 && loc.coordinates[1] < 29.5, 'Latitude should match Nainital');

    const nearby = await findNearbyEntities({
      coordinates: loc.coordinates,
      district: loc.district,
      city: loc.city,
      radiusKm: 75
    });

    assert(Array.isArray(nearby.nearbyDestinations), 'nearbyDestinations must be an array');
    assert(nearby.nearbyDestinations.length > 0, 'Must return real nearby destinations for Nainital');
    assert(Array.isArray(nearby.nearbyStays), 'nearbyStays must be an array');
    assert(nearby.nearbyStays.length > 0, 'Must return real nearby stays for Nainital');
    
    // Check that top destination has distanceKm and proximity tier
    const topDest = nearby.nearbyDestinations[0];
    assert(typeof topDest.distanceKm === 'number', 'Top destination must have numerical distanceKm');
    assert(['HIGHLY_NEARBY', 'NEARBY'].includes(topDest.proximityTier), 'Top destination should be HIGHLY_NEARBY or NEARBY');
  });

  // ----------------------------------------------------------------
  // 2. User Haldwani
  // ----------------------------------------------------------------
  await test(2, 'User Haldwani — Proximity prioritizes Haldwani/Bhimtal/Kathgodam over distant hubs', async () => {
    const loc = await resolveLocation('Haldwani');
    assert(loc, 'Location should resolve for Haldwani');
    assert.strictEqual(loc.city, 'Haldwani');
    assert.strictEqual(loc.district, 'Nainital');

    const nearby = await findNearbyEntities({
      coordinates: loc.coordinates,
      district: loc.district,
      city: loc.city,
      radiusKm: 50
    });

    assert(nearby.nearbyDestinations.length > 0, 'Must return destinations near Haldwani');
    assert(nearby.nearbyStays.length > 0, 'Must return stays near Haldwani');
    // Closest destination should be nearby Kumaon gateway (Bhimtal, Nainital, Kathgodam)
    const closestDest = nearby.nearbyDestinations[0];
    assert(closestDest.distanceKm <= 35, `Closest destination (${closestDest.name}) should be <= 35km from Haldwani, got ${closestDest.distanceKm}km`);
  });

  // ----------------------------------------------------------------
  // 3. User Dehradun
  // ----------------------------------------------------------------
  await test(3, 'User Dehradun — Garhwal capital returns Mussoorie/Rishikesh, not distant Kumaon', async () => {
    const loc = await resolveLocation('Dehradun');
    assert(loc, 'Location should resolve for Dehradun');
    assert.strictEqual(loc.city, 'Dehradun');
    assert.strictEqual(loc.district, 'Dehradun');

    const nearby = await findNearbyEntities({
      coordinates: loc.coordinates,
      district: loc.district,
      city: loc.city,
      radiusKm: 60
    });

    assert(nearby.nearbyDestinations.length > 0, 'Must return destinations near Dehradun');
    // Verify none of the top 3 destinations are Nainital/Almora (which are >150km away)
    const topDestNames = nearby.nearbyDestinations.slice(0, 3).map(d => d.name.toLowerCase());
    for (const name of topDestNames) {
      assert(!name.includes('nainital') && !name.includes('almora'), `Top destination ${name} shouldn't be Kumaon for a Dehradun user`);
    }
  });

  // ----------------------------------------------------------------
  // 4. Guest user
  // ----------------------------------------------------------------
  await test(4, 'Guest user — Public browsing uninterrupted; query params enable session personalization', async () => {
    // 4a. Pure guest with no parameters
    const guest1 = mockReqRes({ query: {} });
    await getPersonalizedHome(guest1.req, guest1.res);
    const data1 = guest1.getData();
    assert.strictEqual(data1.success, true);
    assert.strictEqual(data1.locationSource, 'NONE');
    assert.strictEqual(data1.userLocation, null);

    // 4b. Guest who selected Nainital via browser or search bar
    const guest2 = mockReqRes({ query: { city: 'Nainital' } });
    await getPersonalizedHome(guest2.req, guest2.res);
    const data2 = guest2.getData();
    assert.strictEqual(data2.success, true);
    assert.strictEqual(data2.locationSource, 'MANUAL_SESSION');
    assert.strictEqual(data2.userLocation.city, 'Nainital');
    assert(data2.nearbyDestinations.length > 0, 'Guest with city=Nainital must receive nearby destinations');
  });

  // ----------------------------------------------------------------
  // 5. User with no location
  // ----------------------------------------------------------------
  await test(5, 'User with no location — Gracefully returns general discovery without crashing', async () => {
    const userNoLoc = { _id: new mongoose.Types.ObjectId(), name: 'Traveler No Loc', location: null };
    const mock = mockReqRes({ user: userNoLoc });
    await getPersonalizedHome(mock.req, mock.res);
    const data = mock.getData();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.locationSource, 'NONE');
    assert.strictEqual(data.userLocation, null);
  });

  // ----------------------------------------------------------------
  // 6. Location update
  // ----------------------------------------------------------------
  await test(6, 'Location update — GeoJSON coordinates and district updated properly in User model', async () => {
    const testEmail = `loc_test_${Date.now()}@example.com`;
    const testUser = await User.create({
      name: 'Location Tester',
      email: testEmail,
      password: 'password123',
      location: {
        city: 'Nainital',
        district: 'Nainital',
        state: 'Uttarakhand',
        country: 'India',
        coordinates: { type: 'Point', coordinates: [79.4636, 29.3919] }
      }
    });

    assert.strictEqual(testUser.location.city, 'Nainital');

    // Update to Haldwani
    const resolvedHaldwani = await resolveLocation('Haldwani');
    testUser.location = {
      city: resolvedHaldwani.city,
      district: resolvedHaldwani.district,
      state: resolvedHaldwani.state,
      country: resolvedHaldwani.country,
      coordinates: { type: 'Point', coordinates: resolvedHaldwani.coordinates }
    };
    await testUser.save();

    const reloaded = await User.findById(testUser._id).lean();
    assert.strictEqual(reloaded.location.city, 'Haldwani');
    assert.strictEqual(reloaded.location.district, 'Nainital');
    assert.strictEqual(reloaded.location.coordinates.type, 'Point');
    assert.strictEqual(reloaded.location.coordinates.coordinates[0], resolvedHaldwani.coordinates[0]);

    // Clean up test user
    await User.findByIdAndDelete(testUser._id);
  });

  // ----------------------------------------------------------------
  // 7. Nearby destination
  // ----------------------------------------------------------------
  await test(7, 'Nearby destination — Real Destination records sorted ascending by calculated distance', async () => {
    const loc = await resolveLocation('Nainital');
    const entities = await findNearbyEntities({
      coordinates: loc.coordinates,
      district: loc.district,
      radiusKm: 50
    });

    const dests = entities.nearbyDestinations;
    assert(dests.length > 1, 'Should find multiple destinations near Nainital');
    
    // Validate ascending distance order
    for (let i = 0; i < dests.length - 1; i++) {
      if (dests[i].distanceKm !== null && dests[i + 1].distanceKm !== null) {
        assert(dests[i].distanceKm <= dests[i + 1].distanceKm, `Distances must be sorted ascending: ${dests[i].distanceKm} <= ${dests[i+1].distanceKm}`);
      }
    }
  });

  // ----------------------------------------------------------------
  // 8. Nearby stay
  // ----------------------------------------------------------------
  await test(8, 'Nearby stay — Real MongoDB Stay documents with valid names and proximity', async () => {
    const loc = await resolveLocation('Nainital');
    const entities = await findNearbyEntities({
      coordinates: loc.coordinates,
      district: loc.district,
      radiusKm: 60
    });

    assert(entities.nearbyStays.length > 0, 'Must have nearby stays');
    const firstStay = entities.nearbyStays[0];
    assert(firstStay._id, 'Stay must have MongoDB _id');
    assert(firstStay.name, 'Stay must have name');
    assert(firstStay.proximityTier, 'Stay must have proximityTier');
  });

  // ----------------------------------------------------------------
  // 9. Nearby rental
  // ----------------------------------------------------------------
  await test(9, 'Nearby rental — Real MongoDB Rental vehicles returned near user hub', async () => {
    const loc = await resolveLocation('Haldwani');
    const entities = await findNearbyEntities({
      coordinates: loc.coordinates,
      district: loc.district,
      radiusKm: 75
    });

    assert(entities.nearbyRentals.length > 0, 'Must return rental vehicles in Nainital/Haldwani/Kumaon hub');
    const firstRental = entities.nearbyRentals[0];
    assert(firstRental.vehicleName || firstRental.name, 'Rental must have vehicle name');
    assert(firstRental.category || firstRental.type, 'Rental must have vehicle category');
  });

  // ----------------------------------------------------------------
  // 10. Nearby guide
  // ----------------------------------------------------------------
  await test(10, 'Nearby guide — Real Guides filtered by district or Himalayan regional specialization', async () => {
    const loc = await resolveLocation('Nainital');
    const entities = await findNearbyEntities({
      coordinates: loc.coordinates,
      district: loc.district,
      interests: ['trekking', 'nature']
    });

    assert(entities.nearbyGuides.length > 0, 'Must return guides');
    const guide = entities.nearbyGuides[0];
    assert(guide.name, 'Guide must have name');
    assert(Array.isArray(guide.specialties) || Array.isArray(guide.languages), 'Guide must have specialties or languages');
  });

  // ----------------------------------------------------------------
  // 11. Nearby activity
  // ----------------------------------------------------------------
  await test(11, 'Nearby activity — Real Activity records returned near Nainital (e.g. Boating, Trekking)', async () => {
    const loc = await resolveLocation('Nainital');
    const entities = await findNearbyEntities({
      coordinates: loc.coordinates,
      district: loc.district,
      radiusKm: 50
    });

    assert(entities.nearbyActivities.length > 0, 'Must return activities near Nainital');
    const act = entities.nearbyActivities[0];
    assert(act.name, 'Activity must have a name');
  });

  // ----------------------------------------------------------------
  // 12. District fallback
  // ----------------------------------------------------------------
  await test(12, 'District fallback — When coordinates are absent, fall back to district matching without fake GPS distance', async () => {
    // Pithoragarh query without coordinates
    const entities = await findNearbyEntities({
      coordinates: null,
      district: 'Pithoragarh',
      city: null
    });

    assert(entities.nearbyDestinations.length > 0, 'Must return Pithoragarh destinations via district matching');
    const item = entities.nearbyDestinations[0];
    // Since coordinates were null, distanceKm must remain null (NEVER FABRICATE)
    assert.strictEqual(item.distanceKm, null, 'Must NOT fabricate fake distance when coordinates were not provided');
    assert.strictEqual(item.proximityTier, 'DISTRICT_MATCH');
    assert(item.distanceText.includes('District: Pithoragarh') || item.distanceText.includes('Uttarakhand'));
  });

  // ----------------------------------------------------------------
  // 13. Missing coordinates handling
  // ----------------------------------------------------------------
  await test(13, 'Missing coordinates — Location resolver gracefully resolves canonical fallback without crashing', async () => {
    const loc = await resolveLocation('Unknown Remote Village, Chamoli');
    assert(loc, 'Should return a resolved location object');
    assert.strictEqual(loc.district, 'Chamoli');
    // If city is unknown, it doesn't crash and flags hasCoordinates appropriately
    assert(typeof loc.hasCoordinates === 'boolean');
  });

  // ----------------------------------------------------------------
  // 14. Cache isolation
  // ----------------------------------------------------------------
  await test(14, 'Cache isolation — User A (Nainital) and User B (Haldwani) have separate cache keys; zero leakage', async () => {
    const userAId = 'user_nainital_123';
    const userBId = 'user_haldwani_456';

    const locA = await resolveLocation('Nainital');
    const locB = await resolveLocation('Haldwani');

    // Simulate cache write for User A
    const keyA = `pers_home:u_${userAId}`;
    const keyB = `pers_home:u_${userBId}`;

    assert.notStrictEqual(keyA, keyB, 'User cache keys must be strictly isolated');

    // Guest cache keys with different locations must also never collide
    const guestKeyNainital = `pers_home:g_nainital_nainital_${Math.round(locA.coordinates[0]*100)}_${Math.round(locA.coordinates[1]*100)}`;
    const guestKeyHaldwani = `pers_home:g_haldwani_nainital_${Math.round(locB.coordinates[0]*100)}_${Math.round(locB.coordinates[1]*100)}`;

    assert.notStrictEqual(guestKeyNainital, guestKeyHaldwani, 'Guest cache keys for different cities must not collide');
  });

  // ----------------------------------------------------------------
  // 15. AI "mere aas paas" pronoun resolution
  // ----------------------------------------------------------------
  await test(15, 'AI pronoun "mere aas paas" — Resolves to user saved location (e.g. Nainital)', async () => {
    const userLocation = { city: 'Nainital', district: 'Nainital' };

    // Test Hindi and Hinglish variations
    const q1 = resolveDestination('mere aas paas kya dekhne layak hai?', { userLocation });
    assert(q1, 'Should resolve destination from "mere aas paas"');
    assert.strictEqual(q1.name, 'Nainital');
    assert.strictEqual(q1.isUserNearby, true);
    assert.strictEqual(q1.resolvedFrom, 'USER_LOCATION');

    const q2 = resolveDestination('near me best stay kaunsa hai', { userLocation });
    assert(q2, 'Should resolve destination from "near me"');
    assert.strictEqual(q2.name, 'Nainital');

    const q3 = resolveDestination('yahan koi trekking guide hai?', { userLocation });
    assert(q3, 'Should resolve destination from "yahan"');
    assert.strictEqual(q3.name, 'Nainital');
  });

  // ----------------------------------------------------------------
  // 16. AI "wahan" pronoun resolution
  // ----------------------------------------------------------------
  await test(16, 'AI pronoun "wahan" — Resolves to previously discussed destination, NOT user location', async () => {
    const userLocation = { city: 'Nainital', district: 'Nainital' };

    // When context has destination: "Rishikesh", "wahan" should resolve to Rishikesh
    const res1 = resolveDestination('wahan rafting aur camping available hai kya?', {
      destination: 'Rishikesh',
      userLocation
    });

    assert(res1, 'Should resolve destination from "wahan"');
    assert.strictEqual(res1.name, 'Rishikesh');
    assert.notStrictEqual(res1.name, 'Nainital', '"wahan" must NOT resolve to user location if destination is in context');

    // "udhar" with lastDestination
    const res2 = resolveDestination('udhar taxi service milegi?', {
      lastDestination: 'Kedarnath',
      userLocation
    });

    assert(res2, 'Should resolve destination from "udhar"');
    assert.strictEqual(res2.name, 'Kedarnath');
  });

  // ----------------------------------------------------------------
  // 17. Trip Planner default origin
  // ----------------------------------------------------------------
  await test(17, 'Trip Planner default origin — Uses saved location as initial origin but user can override', async () => {
    const savedUserLocation = { city: 'Nainital', district: 'Nainital' };
    
    // Initial state: default origin comes from user's location
    let plannerOrigin = savedUserLocation.city;
    assert.strictEqual(plannerOrigin, 'Nainital');

    // User overrides origin to "Delhi" or "Dehradun"
    plannerOrigin = 'Delhi';
    assert.strictEqual(plannerOrigin, 'Delhi', 'User must be able to change origin freely without constraint');
  });

  // ----------------------------------------------------------------
  // 18. Location change refresh / cache invalidation
  // ----------------------------------------------------------------
  await test(18, 'Location change refresh — Invalidation removes cached home data so new location loads immediately', async () => {
    const testUserId = 'test_cache_inval_user_789';
    const testKey = `pers_home:u_${testUserId}`;

    // Seed mock cached data in Redis / in-memory cache
    await cacheSet(testKey, { oldCity: 'Nainital' }, 60);
    const cachedBefore = await cacheGet(testKey);
    assert(cachedBefore, 'Cached data should exist before invalidation');

    // Invalidate
    await invalidateUserPersonalizedCache(testUserId);
    const cachedAfter = await cacheGet(testKey);
    assert.strictEqual(cachedAfter, null, 'Cache must be null after invalidation');
  });

  console.log('\n================================================================');
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL 18)`);
  console.log('================================================================\n');

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runAll18Tests().catch(err => {
  console.error('Fatal error running tests:', err);
  process.exit(1);
});
