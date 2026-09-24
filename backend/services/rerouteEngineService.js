/**
 * Discovery Uttarakhand - Landslide Auto-Reroute Engine
 * Feature: Reactive GIS & Mountain Landslide Detour Management
 */

// Active Road & Hazard Registry
export const CORRIDOR_INCIDENTS = [
  {
    id: 'inc-badrinath-01',
    corridor: 'Badrinath National Highway (NH-07)',
    location: 'Near Joshimath - Helang',
    type: 'LANDSLIDE',
    severity: 'CRITICAL',
    status: 'BLOCKED',
    estimatedClearanceHours: 6,
    alternateRoute: {
      name: 'Rishikesh - Srinagar - Karanprayag - Tharali Bypass',
      distanceExtraKm: 34,
      safetyStatus: 'SAFE_ALL_VEHICLES',
      recommendedHaltStay: 'Karanprayag River Homestay'
    },
    safeValleysNearby: ['Auli (via Ropeway)', 'Pipalkoti', 'Rudraprayag Valley'],
    reportedAt: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    id: 'inc-rohtang-02',
    corridor: 'Manali-Leh Highway (Rohtang Pass)',
    location: 'Marhi - Rohtang Top',
    type: 'HEAVY_SNOW_FALL',
    severity: 'WARNING',
    status: 'CAUTION_4X4_ONLY',
    estimatedClearanceHours: 3,
    alternateRoute: {
      name: 'Atal Tunnel (Rohtang Bypass Route)',
      distanceExtraKm: -22, // Shorter via tunnel
      safetyStatus: 'SAFE_ALL_WEATHER',
      recommendedHaltStay: 'Sissu Valley Eco Camp'
    },
    safeValleysNearby: ['Sissu (Lahaul)', 'Solang Valley', 'Naggar'],
    reportedAt: new Date(Date.now() - 45 * 60 * 1000)
  }
];

/**
 * Check if a route/destination has active road blocks
 */
export const checkRouteSafetyAndReroute = (destinationName, corridorName) => {
  const destStr = Array.isArray(destinationName) ? destinationName.join(' ') : String(destinationName || '');
  const query = (destStr + ' ' + (corridorName || '')).toLowerCase();

  const matchedIncident = CORRIDOR_INCIDENTS.find(inc => 
    query.includes(inc.location.toLowerCase()) || 
    query.includes(inc.corridor.toLowerCase()) ||
    (inc.corridor.includes('Badrinath') && (query.includes('badrinath') || query.includes('joshimath'))) ||
    (inc.corridor.includes('Rohtang') && (query.includes('rohtang') || query.includes('manali')))
  );

  if (!matchedIncident) {
    return {
      hasObstruction: false,
      status: 'GREEN_CLEAR',
      message: 'All arterial roads and mountain passes are currently clear and operational.'
    };
  }

  return {
    hasObstruction: true,
    status: matchedIncident.severity === 'CRITICAL' ? 'RED_BLOCKED' : 'YELLOW_RISKY',
    incident: matchedIncident,
    reroutePlan: {
      originalRouteBlocked: matchedIncident.corridor,
      suggestedAlternate: matchedIncident.alternateRoute.name,
      additionalDistanceKm: matchedIncident.alternateRoute.distanceExtraKm,
      recommendedSafeHalt: matchedIncident.alternateRoute.recommendedHaltStay,
      safeValleys: matchedIncident.safeValleysNearby,
      freeCancellationGranted: true,
      instantReallocationAvailable: true
    },
    actionMessage: `Alert: ${matchedIncident.type} reported at ${matchedIncident.location}. Alternate detour via ${matchedIncident.alternateRoute.name} activated.`
  };
};

export default {
  CORRIDOR_INCIDENTS,
  checkRouteSafetyAndReroute
};
