import { UIManager } from "../ui/ui-manager.js";
import { PageComponents } from "../ui/Components/page-components.js";
import { NewsService } from "../services/news-service.js";
import { AppState } from "../state/state.js";
import { CONFIG } from "../config/config.js";
import { ChartService } from "../services/chart-service.js";

const modeConfig = {
  general: {
    status: CONFIG.NEWS_UI.STATUS_GENERAL,
    fallback: CONFIG.NEWS_UI.STATUS_FALLBACK_GENERAL,
    loading: CONFIG.NEWS_UI.LOADING_GENERAL,
    error: CONFIG.NEWS_UI.ERROR_GENERAL,
  },
  favorites: {
    status: CONFIG.NEWS_UI.STATUS_FAVORITES,
    fallback: CONFIG.NEWS_UI.STATUS_FALLBACK_FAVORITES,
    loading: CONFIG.NEWS_UI.LOADING_FAVORITES,
    error: CONFIG.NEWS_UI.ERROR_FAVORITES,
  },
};

export const NewsController = (() => {
  const displayNews = async () => {
    ChartService.cleanup();
    AppState.setCurrentView("news");
    UIManager.showPage(PageComponents.newsPage());
    await fetchNews("general");
  };

  const fetchNews = async (mode = "general") => {
    const normalizedMode = mode === "favorites" ? "favorites" : "general";
    const config = modeConfig[normalizedMode];
    const favorites = AppState.getFavorites();

    UIManager.setNewsFilterMode(normalizedMode);

    if (normalizedMode === "favorites" && !favorites.length) {
      UIManager.updateNewsStatus(CONFIG.NEWS_UI.STATUS_NO_FAVORITES);
      UIManager.showNews([], { emptyMessage: CONFIG.NEWS_UI.EMPTY });
      return;
    }

    UIManager.updateNewsStatus(config.status);
    UIManager.showNewsLoading(config.loading);

    const result =
      normalizedMode === "favorites"
        ? await NewsService.getNewsForFavorites(favorites)
        : await NewsService.getGeneralNews();

    if (!result?.ok) {
      UIManager.showNewsError(result?.errorMessage || config.error);
      return;
    }

    if (result.usedFreshnessFallback) {
      UIManager.updateNewsStatus(config.fallback);
    }

    UIManager.showNews(result.articles);
  };

  return {
    showNewsPage: displayNews,
    loadNews: fetchNews,
    loadGeneral: () => fetchNews("general"),
    loadFavorites: () => fetchNews("favorites"),
  };
})();
