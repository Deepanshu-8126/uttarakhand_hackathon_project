/**
 * Discovery Uttarakhand — Redis Cache Client
 * Supports Upstash REST API (UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN)
 * Falls back gracefully if Redis is unavailable — app still works perfectly.
 */
import { Redis } from '@upstash/redis';

let redisClient = null;
let redisAvailable = false;

const initRedis = () => {
  const url = process.env.UPSTASH_REDIS_REST_URL?.replace(/^"|"$/g, '');
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.replace(/^"|"$/g, '');

  if (!url || !token) {
    // Also try ioredis-style REDIS_URL as fallback
    console.log('[Redis] No Upstash credentials — caching disabled (app works fine without it).');
    return null;
  }

  try {
    const client = new Redis({ url, token });
    redisAvailable = true;
    console.log('[Redis] ✅ Upstash Redis connected — caching ACTIVE!');
    return client;
  } catch (err) {
    console.warn('[Redis] Init failed:', err.message);
    return null;
  }
};

redisClient = initRedis();

// ─── Cache Helpers ──────────────────────────────────────────────────────────

/**
 * Get from cache. Returns parsed value or null.
 */
export const cacheGet = async (key) => {
  if (!redisClient || !redisAvailable) return null;
  try {
    const val = await redisClient.get(key);
    return val ?? null;
  } catch (e) {
    return null;
  }
};

/**
 * Set in cache with TTL in seconds. Default: 10 minutes.
 */
export const cacheSet = async (key, data, ttlSeconds = 600) => {
  if (!redisClient || !redisAvailable) return;
  try {
    await redisClient.setex(key, ttlSeconds, data);
  } catch {
    // Silent — cache is best-effort
  }
};

/**
 * Delete specific keys (cache invalidation on write).
 */
export const cacheDel = async (...keys) => {
  if (!redisClient || !redisAvailable) return;
  try {
    for (const key of keys) await redisClient.del(key);
  } catch {
    // Silent
  }
};

/**
 * Delete all keys matching a pattern (e.g. "stays:*").
 * Upstash supports SCAN-based pattern deletion.
 */
export const cacheDelPattern = async (pattern) => {
  if (!redisClient || !redisAvailable) return;
  try {
    let cursor = 0;
    do {
      const result = await redisClient.scan(cursor, { match: pattern, count: 100 });
      cursor = result[0];
      const keys = result[1];
      if (keys.length > 0) {
        for (const key of keys) await redisClient.del(key);
      }
    } while (cursor !== 0);
  } catch {
    // Silent
  }
};

export const isRedisAvailable = () => redisAvailable;
export default redisClient;
