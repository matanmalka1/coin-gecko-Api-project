import {getFavorites,isFavorite,addFavorite,removeFavorite,} from "../services/storage-manager.js";
import {showCoinDetails,updateFavoriteIcon,} from "../ui/pages/currenciesPage.js";
import { ERRORS,showError,showInfo } from "../config/error.js";
import { showCurrenciesPage, renderCoins } from "./pages-events.js";
import {filterSelectedCoins,getCoinDetails,searchCoin,getAllCoins,sortCoins,} from "../services/coins-service.js";
import { spinner } from "../ui/base-components.js";


let currentViewMode = "all";

const RENDER_STRATEGIES = {
  favorites: () => {
    const favoriteSymbols = getFavorites();
    const coins = getAllCoins().filter((coin) => favoriteSymbols.includes(coin.symbol));
    if (coins.length === 0) showInfo(ERRORS.NO_FAVORITES);

    return { coins, options: { favorites: favoriteSymbols } };
  },
  selected: () => {
    const { ok, data, error } = filterSelectedCoins();
    if (!ok) {
      showInfo(error || ERRORS.NONE_SELECTED);
      return null;
    }
    return { coins: data, options: {} };
  },
  all: () => ({ coins: getAllCoins(), options: {} }),
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
  showInfo(favorite ? "Removed from favorites" : "Added to favorites");

  updateFavoriteIcon(coinSymbol, !favorite);
  if (currentViewMode === "favorites") toggleViewMode("favorites");

};

const toggleViewMode = (mode) => {
  const targetMode = currentViewMode === mode ? "all" : mode;

  const strategy = RENDER_STRATEGIES[targetMode];
  if (!strategy) return;

  const result = strategy();
  if (!result) return;


  currentViewMode = targetMode;

  $("#showFavoritesBtn").toggleClass("active", targetMode === "favorites");
  $("#filterReportsBtn").toggleClass("active", targetMode === "selected");

  renderCoins(result.coins, result.options);
};

// ===== EVENT HANDLERS =====
const handleSearch = () => {
  const $searchInput = $("#searchInput");
  const $clearBtn = $("#clearSearchBtn");
  const searchTerm = $searchInput.val();

  $clearBtn.toggleClass("d-none", !searchTerm);
  if (!searchTerm) return;

  const { ok, data, error } = searchCoin(searchTerm);

  if (!ok) {
    showError(error);
    renderCoins(getAllCoins());
    return;
  }
  renderCoins(data);
};

const handleClearSearch = () => {
  $("#searchInput").val("");
  $("#clearSearchBtn").addClass("d-none");

  const strategy = RENDER_STRATEGIES[currentViewMode];
  const { coins, options } = strategy?.() || {};
  if (coins) renderCoins(coins, options);
};

const handleMoreInfo = async (e) => {
  const coinId = $(e.currentTarget).data("id");
  const collapseId = `collapse-${coinId}`;
  const collapseSelector = `#${collapseId}`;
  const $collapse = $(collapseSelector);

  if ($collapse.hasClass("show")) return $collapse.collapse("hide");

  $collapse.html(spinner("Loading details…"));
  $collapse.collapse("show");

  const { ok, data, error } = await getCoinDetails(coinId);
  if (!ok || !data) {
    showError(error);
    $collapse.html(`<p class="text-muted p-2">Failed to load details</p>`);
    return;
  }
  showCoinDetails(collapseId, data);
};

export const setupCoinsEvents = () => {
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
