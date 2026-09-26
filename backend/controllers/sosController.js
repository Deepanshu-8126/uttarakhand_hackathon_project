import SosAlert from '../models/SosAlert.js';

// Pre-defined Uttarakhand Mountain Emergency Grid & Rescue Posts
export const RESCUE_GRID = [
  {
    district: 'Rudraprayag',
    base: 'SDRF Base Camp Agastyamuni / Sonprayag',
    phone: '+91 1364 233727',
    helpline: '1070',
    ambulance: '108',
    lat: 30.2844,
    lng: 78.9811,
    facilities: ['High Altitude Rescue', 'Helipad', 'Oxygen Bank', 'Extreme Weather Kit']
  },
  {
    district: 'Chamoli',
    base: 'SDRF Post Joshimath / Govindghat',
    phone: '+91 1372 252101',
    helpline: '1070',
    ambulance: '108',
    lat: 30.5564,
    lng: 79.5630,
    facilities: ['Valley of Flowers Quick Reaction', 'Ropeway Evacuation', 'Avalanche Unit']
  },
  {
    district: 'Uttarkashi',
    base: 'NIM & Disaster Management Post Uttarkashi / Gangotri',
    phone: '+91 1374 222122',
    helpline: '1070',
    ambulance: '108',
    lat: 30.7268,
    lng: 78.4354,
    facilities: ['Glacial Traverse Unit', 'Air Evacuation Liaison', 'Trauma Mobile Van']
  },
  {
    district: 'Pithoragarh',
    base: 'ITBP & SDRF Mountain Post Dharchula / Munsiyari',
    phone: '+91 1396 222044',
    helpline: '1070',
    ambulance: '108',
    lat: 29.5832,
    lng: 80.2180,
    facilities: ['Border Rescue Wing', 'High Angle Ropes', 'Satellite Comms Hub']
  },
  {
    district: 'Dehradun',
    base: 'State Emergency Operation Centre (SEOC) IT Park Dehradun',
    phone: '0135-2710334',
    helpline: '112',
    ambulance: '108',
    lat: 30.3165,
    lng: 78.0322,
    facilities: ['Central Heli-Dispatch', 'State Command & Control', 'Medical Air Bridge']
  },
  {
    district: 'Nainital',
    base: 'SDRF Post Nainital / Haldwani Base',
    phone: '+91 1364 222555',
    helpline: '1070',
    ambulance: '108',
    lat: 29.3919,
    lng: 79.4636,
    facilities: ['Kumaon Regional Command', 'Lake Rescue Unit', 'Rapid Detour Vehicle']
  }
];

function generateAlertCode() {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `SOS-UK-${randomNum}`;
}

function findNearestRescuePost(lat, lng) {
  if (!lat || !lng) return RESCUE_GRID[0];
  let closest = RESCUE_GRID[0];
  let minDistance = Infinity;

  for (const post of RESCUE_GRID) {
    const dLat = (post.lat - lat) * 111;
    const dLng = (post.lng - lng) * 111 * Math.cos(lat * (Math.PI / 180));
    const distKm = Math.sqrt(dLat * dLat + dLng * dLng);
    if (distKm < minDistance) {
      minDistance = distKm;
      closest = post;
    }
  }
  return { ...closest, distanceKm: Math.round(minDistance) };
}

/**
 * Trigger new SOS alert
 * POST /api/sos/trigger
 */
