import { CACHE_CONFIG } from "../config/api-cache-config.js";

// LRU cache with max entries and expiry
const { MAX_ENTRIES = 100, EXPIRY_TIME } = CACHE_CONFIG.CACHE;

// ===== IN-MEMORY CACHE (LRU) =====
const cacheStore = new Map();

// Returns a cached entry if it exists and hasn't expired.
const getCache = (key) => {
  const entry = cacheStore.get(key);
  if (!entry) return null;

  const { timestamp, ttl, data } = entry;
  const expired = Date.now() - timestamp >= ttl;

  if (expired) {
    cacheStore.delete(key);
    return null;
  }
  cacheStore.delete(key);
  cacheStore.set(key, entry);
  return data;
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
const fetchWithCache = async (cacheKey, fetcher, ttl = EXPIRY_TIME) => {
  const cached = getCache(cacheKey);
  if (cached) return { ok: true, data: cached, fromCache: true };

  const { ok, data, code, error, status } = await fetcher();
  if (!ok) {
    return {ok: false,code: code || "API_ERROR",error,status,};
  }

  setCache(cacheKey, data, ttl);
  return {ok: true,data,fromCache: false,status,};
};

// ===== LOCAL STORAGE  =====
// Reads and parses JSON from localStorage with fallback on failures.
const readJSON = (key, fallback) => {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : fallback;
  } catch (error) {
    console.warn(`Storage read failed for "${key}`, error);
    return fallback;
  }
};

// Stringifies and stores JSON in localStorage safely.
const writeJSON = (key, storedValue) => {
  try {
    localStorage.setItem(key, JSON.stringify(storedValue));
  } catch (error) {
    console.warn(`Storage write failed for "${key}":`, error);
  }
};

export const CacheManager = {
  getCache,
  setCache,
  clearCache: () => cacheStore.clear(),
  fetchWithCache,
};

export const localeStorage = {
  readJSON,
  writeJSON,
};
