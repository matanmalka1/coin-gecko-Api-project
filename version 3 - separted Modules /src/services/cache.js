import { CONFIG } from "../config/config.js";

export const CacheManager = (() => {
  const cache = {};

  const getCache = (key) => {
    const cached = cache[key];
    if (!cached) return null;

    const now = Date.now();
    const isExpired = now - cached.timestamp >= CONFIG.CACHE.EXPIRY_TIME;

    if (isExpired) {
      delete cache[key];
      return null;
    }

    return cached.data;
  };

  const setCache = (key, data) => {
    cache[key] = {
      data,
      timestamp: Date.now(),
    };
  };

  const removeCache = (key) => {
    delete cache[key];
  };

  const clearCache = () => {
    Object.keys(cache).forEach((key) => delete cache[key]);
  };

  const hasCache = (key) => {
    return getCache(key) !== null;
  };

  return {
    getCache,
    setCache,
    removeCache,
    clearCache,
    hasCache,
  };
})();
