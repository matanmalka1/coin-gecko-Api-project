import {CACHE_COINS_REFRESH_MS,COINS_TIMESTAMP_KEY,NEWS_CACHE_GEN,NEWS_QUERY,CHART_CONFIG,} from "../config/app-config.js";
import { ERRORS, showError } from "../config/error.js";
import {displayCoins,getCompareSelection,currenciesPage,} from "../ui/pages/currenciesPage.js";
import { reportsPage } from "../ui/pages/reportsPage.js";
import { aboutPage } from "../ui/pages/aboutPage.js";
import { showNews, setNewsFilterMode, newsPage } from "../ui/pages/newsPage.js";
import { update, setupCharts } from "../ui/liveCharts/chart-renderer.js";
import {getAllCoins,loadAllCoins,getGlobalStats,} from "../services/coins-service.js";
import { cleanup, startLiveChart } from "../services/chart-service.js";
import { getNewsForFavorites, fetchNews } from "../services/news-service.js";
import {getFavorites,getSelectedReports,readJSON,} from "../services/storage-manager.js";
import { skeleton, renderStatsBar, spinner } from "../ui/base-components.js";

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

export const showCurrenciesPage = async ({ forceRefresh = false } = {}) => {
  cleanup();
  if (isLoadingCoins) return;
  isLoadingCoins = true;

  const $content = $("#content");
  $content.html(currenciesPage());

  $("#compareStatus").addClass("d-none").empty();

  const coins = getAllCoins();
  const lastUpdated = readJSON(COINS_TIMESTAMP_KEY, 0);
  const isCacheExpired =
    !lastUpdated || Date.now() - lastUpdated >= CACHE_COINS_REFRESH_MS;

  const $coinsContainer = $("#coinsContainer");

  if (coins.length > 0 && !forceRefresh && !isCacheExpired) {
    renderCoins(coins);
    isLoadingCoins = false;
    return;
  }
  if (coins.length === 0) {
    $coinsContainer.html(skeleton("coins", 6));
  }

  try {
    const { ok, data, error } = await loadAllCoins();
    if (!ok) {
      isLoadingCoins = false;
      showError(error);
      return;
    }

    renderCoins(data);
  } finally {
    isLoadingCoins = false;
  }
};

const showReportsPage = async () => {
  cleanup();
  const $content = $("#content");
  $content.html(reportsPage());
  const $chartsTrack = $content.find("#chartsTrack");
  $chartsTrack.html(spinner("Loading live charts..."));

  await startLiveChart({
    onChartReady: ({ symbols }) => {
      setupCharts(symbols, {
        historyPoints: CHART_CONFIG.points,
      });
    },
    onData: ({ candlesBySymbol }) => {
      update(candlesBySymbol, {
        historyPoints: CHART_CONFIG.points,
      });
    },
    onError: ({ error = ERRORS.LIVE_CHART_ERROR }) => {
      showError(error);
      $("#chartsTrack").html(
        `<div class="embla__slide"><p class="text-center text-muted py-5 mb-0">${error}</p></div>`
      );
    },
  });
};

export const showNewsPage = async (mode = "general") => {
  const isFavorites = mode === "favorites";

  cleanup();
  $("#content").html(newsPage());

  const $newsList = $("#newsList");
  $newsList.html(skeleton("news", 3));

  setNewsFilterMode(mode);

  const result = isFavorites
    ? await getNewsForFavorites(getFavorites())
    : await fetchNews(NEWS_CACHE_GEN, { q: NEWS_QUERY });

  const { ok, data, error } = result || {};

  if (!ok) {
    showError(error);
    $newsList.html(
      `<p class="text-center text-muted py-5">${error || ERRORS.NEWS_ERROR}</p>`
    );
    return;
  }

  showNews(data);
};

const showAboutPage = () => {
  cleanup();

  $("#content").html(
    aboutPage({
      name: "Matan Yehuda Malka",
      image: "images/2.jpeg",
      linkedin: "https://www.linkedin.com/in/matanyehudamalka",
    })
  );
};

export const setupPagesEvents = () => {
  $("#currenciesBtn, #brandHome").on("click", () => showCurrenciesPage());
  $("#reportsBtn").on("click", () => showReportsPage());
  $("#newsBtn").on("click", () => showNewsPage());
  $("#aboutBtn").on("click", () => showAboutPage());

  $(document)
    .on("click", "#newsGeneralBtn", () => {
      showNewsPage("general");
    })
    .on("click", "#newsFavoritesBtn", () => {
      showNewsPage("favorites");
    });
};
