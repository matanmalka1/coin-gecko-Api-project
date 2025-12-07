// [NEWS] News service: fetches crypto news from NewsData with cache and freshness filter
import { API_CONFIG, CACHE_CONFIG } from "../config/api-cache-config.js";
import { UI_CONFIG } from "../config/ui-config.js";
import { ERRORS } from "../config/error.js";
import { filterLastHours } from "../utils/general-utils.js";
import { CacheManager } from "./storage-manager.js";
import { coinAPI } from "./api.js";

const { TTL_MS: CACHE_TTL_MS, FRESH_WINDOW_MS } = CACHE_CONFIG.NEWS_CACHE;
const { DEFAULT_QUERY, CACHE_KEYS } = UI_CONFIG.NEWS;

// Fetches news articles (with caching) for either general or favorites queries.
const fetchNews = async (cacheKey, params = {}) => {
  const cached = CacheManager.getCache(cacheKey);
  if (cached) {
    const cachedArticles = Array.isArray(cached) ? cached : [];
    const freshArticles = filterLastHours(cachedArticles, FRESH_WINDOW_MS);
    const usedFallback = !freshArticles.length && cachedArticles.length > 0;
    return {
      ok: true,
      articles: freshArticles.length ? freshArticles : cachedArticles,
      usedFallback,
    };
  }

  const response = await coinAPI.fetchNewsData({
    q: params.q || DEFAULT_QUERY,
  });

  if (!response.ok) {
    return {
      ok: false,
      code: "NEWS_HTTP_ERROR",
      status: response.status,
      errorMessage:
        ERRORS.API_STATUS?.(response.status) ||
        response.error ||
        ERRORS.API.DEFAULT,
    };
  }

  const data = response.data;
  const normalized = (data?.results || []).map((article = {}) => ({
    title: article.title,
    description: article.description,
    published_at: article.pubDate,
    source: { title: article.source_id, domain: article.source_id },
    original_url: article.link,
    url: article.link,
    image: article.image_url,
  }));

  CacheManager.setCache(cacheKey, normalized, CACHE_TTL_MS);

  const freshArticles = filterLastHours(normalized, FRESH_WINDOW_MS);
  const usedFallback = !freshArticles.length && normalized.length > 0;

  return {
    ok: true,
    articles: freshArticles.length ? freshArticles : normalized,
    usedFallback,
  };
};

// Returns general crypto news (last 5 hours).
const getGeneralNews = () => fetchNews(CACHE_KEYS.GENERAL);

// Returns crypto news filtered by the user's favorite symbols.
const getNewsForFavorites = (favoriteSymbols = []) => {
  const cleaned = (favoriteSymbols || [])
    .filter(Boolean)
    .map((symbol) => String(symbol).trim().toUpperCase());

  const unique = Array.from(new Set(cleaned)).sort();

  const query = unique.join(" OR ");
  const cacheKey = `${CACHE_KEYS.FAVORITES}:${unique.join(",")}`;

  return fetchNews(cacheKey, { q: query });
};

export const NewsService = {
  getGeneralNews,
  getNewsForFavorites,
};
