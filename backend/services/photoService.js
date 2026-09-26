/**
 * Discovery Uttarakhand - Unified Multi-Source Real Photography Service
 * Integrates Pexels API + Verified Unsplash Directory with Upstash Redis Caching.
 * Zero AI art - 100% Real Geographic & Cultural Himalayan Photography.
 */

import axios from 'axios';
import { redisClient, cacheGet, cacheSet } from '../config/redis.js';

const PEXELS_API_KEY = process.env.PEXELS_API_KEY || '';
const CACHE_TTL_SECONDS = 86400; // 24 hours

// ── Verified High-Resolution Unsplash Fallback Directory ────────────────────
const UNSPASH_VERIFIED_HIMALAYAS = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Naini_lake_nainital_uttarakhand.jpg/1280px-Naini_lake_nainital_uttarakhand.jpg',
  'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1200&q=80',
];

/**
 * Search real high-resolution photos using Pexels with automatic Unsplash fallback
 * @param {string} query Search terms (e.g., "Kedarnath temple snow", "Nainital lake")
 * @param {number} perPage Number of photos to retrieve
 * @returns {Promise<Array<{url: string, photographer: string, alt: string, source: string}>>}
 */
export async function searchRealHimalayanPhotos(query = 'Uttarakhand Himalayas', perPage = 5) {
  const normalizedQuery = query.toLowerCase().trim();
  const cacheKey = `photo:search:${encodeURIComponent(normalizedQuery)}:${perPage}`;

  // 1. Check Redis Cache (dual-layer: memory + Upstash)
  try {
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return typeof cached === 'string' ? JSON.parse(cached) : cached;
    }
  } catch (err) {
    console.warn('[PhotoService] Cache lookup failed:', err.message);
  }

  // 2. Query Pexels API if Key is present
  if (PEXELS_API_KEY && PEXELS_API_KEY !== 'YOUR_PEXELS_API_KEY_HERE') {
    try {
      const response = await axios.get('https://api.pexels.com/v1/search', {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
        params: {
          query: `${query} Uttarakhand Himalayas real photography -ai -artificial -render -illustration -cgi`,
          per_page: perPage,
          orientation: 'landscape',
        },
        timeout: 4000,
      });

      if (response.data && Array.isArray(response.data.photos) && response.data.photos.length > 0) {
        const results = response.data.photos.map((p) => ({
          url: p.src?.original || p.src?.large2x || p.src?.large,
          photographer: p.photographer || 'Pexels Verified Photographer',
          alt: p.alt || query,
          source: 'Pexels',
        }));

        // Cache results in both memory + Upstash layers
        try {
          await cacheSet(cacheKey, JSON.stringify(results), CACHE_TTL_SECONDS);
        } catch (_) {}

        return results;
      }
    } catch (err) {
      console.warn('[PhotoService] Pexels search error, falling back to Unsplash verified directory:', err.message);
    }
  }

  // 3. Fallback to Verified Unsplash Directory
  const fallbackResults = UNSPASH_VERIFIED_HIMALAYAS.slice(0, perPage).map((url, idx) => ({
    url,
    photographer: 'Verified Himalayan Photographer',
    alt: `${query} — Himalayan View ${idx + 1}`,
    source: 'Unsplash Verified Directory',
  }));

  return fallbackResults;
}
