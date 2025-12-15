// ===== API ENDPOINTS & KEYS =====
export const COINGECKO_BASE = "https://api.coingecko.com/api/v3";
export const CRYPTOCOMPARE_BASE = "https://min-api.cryptocompare.com/data";
export const NEWS_URL = "https://newsdata.io/api/1/crypto";

export const CRYPTOCOMPARE_KEY = "4ef2fdc02875bc61baebda22cab1520bc687d182b4a7f09af1b5d3c087812578";
export const NEWS_KEY = "pub_f179a246e66740f4943967a02e0bd77e";

// ===== DATA / FETCH LIMITS =====
export const CHART_HISTORY_DAYS = 7;
export const COINS_PER_PAGE = 50;

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

// ===== SEARCH =====
export const ALLOWED_PATTERN = /^[a-z0-9\s.-]+$/i;

// ===== UI TEXT / LIMITS =====
export const UI_NO_COINS = "No coins found.";
export const NEWS_DESC_MAX = 200;
export const NEWS_QUERY = "crypto OR cryptocurrency";
export const NEWS_LANG = "en";
export const NEWS_CACHE_GEN = "news_cache_general";
export const NEWS_CACHE_FAV = "news_cache_favorites";
export const COIN_DESC_MAX = 200;

// ===== REPORTS =====
export const REPORTS_MAX = 5;
export const REPORTS_COMPARE_MAX = 2;
export const REPORTS_UPDATE_MS = 2000;

// ===== CHART SETTINGS =====
export const CHART_POINTS = 70;
export const CHART_BADGE = "Live";
export const CHART_H = 220;
export const CHART_H_MOBILE = 180;
export const CHART_UP = "#26a69a";
export const CHART_DOWN = "#ef5350";
export const CHART_BORDER_UP = "#26a69a";
export const CHART_BORDER_DOWN = "#ef5350";
export const CHART_WICK_UP = "#26a69a";
export const CHART_WICK_DOWN = "#ef5350";
export const CHART_BG = "#ffffff";
export const CHART_TEXT_BORDER = "#000000ff";
