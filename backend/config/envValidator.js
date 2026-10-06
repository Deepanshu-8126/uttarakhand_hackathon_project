/**
 * Environment Configuration Validator
 * Validates required secrets and configs for production authentication and database.
 */

export const validateEnv = () => {
  if (process.env.NODE_ENV !== 'production') {
    return; // Non-blocking in development
  }

  const missing = [];

  if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
    missing.push('MONGO_URI (or MONGODB_URI)');
  }
  if (!process.env.JWT_SECRET && !process.env.JWT_ACCESS_SECRET) {
    missing.push('JWT_SECRET (or JWT_ACCESS_SECRET)');
  }

  if (!process.env.JWT_REFRESH_SECRET) {
    console.warn('[SECURITY NOTICE] JWT_REFRESH_SECRET not explicitly defined. Falling back to JWT_SECRET.');
    process.env.JWT_REFRESH_SECRET = process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET;
  }

  if (!process.env.FRONTEND_URL) {
    console.warn('[WARN] FRONTEND_URL is not set. Defaulting CORS to allow all origins.');
    process.env.FRONTEND_URL = '*';
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn('[WARN] SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASSWORD) are not configured. Email OTP delivery will fail until set.');
  }

  if (missing.length > 0) {
    console.error(`[CRITICAL] Missing required production environment variables: ${missing.join(', ')}`);
    console.error('[CRITICAL] Server startup aborted for security reasons.');
    process.exit(1);
  }
};
