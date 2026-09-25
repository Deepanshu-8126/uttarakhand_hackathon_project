import api from './api';

export const getVehicleImage = (name = '', type = '') => {
  const n = (name + ' ' + type).toLowerCase();
  
  // Royal Enfield / Adventure / Cruisers
  if (n.includes('himalayan')) {
    return '/assets/rentals/dhanaulti-royal-enfield-himalayan/cover.jpg';
  }
  if (n.includes('classic 350') || n.includes('classic') || n.includes('standard')) {
    return '/assets/rentals/pithoragarh-royal-enfield-classic-350/cover.jpg';
  }
  if (n.includes('bullet')) {
    return '/assets/rentals/tehri-royal-enfield-bullet-350/cover.jpg';
  }
  if (n.includes('meteor')) {
    return '/assets/rentals/rudraprayag-royal-enfield-meteor-350/cover.jpg';
  }
  if (n.includes('interceptor') || n.includes('continental')) {
    return '/assets/rentals/kanatal-royal-enfield-interceptor-650/cover.jpg';
  }
  if (n.includes('thunderbird')) {
    return '/assets/rentals/pithoragarh-royal-enfield-classic-350/cover.jpg';
  }

  // Scooters
  if (n.includes('activa 5g')) {
    return '/assets/rentals/lansdowne-honda-activa-5g/cover.jpg';
  }
  if (n.includes('activa')) {
    return '/assets/rentals/srinagar-honda-activa-6g/cover.jpg';
  }
  if (n.includes('jupiter')) {
    return '/assets/rentals/lansdowne-tvs-jupiter/cover.jpg';
  }
  if (n.includes('ntorq')) {
    return '/assets/rentals/rishikesh-tvs-ntorq-125/cover.jpg';
  }
  if (n.includes('access')) {
    return '/assets/rentals/ramnagar-suzuki-access-125/cover.jpg';
  }
  if (n.includes('burgman')) {
    return '/assets/rentals/ramnagar-suzuki-burgman-street/cover.jpg';
  }
  if (n.includes('vespa')) {
    return '/assets/rentals/bhimtal-vespa-zx-125/cover.jpg';
  }
  if (n.includes('fascino') || n.includes('ray zr') || n.includes('ray')) {
    return '/assets/rentals/bhimtal-yamaha-fascino/cover.jpg';
  }
  if (n.includes('scooty') || n.includes('scooter') || n.includes('dio')) {
    return '/assets/rentals/srinagar-honda-activa-6g/cover.jpg';
  }
  
  // Bikes / Trail
  if (n.includes('xpulse') || n.includes('impulse') || n.includes('scram')) {
    return '/assets/rentals/chamoli-hero-xpulse-200/cover.jpg';
  }
  if (n.includes('apache')) {
    return '/assets/rentals/chopta-tvs-apache-rtr-160/cover.jpg';
  }
  if (n.includes('pulsar')) {
    return '/assets/rentals/ramnagar-bajaj-pulsar-150/cover.jpg';
  }
  if (n.includes('duke') || n.includes('ktm') || n.includes('rc 200') || n.includes('rc 390')) {
    return '/assets/rentals/bhimtal-ktm-duke-200/cover.jpg';
  }
  if (n.includes('r15')) {
    return '/assets/rentals/rishikesh-yamaha-r15-v4/cover.jpg';
  }
  if (n.includes('mt-15') || n.includes('fz')) {
    return '/assets/rentals/ramnagar-yamaha-mt-15/cover.jpg';
  }
  if (n.includes('avenger')) {
    return '/assets/rentals/pithoragarh-royal-enfield-classic-350/cover.jpg';
  }
  if (n.includes('splendor')) {
    return '/assets/rentals/kotdwar-hero-splendor-plus/cover.jpg';
  }
  if (n.includes('hf deluxe') || n.includes('deluxe')) {
    return '/assets/rentals/kotdwar-hero-hf-deluxe/cover.jpg';
  }
  if (n.includes('shine')) {
    return '/assets/rentals/kanatal-honda-shine/cover.jpg';
  }

  // SUVs / 4x4 / Big Mountain Cars
  if (n.includes('thar') || n.includes('gurkha')) {
    return '/assets/rentals/srinagar-mahindra-thar/cover.jpg';
  }
  if (n.includes('scorpio')) {
    return '/assets/rentals/ranikhet-mahindra-scorpio/cover.jpg';
  }
  if (n.includes('xuv') || n.includes('xuv700') || n.includes('xuv300')) {
    return '/assets/rentals/tehri-mahindra-xuv700/cover.jpg';
  }
  if (n.includes('xylo')) {
    return '/assets/rentals/bhimtal-mahindra-xylo/cover.jpg';
  }
  if (n.includes('marazzo')) {
    return '/assets/rentals/chopta-mahindra-marazzo/cover.jpg';
  }
  if (n.includes('bolero')) {
    return '/assets/rentals/mukteshwar-mahindra-bolero-camper/cover.jpg';
  }
  if (n.includes('innova')) {
    return '/assets/rentals/nainital-toyota-innova-crysta/cover.jpg';
  }
  if (n.includes('fortuner')) {
    return '/assets/rentals/haridwar-toyota-fortuner/cover.jpg';
  }
  if (n.includes('etios')) {
    return '/assets/rentals/tehri-toyota-etios/cover.jpg';
  }
  if (n.includes('creta') || n.includes('venue')) {
    return '/assets/rentals/rudraprayag-hyundai-creta/cover.jpg';
  }
  if (n.includes('seltos')) {
    return '/assets/rentals/dhanaulti-kia-seltos/cover.jpg';
  }
  if (n.includes('nexon')) {
    return '/assets/rentals/mussoorie-tata-nexon/cover.jpg';
  }
  if (n.includes('harrier')) {
    return '/assets/rentals/rishikesh-tata-harrier/cover.jpg';
  }
  if (n.includes('safari')) {
    return '/assets/rentals/tehri-tata-safari/cover.jpg';
  }
  if (n.includes('hector')) {
    return '/assets/rentals/mukteshwar-mg-hector/cover.jpg';
  }
  if (n.includes('duster')) {
    return '/assets/rentals/chamoli-renault-duster/cover.jpg';
  }
  if (n.includes('traveller') || n.includes('tempo')) {
    return '/assets/rentals/bhimtal-tempo-traveller-12-seater/cover.jpg';
  }

  // Hatchback & Sedans
  if (n.includes('dzire') || n.includes('swift dzire')) {
    return '/assets/rentals/haldwani-maruti-suzuki-dzire/cover.jpg';
  }
  if (n.includes('swift')) {
    return '/assets/rentals/srinagar-maruti-suzuki-swift/cover.jpg';
  }
  if (n.includes('i20')) {
    return '/assets/rentals/joshimath-hyundai-i20/cover.jpg';
  }
  if (n.includes('baleno')) {
    return '/assets/rentals/pithoragarh-maruti-suzuki-baleno/cover.jpg';
  }
  if (n.includes('city') || n.includes('honda city')) {
    return '/assets/rentals/rudraprayag-honda-city/cover.jpg';
  }
  if (n.includes('celerio')) {
    return '/assets/rentals/tehri-maruti-suzuki-celerio/cover.jpg';
  }
  if (n.includes('wagonr') || n.includes('wagon r')) {
    return '/assets/rentals/tehri-maruti-wagonr/cover.jpg';
  }
  if (n.includes('alto')) {
    return '/assets/rentals/ranikhet-maruti-alto-800/cover.jpg';
  }
  if (n.includes('ertiga')) {
    return '/assets/rentals/ranikhet-maruti-suzuki-ertiga/cover.jpg';
  }
  if (n.includes('ciaz')) {
    return '/assets/rentals/rudraprayag-honda-city/cover.jpg';
  }

  // Default real vehicle fallback
  if (n.includes('bike') || n.includes('motorcycle')) {
    return '/assets/rentals/dhanaulti-royal-enfield-himalayan/cover.jpg';
  }
  if (n.includes('suv') || n.includes('4x4')) {
    return '/assets/rentals/srinagar-mahindra-thar/cover.jpg';
  }
  if (n.includes('sedan') || n.includes('car') || n.includes('hatchback')) {
    return '/assets/rentals/haldwani-maruti-suzuki-dzire/cover.jpg';
  }

  return '/assets/rentals/srinagar-honda-activa-6g/cover.jpg';
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
