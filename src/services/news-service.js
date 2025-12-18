import { NEWS_FRESH_MS, NEWS_QUERY, NEWS_CACHE_FAV, NEWS_URL, NEWS_KEY, NEWS_TTL } from "../config/app-config.js";
import { ERRORS } from "../config/error.js";
import { filterLastHours, ensureArray } from "../utils/general-utils.js";
import { fetchWithCache } from "./storage-manager.js";
import { fetchWithRetry } from "./api.js";


const normalizeArticle = ({title,description,pubDate,source_id,link,image_url,} = {}) => ({
  title,
  description,
  published_at: pubDate,
  source: {title: source_id || "Unknown source",domain: source_id || "unknown",},
  original_url: link,
  url: link,
  image: image_url,
});

export const fetchNews = async (cacheKey, params = {}) => {
  const query = params.q || NEWS_QUERY;
  const { ok, data, status, error } = await fetchWithCache(
    cacheKey,
    async () => {
      const { ok, data, status, error } = await fetchWithRetry(
        `${NEWS_URL}?apikey=${NEWS_KEY}&language=en&q=${query}`
      );
      if (!ok || !data) {return {ok: false,status,error: error || ERRORS.NEWS_ERROR,};}

      const normalized = (data.results || []).map(normalizeArticle);
      return { ok: true, data: normalized, status };
    },
    NEWS_TTL
  );

  if (!ok) {return {ok: false,status,error: error || ERRORS.NEWS_ERROR,};
  }

  const articles = ensureArray(data);
  const fresh = filterLastHours(articles, NEWS_FRESH_MS)
  return {
    ok: true,
    data: fresh.length ? fresh : articles,
    usedFallback: !fresh.length && articles.length > 0,
  };
};

export const getNewsForFavorites = (favoriteSymbols = []) => {
  if (!favoriteSymbols || favoriteSymbols.length === 0) {
    return {ok: false,error: ERRORS.NO_FAVORITES,};
  }
  const unique = [...new Set(ensureArray(favoriteSymbols).filter(Boolean))].sort();

  const query = unique.join(" OR ");
  const cacheKey = `${NEWS_CACHE_FAV}:${unique.join(",")}`;

  return fetchNews(cacheKey, { q: query });
};
