/**
 * Discovery Uttarakhand — Safe SMTP Diagnostic Test Utility
 * 
 * Verifies Nodemailer configuration and connectivity without exposing sensitive credentials.
 * Usage: node backend/scripts/verify_smtp.js [--send]
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded regardless of execution CWD
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const host = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com';
const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '465', 10);
const user = process.env.SMTP_USER || process.env.EMAIL_USER;
const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || process.env.EMAIL_PASS;
const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || (user ? `"Discovery Uttarakhand" <${user}>` : '"Discovery Uttarakhand" <noreply@discoveryuttarakhand.com>');

console.log('====================================================');
console.log('  Discovery Uttarakhand — Nodemailer Diagnostic     ');
console.log('====================================================');
console.log('Environment Diagnostics:');
console.log(`  SMTP_HOST:     ${host}`);
console.log(`  SMTP_PORT:     ${port}`);
console.log(`  SMTP_USER:     ${user ? '[CONFIGURED - ' + user.replace(/^(.).*(@.*)$/, '$1***$2') + ']' : '[MISSING]'}`);
console.log(`  SMTP_PASSWORD: ${pass ? '[CONFIGURED - ' + pass.length + ' chars]' : '[MISSING]'}`);
console.log(`  SMTP_FROM:     ${from ? '[CONFIGURED]' : '[DEFAULT]'}`);
console.log('----------------------------------------------------');

if (!user || !pass) {
  console.error('SMTP TEST: FAILED');
  console.error('Reason: Missing required credentials. Please configure SMTP_USER/EMAIL_USER and SMTP_PASSWORD/EMAIL_PASS in your .env file.');
  process.exit(1);
}

const isGmail = host.includes('gmail.com');
const transporterOptions = isGmail && (port === 465 || port === 587)
  ? {
      service: 'gmail',
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    }
  : {
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    };

const transporter = nodemailer.createTransport(transporterOptions);

transporter.verify(async (error) => {
  if (error) {
    console.error('SMTP TEST: FAILED');
    console.error('Classification:', error.code || 'AUTHENTICATION_OR_CONNECTION_ERROR');
    console.error('Diagnostic Message:', error.message ? error.message.replace(pass, '********') : 'Unknown error');
    if (error.code === 'EAUTH') {
      console.error('\nTroubleshooting EAUTH:');
      console.error('  1. Verify you are using a 16-character Google App Password (not your personal Google account password).');
      console.error('  2. Verify 2-Step Verification is enabled on the Google account.');
      console.error('  3. Ensure there are no accidental spaces or quotes inside the password string in .env.');
    } else if (error.code === 'ESOCKET' || error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      console.error('\nTroubleshooting Connection Error:');
      console.error('  1. Check your network or firewall rules for outbound SMTP (port 465/587).');
      console.error('  2. Try switching between port 465 (SSL) and port 587 (STARTTLS).');
    }
    process.exit(1);
  }

  console.log('SMTP TEST: SUCCESS');
  console.log('Server is ready to accept and dispatch emails.');

  // Check if --send flag was passed to send a test email to the configured sender
  if (process.argv.includes('--send')) {
    console.log(`\nAttempting self-test email dispatch to ${user.replace(/^(.).*(@.*)$/, '$1***$2')}...`);
    try {
      const info = await transporter.sendMail({
        from,
        to: user,
        subject: 'Discovery Uttarakhand — SMTP Test Verification',
        text: 'Hello!\n\nThis is an automated test confirming that Nodemailer SMTP dispatch is functional.\n\nDiscovery Uttarakhand Team',
        html: '<div style="font-family:sans-serif;padding:20px;border:1px solid #059669;border-radius:12px;background:#f0fdf4;"><h2 style="color:#0f3d2e;">Discovery Uttarakhand</h2><p>✅ Automated Nodemailer SMTP verification succeeded.</p></div>',
      });
      console.log('TEST EMAIL DISPATCH: SUCCESS');
      console.log('Message ID:', info.messageId);
    } catch (sendErr) {
      console.error('TEST EMAIL DISPATCH: FAILED');
      console.error('Reason:', sendErr.message ? sendErr.message.replace(pass, '********') : 'Dispatch failed');
    }
  }
  process.exit(0);
});
