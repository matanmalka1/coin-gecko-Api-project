import { CACHE_CONFIG } from "../config/api-cache-config.js";
import { UI_CONFIG } from "../config/ui-config.js";
import { ERRORS } from "../config/error.js";
import { CoinUI } from "../ui/coin-ui.js";
import { NewsUI } from "../ui/news-ui.js";
import { ChartRenderer } from "../ui/chart-renderer.js";
import { PageComponents } from "../ui/Components/page-components.js";
import { BaseComponents } from "../ui/Components/base-components.js";
import { CoinsService } from "../services/coins-service.js";
import { ChartService } from "../services/chart-service.js";
import { NewsService } from "../services/news-service.js";
import { AppState } from "../state/state.js";
import { BaseUI } from "../ui/base-ui.js";

const { REPORTS, CHART, ABOUT } = UI_CONFIG;
const COINS_REFRESH_INTERVAL = CACHE_CONFIG.CACHE.COINS_REFRESH_INTERVAL_MS;

// ===== HELPERS =====
export const renderCoins = (coins, extras = {}) => {
  CoinUI.displayCoins(coins, AppState.getSelectedReports(), {
    favorites: AppState.getFavorites(),
    compareSelection: AppState.getCompareSelection(),
    ...extras,
  });
};

const getNewsConfig = (isFavorites) => {
  const newsUI = UI_CONFIG.NEWS_UI;
  return isFavorites
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
};

// ===== STATS BAR (גלובלי) =====
export const initStatsBar = async () => {
  const { ok, data } = await CoinsService.getGlobalStats();
  const stats = data?.data || data;
  if (!ok || !stats) return;

  BaseUI.renderStatsBar("#statsBar", {
    totalMarketCap: stats.total_market_cap?.usd,
    totalVolume: stats.total_volume?.usd,
    btcDominance: stats.market_cap_percentage?.btc,
    marketChange: stats.market_cap_change_percentage_24h_usd,
  });
};

// ===== CURRENCIES PAGE =====
export const showCurrenciesPage = async ({ forceRefresh = false } = {}) => {
  ChartService.cleanup();

  BaseUI.showPage(PageComponents.currenciesPage());

  const $compareStatus = $("#compareStatus");
  $compareStatus.addClass("d-none");
  $compareStatus.text(`0 / ${REPORTS.MAX_COMPARE} coins selected`);
  CoinUI.clearCompareHighlights();

  const cachedCoins = AppState.getAllCoins();
  const lastUpdated = AppState.getCoinsLastUpdated();

  if (cachedCoins.length) {
    renderCoins(cachedCoins);
  } else {
    CoinUI.showLoading();
  }

  if (AppState.isLoadingCoins()) return;

  const needsInitialLoad = !cachedCoins.length;
  const isCacheExpired =
    !lastUpdated || Date.now() - lastUpdated >= COINS_REFRESH_INTERVAL;

  if (!needsInitialLoad && !forceRefresh && !isCacheExpired) {
    return;
  }

  AppState.setLoadingCoins(true);
  const { ok, data, error, status } = await CoinsService.loadAllCoins();
  AppState.setLoadingCoins(false);

  if (!ok) {
    BaseUI.showError("#coinsContainer", "COIN_LIST_ERROR", {
      defaultMessage: error || ERRORS.API.COIN_LIST_ERROR,
      status,
    });
    return;
  }
  renderCoins(data);
};

// ===== REPORTS PAGE =====
export const showReportsPage = async () => {
  ChartService.cleanup();

  BaseUI.showPage(PageComponents.reportsPage());
  $("#chartsGrid").html(BaseComponents.skeleton());

  const result = await ChartService.startLiveChart({
    onChartReady: ({ symbols, historyPoints }) => {
      ChartRenderer.clear();
      ChartRenderer.setupCharts(symbols, { historyPoints });
    },
    onData: ({ candlesBySymbol }) => {
      ChartRenderer.update(candlesBySymbol, {
        historyPoints: CHART.HISTORY_POINTS,
      });
    },
    onError: ({ code, error, status }) => {
      BaseUI.showError("#chartsGrid", code || "LIVE_CHART_ERROR", {
        defaultMessage: error || ERRORS.API.LIVE_CHART_ERROR,
        status,
      });
    },
  });

  if (!result?.ok) {
    BaseUI.showError("#chartsGrid", "LIVE_CHART_ERROR", {
      defaultMessage: ERRORS.API.LIVE_CHART_ERROR,
      status: result?.status,
    });
  }
};

// ===== NEWS PAGE =====
const loadNews = async (mode = "general") => {
  const isFavorites = mode === "favorites";
  const config = getNewsConfig(isFavorites);

  NewsUI.updateNewsStatus(config.status);
  NewsUI.showNewsLoading(config.loading);
  NewsUI.setNewsFilterMode(mode);

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
    NewsUI.updateNewsStatus(config.fallback);
  }

  NewsUI.showNews(articles);
};

export const showNewsPage = async () => {
  BaseUI.showPage(PageComponents.newsPage());
  await loadNews("general");
};

export const showFavoritesNewsPage = async () => {
  BaseUI.showPage(PageComponents.newsPage());
  await loadNews("favorites");
};

// ===== ABOUT PAGE =====
export const showAboutPage = () => {
  ChartService.cleanup();

  BaseUI.showPage(
    PageComponents.aboutPage({
      name: ABOUT.NAME,
      image: ABOUT.IMAGE,
      linkedin: ABOUT.LINKEDIN,
    })
  );
};
