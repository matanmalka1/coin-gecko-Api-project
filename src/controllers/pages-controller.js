import { APP_CONFIG, CONFIG_CHART } from "../config/app-config.js";
import { displayCoins,getCompareSelection } from "../ui/Components/coin-components.js";
import { NewsUI } from "../ui/Components/news-components.js";
import { ChartRenderer } from "../ui/chart-renderer.js";
import { PageComponents } from "../ui/Components/page-components.js";
import { getAllCoins, loadAllCoins, getGlobalStats} from "../services/coins-service.js";
import { cleanup,startLiveChart } from "../services/chart-service.js";
import { getNewsForFavorites ,fetchNews } from "../services/news-service.js";
import { StorageHelper } from "../services/storage-manager.js";
import { skeleton,renderStatsBar } from "../ui/Components/base-components.js";
import { ErrorUI } from "../ui/error-ui.js";

const {CACHE_COINS_REFRESH_MS,COINS_TIMESTAMP_KEY,ABOUT_NAME,ABOUT_IMAGE,ABOUT_LINKEDIN,NEWS_CACHE_GEN,NEWS_QUERY,} = APP_CONFIG;

const { CHART_POINTS } = CONFIG_CHART;

let isLoadingCoins = false;

// ===== HELPERS =====
export const renderCoins = (coins, extras = {}) => {
  displayCoins(coins, StorageHelper.getSelectedReports(), {
    favorites: StorageHelper.getFavorites(),
    compareSelection: getCompareSelection(),
    ...extras,
  });
};

// ===== STATS BAR =====
export const initStatsBar = async () => {
  const { ok, data } = await getGlobalStats();
  if (!ok || !data) return;

  const stats = data?.data || data;
  renderStatsBar("#statsBar", stats);
};

// ===== CURRENCIES PAGE =====
export const showCurrenciesPage = async ({ forceRefresh = false } = {}) => {
  cleanup();
  if (isLoadingCoins) return;
  isLoadingCoins = true;

  $("#content").html(PageComponents.currenciesPage());

  const $compareStatus = $("#compareStatus");
  $compareStatus.addClass("d-none").empty();

  const coins = getAllCoins();
  const lastUpdated = StorageHelper.readJSON(COINS_TIMESTAMP_KEY, 0);
  const isCacheExpired = !lastUpdated || Date.now() - lastUpdated >= CACHE_COINS_REFRESH_MS;

  if (coins.length > 0 && !forceRefresh && !isCacheExpired) {
    renderCoins(coins);
    isLoadingCoins = false;
    return;
  }
   if (coins.length === 0) {
    $("#coinsContainer").html(skeleton("coins", 6));
  }

  try {
    const { ok, data, code, error, status } = await loadAllCoins();

    if (!ok) {
      ErrorUI.showError("#coinsContainer", code || "COIN_LIST_ERROR", {status, defaultMessage: error,});
      return;
    }

    renderCoins(data);
  } finally {
    isLoadingCoins = false;
  }
};

// ===== REPORTS PAGE =====
export const showReportsPage = async () => {
  cleanup();
  $("#content").html(PageComponents.reportsPage());
  $("#chartsGrid").html(skeleton("charts", 6));

  await startLiveChart({
    onChartReady: ({ symbols, historyPoints }) => {
      ChartRenderer.clear();
      ChartRenderer.setupCharts(symbols, { historyPoints });
    },
    onData: ({ candlesBySymbol }) => {
      ChartRenderer.update(candlesBySymbol, {
        historyPoints: CHART_POINTS,
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

  $("#newsList").html(skeleton("news", 3))
  NewsUI.setNewsFilterMode(mode);

  const {ok,data,code,error,status,} = isFavorites
    ? await getNewsForFavorites(StorageHelper.getFavorites())
    : await fetchNews(NEWS_CACHE_GEN, { q: NEWS_QUERY });

  if (!ok) {
    ErrorUI.showError("#newsList", code || "NEWS_ERROR", {defaultMessage: error, status});
    return;
  }
  NewsUI.showNews(data);
};

export const showNewsPage = async (mode = "general") => {
  cleanup();
  $("#content").html(PageComponents.newsPage());
  await loadNews(mode);
};

// ===== ABOUT PAGE =====
export const showAboutPage = () => {
 cleanup();

  $("#content").html(PageComponents.aboutPage({
        name: ABOUT_NAME,
        image: ABOUT_IMAGE,
        linkedin: ABOUT_LINKEDIN,
      })
    );
};
