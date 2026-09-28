/**
 * Discovery Uttarakhand — Stay Entity Image Resolver
 * 
 * STRICT RULES ENFORCED:
 * 1. Image must belong to the exact Stay entity.
 * 2. NO arbitrary Google Image Search / Serper or Pexels runtime replacement.
 * 3. NO random rotation of other stay images.
 * 4. Missing image -> Stay-Specific Placeholder ("${stay.name} - Photo Unavailable").
 */

import { getAssetUrl, getEntityPlaceholderSvg } from './imageHelpers';

/**
 * Resolve authentic image for a Stay/Homestay
 * @param {Object} stay - Stay model or JSON object
 * @returns {Promise<string>} Image URL or Entity Placeholder
 */
export async function getStayImage(stay) {
  if (!stay) return getEntityPlaceholderSvg({ name: 'Stay', category: 'Stay' });

  // 1. Database images belonging to this stay
  if (Array.isArray(stay.images) && stay.images.length > 0) {
    const cover = stay.images.find(img => img && typeof img === 'object' && img.isCover)?.url || 
                  (typeof stay.images[0] === 'string' ? stay.images[0] : stay.images[0]?.url);
    if (cover && typeof cover === 'string' && cover.trim().length > 5 && !cover.includes('placeholder')) {
      return getAssetUrl(cover.trim());
    }
  }

  if (typeof stay.image === 'string' && stay.image.trim().length > 5 && !stay.image.includes('placeholder')) {
    return getAssetUrl(stay.image.trim());
  }

  // 2. Specific KMVN / GMVN official badge asset if government rest house
  if (stay.isGovt || (stay.name && (stay.name.includes('KMVN') || stay.name.includes('GMVN')))) {
    return getAssetUrl('/assets/kmvn-stay.svg');
  }

  // 3. Fallback strictly to stay-specific placeholder
  return getEntityPlaceholderSvg({
    name: stay.name || stay.title || 'Mountain Homestay',
    category: stay.category || 'Homestay',
    slug: stay.slug
  });
}

/**
 * Fetch multiple authentic images for stay gallery
 */
export async function getStayImages(stay, count = 3) {
  if (!stay) return [getEntityPlaceholderSvg({ name: 'Stay', category: 'Stay' })];

  const results = [];

  // Check stay images array
  if (Array.isArray(stay.images) && stay.images.length > 0) {
    for (const img of stay.images) {
      const u = typeof img === 'string' ? img : img?.url;
      if (u && !results.includes(u) && !u.includes('placeholder')) {
        results.push(getAssetUrl(u));
        if (results.length >= count) break;
      }
    }
  }

  if (results.length === 0 && typeof stay.image === 'string' && stay.image.length > 5) {
    results.push(getAssetUrl(stay.image));
  }

  if (results.length === 0) {
    results.push(await getStayImage(stay));
  }

  return results;
}

export default {
  getStayImage,
  getStayImages
};
