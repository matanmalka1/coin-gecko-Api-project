import { CACHE_CONFIG } from "../config/api-cache-config.js";
import { UI_CONFIG } from "../config/ui-config.js";
import { ERRORS } from "../config/error.js";
import { CoinUI } from "../ui/coin-ui.js";
import { NewsUI } from "../ui/news-ui.js";
import { ChartRenderer } from "../ui/chart-renderer.js";
import { PageComponents } from "../ui/Components/page-components.js";
import { CoinsService } from "../services/coins-service.js";
import { ChartService } from "../services/chart-service.js";
import { NewsService } from "../services/news-service.js";
import { StorageHelper } from "../services/storage-manager.js";
import { BaseUI } from "../ui/base-ui.js";
import { BaseComponents } from "../ui/Components/base-components.js";
import { ErrorUI } from "../ui/error-ui.js";

const { COINS_REFRESH_INTERVAL_MS } = CACHE_CONFIG.CACHE;
const { REPORTS, CHART, ABOUT } = UI_CONFIG;

// ===== LOADING STATE =====
let isLoadingCoins = false;

export const setLoadingCoins = (value) => {
  isLoadingCoins = !!value;
};

export const getLoadingCoins = () => isLoadingCoins;

// ===== HELPERS =====
export const renderCoins = (coins, extras = {}) => {
  CoinUI.displayCoins(coins, StorageHelper.getSelectedReports(), {
    favorites: StorageHelper.getFavorites(),
    compareSelection: CoinUI.getCompareSelection(),
    ...extras,
  });
};

const getNewsConfig = (isFavorites) => {
  const { NEWS_UI } = UI_CONFIG;

  return isFavorites
    ? {
        status: NEWS_UI.STATUS_FAVORITES,
        loading: NEWS_UI.LOADING_FAVORITES,
        fallback: NEWS_UI.STATUS_FALLBACK_FAVORITES,
        error: ERRORS.FAVORITES_ERROR,
      }
    : {
        status: NEWS_UI.STATUS_GENERAL,
        loading: NEWS_UI.LOADING_GENERAL,
        fallback: NEWS_UI.STATUS_FALLBACK_GENERAL,
        error: ERRORS.GENERAL_ERROR,
      };
};

// ===== STATS BAR =====
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
  setLoadingCoins(false);

  BaseUI.showPage(PageComponents.currenciesPage());

  const $compareStatus = $("#compareStatus");
  $compareStatus.addClass("d-none").empty();
  CoinUI.clearCompareHighlights();

  const cachedCoins = CoinsService.getAllCoins();
  const lastUpdated = CoinsService.getCoinsLastUpdated();

  cachedCoins.length ? renderCoins(cachedCoins) : CoinUI.showLoading();

  if (getLoadingCoins()) return;

  const isCacheExpired =
    !lastUpdated || Date.now() - lastUpdated >= COINS_REFRESH_INTERVAL_MS;

  if (cachedCoins.length && !forceRefresh && !isCacheExpired) {
    return;
  }

  setLoadingCoins(true);
  const { ok, data, code, error, status } = await CoinsService.loadAllCoins();
  setLoadingCoins(false);

  if (!ok) {
    ErrorUI.showError("#coinsContainer", code || "COIN_LIST_ERROR", {
      status,
      defaultMessage: error,
    });
    return;
  }

  renderCoins(data);
};

// ===== REPORTS PAGE =====
export const showReportsPage = async () => {
  ChartService.cleanup();

  BaseUI.showPage(PageComponents.reportsPage());
  $("#chartsGrid").html(BaseComponents.skeleton("charts", 6));

  await ChartService.startLiveChart({
    onChartReady: ({ symbols, historyPoints }) => {
      ChartRenderer.clear();
      ChartRenderer.setupCharts(symbols, { historyPoints });
    },
    onData: ({ candlesBySymbol }) => {
      ChartRenderer.update(candlesBySymbol, {
        historyPoints: CHART.HISTORY_POINTS,
      });
    },
    onError: ({ symbol, code, error, status }) => {
      const context = { defaultMessage: error, status };

      if (symbol) {
        const $cardBody = $(`#chart-${symbol}`)
          .closest(".card")
          .find(".card-body");

        ErrorUI.showError($cardBody, code || "LIVE_CHART_ERROR", context);
      } else {
        ErrorUI.showError("#chartsGrid", code || "LIVE_CHART_ERROR", context);
      }
    },
  });
};

// ===== NEWS PAGE =====
const loadNews = async (mode = "general") => {
  const isFavorites = mode === "favorites";
  const { status, loading, fallback, error } = getNewsConfig(isFavorites);

  NewsUI.updateNewsStatus(status);
  NewsUI.showNewsLoading(loading);
  NewsUI.setNewsFilterMode(mode);

  const {
    ok,
    articles,
    usedFallback,
    code,
    errorMessage,
    status: httpStatus,
  } = isFavorites
    ? await NewsService.getNewsForFavorites(StorageHelper.getFavorites())
    : await NewsService.getGeneralNews();

  if (!ok) {
    ErrorUI.showError("#newsList", code || "NEWS_ERROR", {
      defaultMessage: errorMessage || error || ERRORS.GENERAL_ERROR,
      status: httpStatus,
    });
    return;
  }

  if (usedFallback) {
    NewsUI.updateNewsStatus(fallback);
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

  const { NAME: name, IMAGE: image, LINKEDIN: linkedin } = ABOUT;

  BaseUI.showPage(
    PageComponents.aboutPage({
      name,
      image,
      linkedin,
    })
  );
};
