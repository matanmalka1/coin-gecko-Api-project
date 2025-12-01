// [NEWS] News service: fetches crypto news from NewsData with cache and freshness filter
import { CONFIG } from "../config/config.js";
import { ERRORS } from "../config/error.js";
import { filterLastHours } from "../utils/general-utils.js";
import { CacheManager } from "./cache.js";

export const NewsService = (() => {
  const {
    BASE_URL,
    API_KEY,
    DEFAULT_QUERY,
    LANGUAGE,
    CACHE_TTL_MS,
    FRESH_WINDOW_MS,
    CACHE_KEYS,
  } = CONFIG.NEWS;

  const buildFavoritesCacheKey = (symbols = []) => {
    const normalized = (symbols || [])
      .filter(Boolean)
      .map((s) => (typeof s === "string" ? s.trim().toUpperCase() : String(s)))
      .sort();
    return `${CACHE_KEYS.FAVORITES}:${normalized.join(",")}`;
  };

  // Fetches news articles (with caching) for either general or favorites queries.
  const fetchNews = async (cacheKey, params = {}) => {
    const cached = CacheManager.getCache(cacheKey);

    if (cached) {
      const cachedArticles = Array.isArray(cached) ? cached : [];
      const filteredCache = filterLastHours(cachedArticles, FRESH_WINDOW_MS);

      const usedFallback =
        filteredCache.length === 0 && cachedArticles.length > 0;

      const articles = filteredCache.length ? filteredCache : cachedArticles;

      return {
        ok: true,
        articles,
        usedFreshnessFallback: usedFallback,
        source: "cache",
        freshness: usedFallback ? "stale" : "fresh",
      };
    }

    const url = new URL(BASE_URL);
    const searchParams = url.searchParams;
    searchParams.set("apikey", API_KEY);
    if (LANGUAGE) searchParams.set("language", LANGUAGE);
    searchParams.set("q", params.q || DEFAULT_QUERY);

    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        return {
          ok: false,
          errorMessage: `News API returned ${response.status}`,
        };
      }
      const data = await response.json();
      const normalized = (data.results || []).map((article = {}) => ({
        title: article.title,
        description: article.description,
        published_at: article.pubDate,
        source: { title: article.source_id, domain: article.source_id },
        original_url: article.link,
        url: article.link,
        image: article.image_url,
      }));

      CacheManager.setCache(cacheKey, normalized, CACHE_TTL_MS);
      const filtered = filterLastHours(normalized, FRESH_WINDOW_MS);
      const usedFallback = filtered.length === 0 && normalized.length > 0;

      return {
        ok: true,
        articles: filtered.length ? filtered : normalized,
        usedFreshnessFallback: usedFallback,
        source: "api",
        freshness: usedFallback ? "stale" : "fresh",
      };
    } catch (error) {
      console.error("NewsService: API error", error);
      return {
        ok: false,
        errorMessage: ERRORS.NEWS.GENERAL_ERROR,
      };
    }
  };

  // Returns general crypto news (last 5 hours).
  const getGeneralNews = () => fetchNews(CACHE_KEYS.GENERAL);

  // Returns crypto news filtered by the user's favorite symbols.
  const getNewsForFavorites = (favoriteSymbols = []) => {
    const cleaned = (favoriteSymbols || [])
      .filter(Boolean)
      .map((s) => String(s).trim().toUpperCase());

    const unique = Array.from(new Set(cleaned));

    const query = unique.join(" OR ");
    const cacheKey = buildFavoritesCacheKey(unique);

    return fetchNews(cacheKey, { q: query });
  };

  return {
    getGeneralNews,
    getNewsForFavorites,
  };
})();
