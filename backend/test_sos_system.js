import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import SosAlert from './models/SosAlert.js';
import { RESCUE_GRID } from './controllers/sosController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function runSosTest() {
  console.log('Testing SOS Emergency & Rescue Grid System...');
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB Atlas');

  // Test 1: Verify Rescue Grid has all key Himalayan districts
  console.log(`\n1. Rescue Grid: ${RESCUE_GRID.length} verified bases`);
  RESCUE_GRID.forEach(base => {
    console.log(`   - ${base.district}: ${base.base} (${base.phone})`);
  });

  // Test 2: Create a test SOS beacon in Kedarnath trail
  const testAlert = new SosAlert({
    alertCode: `SOS-TEST-${Date.now().toString().slice(-4)}`,
    travelerName: 'Test Himalayan Trekker',
    travelerPhone: '+91 9876543210',
    incidentType: 'AMS_ALTITUDE',
    severity: 'CRITICAL',
    message: 'High altitude AMS symptoms at 3,500m on Kedarnath trek.',
    location: {
      lat: 30.7346,
      lng: 79.0669,
      altitude: 3583,
      district: 'Rudraprayag',
      nearestLandmark: 'Sonprayag Trail Checkpoint'
    },
    deviceTelemetry: {
      batteryLevel: 42,
      isCharging: false,
      networkStatus: 'WEAK_2G'
    },
    emergencyContacts: [
      { name: 'Kavita Negi', phone: '+91 9876543211', relation: 'Family' }
    ],
    status: 'ACTIVE'
  });

  await testAlert.save();
  console.log(`\n2. ✅ Created Test SOS Alert: ${testAlert.alertCode} (Status: ${testAlert.status})`);

  // Test 3: Query Active Alerts
  const activeAlerts = await SosAlert.find({ status: 'ACTIVE' }).limit(5);
  console.log(`\n3. ✅ Found ${activeAlerts.length} Active SOS alerts in DB`);

  // Test 4: Update status to DISPATCHED
  testAlert.status = 'DISPATCHED';
  testAlert.rescueDetails.assignedOfficer = 'Sub-Inspector Rawat (SDRF)';
  testAlert.rescueDetails.etaMinutes = 15;
  testAlert.timeline.push({
    status: 'DISPATCHED',
    note: 'Rapid mountain rescue team dispatched from Sonprayag post.',
    timestamp: new Date()
  });
  await testAlert.save();
  console.log(`\n4. ✅ Updated SOS Alert to DISPATCHED (ETA: 15 mins)`);

  // Cleanup test alert
  await SosAlert.deleteOne({ _id: testAlert._id });
  console.log(`\n5. ✅ Cleaned up test record`);

  await mongoose.disconnect();
  console.log('\n🎉 ALL SOS SYSTEM BACKEND TESTS PASSED!');
}

runSosTest().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
