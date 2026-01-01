/**
 * Simple in-memory cache with TTL support
 * Used to cache Things data and reduce AppleScript calls
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class InMemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();

  /**
   * Get a cached value if it exists and hasn't expired
   * @param key Cache key
   * @returns Cached data or null if not found/expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set a cached value with TTL
   * @param key Cache key
   * @param data Data to cache
   * @param ttlMs Time to live in milliseconds (default 60 seconds)
   */
  set<T>(key: string, data: T, ttlMs: number = 60000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  /**
   * Delete a specific cache entry
   * @param key Cache key to delete
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Check if a key exists and is not expired
   * @param key Cache key
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }
}

// Singleton instance for global use
export const cache = new InMemoryCache();

// Cache keys for Things data
export const CACHE_KEYS = {
  INBOX: 'things:inbox',
  TODAY: 'things:today',
  UPCOMING: 'things:upcoming',
  ANYTIME: 'things:anytime',
  SOMEDAY: 'things:someday',
  PROJECTS: 'things:projects',
  AREAS: 'things:areas',
  TAGS: 'things:tags',
} as const;

// Default TTL: 1 minute
export const DEFAULT_CACHE_TTL = 60 * 1000;
