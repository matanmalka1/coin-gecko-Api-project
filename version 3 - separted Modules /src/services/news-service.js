import { API_CONFIG, CACHE_CONFIG } from "../config/api-cache-config.js";
import { UI_CONFIG } from "../config/ui-config.js";
import { ERRORS } from "../config/error.js";
import { filterLastHours } from "../utils/general-utils.js";
import { CacheManager } from "./storage-manager.js";
import { fetchWithRetry } from "./api.js"; // במקום coinAPI

const { getCache, setCache } = CacheManager;

const { TTL_MS: CACHE_TTL_MS, FRESH_WINDOW_MS } = CACHE_CONFIG.NEWS_CACHE;
const { DEFAULT_QUERY, CACHE_KEYS, LANGUAGE } = UI_CONFIG.NEWS;
const { BASE_URL, API_KEY } = API_CONFIG.NEWS;

// ===== CACHE HELPERS =====
const getCachedNews = (cacheKey) => {
  const cached = getCache(cacheKey);
  if (!cached) return null;

  const cachedArticles = Array.isArray(cached) ? cached : [];
  const freshArticles = filterLastHours(cachedArticles, FRESH_WINDOW_MS);
  const usedFallback = !freshArticles.length && cachedArticles.length > 0;
  return {
    ok: true,
    articles: freshArticles.length ? freshArticles : cachedArticles,
    usedFallback,
  };
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

// ===== RESPONSE BUILDER =====
const buildNewsResponse = (normalized) => {
  const freshArticles = filterLastHours(normalized, FRESH_WINDOW_MS);
  const usedFallback = !freshArticles.length && normalized.length > 0;

  return {
    ok: true,
    articles: freshArticles.length ? freshArticles : normalized,
    usedFallback,
  };
};

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
        (status && ERRORS.API.HTTP_STATUS
          ? ERRORS.API.HTTP_STATUS(status)
          : error) || ERRORS.API.DEFAULT,
    };
  }

  const normalized = (data.results || []).map(normalizeArticle);
  CacheManager.setCache(cacheKey, normalized, CACHE_TTL_MS);

  return buildNewsResponse(normalized);
};

const getGeneralNews = () => fetchNews(CACHE_KEYS.GENERAL);

const getNewsForFavorites = (favoriteSymbols = []) => {
  if (!favoriteSymbols || favoriteSymbols.length === 0) {
    return {
      ok: false,
      code: "NO_FAVORITES",
      errorMessage: "No favorite coins selected",
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

export const NewsService = {
  getGeneralNews,
  getNewsForFavorites,
};
