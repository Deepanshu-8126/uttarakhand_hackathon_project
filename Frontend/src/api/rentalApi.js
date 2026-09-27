import api from './api';

export const getVehicleImage = (name = '', type = '') => {
  const n = (name + ' ' + type).toLowerCase();
  
  // Royal Enfield Adventure / Cruisers
  if (n.includes('himalayan')) {
    return 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80';
  }
  if (n.includes('classic 350') || n.includes('classic') || n.includes('standard')) {
    return '/assets/classic-350.jpg';
  }
  if (n.includes('bullet') || n.includes('meteor') || n.includes('hunter') || n.includes('thunderbird') || n.includes('interceptor')) {
    return 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80';
  }

  // Sports & Street Motorcycles (TVS Apache, Pulsar, Duke, XPulse, R15, MT-15)
  if (n.includes('apache') || n.includes('pulsar') || n.includes('duke') || n.includes('r15') || n.includes('mt-15') || n.includes('fz') || n.includes('xpulse')) {
    return 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80';
  }
  if (n.includes('splendor') || n.includes('deluxe') || n.includes('shine') || n.includes('avenger')) {
    return 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80';
  }

  // Scooters
  if (n.includes('ntorq') || n.includes('burgman') || n.includes('vespa')) {
    return 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&w=800&q=80';
  }
  if (n.includes('jupiter') || n.includes('access') || n.includes('fascino')) {
    return '/assets/activa-2.jpg';
  }
  if (n.includes('activa') || n.includes('scooty') || n.includes('scooter') || n.includes('dio')) {
    return '/assets/activa.jpg';
  }
  
  // SUVs / 4x4 / Big Mountain Cars
  if (n.includes('thar') || n.includes('gurkha') || n.includes('4x4') || n.includes('jeep') || n.includes('gypsy')) {
    return '/assets/pickup-1.jpg';
  }
  if (n.includes('scorpio') || n.includes('bolero') || n.includes('xuv') || n.includes('safari') || n.includes('fortuner') || n.includes('nexon') || n.includes('creta') || n.includes('harrier')) {
    return '/assets/pickup-2.jpg';
  }
  if (n.includes('innova') || n.includes('dzire') || n.includes('swift') || n.includes('baleno') || n.includes('etios') || n.includes('city') || n.includes('car') || n.includes('taxi') || n.includes('sedan')) {
    return '/assets/innova.jpg';
  }

  // Default bike fallback
  if (n.includes('bike') || n.includes('motorcycle')) {
    return 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80';
  }

  return '/assets/activa.jpg';
};

export const getRentals = async () => {
  const response = await api.get('/rentals');
  if (response.data && response.data.success) {
    const flattened = [];
    response.data.data.forEach(biz => {
      const displayLocation = `${biz.city || ''}${biz.city && biz.district ? ', ' : ''}${biz.district || 'Uttarakhand'}`;
      if (biz.vehicles && Array.isArray(biz.vehicles) && biz.vehicles.length > 0) {
        biz.vehicles.forEach((v, index) => {
          // Extract vehicle image with priority to valid real vehicle URL
          let rawUrl = v.image?.url || (typeof v.image === 'string' ? v.image : null);
          if (
            !rawUrl || 
            rawUrl.includes('wikimedia.org') ||
            rawUrl.includes('interior.png') || 
            rawUrl.includes('unsplash.com') ||
            rawUrl.includes('fallback.svg')
          ) {
            rawUrl = getVehicleImage(v.name, v.type || v.typeDetail);
          }

          flattened.push({
            ...biz,
            ...v,
            id: (biz._id || biz.id) + '_' + index,
            _id: biz._id || biz.id,
            slug: (biz.slug || '') + '-' + v.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            name: v.name, // Vehicle name takes precedence
            businessName: biz.name,
            price: v.pricePerDay || biz.pricePerDay || null,
            pricePerDay: v.pricePerDay || biz.pricePerDay || null,
            type: v.type || v.category || biz.category,
            category: v.category || v.type || biz.category,
            city: biz.city,
            district: biz.district,
            location: displayLocation,
            available: true,
            coverImage: rawUrl,
            image: rawUrl,
            images: [rawUrl],
            rating: biz.rating || 4.8,
            ratingSource: biz.ratingSource || 'Verified Mountain Fleet'
          });
        });
      } else {
         const fallbackImg = getVehicleImage(biz.name, biz.category);
         flattened.push({
           ...biz,
           location: displayLocation,
           coverImage: fallbackImg,
           image: fallbackImg,
           images: [fallbackImg]
         });
      }
    });
    response.data.data = flattened;
  }
  return response.data;
};

export const getRentalById = async (id) => {
  const response = await api.get(`/rentals/${id}`);
  return response.data;
};
export const createRental = async (data) => {
  const response = await api.post('/rentals', data);
  return response.data;
};

export const updateRental = async (id, data) => {
  const response = await api.put(`/rentals/${id}`, data);
  return response.data;
};

export const deleteRental = async (id) => {
  const response = await api.delete(`/rentals/${id}`);
  return response.data;
};
