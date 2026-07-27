/**
 * ADAPTIVE RESPONSE CACHE ENGINE
 * Location: server/adaptiveResponseCache.js
 * Platform: NexusAI v9.5.0 Enterprise Agentic Platform
 */

export class AdaptiveResponseCache {
  constructor(config = {}) {
    this.config = config;
    this.cache = new Map();
    this.lru = new Map();
    this.timestamps = new Map();
    this.patternCache = new Map();
    this.ttl = config.ttl || 3600000; // 1 hour
    this.maxSize = config.maxSize || 1000;
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0
    };
  }

  get(key) {
    if (!this.cache.has(key)) {
      this.stats.misses++;
      return null;
    }

    const timestamp = this.timestamps.get(key);
    if (timestamp && Date.now() - timestamp > this.ttl) {
      this._evict(key);
      this.stats.misses++;
      return null;
    }

    // Refresh LRU order
    this.lru.delete(key);
    this.lru.set(key, Date.now());
    this.stats.hits++;
    return this.cache.get(key);
  }

  set(key, value, options = {}) {
    if (this.cache.size >= this.maxSize) {
      this._evictLRU();
    }

    this.cache.set(key, value);
    this.lru.set(key, Date.now());
    this.timestamps.set(key, Date.now());

    if (options.pattern) {
      this.patternCache.set(options.pattern, key);
    }

    this.stats.size = this.cache.size;
  }

  async getOrCompute(key, computeFn, options = {}) {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    const value = await computeFn();
    if (value) {
      this.set(key, value, options);
    }
    return value;
  }

  _evict(key) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      this.lru.delete(key);
      this.timestamps.delete(key);
      this.stats.size = this.cache.size;
      this.stats.evictions++;
    }
  }

  _evictLRU() {
    let oldestKey = null;
    let oldestTime = Infinity;

    for (const [key, time] of this.lru) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this._evict(oldestKey);
    }
  }

  clear() {
    this.cache.clear();
    this.lru.clear();
    this.timestamps.clear();
    this.patternCache.clear();
    this.stats = { hits: 0, misses: 0, evictions: 0, size: 0 };
  }

  getStats() {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;

    return {
      ...this.stats,
      hitRate: parseFloat(hitRate.toFixed(1)),
      maxSize: this.maxSize
    };
  }
}

export const responseCache = new AdaptiveResponseCache();
