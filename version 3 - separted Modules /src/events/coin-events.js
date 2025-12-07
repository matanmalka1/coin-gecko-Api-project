import { CoinsService } from "../services/coins-service.js";
import { CoinUI } from "../ui/coin-ui.js";
import { BaseUI } from "../ui/base-ui.js";
import { ChartRenderer } from "../ui/chart-renderer.js";
import { AppState } from "../state/state.js";
import { ERRORS } from "../config/error.js";
import { UI_CONFIG } from "../config/ui-config.js";
import { showCurrenciesPage, renderCoins } from "../controllers/pages-controller.js";

const { CURRENCIES } = UI_CONFIG;
const { FAVORITES_EMPTY } = UI_CONFIG.UI;
const { API: API_ERRORS, SEARCH: SEARCH_ERRORS } = ERRORS;

let isRegistered = false;

// ===== EVENT HANDLERS =====
const handleSearch = () => {
  const searchTerm = $("#searchInput").val();
  const { ok, code, term, data, favorites } = CoinsService.searchCoin(searchTerm);
  
  $("#clearSearchBtn").removeClass("d-none");

  if (!ok) {
    BaseUI.showError("#coinsContainer", code, {
      term,
      defaultMessage: SEARCH_ERRORS.NO_MATCH(term || ""),
    });
    return;
  }

  renderCoins(data, { favorites });
};

const handleClearSearch = () => {
  $("#searchInput").val("");
  renderCoins(AppState.getAllCoins(), {
    favorites: AppState.getFavorites(),
  });
};

const handleFavoriteToggle = (e) => {
  const coinSymbol = $(e.currentTarget).data("symbol");
  const alreadyFavorite = AppState.isFavorite(coinSymbol);

  AppState[alreadyFavorite ? "removeFavorite" : "addFavorite"](coinSymbol);
  CoinUI.updateFavoriteIcon(coinSymbol, !alreadyFavorite);

  if (AppState.isShowingFavoritesOnly()) {
    renderFavoritesList();
  }
};

const renderFavoritesList = () => {
  const favoriteSymbols = AppState.getFavorites();
  const filtered = AppState.getAllCoins().filter((coin) =>
    favoriteSymbols.includes(coin.symbol)
  );

  renderCoins(filtered, {
    favorites: favoriteSymbols,
    emptyMessage: FAVORITES_EMPTY,
  });
};

const handleMoreInfo = async (e) => {
  const coinId = $(e.currentTarget).data("id");
  const collapseId = `collapse-${coinId}`;
  const $collapse = $(`#${collapseId}`);

  if ($collapse.hasClass("show")) {
    BaseUI.toggleCollapse(collapseId, false);
    return;
  }

  BaseUI.showSpinner(`#${collapseId}`, "Loading details…");
  BaseUI.toggleCollapse(collapseId, true);

  try {
    const { ok, data, status, error } = await CoinsService.getCoinDetails(coinId);

    if (!ok || !data) {
      BaseUI.showError(`#${collapseId}`, "COIN_DETAILS_ERROR", {
        status,
        defaultMessage: typeof error === "string" ? error : API_ERRORS.COIN_DETAILS_ERROR,
      });
      return;
    }

    CoinUI.showCoinDetails(collapseId, data, { currencies: CURRENCIES });
    ChartRenderer.drawMiniChart(coinId);
  } catch (error) {
    BaseUI.showError(`#${collapseId}`, "COIN_DETAILS_ERROR", {
      defaultMessage: API_ERRORS.COIN_DETAILS_ERROR,
    });
  }
};

const handleShowFavorites = () => {
  const isShowing = AppState.isShowingFavoritesOnly();

  if (isShowing) {
    renderCoins(AppState.getAllCoins());
    BaseUI.setFavoritesButtonLabel(false);
    AppState.setShowFavoritesOnly(false);
  } else {
    renderFavoritesList();
    BaseUI.setFavoritesButtonLabel(true);
    AppState.setShowFavoritesOnly(true);
  }
};

const handleSortChange = () => {
  const { data, favorites } = CoinsService.sortCoins($("#sortSelect").val());
  renderCoins(data, { favorites });
};

const handleRefreshCoins = (e) => {
  e.preventDefault();
  if (!AppState.isLoadingCoins()) {
    showCurrenciesPage({ forceRefresh: true });
  }
};

// ===== REGISTRATION =====
const setupEventListeners = () => {
  if (isRegistered) return;

  $(document)
    .on("keypress", "#searchInput", (e) => {
      if (e.key === "Enter") handleSearch();
    })
    .on("click", "#clearSearchBtn", handleClearSearch)
    .on("click", "#showFavoritesBtn", handleShowFavorites)
    .on("click", "#refreshCoinsBtn", handleRefreshCoins)
    .on("click", ".favorite-btn", handleFavoriteToggle)
    .on("click", ".more-info", handleMoreInfo)
    .on("change", "#sortSelect", handleSortChange);

  isRegistered = true;
};

export const CoinEvents = { register: setupEventListeners };