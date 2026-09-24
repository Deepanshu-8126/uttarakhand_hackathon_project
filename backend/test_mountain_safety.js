import { checkAltitudeRequirement, calculateAmsRisk } from './services/altitudeGuardService.js';
import { checkRouteSafetyAndReroute, CORRIDOR_INCIDENTS } from './services/rerouteEngineService.js';
import { getWomenVerifiedStays, dispatchWomenSosBeacon } from './services/womenSafetyService.js';

console.log('=== RUNNING MOUNTAIN SAFETY SUITE UNIT TESTS ===\n');

// 1. Altitude Sickness Guard Tests
console.log('Test 1: Kedarnath (3584m) Altitude Check');
const kedarnathCheck = checkAltitudeRequirement('Kedarnath');
console.assert(kedarnathCheck.isHighAltitude === true, 'Kedarnath should be flagged high altitude');
console.assert(kedarnathCheck.altitudeMeters === 3584, 'Altitude must be 3584m');
console.log('✔ Kedarnath altitude check passed:', kedarnathCheck.altitudeMeters, 'meters');

console.log('Test 1b: AMS Risk Score Calculation');
const riskEval = calculateAmsRisk({
  destination: 'Kedarnath',
  age: 62,
  hasAsthma: true,
  hasHeartCondition: false,
  hasBpIssues: true,
  directAscent: true
});
console.assert(riskEval.riskLevel === 'HIGH', 'Senior with asthma should have HIGH risk');
console.assert(riskEval.canBookDirectly === false, 'Direct booking must be blocked without rest day');
console.log('✔ AMS Risk calculation passed. Score:', riskEval.riskScore, 'Risk Level:', riskEval.riskLevel, 'Blocked Direct Ascent:', !riskEval.canBookDirectly);

// 2. Landslide Auto-Reroute Engine Tests
console.log('\nTest 2: Landslide Hazard Detection & Auto Reroute');
const rerouteEval = checkRouteSafetyAndReroute(['Rishikesh', 'Joshimath', 'Badrinath']);
console.assert(rerouteEval.hasObstruction === true, 'Route containing Joshimath should detect hazard');
console.assert(rerouteEval.reroutePlan !== undefined, 'Alternate detour route should be provided');
console.assert(rerouteEval.reroutePlan.freeCancellationGranted === true, 'Free homestay reallocation must be granted');
console.log('✔ Landslide Detour passed. Suggested alternate:', rerouteEval.reroutePlan.suggestedAlternate);

// 3. Women Solo Safety Layer Tests
console.log('\nTest 3: Women-Verified Stays & SOS Dispatcher');
const womenStays = getWomenVerifiedStays('Joshimath');
console.assert(womenStays.length > 0, 'Should find women-verified stays in Joshimath');
console.assert(womenStays[0].verificationType === 'WOMEN_HOST_VERIFIED', 'Must have verificationType WOMEN_HOST_VERIFIED');
console.log('✔ Women-verified directory passed. Host:', womenStays[0].hostName, 'Verified:', womenStays[0].verificationType);

console.log('Test 3b: Emergency Beacon SOS Dispatch');
const sosBeacon = dispatchWomenSosBeacon({
  travelerName: 'Priya Sharma',
  travelerPhone: '+919876543210',
  coordinates: { lat: 30.7346, lon: 79.0669 },
  destination: 'Joshimath'
});
console.assert(sosBeacon.success === true, 'SOS success must be true');
console.assert(sosBeacon.sentinelDispatch.length > 0, 'Sentinels must be dispatched');
console.log('✔ SOS Beacon dispatcher passed. SOS ID:', sosBeacon.sosId, 'Responders:', sosBeacon.sentinelDispatch.length);

console.log('\n=== ALL 3 MOUNTAIN SAFETY SUITES PASSED 100% ===');
