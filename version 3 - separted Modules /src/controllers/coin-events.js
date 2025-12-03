import { CoinsService } from "../services/coins-service.js";
import { UIManager } from "../ui/ui-manager.js";
import { AppState } from "../state/state.js";
import { ERRORS } from "../config/error.js";
import { UI_CONFIG } from "../config/ui-config.js";
import { CoinUI } from "../ui/coin-ui.js";
import { BaseUI } from "../ui/base-ui.js";
import { showCurrenciesPage } from "./pages-controller.js";

let isRegistered = false;

const renderCoins = (data, selected, { favorites, emptyMessage } = {}) => {
  UIManager.displayCoins(data, selected ?? AppState.getSelectedReports(), {
    favorites: favorites ?? AppState.getFavorites(),
    compareSelection: AppState.getCompareSelection(),
    ...(emptyMessage && { emptyMessage }),
  });
};

// Handles "Enter" search in the currencies page.
const handleSearch = () => {
  const searchTerm = UIManager.getInputValue("#searchInput");
  const result = CoinsService.searchCoin(searchTerm);
  UIManager.showElement("#clearSearchBtn");

  if (!result?.ok) {
    BaseUI.showError("#coinsContainer", result.code, { term: result.term });
    return;
  }

  renderCoins(result.data, result.selected, { favorites: result.favorites });
};

// Clears the search input and resets coins list.
const handleClearSearch = () => {
  UIManager.setInputValue("#searchInput", "");
  const { data, selected, favorites } = CoinsService.clearSearch();
  renderCoins(data, selected, { favorites });
};

// Toggles favorite status for a coin and updates the icon.
const handleFavoriteToggle = (e) => {
  const coinSymbol = UIManager.getDataAttr(e.currentTarget, "symbol");
  const alreadyFavorite = AppState.isFavorite(coinSymbol);

  if (alreadyFavorite) {
    AppState.removeFavorite(coinSymbol);
  } else {
    AppState.addFavorite(coinSymbol);
  }
  CoinUI.updateFavoriteIcon(coinSymbol, !alreadyFavorite);

  // If currently showing favorites-only, refresh the filtered view.
  if (AppState.isShowingFavoritesOnly()) renderFavoritesList();
};

// Renders the favorites-only list based on current favorites state.
const renderFavoritesList = () => {
  const favoriteSymbols = AppState.getFavorites();
  const filtered = AppState.getAllCoins().filter((c) =>
    favoriteSymbols.includes(c.symbol)
  );

  renderCoins(filtered, AppState.getSelectedReports(), {
    favorites: favoriteSymbols,
    emptyMessage: UI_CONFIG.UI.FAVORITES_EMPTY,
  });
};

// Utility to show error on the "more info" collapse area.
const showMoreInfoError = (collapseId, result = {}) => {
  BaseUI.showError(`#${collapseId}`, result.code || "API_ERROR", {
    status: result.status,
    defaultMessage:
      typeof result.error === "string" ? result.error : ERRORS.API.DEFAULT,
  });
};

// Fetches/expands "more info" collapse panel for a coin card.
const handleMoreInfo = async (e) => {
  const coinId = UIManager.getDataAttr(e.currentTarget, "id");
  const collapseId = `collapse-${coinId}`;

  if (UIManager.isCollapseOpen(collapseId)) {
    UIManager.toggleCollapse(collapseId, false);
    return;
  }

  UIManager.showSpinner(`#${collapseId}`, "Loading details…");
  UIManager.toggleCollapse(collapseId, true);

  try {
    const result = await CoinsService.getCoinDetails(coinId);
    if (!result?.ok || !result.data) {
      showMoreInfoError(collapseId, result);
      return;
    }

    UIManager.showCoinDetails(collapseId, result.data, {
      currencies: UI_CONFIG.CURRENCIES,
    });
  } catch (error) {
    showMoreInfoError(collapseId, { error });
  }
};

// Filters the coin list to favorites only or toggles back.
const handleShowFavorites = () => {
  if (AppState.isShowingFavoritesOnly()) {
    renderCoins(AppState.getAllCoins());
    UIManager.setFavoritesButtonLabel(false);
    AppState.setShowFavoritesOnly(false);
    return;
  }

  renderFavoritesList();
  UIManager.setFavoritesButtonLabel(true);
  AppState.setShowFavoritesOnly(true);
};

// Updates the sort order based on user's selection.
const handleSortChange = () => {
  const sortOption = UIManager.getInputValue("#sortSelect");
  const { data, selected, favorites } = CoinsService.sortCoins(sortOption);
  renderCoins(data, selected, { favorites });
};

// Forces re-fetch of coins data via currencies page.
const handleRefreshCoins = (e) => {
  e.preventDefault();
  if (!AppState.isLoadingCoins()) {
    showCurrenciesPage({ forceRefresh: true });
  }
};

// Registers all coin-related DOM events (once).
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
