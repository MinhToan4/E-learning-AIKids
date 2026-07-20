import type { CacheStoreAdapter } from './cache-store.interface.js'
import { InMemoryCache } from './in-memory-cache.js'
import { RedisCache } from './redis-cache.js'

/**
 * Cache facade — initialises Redis if REDIS_URL is set, else InMemory.
 * Consuming code only depends on CacheStoreAdapter interface.
 */
let _cache: CacheStoreAdapter | null = null
let _redisCache: RedisCache | null = null

export async function initCache(redisUrl?: string): Promise<CacheStoreAdapter> {
  if (_cache) return _cache

  if (redisUrl) {
    try {
      const redis = new RedisCache(redisUrl)
      await redis.connect()
      const ok = await redis.ping()
      if (ok) {
        _redisCache = redis
        _cache = redis
        console.log('[Cache] Redis connected ✓')
        return _cache
      }
    } catch (err) {
      console.warn('[Cache] Redis failed, falling back to InMemory:', (err as Error).message)
    }
  }

  _cache = new InMemoryCache()
  console.log('[Cache] Using InMemory cache (single-process only)')
  return _cache
}

export function getCache(): CacheStoreAdapter {
  if (!_cache) {
    // Lazy init InMemory if getCache called before initCache
    _cache = new InMemoryCache()
  }
  return _cache
}

/** Get underlying RedisCache for rate-limit store (null if InMemory) */
export function getRedisCache(): RedisCache | null {
  return _redisCache
}

/** Graceful shutdown */
export async function closeCache(): Promise<void> {
  if (_redisCache) {
    await _redisCache.disconnect()
    _redisCache = null
  }
  _cache = null
}
