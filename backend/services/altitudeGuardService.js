/**
 * Discovery Uttarakhand - Altitude Sickness Guard Service
 * Feature: High Altitude Health Safety & Acclimatization Lock (>3000m)
 */

// Canonical High-Altitude Destination Altitudes in Uttarakhand & Himachal
export const HIGH_ALTITUDE_DESTINATIONS = {
  'kedarnath': { name: 'Kedarnath', altitudeMeters: 3584, recommendedHalt: 'Guptkashi / Sonprayag', baseDistrict: 'Rudraprayag' },
  'tungnath': { name: 'Tungnath / Chopta', altitudeMeters: 3680, recommendedHalt: 'Sari Village / Ukhimath', baseDistrict: 'Rudraprayag' },
  'badrinath': { name: 'Badrinath', altitudeMeters: 3300, recommendedHalt: 'Joshimath / Pipalkoti', baseDistrict: 'Chamoli' },
  'hemkund sahib': { name: 'Hemkund Sahib', altitudeMeters: 4632, recommendedHalt: 'Govindghat / Ghangaria', baseDistrict: 'Chamoli' },
  'valley of flowers': { name: 'Valley of Flowers', altitudeMeters: 3658, recommendedHalt: 'Ghangaria', baseDistrict: 'Chamoli' },
  'gangotri': { name: 'Gangotri', altitudeMeters: 3100, recommendedHalt: 'Uttarkashi / Harsil', baseDistrict: 'Uttarkashi' },
  'yamunotri': { name: 'Yamunotri', altitudeMeters: 3293, recommendedHalt: 'Barkot / Janki Chatti', baseDistrict: 'Uttarkashi' },
  'auli': { name: 'Auli', altitudeMeters: 3050, recommendedHalt: 'Joshimath', baseDistrict: 'Chamoli' },
  'rohtang pass': { name: 'Rohtang Pass', altitudeMeters: 3978, recommendedHalt: 'Manali / Marhi', baseDistrict: 'Kullu' },
  'spiti valley': { name: 'Kaza / Spiti', altitudeMeters: 3800, recommendedHalt: 'Kalpa / Tabo', baseDistrict: 'Lahaul and Spiti' }
};

const ALTITUDE_THRESHOLD = 3000; // Meters

/**
 * Check if a destination requires altitude health clearance
 */
export const checkAltitudeRequirement = (destinationName) => {
  if (!destinationName) return { isHighAltitude: false };
  
  const normalized = String(destinationName).toLowerCase().trim();
  for (const [key, data] of Object.entries(HIGH_ALTITUDE_DESTINATIONS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return {
        isHighAltitude: data.altitudeMeters >= ALTITUDE_THRESHOLD,
        altitudeMeters: data.altitudeMeters,
        destination: data.name,
        recommendedHalt: data.recommendedHalt,
        threshold: ALTITUDE_THRESHOLD
      };
    }
  }

  return { isHighAltitude: false, altitudeMeters: 1800 };
};

/**
 * Calculate Acute Mountain Sickness (AMS) Risk Profile
 */
export const calculateAmsRisk = ({ age = 28, hasHeartCondition = false, hasAsthma = false, hasBpIssues = false, previousAms = false, directAscent = true }) => {
  let riskScore = 0;
  const riskFactors = [];

  const travelerAge = Number(age) || 28;
  if (travelerAge >= 55) {
    riskScore += 30;
    riskFactors.push('Senior age group (55+) has lower atmospheric oxygen adaptation');
  } else if (travelerAge <= 10) {
    riskScore += 20;
    riskFactors.push('Pediatric age (<10) prone to rapid AMS');
  }

  if (hasHeartCondition) {
    riskScore += 40;
    riskFactors.push('Pre-existing cardiovascular condition');
  }

  if (hasAsthma) {
    riskScore += 35;
    riskFactors.push('Respiratory vulnerability in thin air');
  }

  if (hasBpIssues) {
    riskScore += 25;
    riskFactors.push('Hypertension risks under barometric pressure drops');
  }

  if (previousAms) {
    riskScore += 30;
    riskFactors.push('History of high-altitude sickness (AMS)');
  }

  if (directAscent) {
    riskScore += 20;
    riskFactors.push('Same-day direct rapid ascent without acclimatization night');
  }

  let riskLevel = 'LOW';
  let canBookDirectly = true;
  let actionRequired = 'Standard hydration and daylight ascent recommended.';

  if (riskScore >= 60) {
    riskLevel = 'HIGH';
    canBookDirectly = false;
    actionRequired = 'MANDATORY ACCLIMATIZATION: You must schedule at least 1 rest night at lower altitude before final ascent. Direct booking restricted for safety.';
  } else if (riskScore >= 30) {
    riskLevel = 'MEDIUM';
    canBookDirectly = true;
    actionRequired = 'ACCLIMATIZATION RECOMMENDED: Choose homestays equipped with Oxygen Cylinders and avoid high-pace exertion.';
  }

  return {
    riskScore: Math.min(100, riskScore),
    riskLevel,
    canBookDirectly,
    riskFactors,
    actionRequired,
    requiredOxygenSupport: riskLevel !== 'LOW',
    assessedAt: new Date()
  };
};

export default {
  HIGH_ALTITUDE_DESTINATIONS,
  checkAltitudeRequirement,
  calculateAmsRisk
};
