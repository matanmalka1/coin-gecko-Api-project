export const CONFIG = {
  API: {
    COINGECKO_BASE: "https://api.coingecko.com/api/v3",
    CRYPTOCOMPARE_BASE: "https://min-api.cryptocompare.com/data",
  },

  CACHE: {
    EXPIRY_TIME: 2 * 60 * 1000,
  },

  REPORTS: {
    MAX_COINS: 5,
  },

  CHART: {
    TITLE: "Live Crypto Prices (USD)",
    UPDATE_INTERVAL_MS: 2000,
    HISTORY_POINTS: 70,
    AXIS_X_TITLE: "Time",
    AXIS_X_FORMAT: "HH:mm:ss",
    AXIS_Y_TITLE: "Price (USD)",
    AXIS_Y_PREFIX: "$",
  },

  DISPLAY: {
    COINS_PER_PAGE: 150,
  },

  CURRENCIES: {
    USD: { symbol: "$", label: "USD" },
    EUR: { symbol: "€", label: "EUR" },
    ILS: { symbol: "₪", label: "ILS" },
  },

  UI: {
    GENERIC_ERROR: "An error occurred. Please try again.",
    LOADING_COINS: "Loading coins...",
    REPLACE_ALERT: "Please select a coin to replace",
    COMPARE_TITLE: "Compare Coins",
    NO_COINS_FOUND: "No coins found.",
    FAVORITES_EMPTY: "No favorites yet. Tap the star to add coins.",
    FAVORITES_SHOW_LABEL: "Favorites ⭐",
    FAVORITES_HIDE_LABEL: "All Coins",
  },

  STORAGE_KEYS: {
    THEME: "theme",
    FAVORITES: "favorites",
  },

  // [NEWS] NewsData configuration for crypto news
  NEWS: {
    BASE_URL: "https://newsdata.io/api/1/crypto",
    API_KEY: "pub_f179a246e66740f4943967a02e0bd77e",
    DEFAULT_QUERY: "crypto OR cryptocurrency",
    LANGUAGE: "en",
    CACHE_TTL_MS: 10 * 60 * 1000,
    FRESH_WINDOW_MS: 5 * 60 * 60 * 1000,
    CACHE_KEYS: {
      GENERAL: "news_cache_general",
      FAVORITES: "news_cache_favorites",
    },
  },

  // [NEWS] UI texts for news feature
  NEWS_UI: {
    STATUS_GENERAL: "Showing general crypto news from the last 5 hours.",
    STATUS_FAVORITES: "Showing news for your favorite coins from the last 5 hours.",
    STATUS_NO_FAVORITES:
      "No favorite coins selected. Please add favorites to see related news.",
    STATUS_FALLBACK_GENERAL:
      "No articles from the last 5 hours. Showing latest available news.",
    STATUS_FALLBACK_FAVORITES:
      "No articles from the last 5 hours. Showing latest available favorites news.",
    LOADING_GENERAL: "Loading news...",
    LOADING_FAVORITES: "Loading favorites news...",
    ERROR_GENERAL: "Failed to load general news. Please try again later.",
    ERROR_FAVORITES: "Failed to load favorites news. Please try again later.",
    EMPTY: "No news found for the last 5 hours.",
    DESC_MAX: 200,
  },

  // [ABOUT] Static about page data
  ABOUT: {
    NAME: "Matan Yehuda Malka",
    IMAGE: "images/2.jpeg",
    LINKEDIN: "https://www.linkedin.com/in/matanyehudamalka",
  },
};
