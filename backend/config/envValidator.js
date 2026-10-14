/**
 * Discovery Uttarakhand — Environment Configuration Validator
 * Validates mandatory secrets and configurations for authentication, database, and CORS.
 * Enforces explicit backward-compatible precedence rules without leaking secrets in logs.
 */

export const validateEnv = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const missingCritical = [];

  // 1. Database Connection Precedence: MONGODB_URI takes precedence over MONGO_URI
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    missingCritical.push('MONGODB_URI (or MONGO_URI)');
  } else {
    // Standardize to both for full backward compatibility
    process.env.MONGODB_URI = mongoUri;
    process.env.MONGO_URI = mongoUri;
  }

  // 2. JWT Access Secret Precedence: JWT_ACCESS_SECRET takes precedence over JWT_SECRET
  const jwtAccessSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
  if (!jwtAccessSecret) {
    missingCritical.push('JWT_ACCESS_SECRET (or JWT_SECRET)');
  } else {
    process.env.JWT_ACCESS_SECRET = jwtAccessSecret;
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = jwtAccessSecret;
    }
  }

  // 3. JWT Refresh Secret
  if (!process.env.JWT_REFRESH_SECRET) {
    if (isProduction) {
      missingCritical.push('JWT_REFRESH_SECRET');
    } else {
      console.warn('[Env Notice] JWT_REFRESH_SECRET not explicitly defined. Using JWT_ACCESS_SECRET fallback in development.');
      process.env.JWT_REFRESH_SECRET = jwtAccessSecret;
    }
  }

  // 4. CORS & Frontend URL
  if (!process.env.FRONTEND_URL) {
    process.env.FRONTEND_URL = isProduction ? 'https://discoveryuttarakhand.in' : 'http://localhost:5173';
  }

  // 5. Port Configuration
  if (!process.env.PORT) {
    process.env.PORT = '5000';
  }

  // 6. SMTP Email Delivery Status Check (Sanitized - Never leak credentials)
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || process.env.EMAIL_PASS;
  if (!smtpUser || !smtpPass) {
    if (isProduction) {
      console.warn('[Email Warning] SMTP credentials (SMTP_USER/SMTP_PASSWORD) are not set. Live email dispatch will not reach external inboxes.');
    } else {
      console.info('[Email Notice] SMTP credentials not detected. System will initialize Ethereal sandbox / local test provider.');
    }
  }

  // 7. Halt startup if critical variables are missing
  if (missingCritical.length > 0) {
    console.error(`[CRITICAL] Missing required environment configuration: ${missingCritical.join(', ')}`);
    if (isProduction) {
      console.error('[CRITICAL] Server startup aborted for security reasons in production.');
      process.exit(1);
    }
  }
};

