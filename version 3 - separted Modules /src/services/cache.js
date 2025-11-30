import { CONFIG } from "../config/config.js";

// LRU cache with max entries and expiry
export const CacheManager = (() => {
  const cacheStore = new Map();
  const MAX_ENTRIES = CONFIG.CACHE.MAX_ENTRIES || 100;
  const DEFAULT_EXPIRY = CONFIG.CACHE.EXPIRY_TIME;

  // Returns a cached entry if it exists and hasn't expired.
  const getCache = (key) => {
    if (!cacheStore.has(key)) return null;
    const entry = cacheStore.get(key);
    if (isExpired(entry)) {
      cacheStore.delete(key);
      return null;
    }
    cacheStore.delete(key);
    cacheStore.set(key, entry);
    return entry.data;
  };

  // Stores a value in the cache and enforces LRU policy.
  const setCache = (key, data, ttl = DEFAULT_EXPIRY) => {
    const entry = { data, timestamp: Date.now(), ttl };
    if (cacheStore.has(key)) cacheStore.delete(key);
    cacheStore.set(key, entry);
    manageCacheSize();
  };

  const isExpired = (entry) => Date.now() - entry.timestamp >= entry.ttl;

  const manageCacheSize = () => {
    while (cacheStore.size > MAX_ENTRIES) {
      const oldestKey = cacheStore.keys().next().value;
      cacheStore.delete(oldestKey);
    }
  };

  return {
    getCache,
    setCache,
  };
})();
