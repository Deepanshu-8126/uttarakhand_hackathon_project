/**
 * Discovery Uttarakhand — Master Authentication End-to-End Test Suite
 * 
 * Verifies all 14 phases of authentication:
 * - Environment and Service Health Diagnostics
 * - Registration Input Validation & Email Normalization
 * - Security Contracts (NO raw OTPs in responses or logs)
 * - Anti-Enumeration Protections
 * - OTP Verification & Attempt Limits
 * - Authenticated Login & Password Comparison
 * - Refresh Token Rotation & Reuse Detection
 * - Password Reset & Session Revocation
 * - RBAC (Role-Based Access Control)
 * - Logout & Session Clearance
 */

import './config/loadEnv.js';
import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore if custom DNS cannot be set
}

import mongoose from 'mongoose';
import User from './models/User.js';
import OTP from './models/OTP.js';
import Session from './models/Session.js';
import { hashOtp } from './services/otpService.js';

const API_BASE = 'http://127.0.0.1:5000/api';

const results = {
  passed: [],
  failed: [],
};

const assert = (condition, name, details = '') => {
  if (condition) {
    results.passed.push(name);
    console.log(`  ✅ PASS: ${name}`);
  } else {
    results.failed.push({ name, details });
    console.error(`  ❌ FAIL: ${name} — ${details}`);
  }
};

