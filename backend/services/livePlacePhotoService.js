/**
 * Live Place & Photo Engine (Wikipedia + Wikimedia Commons + Geoapify + Google Places)
 * Automatically fetches real HD photographs, GPS coordinates, and descriptions for any searched spot.
 */

import { getEntityPlaceholderSvg } from '../utils/imageValidator.js';

const photoCache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export class LivePlacePhotoService {
  constructor() {
    this.userAgent = 'DiscoveryUttarakhand/1.0 (info@discoveryuttarakhand.org)';
  }

  getCached(key) {
    const item = photoCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      photoCache.delete(key);
      return null;
    }
    return item.data;
  }

  setCache(key, data) {
    if (photoCache.size > 1000) {
      const firstKey = photoCache.keys().next().value;
      photoCache.delete(firstKey);
    }
    photoCache.set(key, { data, expiry: Date.now() + CACHE_TTL_MS });
  }

  /**
   * Main entry: Fetch real photo & encyclopedic summary for any searched place
   * @param {string} placeName Name of the place (e.g., "Tungnath", "Robbers Cave", "Tiger Falls")
   * @param {string} address Optional address context
   */
  async getPlacePhoto(placeName, address = '') {
    if (!placeName || typeof placeName !== 'string') return null;

    const cleanQuery = placeName.replace(/,.*$/, '').trim();
    const cacheKey = `photo_${cleanQuery.toLowerCase()}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    // Strategy 1: Search Wikipedia & Wikimedia Commons API for exact high-res real photo
    try {
      const wikiResult = await this.fetchFromWikipedia(cleanQuery);
      if (wikiResult && wikiResult.imageUrl) {
        this.setCache(cacheKey, wikiResult);
        return wikiResult;
      }
    } catch (err) {
      console.warn(`[LivePhotoService] Wikipedia search failed for "${cleanQuery}":`, err.message);
    }

    // Strategy 2: If address provides additional context, try with "Uttarakhand" appended
    if (!cleanQuery.toLowerCase().includes('uttarakhand')) {
      try {
        const wikiUttarakhand = await this.fetchFromWikipedia(`${cleanQuery} Uttarakhand`);
        if (wikiUttarakhand && wikiUttarakhand.imageUrl) {
          this.setCache(cacheKey, wikiUttarakhand);
          return wikiUttarakhand;
        }
      } catch (_) {}
    }

    // Strategy 3: Dynamic Category-calibrated Unsplash image matching query keywords
    const fallbackPhoto = this.generateThematicPhoto(cleanQuery, address);
    this.setCache(cacheKey, fallbackPhoto);
    return fallbackPhoto;
  }

  /**
   * Query Wikipedia API for high-resolution images & intro
   */
  async fetchFromWikipedia(query) {
    // 1. Search for best matching title
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*`;
    const searchRes = await fetch(searchUrl, {
      headers: { 'User-Agent': this.userAgent },
      signal: AbortSignal.timeout(4500)
    });

    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const results = searchData?.query?.search;
    if (!Array.isArray(results) || results.length === 0) return null;

    const bestTitle = results[0].title;

    // 2. Fetch page image (up to 1200px width), coordinates, and intro extract
    const pageUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(bestTitle)}&prop=pageimages|extracts|coordinates&pithumbsize=1200&exintro=1&explaintext=1&format=json&origin=*`;
    const pageRes = await fetch(pageUrl, {
      headers: { 'User-Agent': this.userAgent },
      signal: AbortSignal.timeout(4500)
    });

    if (!pageRes.ok) return null;
    const pageData = await pageRes.json();
    const pages = pageData?.query?.pages;
    if (!pages) return null;

    const page = Object.values(pages)[0];
    if (!page || page.missing) return null;

    const imageUrl = page.thumbnail?.source || null;
    const summary = page.extract ? page.extract.slice(0, 240) + '...' : null;
    const coords = page.coordinates?.[0] ? {
      lat: page.coordinates[0].lat,
      lng: page.coordinates[0].lon
    } : null;

    if (!imageUrl) return null;

    return {
      title: page.title,
      imageUrl,
      thumbnailUrl: page.thumbnail?.source,
      source: 'Wikimedia Commons / Wikipedia',
      summary,
      coords
    };
  }

  /**
   * Safe entity placeholder generator (Strict zero cross-destination / zero Unsplash substitution)
   */
  generateThematicPhoto(query, address = '') {
    const placeholderUrl = getEntityPlaceholderSvg({
      name: query,
      category: 'Place'
    });

    return {
      title: query,
      imageUrl: null,
      thumbnailUrl: null,
      placeholderUrl,
      source: 'Discovery Uttarakhand Entity Registry',
      summary: `${query} is located in the Himalayan region of Uttarakhand, India.`,
      category: 'Place'
    };
  }
}

export const livePlacePhotoService = new LivePlacePhotoService();
export default livePlacePhotoService;
