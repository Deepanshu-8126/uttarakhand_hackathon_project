/**
 * Automated Mobile API Contract & Feature Parity Test Suite
 * Discovery Uttarakhand
 */

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function runParityTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🧪 DISCOVERY UTTARAKHAND: MOBILE API PARITY VERIFICATION SUITE');
  console.log(`🌐 Target Base URL: ${API_BASE}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  const results = [];

  async function testEndpoint(name, url, method = 'GET', body = null, headers = {}) {
    const start = Date.now();
    try {
      const opts = {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        signal: AbortSignal.timeout(8000)
      };
      if (body) opts.body = JSON.stringify(body);

      const res = await fetch(`${API_BASE}${url}`, opts);
      const duration = Date.now() - start;

      let data = null;
      try {
        data = await res.json();
      } catch (_) {}

      const success = res.status >= 200 && res.status < 300;
      results.push({ name, url, method, status: res.status, duration, success, data });

      const icon = success ? '✅' : '❌';
      console.log(`${icon} [${res.status}] ${method} ${url} (${duration}ms) - ${name}`);
      return { success, data, status: res.status };
    } catch (err) {
      const duration = Date.now() - start;
      results.push({ name, url, method, status: 'TIMEOUT/ERROR', duration, success: false, error: err.message });
      console.log(`❌ [ERR] ${method} ${url} (${duration}ms) - ${name}: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  // 1. Core Tourism Datasets
  await testEndpoint('Destinations Catalog', '/destinations');
  await testEndpoint('Offbeat Hidden Locations', '/hidden-locations?withWeather=true');
  await testEndpoint('Verified Homestays & Stays', '/stays');
  await testEndpoint('Bike & 4x4 Mountain Rentals', '/rentals');
  await testEndpoint('Certified Mountain Guides', '/guides');
  await testEndpoint('Mountain Activities Directory', '/activities');
  await testEndpoint('Spiritual Pilgrimage Shrines', '/spiritual');
  await testEndpoint('Culture, Cuisine & Traditions', '/culture');

  // 2. Telemetry & Safety
  await testEndpoint('Live Telemetry / Weather Corridor', '/live-data/telemetry');
  await testEndpoint('Emergency SOS Trigger (Simulation)', '/sos/trigger', 'POST', {
    type: 'MEDICAL',
    location: { name: 'Kedarnath Base Camp', lat: 30.7346, lng: 79.0669 },
    medicalNotes: 'Automated Mobile Parity Test Ping',
    source: 'MOBILE_PARITY_SCRIPT'
  });

  // 3. AI Copilot & Voice
  await testEndpoint('AI Copilot Chat Endpoint', '/chat', 'POST', {
    message: 'Kedarnath trek ke bare mein batao',
    pageContext: { pageType: 'MOBILE_COPILOT', currentPage: 'PARITY_TEST' }
  });

  // 4. Recommendation & Budget Engine
  await testEndpoint('Recommendation Engine', '/recommendations', 'POST', {
    tripContext: {
      dayNumber: 1,
      location: { name: 'Nainital', district: 'Nainital' },
      budget: 10000,
      pace: 'Balanced'
    },
    categories: ['stays', 'guides', 'activities']
  });

  await testEndpoint('Budget Calculator Engine', '/budget/calculate', 'POST', {
    destination: 'Kedarnath',
    days: 3,
    travelers: 2,
    travelMode: 'Bike',
    interests: ['Trekking', 'Spiritual']
  });

  // 5. Verified Reviews
  await testEndpoint('Verified Reviews Feed', '/reviews/site/general');

  // 6. Web3 Blockchain & Truth Verification
  const destRes = results.find(r => r.name === 'Destinations Catalog');
  const sampleDestId = destRes?.data?.data?.[0]?._id || destRes?.data?.[0]?._id;
  if (sampleDestId) {
    await testEndpoint('Truth Verification Inspection', `/truth/inspect/${sampleDestId}`);
  }

  // 7. Auth & User-Scoped Flows (Trips, Bookings, Favorites)
  let authToken = null;
  const uniqueEmail = `mobile_parity_${Date.now()}@devbhoomi.com`;
  const regRes = await testEndpoint('User Register (Dynamic Parity Session)', '/auth/register', 'POST', {
    name: 'Pahadi Parity Explorer',
    email: uniqueEmail,
    password: 'Password@123',
    phone: '+91 98765 43210',
    role: 'traveler'
  });

  if (regRes.success && regRes.data) {
    authToken = regRes.data.token || (regRes.data.data && regRes.data.data.token);
  }

  const authHeaders = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};

  if (authToken) {
    await testEndpoint('User Profile (Me)', '/auth/me', 'GET', null, authHeaders);

    // Test creating a trip and retrieving saved trips
    const createTripRes = await testEndpoint('Create & Save Trip Plan', '/trips', 'POST', {
      title: 'Kedarnath & Tungnath High Altitude Circuit',
      destination: 'Kedarnath',
      startDate: new Date(Date.now() + 86400000).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 4).toISOString(),
      numDays: 4,
      travelers: '2',
      budget: '15000',
      transport: 'Bike',
      itinerary: [
        { day: 1, title: 'Haridwar to Guptkashi', activities: [] },
        { day: 2, title: 'Guptkashi to Kedarnath Trek', activities: [] }
      ]
    }, authHeaders);

    await testEndpoint('User Saved Trips (/trips)', '/trips', 'GET', null, authHeaders);
    await testEndpoint('User Bookings (/bookings/my)', '/bookings/my', 'GET', null, authHeaders);
    await testEndpoint('User Favorites (/favorites)', '/favorites', 'GET', null, authHeaders);

    // Test creating booking with real stay ID
    const staysRes = results.find(r => r.name === 'Verified Homestays & Stays');
    const sampleStayId = staysRes?.data?.data?.[0]?._id || staysRes?.data?.[0]?._id;

    if (sampleStayId) {
      await testEndpoint('Create Verified Booking', '/bookings', 'POST', {
        type: 'stay',
        stay: sampleStayId,
        startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        guests: 2,
        traveler: { name: 'Pahadi Parity Explorer', phone: '+91 98765 43210', guests: 2 },
        notes: 'Automated mobile parity test booking'
      }, authHeaders);
    }
  } else {
    console.log('⚠️ Skipping authenticated tests (Register token not retrieved)');
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  console.log(`📊 SUMMARY: ${passed}/${total} ENDPOINTS PASSED PARITY CHECK (${((passed/total)*100).toFixed(1)}%)`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runParityTests();
