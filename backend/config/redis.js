/**
 * Discovery Uttarakhand — Dual-Layer Ultra-Efficient Cache Engine
 * Layer 1: Lightning-fast In-Memory RAM Cache (0ms latency, zero API costs)
 * Layer 2: Cloud Upstash Redis REST Client (Distributed cloud caching)
 * 
 * Protects external API quotas (Gemini, Groq, OpenAI, Weather, Pexels)
 * from being consumed repeatedly for duplicate queries.
 */

import { Redis } from '@upstash/redis';

let redisClient = null;
let redisAvailable = false;

// Layer 1 In-Memory LRU & TTL Cache Map (Cap at 2,000 keys)
const memoryCache = new Map();
const MAX_MEMORY_KEYS = 2000;

const initRedis = () => {
  const url = process.env.UPSTASH_REDIS_REST_URL?.replace(/^"|"$/g, '');
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.replace(/^"|"$/g, '');

  if (!url || !token) {
    console.log('[Cache] Using High-Performance In-Memory RAM Cache (Upstash credentials optional).');
    return null;
  }

  try {
    const client = new Redis({ url, token });
    redisAvailable = true;
    console.log('[Cache] ✅ Dual-Layer Cache ACTIVE: In-Memory RAM + Cloud Upstash Redis!');
    return client;
  } catch (err) {
    console.warn('[Cache] Upstash init failed, falling back to In-Memory RAM cache:', err.message);
    return null;
  }
};

redisClient = initRedis();

// ─── Cache Helpers ──────────────────────────────────────────────────────────

/**
 * Get value from cache.
 * Checks Layer 1 In-Memory first (0ms), then Layer 2 Upstash Redis.
 */
export const cacheGet = async (key) => {
  if (!key) return null;

  // 1. Check Layer 1 In-Memory Cache
  if (memoryCache.has(key)) {
    const item = memoryCache.get(key);
    if (Date.now() < item.expiresAt) {
      return item.data;
    }
    memoryCache.delete(key);
  }

  // 2. Check Layer 2 Cloud Redis
  if (redisClient && redisAvailable) {
    try {
      const val = await redisClient.get(key);
      if (val !== null && val !== undefined) {
        // Hydrate Layer 1
        memoryCache.set(key, {
          data: val,
          expiresAt: Date.now() + 600 * 1000 // 10 min RAM default
        });
        return val;
      }
    } catch (e) {
      // fallback to memory
    }
  }

  return null;
};

/**
 * Set value in cache with TTL in seconds.
 * Writes to both Layer 1 In-Memory and Layer 2 Upstash Redis.
 * Default TTL: 600s (10 minutes). For LLM / Weather / Photos: 3600s - 86400s.
 */
export const cacheSet = async (key, data, ttlSeconds = 600) => {
  if (!key || data === undefined) return;

  // 1. Write to Layer 1 In-Memory Cache
  if (memoryCache.size >= MAX_MEMORY_KEYS) {
    // Evict oldest entry (first key in Map)
    const oldestKey = memoryCache.keys().next().value;
    if (oldestKey) memoryCache.delete(oldestKey);
  }

  memoryCache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000
  });

  // 2. Write to Layer 2 Cloud Redis
  if (redisClient && redisAvailable) {
    try {
      await redisClient.setex(key, ttlSeconds, data);
    } catch {
      // Silent — cache is best-effort
    }
  }
};

/**
 * Delete specific keys from both layers.
 */
export const cacheDel = async (...keys) => {
  for (const key of keys) {
    memoryCache.delete(key);
  }

  if (redisClient && redisAvailable) {
    try {
      for (const key of keys) await redisClient.del(key);
    } catch {
      // Silent
    }
  }
};

/**
 * Delete all keys matching a pattern from both layers.
 */
export const cacheDelPattern = async (pattern) => {
  // Clear matching keys from memory
  const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
  for (const k of memoryCache.keys()) {
    if (regex.test(k)) {
      memoryCache.delete(k);
    }
  }

  if (redisClient && redisAvailable) {
    try {
      let cursor = 0;
      do {
        const result = await redisClient.scan(cursor, { match: pattern, count: 100 });
        cursor = result[0];
        const keys = result[1];
        if (keys && keys.length > 0) {
          for (const key of keys) await redisClient.del(key);
        }
      } while (cursor !== 0 && cursor !== '0' && Number(cursor) !== 0);
    } catch {
      // Silent
    }
  }
};

export const isRedisAvailable = () => redisAvailable || memoryCache.size > 0;
export { redisClient };
export default redisClient;
