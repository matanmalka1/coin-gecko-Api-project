export const API_CONFIG = {
  COINGECKO_BASE: "https://api.coingecko.com/api/v3",
  CRYPTOCOMPARE_BASE: "https://min-api.cryptocompare.com/data",
  CHART_HISTORY_DAYS: 7,
  COINS_PER_PAGE: 50,
  
  NEWS: {
    BASE_URL: "https://newsdata.io/api/1/crypto",
    API_KEY: "pub_f179a246e66740f4943967a02e0bd77e",
  },
};

export const CACHE_CONFIG = {
  CACHE: {
    EXPIRY_TIME: 5 * 60 * 1000,
    MAX_ENTRIES: 100,
    COINS_REFRESH_INTERVAL_MS: 5 * 60 * 1000,
  },

  NEWS_CACHE: {
    TTL_MS: 15 * 60 * 1000,
    FRESH_WINDOW_MS: 5 * 60 * 60 * 1000,
  },

  STORAGE_KEYS: {
    FAVORITES: "favorites",
    REPORTS: "reportsSelection",
  },
  REPORTS_CACHE: {
    CHART_TTL_MS: 5 * 60 * 1000,
  },
};
