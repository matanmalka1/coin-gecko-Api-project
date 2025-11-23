// [NEWS] News service: fetches crypto news from NewsData with 10m cache and 5h freshness filter
import { CONFIG } from "../config/config.js";

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

  // [NEWS] Filter articles to last 5 hours
  const filterLastFiveHours = (articles) => {
    const now = Date.now();
    return (articles || []).filter((item) => {
      if (!item.published_at) return false;
      const publishedTime = Date.parse(item.published_at);
      if (Number.isNaN(publishedTime)) return false;
      return now - publishedTime <= FRESH_WINDOW_MS;
    });
  };

  const fetchNews = async (cacheKey, params = {}) => {
    let cached = null;
    try {
      const raw = localStorage.getItem(cacheKey);
      cached = raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.warn("NewsService: failed to parse cache", err);
    }

    if (cached?.timestamp && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      const filteredCache = filterLastFiveHours(cached.articles || []);
      const usedFallback =
        filteredCache.length === 0 && (cached.articles || []).length > 0;
      return {
        ok: true,
        articles: filteredCache.length ? filteredCache : cached.articles || [],
        usedCacheFallback: usedFallback,
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

      try {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({ timestamp: Date.now(), articles: normalized })
        );
      } catch (err) {
        console.warn("NewsService: failed to write cache", err);
      }
      const filtered = filterLastFiveHours(normalized);
      const usedFallback = filtered.length === 0 && normalized.length > 0;

      return {
        ok: true,
        articles: filtered.length ? filtered : normalized,
        usedCacheFallback: usedFallback,
      };
    } catch (error) {
      console.error("NewsService: API error", error);
      return {
        ok: false,
        errorMessage: "Failed to load news. Please try again later.",
      };
    }
  };

  const getGeneralNews = () => fetchNews(CACHE_KEYS.GENERAL);

  const getNewsForFavorites = (favoriteSymbols = []) => {
    const cleaned = (favoriteSymbols || [])
      .filter(Boolean)
      .map((s) => (typeof s === "string" ? s.trim().toUpperCase() : String(s)));

    const unique = Array.from(new Set(cleaned));
    if (!unique.length) {
      return Promise.resolve({
        ok: true,
        articles: [],
        usedCacheFallback: false,
      });
    }

    const query = unique.join(" OR ").trim();
    const params = query ? { q: query } : {};

    return fetchNews(CACHE_KEYS.FAVORITES, params);
  };

  return {
    getGeneralNews,
    getNewsForFavorites,
  };
})();
