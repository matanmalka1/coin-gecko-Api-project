import { UIManager } from "../ui/ui-manager.js";
import { CoinsService } from "../services/coins-service.js";
import { ChartService } from "../services/chart-service.js";
import { AppState } from "../state/state.js";
import { CONFIG } from "../config/config.js";
import { ERRORS } from "../config/error.js";
import { ErrorResolver } from "../utils/error-resolver.js";
// [NEWS]
import { UIComponents } from "../ui/ui-components.js";
// [NEWS]
import { NewsService } from "../services/news-service.js";

export const PagesController = (() => {
  let isLoadingCoins = false;

  const showCurrenciesPage = async () => {
    ChartService.cleanup();
    AppState.setCurrentView("currencies");

    UIManager.renderCurrenciesPage();

    if (isLoadingCoins) return;

    if (AppState.getAllCoins().length === 0) {
      UIManager.showSpinner("#coinsContainer", CONFIG.UI.LOADING_COINS);
    }

    isLoadingCoins = true;
    const result = await CoinsService.loadAllCoins();
    isLoadingCoins = false;

    if (!result?.ok) {
      UIManager.showError(
        "#coinsContainer",
        ErrorResolver.resolve(result.code, { defaultMessage: result?.error })
      );
      return;
    }

    UIManager.displayCoins(result.data, AppState.getSelectedReports(), {
      favorites: AppState.getFavorites(),
    });
  };

  const showReportsPage = () => {
    ChartService.cleanup();
    AppState.setCurrentView("reports");

    UIManager.renderReportsPage();

    const result = ChartService.startLiveChart({
      onChartReady: ({ symbols, updateIntervalMs, historyPoints }) => {
        UIManager.clearLiveChart();
        UIManager.initLiveChart(symbols, {
          updateIntervalMs,
          historyPoints,
        });
      },
      onData: ({ prices, time }) => {
        UIManager.updateLiveChart(prices, time, {
          historyPoints: 30,
        });
      },
      onError: ({ code, error }) => {
        const message = ErrorResolver.resolve(code, {
          defaultMessage: error,
        });
        UIManager.showError("#chartsGrid", message);
      },
    });

    if (!result?.ok) {
      const message = ErrorResolver.resolve(result.code, {
        defaultMessage: ERRORS.API.DEFAULT,
      });
      UIManager.showError("#chartsGrid", message);
    }
  };

  const showAboutPage = () => {
    ChartService.cleanup();
    AppState.setCurrentView("about");

    UIManager.renderAboutPage({
      name: CONFIG.ABOUT.NAME,
      image: CONFIG.ABOUT.IMAGE,
      linkedin: CONFIG.ABOUT.LINKEDIN,
    });
  };

  // [NEWS] Render news page and load general feed
  const showNewsPage = async () => {
    ChartService.cleanup();
    AppState.setCurrentView("news");

    UIManager.showPage(UIComponents.newsPage());
    UIManager.updateNewsStatus(CONFIG.NEWS_UI.STATUS_GENERAL);
    UIManager.showNewsLoading(CONFIG.NEWS_UI.LOADING_GENERAL);

    try {
      const { articles, usedFallback } = await NewsService.getGeneralNews();
      if (usedFallback) {
        UIManager.updateNewsStatus(CONFIG.NEWS_UI.STATUS_FALLBACK_GENERAL);
      }
      UIManager.showNews(articles);
    } catch (err) {
      UIManager.showNewsError(CONFIG.NEWS_UI.ERROR_GENERAL);
    }
  };

  return {
    showCurrenciesPage,
    showReportsPage,
    showAboutPage,
    // [NEWS]
    showNewsPage,
  };
})();
