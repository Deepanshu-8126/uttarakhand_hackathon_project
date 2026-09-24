import mongoose from 'mongoose';
import CommunityReport from '../models/CommunityReport.js';

// In-memory cache for offline/graceful fallback when MongoDB is connecting or unavailable
const inMemoryReports = [
  {
    _id: 'mock-report-1',
    location: 'Rohtang Pass (Marhi Section)',
    circuit: 'Manali-Leh Highway',
    condition: 'HEAVY_RAIN',
    severity: 'WARNING',
    description: 'Heavy rainfall and reduced visibility reported near Marhi. 2-wheelers advised to wait at lower checkpoint.',
    coordinates: { lat: 32.3716, lon: 77.2466 },
    reporterName: 'Sunil Thakur (Manali Bike Sentinel)',
    reporterRole: 'PARTNER',
    consensusVerified: true,
    consensusCount: 4,
    upvotes: 7,
    isOfflineSynced: false,
    createdAt: new Date(Date.now() - 25 * 60 * 1000)
  },
  {
    _id: 'mock-report-2',
    location: 'Kedarnath Trek (Jungle Chatti)',
    circuit: 'Char Dham Corridor',
    condition: 'CLEAR_SAFE',
    severity: 'INFO',
    description: 'Skies clear and dry across Jungle Chatti. Pedestrian and pony trek path operating at normal flow.',
    coordinates: { lat: 30.7346, lon: 79.0669 },
    reporterName: 'Kailash Negi (Registered Valley Guide)',
    reporterRole: 'LOCAL_GUIDE',
    consensusVerified: true,
    consensusCount: 3,
    upvotes: 12,
    isOfflineSynced: false,
    createdAt: new Date(Date.now() - 40 * 60 * 1000)
  },
  {
    _id: 'mock-report-3',
    location: 'Chamoli - Badrinath Corridor',
    circuit: 'Badrinath Circuit',
    condition: 'ROAD_BLOCKED',
    severity: 'CRITICAL',
    description: 'Single-lane regulated traffic near Joshimath following minor BRO road clearance. Drive with caution.',
    coordinates: { lat: 30.5574, lon: 79.5667 },
    reporterName: 'Vikram Rawat (Transport Sentinel)',
    reporterRole: 'PARTNER',
    consensusVerified: true,
    consensusCount: 5,
    upvotes: 15,
    isOfflineSynced: false,
    createdAt: new Date(Date.now() - 15 * 60 * 1000)
  }
];

/**
 * Check and calculate consensus among reports for a location
 */
const evaluateConsensus = (reports, newCondition, location) => {
  const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
  const recentMatching = reports.filter(r => 
    r.location.toLowerCase().includes(location.toLowerCase()) &&
    r.condition === newCondition &&
    new Date(r.createdAt).getTime() >= twoHoursAgo
  );

  return {
    isConsensus: recentMatching.length >= 2, // With new one, becomes >= 3
    count: recentMatching.length + 1
  };
};

/**
 * Submit a community ground observation report
 */
export const recordCommunityReport = async (reportData) => {
  const { location, condition, description, coordinates, reporterName, reporterRole, isOfflineSynced } = reportData;

  const consensus = evaluateConsensus(inMemoryReports, condition, location);

  const reportPayload = {
    _id: `cr-${Date.now()}`,
    location,
    condition,
    severity: ['CRITICAL', 'LANDSLIDE', 'AVALANCHE_ALERT', 'ROAD_BLOCKED'].includes(condition) ? 'CRITICAL' : 'WARNING',
    description,
    coordinates: coordinates || null,
    reporterName: reporterName || 'Local Valley Sentinel',
    reporterRole: reporterRole || 'PARTNER',
    consensusVerified: consensus.isConsensus,
    consensusCount: consensus.count,
    isOfflineSynced: Boolean(isOfflineSynced),
    upvotes: 1,
    createdAt: new Date()
  };

  // Add to in-memory store
  inMemoryReports.unshift(reportPayload);

  // If MongoDB is connected, persist to DB as well
  if (mongoose.connection.readyState === 1) {
    try {
      const doc = await CommunityReport.create(reportPayload);
      return doc.toObject();
    } catch (e) {
      console.warn('[CommunityGrid] MongoDB write fallback to memory:', e.message);
    }
  }

  return reportPayload;
};

/**
 * Get active community advisories with consensus priority
 */
export const getActiveCommunityAdvisories = async (circuitFilter) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const query = circuitFilter ? { circuit: circuitFilter } : {};
      const reports = await CommunityReport.find(query).sort({ consensusVerified: -1, createdAt: -1 }).limit(20);
      if (reports.length > 0) return reports;
    } catch (e) {
      console.warn('[CommunityGrid] DB read error, using in-memory sentinel:', e.message);
    }
  }

  return inMemoryReports;
};

export default {
  recordCommunityReport,
  getActiveCommunityAdvisories
};
