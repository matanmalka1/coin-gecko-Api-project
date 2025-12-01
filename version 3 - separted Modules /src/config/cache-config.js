// Cache and persistence configuration used across services.
export const CACHE_CONFIG = {
  CACHE: {
    EXPIRY_TIME: 2 * 60 * 1000,
    MAX_ENTRIES: 100,
    COINS_REFRESH_INTERVAL_MS: 0.5 * 60 * 1000,
  },

  NEWS_CACHE: {
    TTL_MS: 10 * 60 * 1000,
    FRESH_WINDOW_MS: 5 * 60 * 60 * 1000,
  },

  STORAGE_KEYS: {
    THEME: "themeמתן",
    FAVORITES: "favorites",
    REPORTS: "reportsSelection",
  },
};
