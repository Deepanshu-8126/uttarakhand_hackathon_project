/**
 * Discovery Uttarakhand - Pexels Live High-Res Auto-Fresh Photography Engine
 * Ultra-efficient token & quota management:
 * - LocalStorage + In-Memory 24-hour Persistent Caching (Zero wasted API calls)
 * - Single-Flight Request Deduplication (Multiple cards share 1 request)
 * - Automatic Location-Aware Query Formulation
 * - Random variation on render so user gets fresh photos without credit burn
 */

import { useState, useEffect } from 'react';
import { DESTINATION_NAMED_IMAGES, getHimalayanFallbackImage } from './imageHelpers';

const PEXELS_KEY = import.meta.env.VITE_PEXELS_KEY || '';
const CACHE_PREFIX = 'devbhoomi_pexels_v1_';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 Hours TTL

// Curated High-Signal Mountain Photography Search Queries
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

// In-memory RAM cache & Single-Flight promise map
const memoryCache = new Map();
const inFlightRequests = new Map();

/**
 * Read from localStorage cache safely
 */
function readStorageCache(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp < CACHE_TTL_MS && Array.isArray(parsed.urls) && parsed.urls.length > 0) {
      return parsed.urls;
    }
  } catch (e) {
    // ignore storage quota / parse issues
  }
  return null;
}

/**
 * Write to localStorage cache safely
 */
function writeStorageCache(key, urls) {
  try {
    localStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({ timestamp: Date.now(), urls })
    );
  } catch (e) {
    // quota exceeded — clean older keys
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(k);
          break;
        }
      }
    } catch (ignore) {}
  }
}

/**
 * Fetch a fresh, high-resolution photo from Pexels API with intelligent caching
 * Consumes at most 1 API credit per destination per 24 hours!
 */
export async function getFreshImage(destinationKey = '', fallbackUrl = null) {
  if (!destinationKey) {
    return fallbackUrl || DESTINATION_NAMED_IMAGES['nainital'] || '/assets/yatra_sarthi/nainital.jpg';
  }

  const cleanKey = String(destinationKey).toLowerCase().trim().replace(/[\s_]+/g, '-');
  const localFallback = fallbackUrl || DESTINATION_NAMED_IMAGES[cleanKey.replace(/-/g, ' ')] || DESTINATION_NAMED_IMAGES[cleanKey] || getHimalayanFallbackImage({ slug: cleanKey, name: destinationKey });

  // If no Pexels API key, return verified high-res local asset directly
  if (!PEXELS_KEY || PEXELS_KEY.trim() === '') {
    return localFallback;
  }

  // 1. Check in-memory RAM cache
  if (memoryCache.has(cleanKey)) {
    const photos = memoryCache.get(cleanKey);
    if (photos && photos.length > 0) {
      return photos[Math.floor(Math.random() * photos.length)];
    }
  }

  // 2. Check 24-hour LocalStorage cache
  const stored = readStorageCache(cleanKey);
  if (stored && stored.length > 0) {
    memoryCache.set(cleanKey, stored);
    return stored[Math.floor(Math.random() * stored.length)];
  }

  // 3. Deduplicate in-flight requests (prevent duplicate API calls for same place)
  if (inFlightRequests.has(cleanKey)) {
    try {
      const photos = await inFlightRequests.get(cleanKey);
      if (photos && photos.length > 0) {
        return photos[Math.floor(Math.random() * photos.length)];
      }
    } catch (e) {
      return localFallback;
    }
  }

  // 4. Construct location-aware query
  const query = DESTINATION_SEARCH_QUERIES[cleanKey] || `${destinationKey.replace(/-/g, ' ')} Uttarakhand mountain landscape`;

  const fetchPromise = (async () => {
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
        return null;
      }

      const data = await res.json();
      if (!data.photos || data.photos.length === 0) {
        return null;
      }

      const urls = data.photos.map(p => p.src?.large2x || p.src?.large || p.src?.original).filter(Boolean);
      if (urls.length > 0) {
        memoryCache.set(cleanKey, urls);
        writeStorageCache(cleanKey, urls);
        return urls;
      }
      return null;
    } catch (err) {
      console.warn('[PexelsAPI] Fallback used for', cleanKey);
      return null;
    } finally {
      inFlightRequests.delete(cleanKey);
    }
  })();

  inFlightRequests.set(cleanKey, fetchPromise);

  const resultUrls = await fetchPromise;
  if (resultUrls && resultUrls.length > 0) {
    return resultUrls[Math.floor(Math.random() * resultUrls.length)];
  }

  return localFallback;
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
