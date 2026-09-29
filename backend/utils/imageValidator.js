/**
 * Discovery Uttarakhand - Strict Image Integrity & Entity Ownership Validator
 * Enforces:
 * 1. Image must belong to the entity being displayed.
 * 2. Zero cross-destination, nearby, or random image fallback.
 * 3. Fallback only to same-entity image or entity-specific placeholder.
 */

const KNOWN_DESTINATIONS = [
  'kedarnath', 'badrinath', 'nainital', 'khurpatal', 'bhimtal',
  'mussoorie', 'rishikesh', 'auli', 'chopta', 'valley_of_flowers',
  'gangotri', 'yamunotri', 'haridwar', 'munsiyari', 'almora', 'kausani',
  'ranikhet', 'dhanaulti', 'kanatal', 'sattal', 'naukuchiatal'
];

/**
 * Generate a clean, brand-compliant entity-specific placeholder SVG data URI.
 * Guarantees that "Photo Unavailable" is displayed with the exact entity name and category.
 */
export function getEntityPlaceholderSvg({ name = 'Destination', category = 'Destination', slug = '' } = {}) {
  const safeName = String(name || 'Uttarakhand Entity')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  const safeCategory = String(category || 'Entity').toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#09261e" />
      <stop offset="100%" stop-color="#0c0a09" />
    </linearGradient>
    <linearGradient id="glowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#00FF88" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#00FF88" stop-opacity="0" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bgGrad)"/>
  <rect width="100%" height="100%" fill="url(#glowGrad)"/>
  <path d="M0 600 L220 280 L380 460 L580 180 L800 520 L800 600 Z" fill="#00FF88" opacity="0.06"/>
  <path d="M80 600 L280 360 L440 540 L640 320 L800 560 L800 600 Z" fill="#00FF88" opacity="0.08"/>
  <g text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
    <circle cx="400" cy="220" r="48" fill="#064e3b" stroke="#00FF88" stroke-width="2" opacity="0.6"/>
    <path d="M375 235 L400 195 L425 235 Z" fill="#00FF88" opacity="0.8"/>
    <circle cx="418" cy="210" r="4" fill="#00FF88"/>
    <text x="400" y="320" font-size="28" font-weight="700" fill="#ffffff" letter-spacing="1">${safeName}</text>
    <text x="400" y="358" font-size="14" font-weight="600" fill="#00FF88" letter-spacing="3">${safeCategory}</text>
    <text x="400" y="395" font-size="15" fill="#a8a29e" letter-spacing="1">Photo Unavailable</text>
    <text x="400" y="425" font-size="12" fill="#78716c">Authentic Verified Image Pending</text>
  </g>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Validates that an image belongs strictly to the target entity.
 * Rejects images associated with other entities or showing strong cross-contamination.
 */
export function validateImageBelongsToEntity(image, entity) {
  if (!image) return { valid: false, reason: 'Image is null or empty' };
  
  const url = typeof image === 'string' ? image : image.url;
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return { valid: false, reason: 'Missing image URL' };
  }

  const entityId = String(entity._id || entity.id || entity.slug || '').trim();
  const entitySlug = String(entity.slug || '').toLowerCase().trim();
  const entityName = String(entity.name || entity.title || '').toLowerCase().trim();
  const entityType = String(entity.entityType || entity.type || entity.category || 'destination').toLowerCase().trim();

  // 1. If image has explicit entityId metadata, it MUST match the entity
  if (typeof image === 'object' && image !== null) {
    if (image.entityId && String(image.entityId) !== entityId && String(image.entityId) !== entitySlug) {
      return {
        valid: false,
        reason: `Image entityId (${image.entityId}) does not match current entity (${entityId})`
      };
    }
    if (image.entityType && entityType && !image.entityType.toLowerCase().includes(entityType) && !entityType.includes(image.entityType.toLowerCase())) {
      // E.g., stay image on destination or vice versa
      if (image.entityType === 'stay' && entityType === 'destination') {
        return { valid: false, reason: `Image entityType (${image.entityType}) does not match (${entityType})` };
      }
    }
  }

  const urlLower = url.toLowerCase();
  const altLower = (typeof image === 'object' && image.alt ? image.alt : '').toLowerCase();

  // 2. Strict Cross-Category Semantic Protection
  const isStay = entityType.includes('stay') || entityType.includes('hotel') || entityType.includes('homestay') || entityType.includes('resort');
  const isRental = entityType.includes('rental') || entityType.includes('vehicle') || entityType.includes('bike') || entityType.includes('car');
  const isGuide = entityType.includes('guide');
  const isDestination = entityType.includes('destination');


  const rentalMarkers = ['bike', 'motorcycle', 'scooter', 'bullet', 'activa', 'vehicle', 'car-rental', 'fleet'];
  const stayMarkers = ['hotel', 'resort', 'homestay', 'room', 'bed', 'cottage', 'lodge', 'dormitory'];
  const destinationMarkers = ['temple', 'dham', 'lake', 'waterfall', 'pass', 'glacier', 'valley-of-flowers'];

  if (isStay) {
    if (rentalMarkers.some(m => urlLower.includes(m) || altLower.includes(m))) {
      return { valid: false, reason: 'Stay entity cannot receive a vehicle/rental image' };
    }
  }

  if (isRental) {
    if (stayMarkers.some(m => urlLower.includes(m) || altLower.includes(m))) {
      return { valid: false, reason: 'Rental entity cannot receive a hotel/stay image' };
    }
  }

  if (isGuide) {
    if (destinationMarkers.some(m => urlLower.includes(m) || altLower.includes(m)) ||
        stayMarkers.some(m => urlLower.includes(m) || altLower.includes(m)) ||
        rentalMarkers.some(m => urlLower.includes(m) || altLower.includes(m))) {
      return { valid: false, reason: 'Guide entity cannot receive destination, stay, or vehicle image' };
    }
  }

  if (isDestination) {
    if (rentalMarkers.some(m => urlLower.includes(m) || altLower.includes(m))) {
      return { valid: false, reason: 'Destination entity cannot receive a rental vehicle image' };
    }
  }

  // 3. Cross-Destination Filename / Semantic Check
  for (const known of KNOWN_DESTINATIONS) {
    const cleanKnown = known.replace(/_/g, ' ');
    const isCurrent = entitySlug.includes(known) || entitySlug.includes(known.replace(/_/g, '-')) || entityName.includes(cleanKnown);

    if (!isCurrent) {
      // If the URL or alt strictly references this foreign known destination file
      if (urlLower.includes(`/assets/${known}.jpg`) || 
          urlLower.includes(`/assets/destinations/${known}/`) ||
          altLower.includes(`${cleanKnown} temple`) ||
          altLower.includes(`${cleanKnown} dham`)) {
        return {
          valid: false,
          reason: `Image clearly belongs to '${cleanKnown}' but current entity is '${entityName}' (${entitySlug})`
        };
      }
    }
  }

  return { valid: true, reason: 'OK' };
}


