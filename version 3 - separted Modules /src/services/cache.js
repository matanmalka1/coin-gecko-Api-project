import { CACHE_CONFIG } from "../config/api-cache-config.js";

// LRU cache with max entries and expiry
const cacheStore = new Map();
const { MAX_ENTRIES = 100, EXPIRY_TIME } = CACHE_CONFIG.CACHE;

// Returns a cached entry if it exists and hasn't expired.
const getCache = (key) => {
  const entry = cacheStore.get(key);
  if (!entry) return null;

  const expired = Date.now() - entry.timestamp >= entry.ttl;
  if (expired) {
    cacheStore.delete(key);
    return null;
  }
  cacheStore.delete(key);
  cacheStore.set(key, entry);
  return entry.data;
};

// Stores a value in the cache and enforces LRU policy.
const setCache = (key, data, ttl = EXPIRY_TIME) => {
  const entry = { data, timestamp: Date.now(), ttl };

  if (cacheStore.has(key)) cacheStore.delete(key);
  cacheStore.set(key, entry);

  while (cacheStore.size > MAX_ENTRIES) {
    const oldestKey = cacheStore.keys().next().value;
    cacheStore.delete(oldestKey);
  }
};

export const CacheManager = {
  getCache,
  setCache,
  clearCache: () => cacheStore.clear(),
};