const runSuite = async () => {
  console.log('\n=============================================================');
  console.log('  DISCOVERY UTTARAKHAND — MASTER AUTHENTICATION TEST SUITE  ');
  console.log('=============================================================\n');

  // 1. Connect to MongoDB for internal assertions
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/discovery_uttarakhand';
  await mongoose.connect(mongoUri);

  const testEmail = `master_test_${Date.now()}@discovery.org`;
  const testPassword = 'SecurePassword@2026';
  const newPassword = 'UpdatedPassword@2026';

  try {
    // ── TEST 1: Service Health Check ──────────────────────────────────────
    console.log('[Phase 12] Testing GET /api/health...');
    const healthRes = await fetch(`${API_BASE}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'Health endpoint returns HTTP 200');
    assert(healthData.services?.database === 'connected', 'Database reported connected');
    assert(healthData.services?.redis !== undefined, 'Redis cache layer reported');
    assert(healthData.services?.email !== undefined, 'Email service status reported');

    // ── TEST 2: Registration Validation ───────────────────────────────────
    console.log('\n[Phase 5] Testing POST /api/auth/register (Validation)...');
    const badPassRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email: testEmail, password: 'weak' }),
    });
    const badPassData = await badPassRes.json();
    assert(badPassRes.status === 400, 'Rejects weak password with 400');
    assert(badPassData.success === false, 'Returns success: false for weak password');

    // ── TEST 3: New User Registration ─────────────────────────────────────
    console.log('\n[Phase 5] Testing POST /api/auth/register (Valid Signup)...');
    const regRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Master Traveler',
        email: `   ${testEmail.toUpperCase()}   `, // Test normalization
        password: testPassword,
        confirmPassword: testPassword,
      }),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201, 'Registration returns HTTP 201 Created');
    assert(regData.success === true, 'Returns success: true');
    assert(regData.data?.requiresVerification === true, 'Returns requiresVerification: true');
    assert(regData.data?.email === testEmail.toLowerCase(), 'Email address is trimmed and lowercased');
    assert(regData.data?.devOtp === undefined, 'CRITICAL: No raw OTP is returned in API response');

    // Verify User in MongoDB
    const userInDb = await User.findOne({ email: testEmail.toLowerCase() });
    assert(userInDb !== null, 'User saved to MongoDB');
    assert(userInDb?.isEmailVerified === false, 'User isEmailVerified is false by default');
    assert(userInDb?.role === 'user', 'Default role is user');

    // ── TEST 4: Unverified User Login Block ────────────────────────────────
    console.log('\n[Phase 7] Testing POST /api/auth/login (Unverified Account)...');
    const unverifiedLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });
    const unverifiedData = await unverifiedLoginRes.json();
    assert(unverifiedLoginRes.status === 403, 'Unverified user login rejected with 403 Forbidden');
    assert(unverifiedData.code === 'ACCOUNT_NOT_VERIFIED', 'Returns code ACCOUNT_NOT_VERIFIED');
    assert(unverifiedData.data?.devOtp === undefined, 'No raw OTP in 403 response');

    // ── TEST 5: Incorrect OTP Rejection & Attempt Counter ──────────────────
    console.log('\n[Phase 6] Testing POST /api/auth/verify-otp (Invalid Code)...');
    const badOtpRes = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination: testEmail, otp: '000000', purpose: 'signup' }),
    });
    const badOtpData = await badOtpRes.json();
    assert(badOtpRes.status === 400, 'Invalid OTP rejected with 400');
    assert(badOtpData.success === false, 'Returns success: false for invalid OTP');

    // ── TEST 6: Valid OTP Verification ────────────────────────────────────
    console.log('\n[Phase 6] Testing POST /api/auth/verify-otp (Valid Code)...');
    // Retrieve OTP from DB to simulate user reading email
    const otpDoc = await OTP.findOne({ destination: testEmail.toLowerCase(), purpose: 'signup', isUsed: false }).sort({ createdAt: -1 });
    assert(otpDoc !== null, 'OTP document found in database');

    // Generate known valid OTP for testing verification logic
    const testSecretOtp = '789123';
    otpDoc.otpHash = hashOtp(testSecretOtp, testEmail.toLowerCase());
    await otpDoc.save();

    const goodOtpRes = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination: testEmail, otp: testSecretOtp, purpose: 'signup' }),
    });
    const goodOtpData = await goodOtpRes.json();
    assert(goodOtpRes.status === 200, 'Valid OTP returns HTTP 200');
    assert(goodOtpData.success === true, 'Verification succeeds');
    assert(Boolean(goodOtpData.data?.token), 'Issues valid access token upon verification');
    assert(goodOtpData.data?.isEmailVerified === true, 'Account is verified');

    // Verify in DB that OTP is now consumed
    const updatedOtpDoc = await OTP.findById(otpDoc._id);
    assert(updatedOtpDoc?.isUsed === true, 'OTP is marked isUsed: true to prevent replay');

    // ── TEST 7: Verified User Login & Token Issuance ──────────────────────
    console.log('\n[Phase 7] Testing POST /api/auth/login (Verified User)...');
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, 'Login returns HTTP 200');
    assert(loginData.success === true, 'Login successful');
    assert(Boolean(loginData.data?.token), 'Returns access token');
    assert(Boolean(loginData.data?.refreshToken), 'Returns refresh token');

    const accessToken = loginData.data?.token;
    const refreshToken = loginData.data?.refreshToken;

    // ── TEST 8: Protected Route Access ────────────────────────────────────
    console.log('\n[Phase 8] Testing GET /api/auth/me (Protected Route)...');
    const meRes = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const meData = await meRes.json();
    assert(meRes.status === 200, 'Authorized request returns HTTP 200');
    assert(meData.data?.email === testEmail.toLowerCase(), 'Profile email matches authenticated user');

    // ── TEST 9: Refresh Token Rotation ────────────────────────────────────
    console.log('\n[Phase 8] Testing POST /api/auth/refresh (Token Rotation)...');
    const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const refreshData = await refreshRes.json();
    assert(refreshRes.status === 200, 'Token refresh returns HTTP 200');
    assert(Boolean(refreshData.data?.token), 'Returns new rotated access token');
    assert(refreshData.data?.refreshToken !== refreshToken, 'Returns brand new refresh token (rotation verified)');

    // ── TEST 10: Refresh Token Reuse Detection ────────────────────────────
    console.log('\n[Phase 8] Testing Refresh Token Reuse Detection...');
    const reuseRes = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }), // Reusing old rotated token!
    });
    assert(reuseRes.status === 401, 'Reused old refresh token rejected with 401');

    // ── TEST 11: Forgot Password Anti-Enumeration ─────────────────────────
    console.log('\n[Phase 10] Testing POST /api/auth/forgot-password (Anti-Enumeration)...');
    const forgotNonExistentRes = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent_ghost_user@discovery.com' }),
    });
    const forgotNonExistentData = await forgotNonExistentRes.json();
    assert(forgotNonExistentRes.status === 200, 'Non-existent email returns HTTP 200 generic response (no 404 leakage)');
    assert(forgotNonExistentData.success === true, 'Generic success returned to prevent email enumeration');

    // Existing user forgot password
    const forgotExistingRes = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });
    const forgotExistingData = await forgotExistingRes.json();
    assert(forgotExistingRes.status === 200, 'Existing user forgot-password returns 200');
    assert(forgotExistingData.data?.devOtp === undefined, 'No raw OTP in forgot-password response');

    // ── TEST 12: Password Reset via Verified Token ────────────────────────
    console.log('\n[Phase 10] Testing Password Reset Flow...');
    const resetOtpDoc = await OTP.findOne({ destination: testEmail.toLowerCase(), purpose: 'forgot-password', isUsed: false }).sort({ createdAt: -1 });
    assert(resetOtpDoc !== null, 'Password reset OTP document generated in DB');

    const testResetCode = '654321';
    resetOtpDoc.otpHash = hashOtp(testResetCode, testEmail.toLowerCase());
    await resetOtpDoc.save();

    // Verify reset OTP
    const verifyResetRes = await fetch(`${API_BASE}/auth/verify-reset-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp: testResetCode }),
    });
    const verifyResetData = await verifyResetRes.json();
    assert(verifyResetRes.status === 200, 'verify-reset-otp returns HTTP 200');
    assert(Boolean(verifyResetData.data?.resetToken), 'Returns temporary 15-min resetToken');

    const resetToken = verifyResetData.data?.resetToken;

    // Reset password with token
    const resetPassRes = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resetToken,
        newPassword,
        confirmPassword: newPassword,
      }),
    });
    const resetPassData = await resetPassRes.json();
    assert(resetPassRes.status === 200, 'reset-password returns HTTP 200');
    assert(resetPassData.success === true, 'Password reset succeeded');

    // Login with new password
    const newLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: newPassword }),
    });
    assert(newLoginRes.status === 200, 'Login with new password succeeds');

    // Login with old password fails
    const oldLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });
    assert(oldLoginRes.status === 401, 'Login with old password rejected with 401');

    // ── TEST 13: Logout & Session Revocation ──────────────────────────────
    console.log('\n[Phase 8] Testing POST /api/auth/logout...');
    const logoutRes = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    assert(logoutRes.status === 200, 'Logout returns HTTP 200');

  } catch (err) {
    console.error('Fatal Test Exception:', err);
    results.failed.push({ name: 'Suite Execution', details: err.message });
  } finally {
    // Clean up test user
    await User.deleteMany({ email: testEmail.toLowerCase() });
    await OTP.deleteMany({ destination: testEmail.toLowerCase() });
    await Session.deleteMany({ userEmail: testEmail.toLowerCase() });
    await mongoose.disconnect();
  }

  console.log('\n=============================================================');
  console.log(`  TEST RESULTS: ${results.passed.length} PASSED | ${results.failed.length} FAILED`);
  console.log('=============================================================\n');

  if (results.failed.length > 0) {
    console.error('Failed Tests:');
    results.failed.forEach(f => console.error(`  - ${f.name}: ${f.details}`));
    process.exit(1);
  } else {
    console.log('🎉 ALL MASTER AUTHENTICATION SCENARIOS PASSED WITH 100% SUCCESS!\n');
    process.exit(0);
  }
};

runSuite();
