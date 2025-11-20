import { UIManager } from "../ui/ui-manager.js";
import { CoinsService } from "../services/coins-service.js";
import { ChartService } from "../services/chart-service.js";
import { AppState } from "../state/state.js";
import { CONFIG } from "../config/config.js";
import { ERRORS } from "../config/error.js";
import { ErrorResolver } from "../utils/error-resolver.js";

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
        UIManager.showError("#chartContainer", message);
      },
    });

    if (!result?.ok) {
      const message = ErrorResolver.resolve(result.code, {
        defaultMessage: ERRORS.API.DEFAULT,
      });
      UIManager.showError("#chartContainer", message);
    }
  };

  const showAboutPage = () => {
    ChartService.cleanup();
    AppState.setCurrentView("about");

    const userData = {
      name: "Matan Yehuda Malka",
      image: "images/2.jpeg",
      linkedin: "https://www.linkedin.com/in/matanyehudamalka",
    };

    UIManager.renderAboutPage(userData);
  };

  return {
    showCurrenciesPage,
    showReportsPage,
    showAboutPage,
  };
})();
