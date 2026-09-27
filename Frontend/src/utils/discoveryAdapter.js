/**
 * Discovery Uttarakhand - Candidate Normalizer
 * Adapts any discovery entity (Destination, Activity, Place, Stay, Rental, Guide)
 * to strictly adhere to the useMapStore and Trip Planner contract:
 * {
 *   _id, id, name, slug, coordinates: [lat, lng], district, category, itemType, image, coverImage, detailUrl, price, priceProvenance
 * }
 */
export const normalizeDiscoveryCandidate = (item, parentDestination = {}) => {
  if (!item) return null;

  let cleanId = '';
  if (typeof item._id === 'string' && item._id.length > 0) cleanId = item._id;
  else if (typeof item.id === 'string' && item.id.length > 0) cleanId = item.id;
  else if (item._id && typeof item._id === 'object' && item._id.toString && !item._id.toString().includes('object Object')) cleanId = item._id.toString();
  else if (item.id && typeof item.id === 'object' && item.id.toString && !item.id.toString().includes('object Object')) cleanId = item.id.toString();
  else cleanId = String(Math.random());

  let cleanSlug = '';
  if (typeof item.slug === 'string' && item.slug.trim() && !item.slug.includes('object Object')) cleanSlug = item.slug.trim();
  else if (typeof item.name === 'string' && item.name.trim()) cleanSlug = item.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  else cleanSlug = cleanId;

  const id = cleanId;
  const name = item.name || item.title || 'Uttarakhand Experience';
  const district = item.district || parentDestination.district || 'Uttarakhand';
  const category = item.category || item.itemType || 'Destination';
  const itemType = (item.itemType || category || 'destination').toLowerCase();

  // Coordinates: ensure [latitude, longitude] strictly in this order
  let coordinates = null;
  if (Array.isArray(item.coordinates) && item.coordinates.length === 2 && Number.isFinite(item.coordinates[0]) && Number.isFinite(item.coordinates[1])) {
    coordinates = [item.coordinates[0], item.coordinates[1]];
  } else if (item.location && Array.isArray(item.location.coordinates) && item.location.coordinates.length === 2) {
    // GeoJSON Point is [lng, lat] -> convert to [lat, lng]
    coordinates = [item.location.coordinates[1], item.location.coordinates[0]];
  } else if (parentDestination.coordinates && Array.isArray(parentDestination.coordinates)) {
    coordinates = parentDestination.coordinates;
  } else if (parentDestination.location?.coordinates && Array.isArray(parentDestination.location.coordinates)) {
    coordinates = [parentDestination.location.coordinates[1], parentDestination.location.coordinates[0]];
  } else {
    coordinates = [30.0, 79.5]; // Uttarakhand central baseline
  }

  // Resolve Image
  let imageUrl = '/assets/fallback.svg';
  if (typeof item.image === 'string' && item.image) imageUrl = item.image;
  else if (item.image?.url) imageUrl = item.image.url;
  else if (item.coverImage?.url) imageUrl = item.coverImage.url;
  else if (typeof item.coverImage === 'string' && item.coverImage) imageUrl = item.coverImage;
  else if (Array.isArray(item.images) && item.images.length > 0) {
    const first = item.images[0];
    imageUrl = first?.url || (typeof first === 'string' ? first : '/assets/fallback.svg');
  } else if (parentDestination.coverImage?.url) {
    imageUrl = parentDestination.coverImage.url;
  }

  // Route URL based on domain type
  let detailUrl = `/destinations/${cleanSlug}`;
  if (itemType === 'spiritual') detailUrl = `/spiritual/${cleanSlug}`;
  else if (itemType === 'culture') detailUrl = `/culture/${cleanSlug}`;
  else if (itemType === 'activity') detailUrl = `/activities/${cleanSlug}`;
  else if (itemType === 'stay') detailUrl = `/stays/${cleanSlug}`;
  else if (itemType === 'rental') detailUrl = `/rentals`;
  else if (itemType === 'guide') detailUrl = `/guides/${cleanSlug}`;

  return {
    _id: id,
    id: id,
    slug: cleanSlug,
    name: name,
    district: district,
    category: category,
    type: itemType,
    itemType: itemType,
    coordinates: coordinates,
    image: imageUrl,
    coverImage: { url: imageUrl },
    detailUrl: detailUrl,
    distanceKm: item.distanceKm || null,
    price: item.price || null,
    priceProvenance: item.priceProvenance || 'PRICE NOT VERIFIED',
    description: item.shortDescription || item.description || ''
  };
};

/**
 * Helper to render honest price provenance badge
 */
export const getProvenanceBadge = (provenance) => {
  switch (provenance) {
    case 'VERIFIED':
      return {
        text: 'VERIFIED PRICE',
        className: 'bg-emerald-500/10 text-emerald-700 border border-emerald-300'
      };
    case 'PARTNER_CLAIMED':
      return {
        text: 'PARTNER CLAIMED',
        className: 'bg-blue-500/10 text-blue-700 border border-blue-300'
      };
    case 'ESTIMATED':
      return {
        text: 'ESTIMATED',
        className: 'bg-amber-500/10 text-amber-700 border border-amber-300'
      };
    case 'FREE_ACCESS':
      return {
        text: 'FREE ACCESS',
        className: 'bg-slate-100 text-slate-700 border border-slate-200'
      };
    default:
      return {
        text: 'PRICE NOT VERIFIED',
        className: 'bg-stone-100 text-stone-600 border border-stone-200'
      };
  }
};
