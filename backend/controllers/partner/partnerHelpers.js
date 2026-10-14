import Destination from '../../models/Destination.js';
import Partner from '../../models/Partner.js';
import { resolveDestination } from '../../services/destinationResolver.js';

// Configurable platform fee rate (default 10%). Override via env PLATFORM_FEE_RATE.
export const PLATFORM_FEE_RATE = Number(process.env.PLATFORM_FEE_RATE) || 0.10;

// Helper slug generator
export function generateSlug(title) {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `${base}-${Date.now().toString(36)}`;
}

// Normalizes and validates coordinates into canonical GeoJSON [longitude, latitude]
export async function resolveLocationAndDestination({ district, city, locality, destination, destinationSlug, location, latitude, longitude }) {
  let matchedDest = null;
  let canonicalSlug = destinationSlug ? destinationSlug.toLowerCase().trim() : null;

  // Search terms to locate destination
  const searchTerms = [canonicalSlug, destination, city, locality].filter(Boolean);
  for (const term of searchTerms) {
    if (!matchedDest) {
      matchedDest = await Destination.findOne({
        $or: [
          { slug: term.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
          { name: new RegExp(`^${term.trim()}$`, 'i') }
        ]
      }).lean();
    }
  }

  // Fallback to destinationResolver
  if (!matchedDest && searchTerms.length > 0) {
    for (const term of searchTerms) {
      const res = resolveDestination(term);
      if (res && res.slug) {
        canonicalSlug = res.slug;
        matchedDest = await Destination.findOne({ slug: res.slug }).lean();
        if (matchedDest) break;
      }
    }
  }

  const destId = matchedDest ? matchedDest._id : null;
  const resolvedSlug = matchedDest ? matchedDest.slug : (canonicalSlug || (destination ? destination.toLowerCase().replace(/[^a-z0-9]+/g, '-') : null));

  // Determine coordinates
  let lon = null;
  let lat = null;

  if (location && typeof location === 'object') {
    if (Array.isArray(location.coordinates) && location.coordinates.length >= 2) {
      lon = Number(location.coordinates[0]);
      lat = Number(location.coordinates[1]);
    } else if (location.latitude !== undefined && location.longitude !== undefined) {
      lat = Number(location.latitude);
      lon = Number(location.longitude);
    } else if (location.lat !== undefined && (location.lng !== undefined || location.lon !== undefined)) {
      lat = Number(location.lat);
      lon = Number(location.lng !== undefined ? location.lng : location.lon);
    }
  } else if (latitude !== undefined && longitude !== undefined) {
    lat = Number(latitude);
    lon = Number(longitude);
  }

  // Fallback to matched destination coordinates if not supplied
  if ((lon === null || lat === null || isNaN(lon) || isNaN(lat)) && matchedDest?.location?.coordinates?.length === 2) {
    lon = Number(matchedDest.location.coordinates[0]);
    lat = Number(matchedDest.location.coordinates[1]);
  }

  let finalLocation = null;
  if (lon !== null && lat !== null && !isNaN(lon) && !isNaN(lat)) {
    // Canonical coordinate validation: longitude [-180, 180], latitude [-90, 90]
    if (lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90) {
      finalLocation = {
        type: 'Point',
        coordinates: [lon, lat]
      };
    }
  }

  return {
    destination: destId,
    destinationSlug: resolvedSlug,
    location: finalLocation
  };
}

// Helper to resolve partner profile for a user (with auto-provisioning for platform admin test accounts)
export async function resolvePartnerForUser(user) {
  if (!user) return null;
  let partner = await Partner.findOne({ user: user._id });
  if (!partner && (user.role === 'admin' || user.email === 'deepanshukapri4@gmail.com')) {
    partner = await Partner.findOne({ email: user.email });
    if (!partner) {
      partner = await Partner.create({
        user: user._id,
        businessName: 'Uttarakhand Tourism Master Partner',
        legalBusinessName: 'Uttarakhand Tourism Development Board',
        partnerType: 'Homestay',
        phone: user.phone || '+91 9876543210',
        email: user.email,
        district: 'Dehradun',
        city: 'Dehradun',
        address: 'Paryatan Bhawan, Cult Road, Dehradun',
        description: 'Official partner business and verification test hub.',
        status: 'APPROVED',
        verificationStatus: 'VERIFIED',
        isVerified: true
      });
    }
  }
  return partner;
}