/**
 * Filter an array of images to strictly those belonging to the given entity.
 */
export function filterEntityImages(images, entity) {
  if (!Array.isArray(images)) return [];
  return images.filter(img => validateImageBelongsToEntity(img, entity).valid);
}

/**
 * Resolve canonical cover image for an entity following the strict priority:
 * 1. entity.coverImage where entityId matches
 * 2. entity.images where isCover === true
 * 3. entity.images first valid image belonging to SAME entity
 * 4. entity-specific placeholder
 */
export function resolveEntityCoverImage(entity) {
  if (!entity) return getEntityPlaceholderSvg();

  // 1. Check coverImage
  if (entity.coverImage) {
    const validation = validateImageBelongsToEntity(entity.coverImage, entity);
    if (validation.valid) {
      const url = typeof entity.coverImage === 'string' ? entity.coverImage : entity.coverImage.url;
      if (url && !url.includes('placeholder')) return url;
    }
  }

  // 2. Check images[] with isCover === true
  if (Array.isArray(entity.images)) {
    const coverItem = entity.images.find(img => img && typeof img === 'object' && img.isCover);
    if (coverItem) {
      const validation = validateImageBelongsToEntity(coverItem, entity);
      if (validation.valid && coverItem.url) return coverItem.url;
    }
  }

  // 3. Check gallery[] / images[] for first valid image of SAME entity
  const list = [
    ...(Array.isArray(entity.images) ? entity.images : []),
    ...(Array.isArray(entity.gallery) ? entity.gallery : [])
  ];

  for (const img of list) {
    const validation = validateImageBelongsToEntity(img, entity);
    if (validation.valid) {
      const url = typeof img === 'string' ? img : img.url;
      if (url && !url.includes('placeholder')) return url;
    }
  }

  // 4. Check known verified landmark assets (e.g., Raj Bhavan Nainital)
  const normName = (entity.name || entity.title || '').toLowerCase().trim();
  if (normName.includes('raj bhavan') || normName.includes('governor house')) {
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Governor_House%2C_Nainital%2C_Uttarakhand%2C_India.jpg/1920px-Governor_House%2C_Nainital%2C_Uttarakhand%2C_India.jpg';
  }

  // 5. Strict entity-specific placeholder
  return getEntityPlaceholderSvg({
    name: entity.name || entity.title,
    category: entity.category || entity.entityType || 'Destination',
    slug: entity.slug
  });
}

