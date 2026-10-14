import '../config/loadEnv.js';
import mongoose from 'mongoose';
import OTP from '../models/OTP.js';
import User from '../models/User.js';

const BASE_URL = 'http://localhost:5000/api';
const TEST_EMAIL = 'discoveryuttarakhand2000@gmail.com';
const TEST_PASSWORD = 'Password123!';
const TEST_NAME = 'Devbhoomi Admin Explorer';

async function run() {
  console.log('--- STARTING COMPREHENSIVE AUTH & OTP FLOW TEST ---');
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);

  // 1. Clean up any previous test user for clean slate
  await User.deleteOne({ email: TEST_EMAIL });
  await OTP.deleteMany({ destination: TEST_EMAIL });
  console.log('1. Cleaned up previous test records for clean slate.');

  // 2. Register User via HTTP API
  console.log(`2. Registering ${TEST_EMAIL} via POST /api/auth/signup ...`);
  const regRes = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: TEST_NAME,
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      confirmPassword: TEST_PASSWORD,
    }),
  });

  const regData = await regRes.json();
  console.log('Registration status:', regRes.status, regData.success ? 'SUCCESS' : 'FAILED');
  console.log('Registration response:', JSON.stringify(regData, null, 2));

  if (!regData.success || !regData.data?.requiresVerification) {
    throw new Error('Registration failed or did not request OTP verification: ' + JSON.stringify(regData));
  }
  console.log('✅ Registration successfully triggered OTP email dispatch.');

  // 3. Inspect OTP record generated in DB
  const otpRecord = await OTP.findOne({ destination: TEST_EMAIL, isUsed: false }).sort({ createdAt: -1 });
  if (!otpRecord) {
    throw new Error('No OTP record was created in database!');
  }
  console.log('✅ OTP record confirmed in MongoDB:');
  console.log('   - ID:', otpRecord._id.toString());
  console.log('   - Destination:', otpRecord.destination);
  console.log('   - Purpose:', otpRecord.purpose);
  console.log('   - Channel:', otpRecord.channel);
  console.log('   - Hash present:', Boolean(otpRecord.otpHash));
  console.log('   - Expires at:', otpRecord.expiresAt);

  // 4. Test wrong OTP rejection
  console.log('4. Testing wrong OTP rejection (000000)...');
  const wrongVerifyRes = await fetch(`${BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      destination: TEST_EMAIL,
      otp: '000000',
      purpose: 'signup',
    }),
  });
  const wrongVerifyData = await wrongVerifyRes.json();
  console.log('Wrong OTP response:', wrongVerifyRes.status, wrongVerifyData.message);
  if (wrongVerifyRes.status !== 400 || wrongVerifyData.success !== false) {
    throw new Error('Wrong OTP was unexpectedly accepted!');
  }
  console.log('✅ Wrong OTP was correctly rejected.');

  // 5. Test Resend Cooldown
  console.log('5. Testing 60-second cooldown on resend OTP...');
  const resendRes = await fetch(`${BASE_URL}/auth/resend-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      destination: TEST_EMAIL,
      purpose: 'signup',
    }),
  });
  const resendData = await resendRes.json();
  console.log('Resend status:', resendRes.status, resendData.message);
  if (resendRes.status !== 429) {
    throw new Error('Cooldown rate limiting failed on immediate resend!');
  }
  console.log('✅ 60-second cooldown rate limiting confirmed active.');

  // 6. Test Unverified User Login Attempt
  console.log('6. Testing Login attempt before email verification...');
  const unverifiedLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: TEST_EMAIL,
      password: TEST_PASSWORD,
    }),
  });
  const unverifiedLoginData = await unverifiedLoginRes.json();
  console.log('Unverified login status:', unverifiedLoginRes.status, unverifiedLoginData.code);
  if (unverifiedLoginRes.status !== 403 || unverifiedLoginData.code !== 'ACCOUNT_NOT_VERIFIED') {
    throw new Error('Unverified user was unexpectedly allowed to log in!');
  }
  console.log('✅ Unverified user login blocked with ACCOUNT_NOT_VERIFIED.');

  console.log('--- ALL AUTOMATED CHECKS PASSED SUCCESSFULLY ---');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
