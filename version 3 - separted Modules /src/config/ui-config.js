// UI texts and view-related constants.
export const CONFIG = {
  // API
  COINGECKO: "https://api.coingecko.com/api/v3",
  NEWS_API: "https://newsdata.io/api/1/crypto",
  NEWS_KEY: "pub_f179a246e66740f4943967a02e0bd77e",

  // Search
  SEARCH_MIN: 2,
  SEARCH_MAX: 40,
  SEARCH_PATTERN: /^[a-z0-9\s.-]+$/i,

  // Limits
  MAX_REPORTS: 5,
  MAX_COMPARE: 2,
  COINS_PER_PAGE: 50,

  //  Chart
  CHART_HISTORY: 70,
  CHART_DAYS: 30,
  CHART_HEIGHT: 220,
  CHART_HEIGHT_MOBILE: 180,

  // Text limits
  DESC_MAX: 200,
  NEWS_DESC_MAX: 200,

  // Currencies
  CURRENCIES: { USD: "$", EUR: "€", ILS: "₪" },

  // About
  AUTHOR: "Matan Yehuda Malka",
  AUTHOR_IMAGE: "images/2.jpeg",
  AUTHOR_LINKEDIN: "https://www.linkedin.com/in/matanyehudamalka",

  // Cache
  CACHE_TTL: 5 * 60 * 1000,
  NEWS_TTL: 15 * 60 * 1000,
  NEWS_FRESH: 5 * 60 * 60 * 1000,
  MAX_CACHE: 100,


  // Storage keys
  KEY_FAVORITES: "favorites",
  KEY_REPORTS: "reportsSelection",
};

  // General UI messages
  LOADING_COINS: "Loading coins...",
  REPLACE_ALERT: "Please select a coin to replace",
  COMPARE_TITLE: "Compare Coins",
  NO_COINS_FOUND: "No coins found.",
  FAVORITES_EMPTY: "No favorites yet. Tap the star to add coins.",
  FAVORITES_SHOW_LABEL: "Favorites ⭐",
  FAVORITES_HIDE_LABEL: "All Coins",

  // News UI messages
  STATUS_GENERAL: "Showing general crypto news from the last 5 hours.",
  STATUS_FAVORITES:
    "Showing news for your favorite coins from the last 5 hours.",
  STATUS_NO_FAVORITES:
    "No favorite coins selected. Please add favorites to see related news.",
  STATUS_FALLBACK_GENERAL:
    "No articles from the last 5 hours. Showing latest available news.",
  STATUS_FALLBACK_FAVORITES:
    "No articles from the last 5 hours. Showing latest available favorites news.",
  LOADING_GENERAL: "Loading news...",
  LOADING_FAVORITES: "Loading favorites news...",
  // Chart settings
  CHART: {
    UPDATE_INTERVAL_MS: 2000,
    AXIS_X_FORMAT: "HH:mm:ss",
    AXIS_Y_PREFIX: "$",
    CARD_BADGE_TEXT: "Live",
    CANDLE_COLORS: {
      UP: "#26a69a",
      DOWN: "#ef5350",
      BORDER_UP: "#26a69a",
      BORDER_DOWN: "#ef5350",
      WICK_UP: "#26a69a",
      WICK_DOWN: "#ef5350",
    },
    LAYOUT: {
      BACKGROUND: "#ffffff",
      TEXT: "#333333",
      BORDER: "#D1D4DC",
    },
  },

  // Reports settings
  REPORTS: {
    HISTORY_DAYS: 30,
    CREDIT: {
      LABEL: "Reports charts powered by",
      NAME: "TradingView Lightweight Charts",
      LINK: "https://www.tradingview.com",
    },
  },


  // News default preferences
  NEWS: {
    DEFAULT_QUERY: "crypto OR cryptocurrency",
    LANGUAGE: "en",
    CACHE_KEYS: {
      GENERAL: "news_cache_general",
      FAVORITES: "news_cache_favorites",
    },
  },

  STATSBAR: {
    ICON: `<i class="fas fa-chart-bar"></i>`,
    LABELS: {
      MARKET_CAP: "Market Cap",
      VOLUME_24H: "24h Volume",
      BTC_DOMINANCE: "BTC Dominance",
      MARKET_CHANGE_24H: "Market Change",
    },
  },

  DARKMODE: {
    bottom: "20px",
    right: "5px",
    left: "unset",
    time: "0.3s",
    mixColor: "#fff",
    backgroundColor: "#f5f5f5",
    buttonColorDark: "#ffffff",
    buttonColorLight: "#000000",
    saveInCookies: true,
    label: "☀️",
    autoMatchOsTheme: true,
  },
};
