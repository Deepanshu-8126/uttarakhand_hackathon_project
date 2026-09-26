import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  triggerSos,
  getActiveAlerts,
  getAlertById,
  updateAlertStatus,
  cancelSos,
  getNearbyRescuePosts
} from '../controllers/sosController.js';

const router = express.Router();

// Emergency SOS trigger rate limiter to prevent denial-of-service on dispatch grid
const sosLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'test' ? 1000 : 15,
  message: {
    success: false,
    message: 'Too many SOS requests. Please call emergency hotline 1070 or 112 directly.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Trigger SOS Beacon
router.post('/trigger', sosLimiter, triggerSos);

// Get Active Alerts for Rescue Ops
router.get('/active', getActiveAlerts);

// Get Nearby Rescue Posts & Helplines
router.get('/nearby-rescue-posts', getNearbyRescuePosts);

// Cancel SOS
router.post('/cancel', cancelSos);

// Get Alert By ID / AlertCode
router.get('/:id', getAlertById);

// Update Alert Status (Dispatch / Resolve)
router.put('/:id/status', updateAlertStatus);

export default router;