/**
 * Canonical Image Normalizer
 * Returns structured image contract: { url, source, entityId, entityType, verified, isPlaceholder }
 */
export function normalizeEntityImage(entity) {
  if (!entity) {
    return {
      url: getEntityPlaceholderSvg({ name: 'Entity' }),
      source: 'Entity Placeholder',
      entityId: null,
      entityType: null,
      verified: false,
      isPlaceholder: true
    };
  }

  const entityId = String(entity._id || entity.id || entity.slug || entity.place_id || '');
  const entityType = String(entity.entityType || entity.type || entity.category || 'destination');
  const entityName = String(entity.name || entity.title || '');

  // 1. Check coverImage
  if (entity.coverImage) {
    const val = validateImageBelongsToEntity(entity.coverImage, entity);
    if (val.valid) {
      const url = typeof entity.coverImage === 'string' ? entity.coverImage : entity.coverImage.url;
      if (url && typeof url === 'string' && url.length > 5 && !url.includes('placeholder')) {
        return {
          url,
          source: typeof entity.coverImage === 'object' ? (entity.coverImage.source || 'Database Verified') : 'Database Record',
          entityId,
          entityType,
          verified: true,
          isPlaceholder: false
        };
      }
    }
  }

  // 2. Check images[] where isCover === true
  if (Array.isArray(entity.images)) {
    const coverItem = entity.images.find(img => img && typeof img === 'object' && img.isCover);
    if (coverItem) {
      const val = validateImageBelongsToEntity(coverItem, entity);
      if (val.valid && coverItem.url) {
        return {
          url: coverItem.url,
          source: coverItem.source || 'Database Verified',
          entityId,
          entityType,
          verified: true,
          isPlaceholder: false
        };
      }
    }
  }

  // 3. Check first valid image in images[] or gallery[]
  const list = [
    ...(Array.isArray(entity.images) ? entity.images : []),
    ...(Array.isArray(entity.gallery) ? entity.gallery : [])
  ];

  for (const img of list) {
    const val = validateImageBelongsToEntity(img, entity);
    if (val.valid) {
      const url = typeof img === 'string' ? img : img.url;
      if (url && typeof url === 'string' && url.length > 5 && !url.includes('placeholder')) {
        return {
          url,
          source: typeof img === 'object' ? (img.source || 'Database Record') : 'Database Record',
          entityId,
          entityType,
          verified: true,
          isPlaceholder: false
        };
      }
    }
  }

  // 4. Check known verified landmark assets (e.g. Raj Bhavan Nainital)
  const normName = entityName.toLowerCase().trim();
  if (normName.includes('raj bhavan') || normName.includes('governor house')) {
    return {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Governor_House%2C_Nainital%2C_Uttarakhand%2C_India.jpg/1920px-Governor_House%2C_Nainital%2C_Uttarakhand%2C_India.jpg',
      source: 'Wikimedia Commons Verified',
      entityId,
      entityType,
      verified: true,
      isPlaceholder: false
    };
  }

  // 5. Strict Category / Entity-Specific SVG Placeholder
  const placeholderUrl = getEntityPlaceholderSvg({
    name: entityName,
    category: entityType,
    slug: entity.slug
  });

  return {
    url: placeholderUrl,
    source: 'Entity Placeholder',
    entityId,
    entityType,
    verified: false,
    isPlaceholder: true
  };
}

/**
 * Resolve canonical single image URL for an entity
 */
export function resolveEntityImage(entity) {
  return normalizeEntityImage(entity).url;
}