export const triggerSos = async (req, res) => {
  try {
    const {
      travelerName,
      travelerPhone,
      incidentType,
      severity,
      message,
      location,
      deviceTelemetry,
      emergencyContacts,
      offlineQueuedAt
    } = req.body;

    const lat = location?.lat || 30.7346;
    const lng = location?.lng || 79.0669;
    const nearestPost = findNearestRescuePost(lat, lng);

    const alertCode = generateAlertCode();

    const newAlert = new SosAlert({
      alertCode,
      userId: req.user?._id || null,
      travelerName: travelerName || req.user?.name || 'Uttarakhand Tourist',
      travelerPhone: travelerPhone || req.user?.phone || '',
      incidentType: incidentType || 'GENERAL_SOS',
      severity: severity || 'CRITICAL',
      message: message || 'Emergency SOS distress beacon triggered on mountain circuit.',
      location: {
        lat,
        lng,
        altitude: location?.altitude || 0,
        accuracy: location?.accuracy || 10,
        nearestLandmark: location?.nearestLandmark || `${nearestPost.district} Trail`,
        district: location?.district || nearestPost.district
      },
      deviceTelemetry: {
        batteryLevel: deviceTelemetry?.batteryLevel ?? 100,
        isCharging: deviceTelemetry?.isCharging ?? false,
        networkStatus: deviceTelemetry?.networkStatus || 'ONLINE',
        userAgent: req.headers['user-agent'] || ''
      },
      emergencyContacts: Array.isArray(emergencyContacts) ? emergencyContacts : [],
      status: 'ACTIVE',
      rescueDetails: {
        assignedTeam: nearestPost.base,
        assignedOfficer: 'SDRF Duty Commander',
        officerPhone: nearestPost.phone,
        etaMinutes: Math.max(15, Math.min(60, (nearestPost.distanceKm || 20) * 2)),
        resolutionNotes: ''
      },
      timeline: [
        {
          status: 'TRIGGERED',
          note: `SOS beacon broadcast from Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}. Dispatched to ${nearestPost.base}.`,
          timestamp: new Date()
        }
      ],
      offlineQueuedAt: offlineQueuedAt ? new Date(offlineQueuedAt) : null
    });

    await newAlert.save();

    res.status(201).json({
      success: true,
      message: '🚨 EMERGENCY SOS BEACON RECEIVED & REGISTERED ON RESCUE GRID.',
      data: newAlert,
      nearestRescuePost: nearestPost,
      emergencyHelplines: {
        sdrf: '1070',
        police: '112',
        ambulance: '108',
        women: '1090',
        disasterCell: '0135-2710334'
      }
    });
  } catch (error) {
    console.error('[sosController] triggerSos error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get active SOS alerts for Rescue Ops dashboard
 * GET /api/sos/active
 */
export const getActiveAlerts = async (req, res) => {
  try {
    const alerts = await SosAlert.find({
      status: { $in: ['ACTIVE', 'ACKNOWLEDGED', 'DISPATCHED'] }
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get specific SOS alert by ID or Alert Code
 * GET /api/sos/:id
 */
export const getAlertById = async (req, res) => {
  try {
    const { id } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const query = isObjectId ? { _id: id } : { alertCode: id };

    const alert = await SosAlert.findOne(query).lean();
    if (!alert) {
      return res.status(404).json({ success: false, message: 'SOS Alert not found' });
    }

    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update SOS Alert Status (by Rescue Team or Admin)
 * PUT /api/sos/:id/status
 */
export const updateAlertStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, assignedTeam, assignedOfficer, officerPhone, etaMinutes, resolutionNotes } = req.body;

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const query = isObjectId ? { _id: id } : { alertCode: id };

    const alert = await SosAlert.findOne(query);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'SOS Alert not found' });
    }

    if (status) alert.status = status;
    if (assignedTeam) alert.rescueDetails.assignedTeam = assignedTeam;
    if (assignedOfficer) alert.rescueDetails.assignedOfficer = assignedOfficer;
    if (officerPhone) alert.rescueDetails.officerPhone = officerPhone;
    if (etaMinutes !== undefined) alert.rescueDetails.etaMinutes = etaMinutes;
    if (resolutionNotes) alert.rescueDetails.resolutionNotes = resolutionNotes;

    alert.timeline.push({
      status: status || alert.status,
      note: note || `Status updated to ${status || alert.status}`,
      timestamp: new Date()
    });

    await alert.save();

    res.json({
      success: true,
      message: `SOS alert updated to ${alert.status}`,
      data: alert
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Cancel SOS Alert by user
 * POST /api/sos/cancel
 */
export const cancelSos = async (req, res) => {
  try {
    const { alertCode, reason } = req.body;
    if (!alertCode) {
      return res.status(400).json({ success: false, message: 'alertCode is required' });
    }

    const alert = await SosAlert.findOne({ alertCode });
    if (!alert) {
      return res.status(404).json({ success: false, message: 'SOS Alert not found' });
    }

    alert.status = 'CANCELLED';
    alert.timeline.push({
      status: 'CANCELLED',
      note: reason || 'Cancelled by user (False alarm or reached safety).',
      timestamp: new Date()
    });

    await alert.save();

    res.json({
      success: true,
      message: 'SOS beacon cancelled successfully.',
      data: alert
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get nearby rescue posts and official helplines
 * GET /api/sos/nearby-rescue-posts
 */
export const getNearbyRescuePosts = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);

    let posts = RESCUE_GRID;
    if (!isNaN(lat) && !isNaN(lng)) {
      posts = posts.map(p => {
        const dLat = (p.lat - lat) * 111;
        const dLng = (p.lng - lng) * 111 * Math.cos(lat * (Math.PI / 180));
        return { ...p, distanceKm: Math.round(Math.sqrt(dLat * dLat + dLng * dLng)) };
      }).sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    }

    res.json({
      success: true,
      data: posts,
      helplines: {
        sdrfStateControl: '1070',
        nationalEmergency: '112',
        mountainAmbulance: '108',
        womenHelpline: '1090',
        disasterControlDehradun: '0135-2710334',
        forestFireReport: '1926'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  triggerSos,
  getActiveAlerts,
  getAlertById,
  updateAlertStatus,
  cancelSos,
  getNearbyRescuePosts
};
