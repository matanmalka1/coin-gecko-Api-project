import { UIManager } from "../ui/ui-manager.js";
import { AppState } from "../state/state.js";
import { NewsService } from "../services/news-service.js";
import { UI_CONFIG } from "../config/ui-config.js";
import { ERRORS } from "../config/error.js";
import { BaseUI } from "../ui/base-ui.js";

const loadNews = async (mode = "general") => {
  const isFavorites = mode === "favorites";

  const config = isFavorites
    ? UI_CONFIG.NEWS.FAVORITES
    : UI_CONFIG.NEWS.GENERAL;

  UIManager.updateNewsStatus(config.status);
  UIManager.showNewsLoading(config.loading);

  const result = isFavorites
    ? await NewsService.getNewsForFavorites(AppState.getFavorites())
    : await NewsService.getGeneralNews();

  if (!result?.ok) {
    BaseUI.showError("#newsList", result.code || "NEWS_ERROR", {
      defaultMessage: config.error,
      status: result.status,
    });
    return;
  }

  if (result.usedFallback) {
    UIManager.updateNewsStatus(config.fallback);
  }

  UIManager.showNews(result.articles);
};

export const showNewsPage = async () => {
  UIManager.renderNewsPage();
  await loadNews("general");
};

export const showFavoritesNewsPage = async () => {
  UIManager.renderNewsPage();
  await loadNews("favorites");
};
