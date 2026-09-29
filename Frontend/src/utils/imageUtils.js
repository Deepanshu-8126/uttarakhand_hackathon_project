/**
 * Discovery Uttarakhand - Strict Image Integrity & Entity Image Resolver
 * Guarantees zero cross-contamination and deterministic brand SVG placeholders.
 */

export function getEntityPlaceholderSvg({ name = 'Listing', category = 'Listing' } = {}) {
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
    <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
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
    <text x="400" y="395" font-size="15" fill="#a8a29e" letter-spacing="1">Authentic Photography Pending</text>
    <text x="400" y="425" font-size="12" fill="#78716c">Discovery Uttarakhand Brand Verified</text>
  </g>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Safely resolves entity image or yields brand SVG placeholder.
 */
export function resolveEntityImage(entity, entityType = 'stay') {
  if (!entity) return getEntityPlaceholderSvg({ name: 'Listing', category: entityType });

  // 1. Direct url if string
  if (typeof entity === 'string' && entity.startsWith('http')) return entity;

  // 2. Direct image array
  const images = entity.images || (entity.image ? [entity.image] : []);
  if (Array.isArray(images) && images.length > 0) {
    const first = images[0];
    const url = typeof first === 'string' ? first : (first?.url || first?.src);
    if (url && typeof url === 'string' && url.startsWith('http')) {
      return url;
    }
  }

  // 3. Fallback to brand SVG placeholder
  const title = entity.name || entity.title || entity.businessName || 'Mountain Listing';
  const category = entity.category || entity.propertyType || entity.vehicleType || entityType;
  return getEntityPlaceholderSvg({ name: title, category });
}

export const getImageUrl = (image, fallback = null) => {
  if (!image) return fallback || getEntityPlaceholderSvg();
  if (typeof image === 'string') return image;
  if (image && typeof image === 'object' && image.url) return image.url;
  return fallback || getEntityPlaceholderSvg();
};

export function getFirstValidImage(images, category = 'Listing') {
  if (Array.isArray(images) && images.length > 0) {
    const first = images[0];
    const url = typeof first === 'string' ? first : (first?.url || first?.src);
    if (url && typeof url === 'string' && (url.startsWith('http') || url.startsWith('/'))) {
      return url;
    }
  }
  return getEntityPlaceholderSvg({ name: 'Tourism Service', category });
}


