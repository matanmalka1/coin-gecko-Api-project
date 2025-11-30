import { UIManager } from "../ui/ui-manager.js";
import { CoinsService } from "../services/coins-service.js";
import { ChartService } from "../services/chart-service.js";
import { AppState } from "../state/state.js";
import { CONFIG } from "../config/config.js";
import { ERRORS } from "../config/error.js";
import { ErrorResolver } from "../utils/error-resolver.js";

export const PagesController = (() => {
  const COINS_REFRESH_INTERVAL = CONFIG.CACHE.COINS_REFRESH_INTERVAL_MS;

  const shouldRefreshCoins = () => {
    const lastUpdated = AppState.getCoinsLastUpdated();
    if (!lastUpdated) return true;
    return Date.now() - lastUpdated >= COINS_REFRESH_INTERVAL;
  };

  const showCurrenciesPage = async ({ forceRefresh = false } = {}) => {
    ChartService.cleanup();
    AppState.setCurrentView("currencies");

    UIManager.displayCurrencyPage();
    UIManager.setCompareStatusVisibility(false);
    UIManager.updateCompareStatus(0, CONFIG.REPORTS.MAX_COMPARE);

    const cachedCoins = AppState.getAllCoins();
    if (cachedCoins.length) {
      UIManager.displayCoins(cachedCoins, AppState.getSelectedReports(), {
        favorites: AppState.getFavorites(),
      });
    } else {
      UIManager.showCoinsLoading();
    }

    if (AppState.isLoadingCoins()) return;
    if (cachedCoins.length && !forceRefresh && !shouldRefreshCoins()) return;

    AppState.setLoadingCoins(true);
    const result = await CoinsService.loadAllCoins();
    AppState.setLoadingCoins(false);

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
    UIManager.showChartSkeleton();

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
          historyPoints: CONFIG.CHART.HISTORY_POINTS,
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

  return {
    showCurrenciesPage,
    showReportsPage,
    showAboutPage,
  };
})();
