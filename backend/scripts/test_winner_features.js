import assert from 'assert';
import { generateCheckInOtp, verifyOtpToken, releaseEscrowPayout } from '../services/escrowService.js';
import { verifyExifGps, evaluate3LayerTruth, isCoordinateInHimalayanRegion } from '../services/truthCheckService.js';
import { recordCommunityReport, getActiveCommunityAdvisories } from '../services/communityGridService.js';

console.log('--- RUNNING WINNER FEATURES TEST SUITE ---');

// 1. Test TOP 1: Escrow & OTP Handshake
console.log('Testing TOP 1: Escrow & Check-In Handshake...');
const testOtp = generateCheckInOtp();
assert.strictEqual(testOtp.length, 6, 'OTP must be 6 digits');
assert.strictEqual(verifyOtpToken(testOtp, testOtp), true, 'Valid OTP must verify');
assert.strictEqual(verifyOtpToken('000000', testOtp), false, 'Invalid OTP must fail');

const sampleBooking = { amount: 5000, currency: 'INR' };
const payout = releaseEscrowPayout(sampleBooking, 'partner-123');
assert.strictEqual(payout.success, true);
assert.strictEqual(payout.partnerPayout, 4750); // 95%
assert.strictEqual(payout.platformFee, 250); // 5%
console.log('✓ TOP 1 Escrow + OTP: PASSED');

// 2. Test TOP 2: 3-Layer Truth Check
console.log('Testing TOP 2: 3-Layer Truth Check...');
assert.strictEqual(isCoordinateInHimalayanRegion(30.31, 78.03), true, 'Dehradun must be valid');
assert.strictEqual(isCoordinateInHimalayanRegion(15.29, 73.98), false, 'Goa must be rejected');

const validExif = verifyExifGps({ latitude: 30.1458, longitude: 78.3042 });
assert.strictEqual(validExif.passed, true);
assert.strictEqual(validExif.status, 'EXIF_VERIFIED');

const fakeExif = verifyExifGps({ latitude: 15.2993, longitude: 73.9872 }); // Goa
assert.strictEqual(fakeExif.passed, false);
assert.strictEqual(fakeExif.status, 'EXIF_LOCATION_MISMATCH');

const evaluation = evaluate3LayerTruth({
  exifResult: { passed: true },
  videoResult: { passed: true },
  selfieResult: { passed: true }
});
assert.strictEqual(evaluation.truthScore, 100);
assert.strictEqual(evaluation.badge, '3-LAYER TRUTH VERIFIED');
console.log('✓ TOP 2 3-Layer Truth Check: PASSED');

// 3. Test TOP 3: Community SOS Grid & Consensus
console.log('Testing TOP 3: Community SOS Grid...');
const initialAdvisories = await getActiveCommunityAdvisories();
assert.ok(initialAdvisories.length >= 3, 'Must provide resilient in-memory fallback advisories');

const report1 = await recordCommunityReport({
  location: 'Rohtang Pass (Manali Circuit)',
  condition: 'HEAVY_RAIN',
  description: 'Road slippery, local vehicles waiting.',
  reporterName: 'Ramesh Singh'
});
assert.ok(report1._id, 'Report must be created with ID');
console.log('✓ TOP 3 Community Grid: PASSED');

console.log('============================================');
console.log('ALL TOP 3 WINNER ARCHITECTURE TESTS PASSED!');
console.log('============================================');
