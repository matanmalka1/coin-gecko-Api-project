// ===== API ENDPOINTS & KEYS =====
export const COINGECKO_BASE = "https://api.coingecko.com/api/v3";
export const CRYPTOCOMPARE_BASE = "https://min-api.cryptocompare.com/data";
export const NEWS_URL = "https://newsdata.io/api/1/crypto";

export const CRYPTOCOMPARE_KEY = "4ef2fdc02875bc61baebda22cab1520bc687d182b4a7f09af1b5d3c087812578";
export const NEWS_KEY = "pub_f179a246e66740f4943967a02e0bd77e";

// ===== DATA / FETCH LIMITS =====
export const CHART_HISTORY_DAYS = 7;
export const COINS_PER_PAGE = 100;

// ===== CACHE SETTINGS =====
export const CACHE_TTL = 5 * 60 * 1000;
export const CACHE_MAX = 100;
export const CACHE_COINS_REFRESH_MS = 5 * 60 * 1000;
export const NEWS_TTL = 30 * 60 * 1000;
export const NEWS_FRESH_MS = 5 * 60 * 60 * 1000;
export const KEY_FAVORITES = "favorites";
export const KEY_REPORTS = "reportsSelection";
export const COINS_CACHE_KEY = "marketData";
export const COINS_TIMESTAMP_KEY = "marketDataTimestamp";

// ===== NEWS =====
export const NEWS_QUERY = "crypto OR cryptocurrency";
export const NEWS_CACHE_GEN = "news_cache_general";
export const NEWS_CACHE_FAV = "news_cache_favorites";
export const NEWS_DESC_MAX = 200;

// ===== REPORTS =====
export const REPORTS_MAX = 5;
export const REPORTS_COMPARE_MAX = 2;
export const REPORTS_UPDATE_MS = 2000;

// ===== CHART CONFIGURATION =====
export const CHART_CONFIG = {
  points: 300,
  badge: "Live",
  colors: {
    up: "#26a69a",
    down: "#ef5350",
    borderUp: "#26a69a",
    borderDown: "#ef5350",
    wickUp: "#26a69a",
    wickDown: "#ef5350",
    background: "#ffffff",
    textBorder: "#000000ff",
  },
};
