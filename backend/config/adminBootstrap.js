/**
 * Discovery Uttarakhand — Admin Bootstrap Service
 * 
 * Safely provisions the initial system administrator only when explicitly configured
 * via environment variables (ADMIN_EMAIL and ADMIN_PASSWORD).
 * 
 * Rules:
 * 1. Hashes password before persistence via User schema pre-save hook.
 * 2. Does NOT recreate admin if already existing.
 * 3. Does NOT overwrite an existing admin's modified password.
 * 4. Ensures isEmailVerified is true so admin is immediately operational.
 * 5. Sanitizes all console output (never leaks passwords or raw credentials).
 */

import User from '../models/User.js';

export const bootstrapAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return; // Admin bootstrap not configured; normal operation
  }

  const cleanEmail = adminEmail.trim().toLowerCase();

  try {
    const existing = await User.findOne({ email: cleanEmail });

    if (existing) {
      if (existing.role !== 'admin') {
        existing.role = 'admin';
        existing.isEmailVerified = true;
        await existing.save();
        console.log(`[Admin Bootstrap] Granted admin role to configured user: ${cleanEmail.slice(0, 3)}***@***`);
      }
      return;
    }

    // Create new administrator
    const adminUser = new User({
      name: process.env.ADMIN_NAME || 'State Tourism Officer',
      email: cleanEmail,
      password: adminPassword,
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
    });

    await adminUser.save();
    console.log(`[Admin Bootstrap] ✅ Initial administrator successfully provisioned: ${cleanEmail.slice(0, 3)}***@***`);
  } catch (error) {
    console.error('[Admin Bootstrap Error] Could not bootstrap admin account:', error.message);
  }
};

export default bootstrapAdmin;
