import { CoinsService } from "../services/coins-service.js";
import { CoinUI } from "../ui/coin-ui.js";
import { BaseUI } from "../ui/base-ui.js";
import { ChartRenderer } from "../ui/chart-renderer.js";
import { AppState } from "../state/state.js";
import { ERRORS } from "../config/error.js";
import { UI_CONFIG } from "../config/ui-config.js";
import {
  showCurrenciesPage,
  renderCoins,
} from "../controllers/pages-controller.js";

let isRegistered = false;

// ===== EVENT HANDLERS =====

const handleSearch = () => {
  const result = CoinsService.searchCoin($("#searchInput").val());
  $("#clearSearchBtn").removeClass("d-none");

  if (!result.ok) {
    BaseUI.showError("#coinsContainer", result.code, {
      term: result.term,
      defaultMessage: ERRORS.SEARCH.NO_MATCH(result.term || ""),
    });
    return;
  }

  renderCoins(result.data, { favorites: result.favorites });
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

  if (alreadyFavorite) {
    AppState.removeFavorite(coinSymbol);
  } else {
    AppState.addFavorite(coinSymbol);
  }
  CoinUI.updateFavoriteIcon(coinSymbol, !alreadyFavorite);

  if (AppState.isShowingFavoritesOnly()) renderFavoritesList();
};

const renderFavoritesList = () => {
  const favoriteSymbols = AppState.getFavorites();
  const filtered = AppState.getAllCoins().filter((c) =>
    favoriteSymbols.includes(c.symbol)
  );

  renderCoins(filtered, {
    favorites: favoriteSymbols,
    emptyMessage: UI_CONFIG.UI.FAVORITES_EMPTY,
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
    const result = await CoinsService.getCoinDetails(coinId);

    if (!result?.ok || !result.data) {
      BaseUI.showError(`#${collapseId}`, "COIN_DETAILS_ERROR", {
        status: result.status,
        defaultMessage:
          typeof result.error === "string"
            ? result.error
            : ERRORS.API.COIN_DETAILS_ERROR,
      });
      return;
    }

    CoinUI.showCoinDetails(collapseId, result.data, {
      currencies: UI_CONFIG.CURRENCIES,
    });

    // Draw chart AFTER rendering the HTML
    ChartRenderer.drawMiniChart(coinId);
  } catch (error) {
    BaseUI.showError(`#${collapseId}`, "COIN_DETAILS_ERROR", {
      defaultMessage: ERRORS.API.COIN_DETAILS_ERROR,
    });
  }
};

const handleShowFavorites = () => {
  if (AppState.isShowingFavoritesOnly()) {
    renderCoins(AppState.getAllCoins());
    BaseUI.setFavoritesButtonLabel(false);
    AppState.setShowFavoritesOnly(false);
    return;
  }

  renderFavoritesList();
  BaseUI.setFavoritesButtonLabel(true);
  AppState.setShowFavoritesOnly(true);
};

const handleSortChange = () => {
  const { data, selected, favorites } = CoinsService.sortCoins(
    $("#sortSelect").val()
  );
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
