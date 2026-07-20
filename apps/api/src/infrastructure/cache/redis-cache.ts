import { Redis } from 'ioredis'
import type { CacheStoreAdapter } from './cache-store.interface.js'

/**
 * Redis-backed cache adapter.
 * Uses ioredis with automatic reconnect.
 * Key prefix avoids collision with other apps on shared Redis.
 */
export class RedisCache implements CacheStoreAdapter {
  private client: Redis
  private readonly prefix: string

  constructor(redisUrl: string, prefix = 'aikids:') {
    this.prefix = prefix
    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        // Exponential backoff: 50ms, 100ms, 200ms... max 2s
        return Math.min(times * 50, 2000)
      },
      enableReadyCheck: true,
      connectTimeout: 5000,
    })

    this.client.on('error', (err: Error) => {
      // Log but don't crash — InMemory fallback handles it
      console.error('[RedisCache] connection error:', err.message)
    })

    this.client.on('ready', () => {
      console.log('[RedisCache] connected and ready')
    })
  }

  /** Wait for Redis to be ready (auto-connects, no lazyConnect) */
  async connect(): Promise<void> {
    return new Promise((resolve) => {
      if (this.client.status === 'ready') {
        resolve()
        return
      }
      this.client.once('ready', resolve)
      // Don't block forever — resolve after 3s even if not connected
      setTimeout(resolve, 3000)
    })
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(this.prefix + key)
    } catch {
      return null
    }
  }

  async set(key: string, value: string, ttlMs: number): Promise<void> {
    try {
      await this.client.set(this.prefix + key, value, 'PX', Math.max(ttlMs, 1))
    } catch {
      // Silent fail — InMemory will serve
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(this.prefix + key)
    } catch {
      // Silent fail
    }
  }

  async increment(key: string, ttlMs: number): Promise<number> {
    const fullKey = this.prefix + key
    try {
      const count = await this.client.incr(fullKey)
      // Set TTL only on first increment (when count === 1)
      if (count === 1) {
        await this.client.pexpire(fullKey, Math.max(ttlMs, 1))
      }
      return count
    } catch {
      return 1
    }
  }

  async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping()
      return result === 'PONG'
    } catch {
      return false
    }
  }

  /** Graceful shutdown */
  async disconnect(): Promise<void> {
    await this.client.quit()
  }

  /** Raw ioredis client for @fastify/rate-limit store */
  get raw(): Redis {
    return this.client
  }
}
