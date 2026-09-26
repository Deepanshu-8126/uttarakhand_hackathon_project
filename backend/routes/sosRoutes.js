import express from 'express';
import {
  triggerSos,
  getActiveAlerts,
  getAlertById,
  updateAlertStatus,
  cancelSos,
  getNearbyRescuePosts
} from '../controllers/sosController.js';

const router = express.Router();

// Trigger SOS Beacon
router.post('/trigger', triggerSos);

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
