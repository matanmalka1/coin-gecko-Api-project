import { UIManager } from "../ui/ui-manager.js";
import { CoinsService } from "../services/coins-service.js";
import { ChartService } from "../services/chart-service.js";
import { AppState } from "../state/state.js";
import { CONFIG } from "../config/config.js";
import { ERRORS } from "../config/error.js";
import { ErrorResolver } from "../utils/error-resolver.js";

export const PagesController = (() => {
  const COINS_REFRESH_INTERVAL = CONFIG.CACHE.COINS_REFRESH_INTERVAL_MS;

  // Checks whether cached coins should be refreshed based on timestamp.
  const shouldRefreshCoins = () => {
    const lastUpdated = AppState.getCoinsLastUpdated();
    if (!lastUpdated) return true;
    return Date.now() - lastUpdated >= COINS_REFRESH_INTERVAL;
  };

  // Entry point for rendering the currencies page and refreshing coins if needed.
  const showCurrenciesPage = async ({ forceRefresh = false } = {}) => {
    ChartService.cleanup();

    UIManager.displayCurrencyPage();
    UIManager.setCompareStatusVisibility(false);
    UIManager.updateCompareStatus(0, CONFIG.REPORTS.MAX_COMPARE);
    UIManager.clearCompareHighlights();

    const cachedCoins = AppState.getAllCoins();
    if (cachedCoins.length) {
      UIManager.displayCoins(cachedCoins, AppState.getSelectedReports(), {
        favorites: AppState.getFavorites(),
        compareSelection: AppState.getCompareSelection(),
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
        ErrorResolver.resolve(result.code, {
          defaultMessage: result?.error,
          status: result?.status,
        })
      );
      return;
    }

    UIManager.displayCoins(result.data, AppState.getSelectedReports(), {
      favorites: AppState.getFavorites(),
      compareSelection: AppState.getCompareSelection(),
    });
  };

  // Shows the live reports page (charts) and starts the live polling.
  const showReportsPage = () => {
    ChartService.cleanup();

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
      onError: ({ code, error, status }) => {
        const message = ErrorResolver.resolve(code, {
          defaultMessage: error,
          status,
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

  // Static "about" page renderer.
  const showAboutPage = () => {
    ChartService.cleanup();

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
