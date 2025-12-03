import { UIManager } from "../ui/ui-manager.js";
import { CoinsService } from "../services/coins-service.js";
import { ChartService } from "../services/chart-service.js";
import { AppState } from "../state/state.js";
import { ERRORS } from "../config/error.js";
import { CACHE_CONFIG } from "../config/api-cache-config.js";
import { UI_CONFIG } from "../config/ui-config.js";
import { BaseUI } from "../ui/base-ui.js";

const { REPORTS, CHART, ABOUT } = UI_CONFIG;
const COINS_REFRESH_INTERVAL = CACHE_CONFIG.CACHE.COINS_REFRESH_INTERVAL_MS;

const renderCoins = (coins, extras = {}) => {
  UIManager.displayCoins(coins, AppState.getSelectedReports(), {
    favorites: AppState.getFavorites(),
    compareSelection: AppState.getCompareSelection(),
    ...extras,
  });
};

const showChartError = (code, error, status) => {
  BaseUI.showError("#chartsGrid", code, {
    defaultMessage: error,
    status,
  });
};

export const showCurrenciesPage = async ({ forceRefresh = false } = {}) => {
  ChartService.cleanup();

  UIManager.renderCurrenciesPage();
  UIManager.setCompareStatusVisibility(false);
  UIManager.updateCompareStatus(0, REPORTS.MAX_COMPARE);
  UIManager.clearCompareHighlights();

  const cachedCoins = AppState.getAllCoins();
  const lastUpdated = AppState.getCoinsLastUpdated();

  if (cachedCoins.length) {
    renderCoins(cachedCoins);
  } else {
    UIManager.showLoading();
  }

  if (AppState.isLoadingCoins()) return;

  const needsInitialLoad = !cachedCoins.length;
  const isCacheExpired =
    !lastUpdated || Date.now() - lastUpdated >= COINS_REFRESH_INTERVAL;

  if (!needsInitialLoad && !forceRefresh && !isCacheExpired) {
    return; 
  }

  AppState.setLoadingCoins(true);
  const result = await CoinsService.loadAllCoins();
  AppState.setLoadingCoins(false);

  if (!result?.ok) {
    BaseUI.showError("#coinsContainer", result.code, {
      defaultMessage: result?.error,
      status: result?.status,
    });
    return;
  }
  renderCoins(result.data);
};

export const showReportsPage = () => {
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
        historyPoints: CHART.HISTORY_POINTS,
      });
    },
    onError: ({ code, error, status }) => showChartError(code, error, status),
  });

  if (!result?.ok) {
    showChartError(result.code, ERRORS.API.DEFAULT, result.status);
  }
};

export const showAboutPage = () => {
  ChartService.cleanup();

  UIManager.renderAboutPage({
    name: ABOUT.NAME,
    image: ABOUT.IMAGE,
    linkedin: ABOUT.LINKEDIN,
  });
};
