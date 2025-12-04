import { CACHE_CONFIG } from "../config/api-cache-config.js";
import { UI_CONFIG } from "../config/ui-config.js";
import { UIManager } from "../ui/ui-manager.js";
import { CoinsService } from "../services/coins-service.js";
import { ChartService } from "../services/chart-service.js";
import { AppState } from "../state/state.js";
import { ERRORS } from "../config/error.js";
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

export const initStatsBar = async () => {
  const result = await CoinsService.getGlobalStats();
  const stats = result?.data?.data || result?.data;

  if (!result?.ok || !stats) return;

  BaseUI.renderStatsBar("#statsBar", {
    totalMarketCap: stats.total_market_cap?.usd,
    totalVolume: stats.total_volume?.usd,
    btcDominance: stats.market_cap_percentage?.btc,
    marketChange: stats.market_cap_change_percentage_24h_usd,
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
    BaseUI.showError("#coinsContainer", "COIN_LIST_ERROR", {
      defaultMessage: result?.error || ERRORS.API.COIN_LIST_ERROR,
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
    onError: ({ code, error, status }) => {
      BaseUI.showError("#chartsGrid", code || "LIVE_CHART_ERROR", {
        defaultMessage: error || ERRORS.API.LIVE_CHART_ERROR,
      });
    },
  });

  if (!result?.ok) {
    BaseUI.showError("#chartsGrid", "LIVE_CHART_ERROR", {
      defaultMessage: ERRORS.API.LIVE_CHART_ERROR,
      status: result.status,
    });
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
