import { StorageHelper } from "../services/storage-manager.js";
import { showCoinDetails, updateFavoriteIcon } from "../ui/coin-ui.js";
import { BaseUI } from "../ui/base-ui.js";
import { APP_CONFIG } from "../config/app-config.js";
import { ERRORS } from "../config/error.js";
import { ErrorUI } from "../ui/error-ui.js";
import { showCurrenciesPage, renderCoins } from "../controllers/pages-controller.js";
import { getCoinDetails ,searchCoin, getAllCoins, sortCoins} from "../services/coins-service.js";
import { normalizeSymbol } from "../utils/general-utils.js";

const FAVORITES_EMPTY = APP_CONFIG.UI_FAV_EMPTY;

let isRegistered = false;
let isShowingFavoritesOnly = false;

// ===== EVENT HANDLERS =====
const handleSearch = () => {
  const searchTerm = $("#searchInput").val();
  const { ok, code, term, data, } = searchCoin(searchTerm);

  $("#clearSearchBtn").removeClass("d-none");

  if (!ok) {
    ErrorUI.showError("#coinsContainer", code, {
      term,
      defaultMessage: ERRORS.NO_MATCH(term || ""),
    });
    return;
  }

  renderCoins(data);
};

const handleClearSearch = () => {
  $("#searchInput").val("");
  renderCoins(getAllCoins());
};

const handleFavoriteToggle = (e) => {
  const coinSymbol = $(e.currentTarget).data("symbol");
  const alreadyFavorite = StorageHelper.isFavorite(coinSymbol);

  if (alreadyFavorite) {
    StorageHelper.removeFavorite(coinSymbol);
  } else {
    StorageHelper.addFavorite(coinSymbol);
  }

  updateFavoriteIcon(coinSymbol, !alreadyFavorite);

  if (isShowingFavoritesOnly) {
    renderFavoritesList();
  }
};

const renderFavoritesList = () => {
  const favoriteSymbols = StorageHelper.getFavorites();
  const filtered = getAllCoins().filter((coin) =>
    favoriteSymbols.includes(normalizeSymbol(coin.symbol))
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
    const { ok, data, status, error } = await getCoinDetails(coinId);

    if (!ok || !data) {
      ErrorUI.showError(`#${collapseId}`, "COIN_DETAILS_ERROR", {
        status,
      });
      return;
    }

    showCoinDetails(collapseId, data);
  } catch (error) {
    ErrorUI.showError(`#${collapseId}`, "COIN_DETAILS_ERROR", {
      status: null,
    });
  }
};

const handleShowFavorites = () => {
  if (isShowingFavoritesOnly) {
    renderCoins(getAllCoins());
    BaseUI.setFavoritesButtonLabel(false);
    isShowingFavoritesOnly = false;
  } else {
    renderFavoritesList();
    BaseUI.setFavoritesButtonLabel(true);
    isShowingFavoritesOnly = true;
  }
};

const handleSortChange = () => {
  const { data } = sortCoins($("#sortSelect").val());
  renderCoins(data);
};

const handleRefreshCoins = (e) => {
  e.preventDefault();
  showCurrenciesPage({ forceRefresh: true });
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
