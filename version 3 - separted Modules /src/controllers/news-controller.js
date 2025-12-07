import { UIManager } from "../ui/ui-manager.js";
import { AppState } from "../state/state.js";
import { NewsService } from "../services/news-service.js";
import { ERRORS } from "../config/error.js";
import { BaseUI } from "../ui/base-ui.js";
import { UI_CONFIG } from "../config/ui-config.js";

const newsUI = UI_CONFIG.NEWS_UI;

const getNewsConfig = (isFavorites) =>
  isFavorites
    ? {
        status: newsUI.STATUS_FAVORITES,
        loading: newsUI.LOADING_FAVORITES,
        fallback: newsUI.STATUS_FALLBACK_FAVORITES,
        error: ERRORS.NEWS.FAVORITES_ERROR,
      }
    : {
        status: newsUI.STATUS_GENERAL,
        loading: newsUI.LOADING_GENERAL,
        fallback: newsUI.STATUS_FALLBACK_GENERAL,
        error: ERRORS.NEWS.GENERAL_ERROR,
      };

const loadNews = async (mode = "general") => {
  const isFavorites = mode === "favorites";

  const config = getNewsConfig(isFavorites);

  UIManager.updateNewsStatus(config.status);
  UIManager.showNewsLoading(config.loading);
  UIManager.setNewsFilterMode(mode);

  const { ok, articles, usedFallback, code, errorMessage, status } = isFavorites
    ? await NewsService.getNewsForFavorites(AppState.getFavorites())
    : await NewsService.getGeneralNews();

  if (!ok) {
    BaseUI.showError("#newsList", code || "NEWS_ERROR", {
      defaultMessage: errorMessage || config.error || ERRORS.NEWS.GENERAL_ERROR,
      status,
    });
    return;
  }

  if (usedFallback) {
    UIManager.updateNewsStatus(config.fallback);
  }

  UIManager.showNews(articles);
};

export const showNewsPage = async () => {
  UIManager.renderNewsPage();
  await loadNews("general");
};

export const showFavoritesNewsPage = async () => {
  UIManager.renderNewsPage();
  await loadNews("favorites");
};
