interface CacheConfig {
  maxAge: number;
  maxSize: number;
  strategy: 'LRU' | 'FIFO' | 'TTL';
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

export class CacheManager<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxAge: 5 * 60 * 1000, // 5 minutes
      maxSize: 100, // 100 entries
      strategy: 'LRU',
      ...config
    };
  }

  set(key: string, data: T): void {
    const now = Date.now();
    
    // Remove expired entries
    this.cleanup();
    
    // If cache is full, remove entries based on strategy
    if (this.cache.size >= this.config.maxSize) {
      this.evict();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      accessCount: 0,
      lastAccessed: now
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > this.config.maxAge) {
      this.cache.delete(key);
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  getStats() {
    const entries = Array.from(this.cache.values());
    const totalAccesses = entries.reduce((sum, entry) => sum + entry.accessCount, 0);
    const avgAge = entries.reduce((sum, entry) => sum + (Date.now() - entry.timestamp), 0) / entries.length;

    return {
      size: this.cache.size,
      totalAccesses,
      avgAge: avgAge || 0,
      hitRate: totalAccesses / (totalAccesses + this.cache.size) // Simplified calculation
    };
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.config.maxAge) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));
  }

  private evict(): void {
    if (this.cache.size === 0) return;

    let keyToRemove: string;

    switch (this.config.strategy) {
      case 'LRU':
        // Remove least recently used
        let oldestAccess = Date.now();
        keyToRemove = '';
        for (const [key, entry] of this.cache.entries()) {
          if (entry.lastAccessed < oldestAccess) {
            oldestAccess = entry.lastAccessed;
            keyToRemove = key;
          }
        }
        break;

      case 'FIFO':
        // Remove first in (oldest timestamp)
        let oldestTimestamp = Date.now();
        keyToRemove = '';
        for (const [key, entry] of this.cache.entries()) {
          if (entry.timestamp < oldestTimestamp) {
            oldestTimestamp = entry.timestamp;
            keyToRemove = key;
          }
        }
        break;

      case 'TTL':
        // Remove entry closest to expiration
        const now = Date.now();
        let closestToExpiration = 0;
        keyToRemove = '';
        for (const [key, entry] of this.cache.entries()) {
          const timeToExpire = this.config.maxAge - (now - entry.timestamp);
          if (timeToExpire < closestToExpiration || keyToRemove === '') {
            closestToExpiration = timeToExpire;
            keyToRemove = key;
          }
        }
        break;

      default:
        keyToRemove = this.cache.keys().next().value;
    }

    if (keyToRemove) {
      this.cache.delete(keyToRemove);
    }
  }
}

// Global cache instances
export const dataCache = new CacheManager({
  maxAge: 10 * 60 * 1000, // 10 minutes for data
  maxSize: 50,
  strategy: 'LRU'
});

export const visualizationCache = new CacheManager({
  maxAge: 5 * 60 * 1000, // 5 minutes for visualizations
  maxSize: 20,
  strategy: 'LRU'
});

export const apiCache = new CacheManager({
  maxAge: 2 * 60 * 1000, // 2 minutes for API responses
  maxSize: 100,
  strategy: 'TTL'
});

// Cache utilities
export const createCacheKey = (...parts: (string | number | boolean)[]): string => {
  return parts.map(part => String(part)).join(':');
};

export const withCache = <T>(
  cache: CacheManager<T>,
  key: string,
  fetcher: () => Promise<T>
): Promise<T> => {
  const cached = cache.get(key);
  if (cached) {
    return Promise.resolve(cached);
  }

  return fetcher().then(data => {
    cache.set(key, data);
    return data;
  });
};