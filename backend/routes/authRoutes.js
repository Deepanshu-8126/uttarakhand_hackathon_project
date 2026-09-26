import express from 'express';
import rateLimit from 'express-rate-limit';
import { registerUser, loginUser, getMe, logoutUser, registerPartner } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Strict Rate Limiting on Auth endpoints to prevent brute-force credential stuffing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 1000 : 20,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

router.post('/register', authLimiter, registerUser);
router.post('/register-partner', authLimiter, registerPartner);
router.post('/login', authLimiter, loginUser);
router.get('/me', protect, getMe);
router.post('/logout', logoutUser);

export default router;
