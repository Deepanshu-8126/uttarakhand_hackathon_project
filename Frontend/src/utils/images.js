/**
 * Discovery Uttarakhand - Pexels Live High-Res Auto-Fresh Photography Engine
 * Automatically fetches fresh, 4K, dramatic real photographer images for destinations & stays
 * with intelligent query mapping, in-memory caching, and rock-solid local fallbacks.
 */

import { useState, useEffect } from 'react';
import { DESTINATION_NAMED_IMAGES, getHimalayanFallbackImage } from './imageHelpers';

const PEXELS_KEY = import.meta.env.VITE_PEXELS_KEY || '';

// High-Signal Mountain & Cultural Photography Search Queries
export const DESTINATION_SEARCH_QUERIES = {
  // Sacred Yatras & Peaks
  "kedarnath": "Kedarnath temple snow mountain himalaya",
  "badrinath": "Badrinath temple river mountain Alaknanda",
  "gangotri": "Gangotri temple glacier river Himalaya",
  "yamunotri": "Yamunotri temple hot springs mountain valley",
  "adi-kailash": "Om Parvat Kailash Himalaya snow sacred mountain",
  "om-parvat": "Om Parvat sacred mountain snow peak Himalaya",
  "tungnath": "Tungnath temple highest Shiva shrine Chopta peak",
  "rudranath": "Rudranath meadow trek rhododendron Himalaya",
  "madhyamaheshwar": "Madhyamaheshwar alpine bugyal Chaukhamba peak",
  "kalpeshwar": "Kalpeshwar cave temple stone mountain Garhwal",
  "hemkund-sahib": "Hemkund Sahib alpine lake glacier Gurdwara",
  "jageshwar": "Jageshwar dham ancient deodar cedar forest temple",
  "baijnath": "Baijnath ancient stone temple river Kumaon",

  // Treks & Alpine Bugyals
  "valley-of-flowers": "Valley of flowers national park alpine blossom flowers Himalaya",
  "auli": "Auli ski meadows snow slope Nanda Devi panorama",
  "chopta": "Chopta Chandrashila alpine meadow snow peak sunrise",
  "kedarkantha": "Kedarkantha trek snow summit sunrise golden hour",
  "dayara-bugyal": "Dayara Bugyal alpine meadow mountain grazing",
  "kuari-pass": "Kuari Pass Lord Curzon trail snow summit view",
  "roopkund": "Roopkund glacial lake snow mountain trek",
  "har-ki-dun": "Har Ki Dun valley pine forest glacier stream",
  "munsiyari": "Munsiyari Panchachuli 5 peaks alpenglow sunset",
  "gaumukh": "Gaumukh glacier Bhagirathi river source peak",
  "milam": "Milam glacier alpine pass Johar valley trek",

  // Rivers & Yoga
  "rishikesh": "Rishikesh Ganges bridge river rafting yoga sunset",
  "haridwar": "Haridwar Ganga Aarti Har Ki Pauri lamps river",
  "devprayag": "Devprayag Alaknanda Bhagirathi river confluence sangam",

  // Lakes & Hill Stations
  "nainital": "Nainital emerald lake mountain mist pine boats",
  "bhimtal": "Bhimtal island lake emerald water hills",
  "sattal": "Sattal pine forest seven lakes pristine water",
  "naukuchiatal": "Naukuchiatal nine cornered lake lotus kayaking",
  "mussoorie": "Mussoorie gun hill cloud valley winter line",
  "dhanaulti": "Dhanaulti deodar cedar eco park snow mountains",
  "kanatal": "Kanatal apple orchard apple trees pine cottage",
  "tehri": "Tehri dam lake water sports reservoir turquoise",
  "lansdowne": "Lansdowne oak pine forest quiet colonial hill station",
  "ranikhet": "Ranikhet golf meadow pine forest Himalayan peaks",
  "kausani": "Kausani tea garden Trishul Nanda Devi sunrise",
  "almora": "Almora Bright End Corner sunrise sunset valley",
  "mukteshwar": "Mukteshwar Chauli Ki Jali cliff valley view",
  "pithoragarh": "Pithoragarh Soar valley snow mountain castle",

  // Wildlife & Nature
  "jim-corbett-national-park": "Jim Corbett National Park tiger safari jungle forest",
  "rajaji-national-park": "Rajaji National Park wild elephant river forest",
  "binsar": "Binsar wildlife sanctuary zero point 300km Himalayan panorama",

  // General Categories
  "stay": "Himalayan cozy wooden cabin cottage stone homestay mountain view",
  "homestay": "Authentic stone wood Pahadi homestay village mountain",
  "resort": "Luxury mountain resort pine forest valley view sunrise",
  "camp": "Glamping tent meadow mountain sunrise bonfire"
};

