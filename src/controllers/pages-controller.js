import { CACHE_COINS_REFRESH_MS, COINS_TIMESTAMP_KEY, NEWS_CACHE_GEN, NEWS_QUERY, CHART_CONFIG } from "../config/app-config.js";
import { displayCoins,getCompareSelection } from "../ui/Components/coin-components.js";
import { NewsUI } from "../ui/Components/news-components.js";
import { ChartRenderer } from "../ui/chart-renderer.js";
import { currenciesPage, reportsPage, newsPage, aboutPage } from "../ui/Components/page-components.js";
import { getAllCoins, loadAllCoins, getGlobalStats} from "../services/coins-service.js";
import { cleanup,startLiveChart } from "../services/chart-service.js";
import { getNewsForFavorites ,fetchNews } from "../services/news-service.js";
import { getFavorites, getSelectedReports, readJSON } from "../services/storage-manager.js";
import { skeleton,renderStatsBar,spinner } from "../ui/Components/base-components.js";
import { ErrorUI } from "../ui/error-ui.js";
import { ERRORS } from "../config/error.js";

let isLoadingCoins = false;

// ===== HELPERS =====
export const renderCoins = (coins, extras = {}) => {
  displayCoins(coins, getSelectedReports(), {
    favorites: getFavorites(),
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

  const $content = $("#content");
  $content.html(currenciesPage());

  $("#compareStatus").addClass("d-none").empty();

  const coins = getAllCoins();
  const lastUpdated = readJSON(COINS_TIMESTAMP_KEY, 0);
  const isCacheExpired = !lastUpdated || Date.now() - lastUpdated >= CACHE_COINS_REFRESH_MS;

  const $coinsContainer = $("#coinsContainer");

  if (coins.length > 0 && !forceRefresh && !isCacheExpired) {
    renderCoins(coins);
    isLoadingCoins = false;
    return;
  }
  if (coins.length === 0) {$coinsContainer.html(skeleton("coins", 6));

  }

  try {
    const { ok, data, error } = await loadAllCoins();
    if (!ok) {ErrorUI.showError(error);
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
  const $content = $("#content");
  $content.html(reportsPage());
  const $chartsTrack = $content.find("#chartsTrack");
  $chartsTrack.html(spinner("Loading live charts..."));

  await startLiveChart({
    onChartReady: ({ symbols }) => {
      ChartRenderer.setupCharts(symbols, { historyPoints: CHART_CONFIG.points });
    },
    onData: ({ candlesBySymbol }) => {
      ChartRenderer.update(candlesBySymbol, {
        historyPoints: CHART_CONFIG.points,
      });
    },
  onError: ({error = ERRORS.LIVE_CHART_ERROR}) => {
    ErrorUI.showError(error);
    $("#chartsTrack").html(`<div class="embla__slide"><p class="text-center text-muted py-5 mb-0">${error}</p></div>`);
  },
  });
};

// ===== NEWS PAGE =====
const loadNews = async (mode = "general") => {
  const isFavorites = mode === "favorites";

  const $newsList = $("#newsList");
  $newsList.html(skeleton("news", 3))
  NewsUI.setNewsFilterMode(mode);

  const {ok,data,error} = isFavorites
    ? await getNewsForFavorites(getFavorites())
    : await fetchNews(NEWS_CACHE_GEN, { q: NEWS_QUERY });

  if (!ok) {
    ErrorUI.showError(error);
    $newsList.html(`<p class="text-center text-muted py-5">${error || ERRORS.NEWS_ERROR}</p>`);
    return;
  }
  NewsUI.showNews(data);
};

export const showNewsPage = async (mode = "general") => {
  cleanup();
  $("#content").html(newsPage());
  await loadNews(mode);
};

// ===== ABOUT PAGE =====
export const showAboutPage = () => {
 cleanup();

  $("#content").html(aboutPage({
        name: "Matan Yehuda Malka",
        image: "images/2.jpeg",
        linkedin: "https://www.linkedin.com/in/matanyehudamalka",
      })
    );
};
