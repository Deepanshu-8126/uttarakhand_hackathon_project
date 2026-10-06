import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    console.warn('[EmailService] SMTP credentials not fully configured in environment variables.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });

  return transporter;
};

const getFromAddress = () => {
  return process.env.SMTP_FROM || '"Discovery Uttarakhand" <noreply@discoveryuttarakhand.com>';
};

/**
 * Base email sending wrapper
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  const mailer = getTransporter();

  if (!mailer) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SMTP email service is not configured on this server.');
    } else {
      console.warn(`[EmailService DEV NOTICE] Email to ${to} not sent because SMTP is not configured. Subject: "${subject}"`);
      return { success: false, simulated: true, message: 'SMTP not configured in local environment.' };
    }
  }

  const mailOptions = {
    from: getFromAddress(),
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await mailer.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[EmailService] Failed to send email:', error.message);
    throw error;
  }
};

/**
 * Send Account Verification OTP
 */
export const sendVerificationOTP = async (email, name, otp) => {
  const displayName = name || 'Explorer';
  const subject = 'Verify Your Account - Discovery Uttarakhand';

  const text = `Hello ${displayName},\n\nYour verification OTP is:\n\n${otp}\n\nThis OTP will expire in 5 minutes.\n\nIf you did not request this OTP, please ignore this email.\n\nRegards,\nDiscovery Uttarakhand Team`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fdfbf7; margin: 0; padding: 0; color: #1e293b; }
        .container { max-width: 560px; margin: 30px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #0f3d2e 0%, #081a13 100%); padding: 32px 24px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { color: #a7f3d0; margin: 6px 0 0; font-size: 13px; font-weight: 500; }
        .content { padding: 32px 28px; }
        .otp-box { background: #f0fdf4; border: 2px dashed #059669; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-code { font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0f3d2e; }
        .expiry-note { font-size: 12px; color: #64748b; margin-top: 8px; font-weight: 600; }
        .footer { background: #f8fafc; padding: 20px 28px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Discovery Uttarakhand</h1>
          <p>Himalayan Expedition &amp; Smart Tourism Portal</p>
        </div>
        <div class="content">
          <p style="font-size: 16px; font-weight: 600; margin-top: 0;">Hello ${displayName},</p>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">Thank you for registering. Use the following 6-digit One-Time Password (OTP) to verify your account:</p>
          
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <div class="expiry-note">⏱ Valid for 5 minutes only</div>
          </div>

          <p style="font-size: 13px; color: #64748b; line-height: 1.5;">If you did not request this OTP, please disregard this email or contact support if you have concerns.</p>
          
          <p style="font-size: 14px; font-weight: 600; color: #0f3d2e; margin-bottom: 0;">Regards,<br>Discovery Uttarakhand Team</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Discovery Uttarakhand. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: email, subject, text, html });
};

/**
 * Send Login Verification OTP
 */
export const sendLoginOTP = async (email, name, otp) => {
  const displayName = name || 'Explorer';
  const subject = 'Login Verification Code - Discovery Uttarakhand';

  const text = `Hello ${displayName},\n\nYour login verification OTP is:\n\n${otp}\n\nThis OTP will expire in 5 minutes.\n\nIf you did not attempt to log in, please secure your account immediately.\n\nRegards,\nDiscovery Uttarakhand Team`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fdfbf7; margin: 0; padding: 0; }
        .container { max-width: 560px; margin: 30px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
        .header { background: #0f3d2e; padding: 28px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; }
        .content { padding: 32px 28px; }
        .otp-box { background: #f0fdf4; border: 2px dashed #059669; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-code { font-family: monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #0f3d2e; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Discovery Uttarakhand</h1>
        </div>
        <div class="content">
          <p style="font-size: 15px; font-weight: 600;">Hello ${displayName},</p>
          <p style="font-size: 14px; color: #475569;">You are attempting to sign in. Enter this code to verify your identity:</p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <p style="font-size: 12px; color: #64748b; margin: 8px 0 0;">⏱ Valid for 5 minutes</p>
          </div>
          <p style="font-size: 13px; color: #ef4444; font-weight: 500;">If this wasn't you, someone may be trying to access your account.</p>
        </div>
        <div class="footer">&copy; ${new Date().getFullYear()} Discovery Uttarakhand</div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: email, subject, text, html });
};

/**
 * Send Password Reset OTP
 */
export const sendPasswordResetOTP = async (email, name, otp) => {
  const displayName = name || 'Explorer';
  const subject = 'Password Reset Code - Discovery Uttarakhand';

  const text = `Hello ${displayName},\n\nYour password reset OTP is:\n\n${otp}\n\nThis OTP will expire in 5 minutes.\n\nIf you did not request a password reset, please ignore this email.\n\nRegards,\nDiscovery Uttarakhand Team`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fdfbf7; margin: 0; padding: 0; }
        .container { max-width: 560px; margin: 30px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
        .header { background: #0f3d2e; padding: 28px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; }
        .content { padding: 32px 28px; }
        .otp-box { background: #fef2f2; border: 2px dashed #dc2626; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-code { font-family: monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #991b1b; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Discovery Uttarakhand</h1>
        </div>
        <div class="content">
          <p style="font-size: 15px; font-weight: 600;">Hello ${displayName},</p>
          <p style="font-size: 14px; color: #475569;">We received a request to reset your password. Use the verification code below:</p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <p style="font-size: 12px; color: #991b1b; margin: 8px 0 0;">⏱ Valid for 5 minutes only</p>
          </div>
          <p style="font-size: 13px; color: #64748b;">If you did not request a password reset, you can safely ignore this email.</p>
        </div>
        <div class="footer">&copy; ${new Date().getFullYear()} Discovery Uttarakhand</div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: email, subject, text, html });
};

/**
 * Send Welcome Email
 */
export const sendWelcomeEmail = async (email, name) => {
  const displayName = name || 'Explorer';
  const subject = 'Welcome to Discovery Uttarakhand!';

  const text = `Hello ${displayName},\n\nWelcome to Discovery Uttarakhand! Your account has been successfully verified.\n\nYou can now explore sacred shrines, verified homestays, 4x4 mountain rentals, and use the AI Copilot to plan your itinerary.\n\nRegards,\nDiscovery Uttarakhand Team`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: sans-serif; background-color: #fdfbf7; padding: 20px;">
      <div style="max-width: 560px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 16px; border: 1px solid #e2e8f0;">
        <h2 style="color: #0f3d2e; margin-top: 0;">Welcome to Devbhoomi Uttarakhand, ${displayName}! 🏔️</h2>
        <p style="color: #475569; line-height: 1.6;">Your account has been fully verified and activated. You're ready to experience sacred Himalayan corridors, verified local stays, and seamless mountain journeys.</p>
        <p style="margin-top: 24px; color: #0f3d2e; font-weight: bold;">Happy Travels,<br>Discovery Uttarakhand Team</p>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: email, subject, text, html });
};