// Global in-memory cache to avoid redundant API hits and keep responses sub-10ms
const imageCache = new Map();

/**
 * Fetch a fresh, high-resolution photo from Pexels API with fallback
 * @param {string} destinationKey - slug or destination name
 * @param {string} fallbackUrl - optional local image fallback
 * @returns {Promise<string>} - high-res image URL
 */
export async function getFreshImage(destinationKey = '', fallbackUrl = null) {
  if (!destinationKey) {
    return fallbackUrl || DESTINATION_NAMED_IMAGES['nainital'] || '/assets/yatra_sarthi/nainital.jpg';
  }

  const cleanKey = String(destinationKey).toLowerCase().trim().replace(/[\s_]+/g, '-');
  const localFallback = fallbackUrl || DESTINATION_NAMED_IMAGES[cleanKey.replace(/-/g, ' ')] || DESTINATION_NAMED_IMAGES[cleanKey] || getHimalayanFallbackImage({ slug: cleanKey, name: destinationKey });

  // If no Pexels API key configured, use our verified high-res local asset directory
  if (!PEXELS_KEY || PEXELS_KEY.trim() === '') {
    return localFallback;
  }

  // Check in-memory cache first
  if (imageCache.has(cleanKey)) {
    const photos = imageCache.get(cleanKey);
    if (photos && photos.length > 0) {
      return photos[Math.floor(Math.random() * photos.length)];
    }
  }

  // Determine query
  const query = DESTINATION_SEARCH_QUERIES[cleanKey] || `${destinationKey.replace(/-/g, ' ')} Uttarakhand Himalaya scenic`;

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=8&orientation=landscape&size=large`,
      {
        headers: {
          Authorization: PEXELS_KEY
        }
      }
    );

    if (!res.ok) {
      return localFallback;
    }

    const data = await res.json();
    if (!data.photos || data.photos.length === 0) {
      return localFallback;
    }

    // Extract photo URLs (large2x or large)
    const urls = data.photos.map(p => p.src?.large2x || p.src?.large || p.src?.original).filter(Boolean);
    if (urls.length > 0) {
      imageCache.set(cleanKey, urls);
      return urls[Math.floor(Math.random() * urls.length)];
    }

    return localFallback;
  } catch (err) {
    console.warn('[PexelsAPI] Fallback used for', cleanKey, err);
    return localFallback;
  }
}

/**
 * React hook to auto-load fresh high-resolution image for any card or component
 */
export function useFreshImage(destinationKey, fallbackUrl = null) {
  const [imageSrc, setImageSrc] = useState(
    fallbackUrl || DESTINATION_NAMED_IMAGES[String(destinationKey || '').toLowerCase().replace(/[\s_-]+/g, ' ')] || '/assets/yatra_sarthi/nainital.jpg'
  );

  useEffect(() => {
    let isMounted = true;
    if (destinationKey) {
      getFreshImage(destinationKey, fallbackUrl).then((url) => {
        if (isMounted && url) {
          setImageSrc(url);
        }
      });
    }
    return () => { isMounted = false; };
  }, [destinationKey, fallbackUrl]);

  return imageSrc;
}

export default {
  getFreshImage,
  useFreshImage,
  DESTINATION_SEARCH_QUERIES
};
