/**
 * Discovery Uttarakhand - Mountain Safety & Impact Controller
 * Endpoints for Altitude Guard, Landslide Reroute, and Women Solo Safety Layer
 */

import { checkAltitudeRequirement, calculateAmsRisk } from '../services/altitudeGuardService.js';
import { checkRouteSafetyAndReroute, CORRIDOR_INCIDENTS } from '../services/rerouteEngineService.js';
import { WOMEN_VERIFIED_HOSTS, dispatchWomenSosBeacon } from '../services/womenSafetyService.js';

/**
 * Feature 1: Evaluate Altitude Health & Acclimatization Risk
 * POST /api/safety/altitude-check
 */
export const evaluateAltitudeSafety = async (req, res) => {
  try {
    const { destination, age, hasHeartCondition, hasAsthma, hasBpIssues, previousAms, directAscent } = req.body;

    const altitudeReq = checkAltitudeRequirement(destination);
    const riskAssessment = calculateAmsRisk({
      age,
      hasHeartCondition,
      hasAsthma,
      hasBpIssues,
      previousAms,
      directAscent
    });

    res.json({
      success: true,
      data: {
        destination: destination || 'Mountain Destination',
        ...altitudeReq,
        assessment: riskAssessment
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Feature 2: Check Landslide / Hazard Detour & Alternate Route
 * POST /api/safety/reroute-check
 */
export const checkRoadSafetyAndReroute = async (req, res) => {
  try {
    const { destination, corridor } = req.body;
    const rerouteResult = checkRouteSafetyAndReroute(destination, corridor);

    res.json({
      success: true,
      data: rerouteResult
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all active mountain corridor incidents
 * GET /api/safety/incidents
 */
export const getActiveIncidents = async (req, res) => {
  try {
    res.json({
      success: true,
      count: CORRIDOR_INCIDENTS.length,
      data: CORRIDOR_INCIDENTS
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Feature 8: Get Verified Women-Host Homestays
 * GET /api/safety/women-stays
 */
export const getWomenVerifiedStays = async (req, res) => {
  try {
    const { district } = req.query;
    let stays = WOMEN_VERIFIED_HOSTS;
    if (district) {
      stays = stays.filter(s => s.district.toLowerCase().includes(district.toLowerCase()));
    }

    res.json({
      success: true,
      count: stays.length,
      data: stays
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Feature 8: Dispatch 24hr Women Solo Emergency Beacon SOS
 * POST /api/safety/women-sos
 */
export const triggerWomenSos = async (req, res) => {
  try {
    const { travelerName, travelerPhone, coordinates, destination, emergencyContact } = req.body;

    const dispatchResult = dispatchWomenSosBeacon({
      travelerName: travelerName || req.user?.name,
      travelerPhone: travelerPhone || req.user?.phone,
      coordinates,
      destination,
      emergencyContact
    });

    res.json({
      success: true,
      message: 'EMERGENCY BEACON ACTIVATED. Authorities and local sentinels notified.',
      data: dispatchResult
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  evaluateAltitudeSafety,
  checkRoadSafetyAndReroute,
  getActiveIncidents,
  getWomenVerifiedStays,
  triggerWomenSos
};
