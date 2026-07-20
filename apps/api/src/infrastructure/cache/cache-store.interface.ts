/**
 * Abstract cache adapter — pluggable backend (InMemory or Redis).
 * Pattern from vidtory-b2b-api AuthCacheStoreAdapter.
 */
export interface CacheStoreAdapter {
  get(key: string): Promise<string | null>
  set(key: string, value: string, ttlMs: number): Promise<void>
  delete(key: string): Promise<void>
  increment(key: string, ttlMs: number): Promise<number>
  /** Optional: check connection health */
  ping?(): Promise<boolean>
}
