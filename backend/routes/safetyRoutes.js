import express from 'express';
import { 
  evaluateAltitudeSafety, 
  checkRoadSafetyAndReroute, 
  getActiveIncidents, 
  getWomenVerifiedStays, 
  triggerWomenSos 
} from '../controllers/safetyController.js';

const router = express.Router();

// Altitude Sickness Guard (>3000m)
router.post('/altitude-check', evaluateAltitudeSafety);

// Landslide & Detour Reroute
router.post('/reroute-check', checkRoadSafetyAndReroute);
router.get('/incidents', getActiveIncidents);

// Women Solo Safety Layer
router.get('/women-stays', getWomenVerifiedStays);
router.post('/women-sos', triggerWomenSos);

export default router;
