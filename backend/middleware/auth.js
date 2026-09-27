/**
 * Auth Middleware Re-export
 * Enables importing from middleware/auth.js or middleware/authMiddleware.js
 */
export { protect, requireAuth, optionalAuth, adminOnly, partnerOnly } from './authMiddleware.js';
