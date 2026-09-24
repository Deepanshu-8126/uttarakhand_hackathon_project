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

const VEHICLE_RENTAL_IMAGES = [
  'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1200&auto=format&fit=crop', // Royal Enfield Himalayan Adventure
  'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=1200&auto=format&fit=crop', // Royal Enfield Classic 350 Reborn
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1200&auto=format&fit=crop', // Mahindra Thar 4x4 Mountain Expedition
  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1200&auto=format&fit=crop', // Self-Drive Mountain Sedan
  'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1200&auto=format&fit=crop', // Mountain Tourer Cruiser
  'https://images.unsplash.com/photo-1508974239320-0a029497e820?q=80&w=1200&auto=format&fit=crop'  // Himalayan Scrambler / Trail Bike
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
    // Filter out generic duplicate svg illustrations and low-res diagram screenshots
    if (url && typeof url === 'string' && !url.includes('.svg') && !url.includes('interior.png') && !images.includes(url)) {
      images.push(url);
    }
  };

  // 1. Primary cover image / image
  if (item.coverImage) addUrl(item.coverImage);
  if (item.image) addUrl(item.image);
  if (item.profileImage) addUrl(item.profileImage);

  // 2. Extract vehicle photos from rental fleets
  if (Array.isArray(item.vehicles)) {
    item.vehicles.forEach(v => {
      if (v?.image) addUrl(v.image);
      if (v?.coverImage) addUrl(v.coverImage);
      if (Array.isArray(v?.images)) v.images.forEach(img => addUrl(img));
    });
  }

  // 3. Extract fleet array
  if (Array.isArray(item.fleet)) {
    item.fleet.forEach(f => {
      if (f?.image) addUrl(f.image);
      if (f?.coverImage) addUrl(f.coverImage);
    });
  }

  // 4. Gallery array
  if (Array.isArray(item.gallery)) {
    item.gallery.forEach(g => addUrl(g));
  }

  // 5. Images array
  if (Array.isArray(item.images)) {
    item.images.forEach(img => addUrl(img));
  }

  // 6. Photos array
  if (Array.isArray(item.photos)) {
    item.photos.forEach(p => addUrl(p));
  }

  // If no valid real photos found, pick a deterministic diverse high-res photo based on category
  if (images.length === 0) {
    const isVehicle = item.category?.toLowerCase()?.includes('rental') || 
                      item.category?.toLowerCase()?.includes('bike') || 
                      item.category?.toLowerCase()?.includes('car') || 
                      item.category?.toLowerCase()?.includes('scooter') || 
                      item.type?.toLowerCase()?.includes('bike') || 
                      item.type?.toLowerCase()?.includes('scooter') || 
                      item.type?.toLowerCase()?.includes('car') || 
                      item.type?.toLowerCase()?.includes('motorcycle') || 
                      item.type?.toLowerCase()?.includes('suv') || 
                      item.vehicleType || 
                      item.pricePerDay || 
                      (Array.isArray(item.vehicles) && item.vehicles.length > 0);

    const pool = isVehicle ? VEHICLE_RENTAL_IMAGES : MOUNTAIN_STAY_IMAGES;
    const seedStr = (item.name || item.id || item._id || item.slug || 'item').toString();
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = (hash << 5) - hash + seedStr.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % pool.length;
    return [pool[idx]];
  }

  return images;
}

