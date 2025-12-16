import { getFavorites, isFavorite, addFavorite, removeFavorite } from "../services/storage-manager.js";
import {showCoinDetails,updateFavoriteIcon,} from "../ui/Components/coin-components.js";
import { ERRORS } from "../config/error.js";
import { ErrorUI } from "../ui/error-ui.js";
import {showCurrenciesPage,renderCoins,} from "../controllers/pages-controller.js";
import {filterSelectedCoins,getCoinDetails,searchCoin,getAllCoins,sortCoins,} from "../services/coins-service.js";
import { spinner, toggleCollapse } from "../ui/Components/base-components.js";

let isShowingFavoritesOnly = false;
let isShowingSelectedOnly = false;
let currentViewMode = "all";

const RENDER_STRATEGIES = {
  favorites: () => {
    const favoriteSymbols = getFavorites();
    const coins = getAllCoins().filter((coin) => favoriteSymbols.includes(coin.symbol));
    return { coins, options: { favorites: favoriteSymbols, emptyMessage: ERRORS.NO_FAVORITES } };
  },
  selected: () => {
    const { ok, error, data } = filterSelectedCoins();
    if (!ok) {
      ErrorUI.showError("#coinsContainer", error || ERRORS.NONE_SELECTED);
      return null;
    }
    return { coins: data, options: {} };
  },
  all: () => ({ coins: getAllCoins(), options: {} })
};

const handleSortChange = () => {
  const sortType = $("#sortSelect").val();
  
  const strategy = RENDER_STRATEGIES[currentViewMode];
  const result = strategy?.();
  if (!result) return;
  
  const { data } = sortCoins(sortType, result.coins);
  renderCoins(data, result.options);
};

const handleFavoriteToggle = (e) => {
  const coinSymbol = $(e.currentTarget).data("symbol");
  const favorite = isFavorite(coinSymbol);

  favorite ? removeFavorite(coinSymbol) : addFavorite(coinSymbol);

  updateFavoriteIcon(coinSymbol, !favorite);
  if (isShowingFavoritesOnly) {toggleViewMode("favorites");}
};

const toggleViewMode = (mode) => {
  const targetMode = currentViewMode === mode ? "all" : mode;

  const strategy = RENDER_STRATEGIES[targetMode];
  if (!strategy) return;

  const result = strategy();
  if (!result) return;

  isShowingFavoritesOnly = targetMode === "favorites";
  isShowingSelectedOnly = targetMode === "selected";
  currentViewMode = targetMode;

  $("#showFavoritesBtn").toggleClass("active", targetMode === "favorites");
  $("#filterReportsBtn").toggleClass("active", targetMode === "selected");

  renderCoins(result.coins, result.options);
};

// ===== EVENT HANDLERS =====
const handleSearch = () => {
  const $searchInput = $("#searchInput");
  const $clearBtn = $("#clearSearchBtn");
  const { ok, error, data } = searchCoin($searchInput.val());
  $clearBtn.toggleClass("d-none", !$searchInput.val());

  if (!ok) {
    ErrorUI.showError("#coinsContainer", error || ERRORS.DEFAULT);
    return;
  }
  renderCoins(data);
};

const handleClearSearch = () => {
  $("#searchInput").val("");
  const $clearBtn = $("#clearSearchBtn");
  renderCoins(getAllCoins());
  $clearBtn.addClass("d-none");
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
