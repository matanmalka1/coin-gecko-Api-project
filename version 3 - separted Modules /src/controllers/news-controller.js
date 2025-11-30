import { UIManager } from "../ui/ui-manager.js";
import { PageComponents } from "../ui/Components/page-components.js";
import { NewsService } from "../services/news-service.js";
import { AppState } from "../state/state.js";
import { CONFIG } from "../config/config.js";
import { ERRORS } from "../config/error.js";
import { ChartController } from "./chart-controller.js";

const modeConfig = {
  general: {
    status: CONFIG.NEWS_UI.STATUS_GENERAL,
    fallback: CONFIG.NEWS_UI.STATUS_FALLBACK_GENERAL,
    loading: CONFIG.NEWS_UI.LOADING_GENERAL,
    error: ERRORS.NEWS.GENERAL_ERROR,
  },
  favorites: {
    status: CONFIG.NEWS_UI.STATUS_FAVORITES,
    fallback: CONFIG.NEWS_UI.STATUS_FALLBACK_FAVORITES,
    loading: CONFIG.NEWS_UI.LOADING_FAVORITES,
    error: ERRORS.NEWS.FAVORITES_ERROR,
  },
};

export const NewsController = (() => {
  const showNewsPage = async () => {
    ChartController.cleanupAll();
    AppState.setCurrentView("news");
    UIManager.showPage(PageComponents.newsPage());
    await loadNews("general");
  };

  const loadNews = async (mode = "general") => {
    const normalizedMode = mode === "favorites" ? "favorites" : "general";
    const config = modeConfig[normalizedMode];
    const favorites = AppState.getFavorites();

    UIManager.setNewsFilterMode(normalizedMode);

    if (normalizedMode === "favorites" && !favorites.length) {
      UIManager.updateNewsStatus(CONFIG.NEWS_UI.STATUS_NO_FAVORITES);
      UIManager.showNews([], { emptyMessage: ERRORS.NEWS.EMPTY });
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
    showNewsPage,
    loadNews,
    loadGeneral: () => loadNews("general"),
    loadFavorites: () => loadNews("favorites"),
  };
})();
