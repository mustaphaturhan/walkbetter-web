import { Redis } from "@upstash/redis";
import { consola } from "consola";

export let redis: Redis | null = null;

export const DEFAULT_CACHE_TTL_SECONDS = 10 * 60;

try {
  // Initialize Redis client from environment variables
  // This expects UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
  // or Vercel KV specific variables (KV_REST_API_URL, KV_REST_API_TOKEN)
  // Redis.fromEnv() automatically picks the correct ones if available.
  redis = Redis.fromEnv();
} catch (error) {
  // Log error if initialization fails (e.g., missing env vars)
  consola.warn(
    "Failed to initialize Upstash Redis client from env variables. Cache will be disabled.",
    error
  );
  // Keep redis as null, cache operations will be bypassed gracefully
}

/**
 * Retrieves data from the Redis cache.
 * Returns null if cache is disabled, key not found, or an error occurs.
 */
export async function getFromCache<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const cachedData = await redis.get<T | null>(key);
    if (cachedData) {
      consola.debug(`Cache hit for: ${key}`);
      return cachedData;
    }
    consola.debug(`Cache miss for: ${key}`);
    return null;
  } catch (error) {
    consola.error(`Redis GET error for key ${key}:`, error);
    return null; // Treat Redis error as cache miss
  }
}

/**
 * Stores data in the Redis cache with a specified TTL.
 * Uses default TTL if not provided.
 */
export async function setInCache<T>(
  key: string,
  value: T,
  ttlSeconds: number = DEFAULT_CACHE_TTL_SECONDS
): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(key, value, { ex: ttlSeconds });
    consola.debug(`Set cache for: ${key} with TTL ${ttlSeconds}s`);
  } catch (error) {
    consola.error(`Redis SET error for key ${key}:`, error);
  }
}
