import { getFavorites, isFavorite, addFavorite, removeFavorite } from "../services/storage-manager.js";
import {showCoinDetails,updateFavoriteIcon,} from "../ui/Components/coin-components.js";
import { ERRORS } from "../config/error.js";
import { ErrorUI } from "../ui/error-ui.js";
import {showCurrenciesPage,renderCoins,} from "../controllers/pages-controller.js";
import {filterSelectedCoins,getCoinDetails,searchCoin,getAllCoins,sortCoins,} from "../services/coins-service.js";
import { spinner } from "../ui/Components/base-components.js";
import { getNotyf } from "../ui/error-ui.js";

let isShowingFavoritesOnly = false;
let isShowingSelectedOnly = false;
let currentViewMode = "all";

const RENDER_STRATEGIES = {
  favorites: () => {
    const favoriteSymbols = getFavorites();
    const coins = getAllCoins().filter((coin) => favoriteSymbols.includes(coin.symbol));
    if (coins.length === 0) {
      ErrorUI.showInfo(ERRORS.NO_FAVORITES);
    }
    return { coins, options: { favorites: favoriteSymbols } };
  },
  selected: () => {
    const { ok, data, error, status } = filterSelectedCoins();
    if (!ErrorUI.handleResult({ ok, data, error, status }, ERRORS.NONE_SELECTED)) return null;
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

  (favorite ? removeFavorite : addFavorite)(coinSymbol);
  ErrorUI.showInfo(favorite ? "Removed from favorites" : "Added to favorites");

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
  const { ok, data, error, status } = searchCoin($searchInput.val());
  $clearBtn.toggleClass("d-none", !$searchInput.val());

  if (!ok) {
    ErrorUI.showError(error);
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

  if ($collapse.hasClass("show")) return $collapse.collapse("hide");

  $collapse.html(spinner("Loading details…"));
  $collapse.collapse("show");

  try {
    const { ok, data, status, error } = await getCoinDetails(coinId);
    if (!ok || !data) {
      ErrorUI.showError(error);
      return;
    }
    showCoinDetails(collapseId, data);
  } catch {
    ErrorUI.showError(ERRORS.COIN_DETAILS_ERROR);
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
