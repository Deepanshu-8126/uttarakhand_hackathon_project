/**
 * Discovery Uttarakhand - Image Extraction & Normalization Helper
 * Safely extracts an array of clean image URL strings from any listing/card item.
 */

const MOUNTAIN_STAY_IMAGES = [
  'https://images.unsplash.com/photo-1542157675-99d949ad5f23?q=80&w=800&auto=format&fit=crop', // Cozy Wooden Cottage
  'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=800&auto=format&fit=crop', // Riverside Valley Eco Camp
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop', // Snow Peak Himalayan Retreat
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800&auto=format&fit=crop', // Pine Forest Chalet
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop', // High Altitude Mountain Base
  'https://images.unsplash.com/photo-1587061949409-02df41d5e562?q=80&w=800&auto=format&fit=crop', // Stone & Cedar Pahadi Homestay
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop', // Trishul Peak View Homestay
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800&auto=format&fit=crop'  // Himalayan Valley Orchard Cabin
];

export function getCardImages(item, fallbackUrl = '/assets/fallback.svg') {
  if (!item) return [fallbackUrl];

  const images = [];

  const addUrl = (val) => {
    if (!val) return;
    let url = null;
    if (typeof val === 'string' && val.trim() !== '') {
      url = val.trim();
    } else if (typeof val === 'object' && val !== null) {
      url = val.url || val.secure_url || val.src || null;
    }
    // Filter out generic duplicate svg illustrations if real photos are needed
    if (url && typeof url === 'string' && !url.includes('.svg') && !images.includes(url)) {
      images.push(url);
    }
  };

  // 1. Primary cover image / image
  if (item.coverImage) addUrl(item.coverImage);
  if (item.image) addUrl(item.image);
  if (item.profileImage) addUrl(item.profileImage);

  // 2. Gallery array
  if (Array.isArray(item.gallery)) {
    item.gallery.forEach(g => addUrl(g));
  }

  // 3. Images array
  if (Array.isArray(item.images)) {
    item.images.forEach(img => addUrl(img));
  }

  // 4. Photos array
  if (Array.isArray(item.photos)) {
    item.photos.forEach(p => addUrl(p));
  }

  // If no valid real photos found, pick a deterministic diverse mountain homestay photo
  if (images.length === 0) {
    const seedStr = (item.name || item.id || item._id || item.slug || 'stay').toString();
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = (hash << 5) - hash + seedStr.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % MOUNTAIN_STAY_IMAGES.length;
    return [MOUNTAIN_STAY_IMAGES[idx]];
  }

  return images;
}

