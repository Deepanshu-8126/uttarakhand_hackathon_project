# Discovery Uttarakhand — Production Authentication & Authorization System

## 1. Architecture Overview

The Discovery Uttarakhand authentication system is a bank-grade, multi-tiered security pipeline designed for travelers, mountain guides, fleet operators, and system administrators.

```
Client (Web / Mobile / Kilo Code)
      │
      ├── [1] HTTPS + HTTP-only Cookie / Bearer Token
      │
      ▼
Express Gateway (Rate Limiters & CORS)
      │
      ├── [2] authMiddleware (JWT Verification & Revocation Guard)
      │
      ▼
Controllers & Service Layer
      ├── authController.js
      ├── emailService.js (Nodemailer SMTP Transporter)
      ├── otpService.js (6-Digit Crypto HMAC & TTL)
      ├── tokenService.js (Refresh Token Rotation & Sessions)
      └── smsService.js (Twilio / Fast2SMS Provider Abstraction)
      │
      ▼
MongoDB Atlas Layer
      ├── User (isEmailVerified, credentials, role)
      ├── OTP (TTL index = 300s, max 5 attempts)
      └── Session (TTL index = 7d, rotation & revocation)
```

---

## 2. Authentication Flows

### A. Signup & Email Verification Flow
1. User submits `name`, `email`, `mobile`, `password`, `confirmPassword`.
2. Input validation checks schema, duplicate email, duplicate mobile, and password complexity (minimum 8 chars, 1 uppercase, 1 lowercase, 1 number).
3. User is created in database with `isEmailVerified = false`, `isMobileVerified = false`, `isActive = true`.
4. A 6-digit cryptographically secure OTP is generated via `crypto.randomInt()`, hashed with SHA-256 HMAC, and stored in the `OTP` collection with a 5-minute MongoDB TTL index.
5. Email verification is dispatched via Nodemailer SMTP.
6. The user is redirected to the OTP verification screen. **Login is prohibited until OTP verification is completed.**
7. Upon successful verification:
   - `isEmailVerified` is marked `true`.
   - Welcome email is dispatched.
   - Access Token (15m) and Refresh Token (7d) are issued.
   - HTTP-only cookies are attached to the response.

### B. Login & Session Flow
1. User provides `email`/`mobile` + `password`.
2. Account is located and verified active.
3. Password verified using `bcryptjs`.
4. Verification check: if `isEmailVerified === false`, login is blocked and a new verification OTP is automatically dispatched.
5. On successful login:
   - A new `Session` document is stored in MongoDB.
   - Access token and refresh token are generated.
   - HTTP-only cookies (`accessToken`, `refreshToken`) are set.
   - User profile (excluding password and sensitive keys) is returned.

### C. Refresh Token Rotation (RTR) Flow
1. Access token expires after 15 minutes.
2. Axios response interceptor intercepts HTTP 401 and calls `POST /api/auth/refresh`.
3. Server validates incoming refresh token against the active session in MongoDB.
4. Old session is revoked, and a brand new refresh token + access token pair is issued.
5. If a previously revoked refresh token is presented (potential token theft/replay attack), all active sessions for that user are immediately revoked.

### D. Forgot & Reset Password Flow
1. User enters registered email.
2. Anti-enumeration: Generic response returned (`"If an account exists, a code has been sent"`).
3. Active user receives a 6-digit password reset OTP.
4. User submits OTP to receive a short-lived `resetToken`.
5. User enters new password.
6. Password hashed and saved, `passwordChangedAt` timestamp updated.
7. All existing sessions are revoked for security.

---

## 3. Environment Variables Reference

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `NODE_ENV` | Runtime environment | `development` / `production` |
| `PORT` | API server port | `5000` |
| `FRONTEND_URL` | Allowed CORS origins | `http://localhost:5173,http://localhost` |
| `MONGODB_URI` | MongoDB Atlas URI | `mongodb+srv://...` |
| `JWT_SECRET` | Master fallback JWT secret | 64-char hex string |
| `JWT_ACCESS_SECRET` | Access token signing secret | 64-char hex string |
| `JWT_REFRESH_SECRET` | Refresh token signing secret | 64-char hex string |
| `JWT_ACCESS_EXPIRES_IN`| Access token lifespan | `15m` |
| `JWT_REFRESH_EXPIRES_IN`| Refresh token lifespan | `7d` |
| `OTP_SECRET` | HMAC secret for OTP hashes | 32-char hex string |
| `SMTP_HOST` | Nodemailer SMTP host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` (TLS) or `465` (SSL) |
| `SMTP_USER` | SMTP username | `your_email@gmail.com` |
| `SMTP_PASSWORD` | SMTP password / app password | `xxxx xxxx xxxx xxxx` |
| `SMTP_FROM` | Outgoing sender display | `"Discovery Uttarakhand" <noreply@...>` |
| `SMS_PROVIDER` | SMS Provider abstraction | `twilio` or `fast2sms` |
| `SMS_API_KEY` | Provider API key | API key string |
| `SMS_API_SECRET` | Provider secret (Twilio AuthToken)| Secret string |

---

## 4. API Endpoints Reference

### Public Authentication Endpoints
- `POST /api/auth/signup` — Register traveler account (dispatches email OTP).
- `POST /api/auth/register-partner` — Register business partner (forces role `partner`, dispatches OTP).
- `POST /api/auth/verify-otp` — Verify 6-digit OTP code (`purpose`: `signup`, `login`, `forgot-password`).
- `POST /api/auth/send-otp` / `POST /api/auth/resend-otp` — Resend verification code (60-second cooldown).
- `POST /api/auth/login` — Sign in via email/mobile + password.
- `POST /api/auth/google` — Google OAuth 2.0 & One-Tap verified sign in.
- `POST /api/auth/refresh` — Refresh access token via refresh token rotation.
- `POST /api/auth/logout` — Revoke session and clear HTTP-only cookies.
- `POST /api/auth/forgot-password` — Dispatch reset OTP with anti-enumeration protection.
- `POST /api/auth/verify-reset-otp` — Verify reset OTP and issue reset token.
- `POST /api/auth/reset-password` — Set new password and invalidate existing sessions.

### Protected Endpoints (Requires `protect`)
- `GET /api/auth/me` — Retrieve sanitized current user profile.
- `POST /api/auth/change-password` — Change password for logged-in user.
- `POST /api/auth/send-email-verification` — Send email verification code.
- `POST /api/auth/verify-email` — Verify email code.

---

## 5. Security & Rate Limiting Guardrails

1. **Brute-Force Login Throttling**: 5 attempts per 15 minutes per IP (`loginLimiter`).
2. **OTP Abuse Prevention**:
   - 60-second cooldown between resend requests (`otpResendLimiter`).
   - Maximum 5 resends per verification window.
   - Maximum 5 validation attempts before OTP is permanently invalidated.
3. **HTTP-only Cookies**:
   - `httpOnly: true` prevents XSS token extraction.
   - `secure: true` in production (enforces HTTPS).
   - `sameSite: 'none'` (cross-domain) / `'lax'` (same-domain).
4. **Dual Authentication Support**:
   - Web application uses HTTP-only cookies + automatic refresh interceptor.
   - Mobile app (Flutter) and API clients use `Authorization: Bearer <token>`.
5. **No Password Leakage**: All query pipelines use `.select('-password')` and safe user serialization.
