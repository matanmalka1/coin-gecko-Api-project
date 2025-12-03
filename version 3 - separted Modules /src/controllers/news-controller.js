import { UIManager } from "../ui/ui-manager.js";
import { PageComponents } from "../ui/Components/page-components.js";
import { NewsService } from "../services/news-service.js";
import { AppState } from "../state/state.js";
import { ERRORS } from "../config/error.js";
import { ChartService } from "../services/chart-service.js";
import { UI_CONFIG } from "../config/ui-config.js";

const modeConfig = {
  general: {
    status: UI_CONFIG.NEWS_UI.STATUS_GENERAL,
    fallback: UI_CONFIG.NEWS_UI.STATUS_FALLBACK_GENERAL,
    loading: UI_CONFIG.NEWS_UI.LOADING_GENERAL,
    error: ERRORS.NEWS.GENERAL_ERROR,
  },
  favorites: {
    status: UI_CONFIG.NEWS_UI.STATUS_FAVORITES,
    fallback: UI_CONFIG.NEWS_UI.STATUS_FALLBACK_FAVORITES,
    loading: UI_CONFIG.NEWS_UI.LOADING_FAVORITES,
    error: ERRORS.NEWS.FAVORITES_ERROR,
  },
};

// Generic news-loading helper, handles general/favorites modes.
const loadNews = async (mode = "general") => {
  const isFavorites = mode === "favorites";
  const currentMode = isFavorites ? "favorites" : "general";
  const config = modeConfig[currentMode];
  const favorites = AppState.getFavorites();

  UIManager.setNewsFilterMode(currentMode);

  if (isFavorites && !favorites.length) {
    UIManager.updateNewsStatus(UI_CONFIG.NEWS_UI.STATUS_NO_FAVORITES);
    UIManager.showNews([], { emptyMessage: ERRORS.NEWS.EMPTY });
    return;
  }

  UIManager.updateNewsStatus(config.status);
  UIManager.showNewsLoading(config.loading);

  const result = isFavorites
    ? await NewsService.getNewsForFavorites(favorites)
    : await NewsService.getGeneralNews();

  if (!result?.ok) {
    UIManager.showNewsError(result?.errorMessage || config.error);
    return;
  }

  if (result.usedFallback) {
    UIManager.updateNewsStatus(config.fallback);
  }

  UIManager.showNews(result.articles);
};

const showNewsPage = async () => {
  ChartService.cleanup();
  UIManager.showPage(PageComponents.newsPage());
  await loadNews("general");
};

export const NewsController = {
  showNewsPage,
  loadGeneral: () => loadNews("general"),
  loadFavorites: () => loadNews("favorites"),
};
