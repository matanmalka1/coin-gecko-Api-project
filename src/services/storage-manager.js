import { CACHE_MAX as MAX_ENTRIES, CACHE_TTL as EXPIRY_TIME} from "../config/app-config.js";
import { ensureArray } from "../utils/general-utils.js";

 const KEY_FAVORITES = "favorites";
 const KEY_REPORTS = "reportsSelection";
 const cacheStore = new Map();

export const getCache = (key) => {
  const entry = cacheStore.get(key);
  if (!entry) return null;

  const { timestamp, ttl, data } = entry;
  if (Date.now() - timestamp >= ttl) {
    cacheStore.delete(key);
    return null;
  }
  cacheStore.delete(key);
  cacheStore.set(key, entry);
  return data;
};

export const setCache = (key, data, ttl = EXPIRY_TIME) => {
 cacheStore.delete(key); 
  cacheStore.set(key, { data, timestamp: Date.now(), ttl });

  if (cacheStore.size > MAX_ENTRIES) {
    const oldestKey = cacheStore.keys().next().value;
    cacheStore.delete(oldestKey);
  }
};
export const fetchWithCache = async (cacheKey, fetcher, ttl = EXPIRY_TIME) => {
  const cached = getCache(cacheKey);
  if (cached) return { ok: true, data: cached, fromCache: true };

  const { ok, data, error, status } = await fetcher();
  if (!ok) {return { ok: false, error, status };}

  setCache(cacheKey, data, ttl);
  return { ok: true, data, fromCache: false, status };
};

// ===== LOCAL STORAGE HELPERS =====
export const readJSON = (key, fallback = null) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch (error) {
    console.warn(`Storage read failed for "${key}"`, error);
    return fallback;
  }
};

export const writeJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Storage write failed for "${key}":`, error);
  }
};

// ===== FAVORITES & REPORTS HELPERS =====
export const getFavorites = () => {
  return ensureArray(readJSON(KEY_FAVORITES, []));
};

export const addFavorite = (symbol) => {
  const favorites = getFavorites();
  if (!favorites.includes(symbol)) {
    writeJSON(KEY_FAVORITES, [...favorites, symbol]);
  }
};

export const removeFavorite = (symbol) =>
  writeJSON(KEY_FAVORITES, getFavorites().filter((f) => f !== symbol));

export const isFavorite = (symbol) => getFavorites().includes(symbol);

export const getSelectedReports = () => {
  return ensureArray(readJSON(KEY_REPORTS, []));
};

export const setSelectedReports = (reports) => {
  writeJSON(KEY_REPORTS, ensureArray(reports));
};

export const addReport = (symbol) => {
  const reports = getSelectedReports();
  if (!reports.includes(symbol)) {
    writeJSON(KEY_REPORTS, [...reports, symbol]);
  }
};

export const removeReport = (symbol) =>
  writeJSON(KEY_REPORTS, getSelectedReports().filter((r) => r !== symbol));
