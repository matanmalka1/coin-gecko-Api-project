// Flat configuration container (grouped by comment, no nested objects)
export const APP_CONFIG = {
  // ===== API ENDPOINTS =====
  COINGECKO_URL: "https://api.coingecko.com/api/v3",
  CRYPTOCOMPARE_URL: "https://min-api.cryptocompare.com/data",
  NEWS_URL: "https://newsdata.io/api/1/crypto",
  NEWS_KEY: "pub_f179a246e66740f4943967a02e0bd77e",
  CHART_HISTORY_DAYS: 7,
  COINS_PER_PAGE: 50,

  // ===== CACHE SETTINGS =====
  CACHE_TTL: 5 * 60 * 1000,
  CACHE_MAX: 100,
  CACHE_COINS_REFRESH_MS: 5 * 60 * 1000,
  NEWS_TTL: 15 * 60 * 1000,
  NEWS_FRESH_MS: 5 * 60 * 60 * 1000,
  REPORTS_CHART_TTL: 5 * 60 * 1000,
  KEY_FAVORITES: "favorites",
  KEY_REPORTS: "reportsSelection",

  // ===== SEARCH =====
  SEARCH_MIN: 2,
  SEARCH_MAX: 40,
  SEARCH_PATTERN: /^[a-z0-9\s.-]+$/i,

  // ===== GENERAL UI TEXT =====
  UI_LOAD_COINS: "Loading coins...",
  UI_REPLACE: "Please select a coin to replace",
  UI_COMPARE_TITLE: "Compare Coins",
  UI_NO_COINS: "No coins found.",
  UI_FAV_EMPTY: "No favorites yet. Tap the star to add coins.",
  UI_FAV_SHOW: "Favorites ⭐",
  UI_FAV_HIDE: "All Coins",

  // ===== NEWS UI =====
  NEWS_STATUS_GEN: "Showing general crypto news from the last 5 hours.",
  NEWS_STATUS_FAV:
    "Showing news for your favorite coins from the last 5 hours.",
  NEWS_STATUS_NOFAV:
    "No favorite coins selected. Please add favorites to see related news.",
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

  // ===== CHART SETTINGS =====
  CHART_TICK_MS: 2000,
  CHART_POINTS: 70,
  CHART_TIME_FMT: "HH:mm:ss",
  CHART_Y_PREFIX: "$",
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
  CHART_TEXT: "#333333",
  CHART_BORDER: "#D1D4DC",

  // ===== COIN DETAILS =====
  COIN_DESC_MAX: 200,

  // ===== REPORTS =====
  REPORTS_MAX: 5,
  REPORTS_COMPARE_MAX: 2,
  REPORTS_DAYS: 30,
  REPORTS_CREDIT_LABEL: "Reports charts powered by",
  REPORTS_CREDIT_NAME: "TradingView Lightweight Charts",
  REPORTS_CREDIT_LINK: "https://www.tradingview.com",

  // ===== CURRENCIES =====
  USD_SYMBOL: "$",
  USD_LABEL: "USD",
  EUR_SYMBOL: "€",
  EUR_LABEL: "EUR",
  ILS_SYMBOL: "₪",
  ILS_LABEL: "ILS",

  // ===== ABOUT =====
  ABOUT_NAME: "Matan Yehuda Malka",
  ABOUT_IMAGE: "images/2.jpeg",
  ABOUT_LINKEDIN: "https://www.linkedin.com/in/matanyehudamalka",

  // ===== STATSBAR =====
  STATS_ICON: `<i class="fas fa-chart-bar"></i>`,
  STATS_MARKET_CAP: "Market Cap",
  STATS_VOLUME_24H: "24h Volume",
  STATS_BTC_DOM: "BTC Dominance",
  STATS_MARKET_CHANGE: "Market Change",

  // ===== DARKMODE WIDGET =====
  DM_BOTTOM: "20px",
  DM_RIGHT: "5px",
  DM_LEFT: "unset",
  DM_TIME: "0.3s",
  DM_MIX: "#fff",
  DM_BG: "#f5f5f5",
  DM_BTN_DARK: "#ffffff",
  DM_BTN_LIGHT: "#000000",
  DM_SAVE_COOKIES: true,
  DM_LABEL: "☀️",
  DM_AUTO_OS: true,
};
