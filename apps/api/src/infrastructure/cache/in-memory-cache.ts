import type { CacheStoreAdapter } from './cache-store.interface.js'

type CacheEntry = { value: string; expiresAt: number }
type CounterEntry = { count: number; expiresAt: number }

/**
 * InMemory cache — fallback when Redis is unavailable.
 * Suitable for single-instance dev; not for multi-process production.
 */
export class InMemoryCache implements CacheStoreAdapter {
  private readonly values = new Map<string, CacheEntry>()
  private readonly counters = new Map<string, CounterEntry>()

  async get(key: string): Promise<string | null> {
    const entry = this.values.get(key)
    if (!entry) return null
    if (entry.expiresAt <= Date.now()) {
      this.values.delete(key)
      return null
    }
    return entry.value
  }

  async set(key: string, value: string, ttlMs: number): Promise<void> {
    this.values.set(key, {
      value,
      expiresAt: Date.now() + Math.max(ttlMs, 1),
    })
  }

  async delete(key: string): Promise<void> {
    this.values.delete(key)
    this.counters.delete(key)
  }

  async increment(key: string, ttlMs: number): Promise<number> {
    const now = Date.now()
    const existing = this.counters.get(key)
    if (!existing || existing.expiresAt <= now) {
      this.counters.set(key, { count: 1, expiresAt: now + Math.max(ttlMs, 1) })
      return 1
    }
    existing.count += 1
    return existing.count
  }

  async ping(): Promise<boolean> {
    return true
  }
}
