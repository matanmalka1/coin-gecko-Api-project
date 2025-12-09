import { APP_CONFIG } from "../config/app-config.js";
import { ERRORS } from "../config/error.js";
import { filterLastHours } from "../utils/general-utils.js";
import { CacheManager } from "./storage-manager.js";
import { fetchWithRetry } from "./api.js"; // במקום coinAPI

const { getCache, setCache } = CacheManager;

const CACHE_TTL_MS = APP_CONFIG.NEWS_TTL;
const FRESH_WINDOW_MS = APP_CONFIG.NEWS_FRESH_MS;
const DEFAULT_QUERY = APP_CONFIG.NEWS_QUERY;
const LANGUAGE = APP_CONFIG.NEWS_LANG;
const CACHE_KEYS = {
  GENERAL: APP_CONFIG.NEWS_CACHE_GEN,
  FAVORITES: APP_CONFIG.NEWS_CACHE_FAV,
};
const BASE_URL = APP_CONFIG.NEWS_URL;
const API_KEY = APP_CONFIG.NEWS_KEY;

// ===== RESPONSE BUILDER =====
const buildNewsResponse = (articles) => {
  const fresh = filterLastHours(articles, FRESH_WINDOW_MS);
  return {
    ok: true,
    articles: fresh.length ? fresh : articles,
    usedFallback: !fresh.length && articles.length > 0,
  };
};

// ===== CACHE HELPERS =====
const getCachedNews = (cacheKey) => {
  const cached = getCache(cacheKey);
  return cached ? buildNewsResponse(Array.isArray(cached) ? cached : []) : null;
};
// ===== NORMALIZATION =====
const normalizeArticle = ({
  title,
  description,
  pubDate,
  source_id,
  link,
  image_url,
} = {}) => ({
  title,
  description,
  published_at: pubDate,
  source: {
    title: source_id || "Unknown source",
    domain: source_id || "unknown",
  },
  original_url: link,
  url: link,
  image: image_url,
});

// ===== FETCH LAYER =====
const fetchNews = async (cacheKey, params = {}) => {
  const cached = getCachedNews(cacheKey);
  if (cached) return cached;

  const query = params.q || DEFAULT_QUERY;

  const { ok, data, status, error } = await fetchWithRetry(
    `${BASE_URL}?apikey=${API_KEY}` +
      (LANGUAGE ? `&language=${LANGUAGE}` : "") +
      `&q=${query}`
  );

  if (!ok || !data) {
    return {
      ok: false,
      code: "NEWS_HTTP_ERROR",
      status,
      errorMessage:
        (status ? ERRORS.HTTP_STATUS(status) : error) || ERRORS.DEFAULT,
    };
  }

  const normalized = (data.results || []).map(normalizeArticle);
  CacheManager.setCache(cacheKey, normalized, CACHE_TTL_MS);

  return buildNewsResponse(normalized);
};

export const getGeneralNews = () => fetchNews(CACHE_KEYS.GENERAL);

export const getNewsForFavorites = (favoriteSymbols = []) => {
  if (!favoriteSymbols || favoriteSymbols.length === 0) {
    return {
      ok: false,
      code: "NO_FAVORITES",
      errorMessage: ERRORS.NO_FAVORITES,
    };
  }
  const unique = [
    ...new Set(
      (favoriteSymbols || [])
        .filter(Boolean)
        .map((symbol) => String(symbol).trim().toUpperCase())
    ),
  ].sort();

  const query = unique.join(" OR ");
  const cacheKey = `${CACHE_KEYS.FAVORITES}:${unique.join(",")}`;

  return fetchNews(cacheKey, { q: query });
};
