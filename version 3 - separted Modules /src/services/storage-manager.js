import { APP_CONFIG } from "../config/app-config.js";

const {
  CACHE_MAX: MAX_ENTRIES = 100,
  CACHE_TTL: EXPIRY_TIME,
  KEY_FAVORITES,
  KEY_REPORTS,
} = APP_CONFIG;

// ===== IN-MEMORY CACHE (LRU) =====
const cacheStore = new Map();

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

const setCache = (key, data, ttl = EXPIRY_TIME) => {
  const entry = { data, timestamp: Date.now(), ttl };

  if (cacheStore.has(key)) cacheStore.delete(key);
  cacheStore.set(key, entry);

  while (cacheStore.size > MAX_ENTRIES) {
    const oldestKey = cacheStore.keys().next().value;
    cacheStore.delete(oldestKey);
  }
};

 export const fetchWithCache = async (cacheKey, fetcher, ttl = EXPIRY_TIME) => {
  const cached = getCache(cacheKey);
  if (cached) return { ok: true, data: cached, fromCache: true };

 const { ok, data, code, error, status } = await fetcher();
  if (!ok) {
    return { ok: false, code: code || "DEFAULT", error, status };
  }

  setCache(cacheKey, data, ttl);
  return { ok: true, data, fromCache: false, status };
};

// ===== LOCAL STORAGE HELPERS =====
const readJSON = (key, fallback = null) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch (error) {
    console.warn(`Storage read failed for "${key}"`, error);
    return fallback;
  }
};

const writeJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Storage write failed for "${key}":`, error);
  }
};

// ===== FAVORITES & REPORTS HELPERS =====
const getFavorites = () => {
  const stored = readJSON(KEY_FAVORITES, []);
  return Array.isArray(stored) ? stored : [];
};

const addFavorite = (symbol) => {
  const favorites = getFavorites();
  if (!favorites.includes(symbol)) {
    writeJSON(KEY_FAVORITES, [...favorites, symbol]);}
};

const removeFavorite = (symbol) => {
  const favorites = getFavorites();
  writeJSON(KEY_FAVORITES,favorites.filter((f) => f !== symbol));
};

const isFavorite = (symbol) => getFavorites().includes(symbol);

export const getSelectedReports = () => {
  const stored = readJSON(KEY_REPORTS, []);
  return Array.isArray(stored) ? stored : [];
};

const setSelectedReports = (reports) => {
  writeJSON(KEY_REPORTS, Array.isArray(reports) ? reports : []);
};

const addReport = (symbol) => {
  const reports = getSelectedReports();
  if (!reports.includes(symbol)) {
    writeJSON(KEY_REPORTS, [...reports, symbol]);
  }
};

const removeReport = (symbol) => {
  const reports = getSelectedReports();
  writeJSON(
    KEY_REPORTS,
    reports.filter((r) => r !== symbol)
  );
};

const hasReport = (symbol) => getSelectedReports().includes(symbol);

const getUIState = () => ({
  selected: getSelectedReports(),
  favorites: getFavorites(),
});

export const CacheManager = {
  getCache,
  setCache,
  fetchWithCache,
};

export const StorageHelper = {
  readJSON,
  writeJSON,
  getFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
  getSelectedReports,
  setSelectedReports,
  addReport,
  removeReport,
  hasReport,
  getUIState,
};
