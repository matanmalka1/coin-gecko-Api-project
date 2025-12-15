import { getFavorites, isFavorite, addFavorite, removeFavorite } from "../services/storage-manager.js";
import {showCoinDetails,updateFavoriteIcon,} from "../ui/Components/coin-components.js";
import { ERRORS } from "../config/error.js";
import { ErrorUI } from "../ui/error-ui.js";
import {showCurrenciesPage,renderCoins,} from "../controllers/pages-controller.js";
import {filterSelectedCoins,getCoinDetails,searchCoin,getAllCoins,sortCoins,} from "../services/coins-service.js";
import { spinner, toggleCollapse } from "../ui/Components/base-components.js";

const { NO_FAVORITES } = ERRORS;

let isShowingFavoritesOnly = false;
let isShowingSelectedOnly = false;

const handleSortChange = () => {
  const { data } = sortCoins($("#sortSelect").val());
  renderCoins(data);
};

const renderFavoritesList = () => {
  const favoriteSymbols = getFavorites();
  const filtered = getAllCoins().filter((coin) =>
    favoriteSymbols.includes(coin.symbol)
  );

  renderCoins(filtered, {
    favorites: favoriteSymbols,
    emptyMessage: NO_FAVORITES,
  });
};

const renderSelectedList = () => {
  const { ok, error, data } = filterSelectedCoins();

  if (!ok) {
    ErrorUI.showError("#coinsContainer", error || ERRORS.NONE_SELECTED);
    return;
  }
  renderCoins(data);
};

const RENDER_MODES = {
  favorites: renderFavoritesList,
  selected: renderSelectedList,
  all: () => renderCoins(getAllCoins()),
};

const handleFavoriteToggle = (e) => {
  const coinSymbol = $(e.currentTarget).data("symbol");
  const favorite = isFavorite(coinSymbol);

  favorite ? removeFavorite(coinSymbol) : addFavorite(coinSymbol);

  updateFavoriteIcon(coinSymbol, !favorite);
  if (isShowingFavoritesOnly) {renderFavoritesList();
  }
};

const toggleViewMode = (mode) => {
  const render = RENDER_MODES[mode];
  if (!render) return;

  isShowingFavoritesOnly = mode === "favorites";
  isShowingSelectedOnly = mode === "selected";

  render();
};

// ===== EVENT HANDLERS =====
const handleSearch = () => {
  const { ok, error, data } = searchCoin($("#searchInput").val());
  $("#clearSearchBtn").toggleClass("d-none");

  if (!ok) {
    ErrorUI.showError("#coinsContainer", error || ERRORS.DEFAULT);
    return;
  }
  renderCoins(data);
};

const handleClearSearch = () => {
  $("#searchInput").val("");
  renderCoins(getAllCoins());
  $("#clearSearchBtn").addClass("d-none");
};

const handleMoreInfo = async (e) => {
  const coinId = $(e.currentTarget).data("id");
  const collapseId = `collapse-${coinId}`;
  const collapseSelector = `#${collapseId}`;
  const $collapse = $(collapseSelector);

  if ($collapse.hasClass("show")) {
    toggleCollapse(collapseId, false);
    return;
  }

  $collapse.html(spinner("Loading details…"));
  toggleCollapse(collapseId, true);

  try {
    const { ok, data, status } = await getCoinDetails(coinId);

    if (!ok || !data) {
      ErrorUI.showError(collapseSelector, ERRORS.COIN_DETAILS_ERROR);
      return;
    }
    showCoinDetails(collapseId, data);
  } catch {
    ErrorUI.showError(collapseSelector, ERRORS.COIN_DETAILS_ERROR);
  }
};

// ===== REGISTRATION =====
const setupEventListeners = () => {
  $(document)
    .on("keypress", "#searchInput", (e) => {
      if (e.key === "Enter") handleSearch();
    })

    .on("click", "#clearSearchBtn", handleClearSearch)
    .on("click", "#showFavoritesBtn", () => toggleViewMode("favorites"))
    .on("click", "#filterReportsBtn", () => toggleViewMode("selected"))
    .on("click", "#refreshCoinsBtn", () => showCurrenciesPage({ forceRefresh: true }))
    .on("click", ".favorite-btn", handleFavoriteToggle)
    .on("click", ".more-info", handleMoreInfo)
    .on("change", "#sortSelect", handleSortChange);
};

export const CoinEvents = { register: setupEventListeners };
