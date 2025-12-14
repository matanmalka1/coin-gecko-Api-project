// Flat configuration container (grouped by comment, no nested objects)
export const APP_CONFIG = {
  // ===== API ENDPOINTS =====
  COINGECKO_BASE: "https://api.coingecko.com/api/v3",
  CRYPTOCOMPARE_BASE: "https://min-api.cryptocompare.com/data",
  NEWS_URL: "https://newsdata.io/api/1/crypto",

  CRYPTOCOMPARE_KEY: "4ef2fdc02875bc61baebda22cab1520bc687d182b4a7f09af1b5d3c087812578",
  NEWS_KEY: "pub_f179a246e66740f4943967a02e0bd77e",

  CHART_HISTORY_DAYS: 7,
  COINS_PER_PAGE: 50,

  // ===== CACHE SETTINGS =====
  CACHE_TTL: 5 * 60 * 1000,
  CACHE_MAX: 100,
  CACHE_COINS_REFRESH_MS: 5 * 60 * 1000,
  NEWS_TTL: 30 * 60 * 1000,
  NEWS_FRESH_MS: 5 * 60 * 60 * 1000,
  KEY_FAVORITES: "favorites",
  KEY_REPORTS: "reportsSelection",
  COINS_CACHE_KEY: "marketData",
  COINS_TIMESTAMP_KEY: "marketDataTimestamp",

  // ===== SEARCH =====
  MIN_LENGTH: 2,
  MAX_LENGTH: 20,
  ALLOWED_PATTERN: /^[a-z0-9\s.-]+$/i,

  // ===== GENERAL UI TEXT =====
  UI_LOAD_COINS: "Loading coins...",
  UI_COMPARE_TITLE: "Compare Coins",
  UI_NO_COINS: "No coins found.",
  UI_FAV_EMPTY: "No favorites yet. Tap the star to add coins.",
  UI_FAV_SHOW: "Favorites ⭐",
  UI_FAV_HIDE: "All Coins",

  // ===== NEWS UI =====
  NEWS_STATUS_GEN: "Showing general crypto news from the last 5 hours.",
  NEWS_STATUS_FAV:
    "Showing news for your favorite coins from the last 5 hours.",
  NEWS_STATUS_FALLBACK_GEN:
    "No articles from the last 5 hours. Showing latest available news.",
  NEWS_STATUS_FALLBACK_FAV:
    "No articles from the last 5 hours. Showing latest available favorites news.",
  NEWS_LOAD_GEN: "Loading news...",
  NEWS_LOAD_FAV: "Loading favorites news...",
  NEWS_DESC_MAX: 200,

  // ===== NEWS DEFAULTS =====
  NEWS_QUERY: "crypto OR cryptocurrency",
  NEWS_LANG: "en",
  NEWS_CACHE_GEN: "news_cache_general",
  NEWS_CACHE_FAV: "news_cache_favorites",

  // ===== COIN DETAILS =====
  COIN_DESC_MAX: 200,

  // ===== REPORTS =====
  REPORTS_MAX: 5,
  REPORTS_COMPARE_MAX: 2,
  REPORTS_DAYS: 30,
  REPORTS_UPDATE_MS: 2000,
  REPORTS_CREDIT_LABEL: "Reports charts powered by",
  REPORTS_CREDIT_NAME: "TradingView Lightweight Charts",
  REPORTS_CREDIT_LINK: "https://www.tradingview.com",

  // ===== ABOUT =====
  ABOUT_NAME: "Matan Yehuda Malka",
  ABOUT_IMAGE: "images/2.jpeg",
  ABOUT_LINKEDIN: "https://www.linkedin.com/in/matanyehudamalka",
};

export const CONFIG_CHART = {
  // ===== CHART SETTINGS =====
  CHART_POINTS: 70,
  CHART_BADGE: "Live",
  CHART_H: 220,
  CHART_H_MOBILE: 180,
  CHART_UP: "#26a69a",
  CHART_DOWN: "#ef5350",
  CHART_BORDER_UP: "#26a69a",
  CHART_BORDER_DOWN: "#ef5350",
  CHART_WICK_UP: "#26a69a",
  CHART_WICK_DOWN: "#ef5350",
  CHART_BG: "#ffffff",
  CHART_TEXT_BORDER: "#000000ff",
};
