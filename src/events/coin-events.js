import { StorageHelper } from "../services/storage-manager.js";
import { showCoinDetails, updateFavoriteIcon } from "../ui/coin-ui.js";
import { BaseUI } from "../ui/base-ui.js";
import { ERRORS } from "../config/error.js";
import { ErrorUI } from "../ui/error-ui.js";
import { showCurrenciesPage, renderCoins } from "../controllers/pages-controller.js";
import {filterSelectedCoins, getCoinDetails ,searchCoin, getAllCoins, sortCoins} from "../services/coins-service.js";
import { normalizeSymbol } from "../utils/general-utils.js";


const { NO_FAVORITES } = ERRORS

let isShowingFavoritesOnly = false;
let isShowingSelectedOnly = false;

const renderFavoritesList = () => {
  const favoriteSymbols = StorageHelper.getFavorites();
  const filtered = getAllCoins().filter((coin) =>
    favoriteSymbols.includes(normalizeSymbol(coin.symbol))
  );

  renderCoins(filtered, {
    favorites: favoriteSymbols,
    emptyMessage: NO_FAVORITES,
  });
};

const renderSelectedList = () => {
  const { ok, code, data } = filterSelectedCoins();
  
  if (!ok) {
    ErrorUI.showError("#coinsContainer", code, {
      defaultMessage: ERRORS.NONE_SELECTED,
    });
    return;
  }
  
  renderCoins(data);
};
// ===== EVENT HANDLERS =====
const handleSearch = () => {
  const { ok, code, term, data } = searchCoin( $("#searchInput").val());
  $("#clearSearchBtn").toggleClass("d-none");

  if (!ok) {ErrorUI.showError("#coinsContainer", code, { term });
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
    BaseUI.toggleCollapse(collapseId, false);
    return;
  }

  BaseUI.showSpinner(collapseSelector, "Loading details…");
  BaseUI.toggleCollapse(collapseId, true);

  try {
    const { ok, data, status } = await getCoinDetails(coinId);

    if (!ok || !data) {
      ErrorUI.showError(collapseSelector, "COIN_DETAILS_ERROR", {
        status,
      });
      return;
    }
    showCoinDetails(collapseId, data);
  } catch {
    ErrorUI.showError(collapseSelector, "COIN_DETAILS_ERROR", {
      status: null,
    });
  }
};

const handleFavoriteToggle = (e) => {
  const coinSymbol = $(e.currentTarget).data("symbol");
  const isFavorite = StorageHelper.isFavorite(coinSymbol);

  isFavorite 
    ? StorageHelper.removeFavorite(coinSymbol)
    : StorageHelper.addFavorite(coinSymbol);

  updateFavoriteIcon(coinSymbol, !isFavorite);
  if (isShowingFavoritesOnly) {
    renderFavoritesList();
  }
};

const handleShowFavorites = () => {
  isShowingFavoritesOnly = !isShowingFavoritesOnly;
   if (isShowingFavoritesOnly) isShowingSelectedOnly = false;
  isShowingFavoritesOnly ? renderFavoritesList() : renderCoins(getAllCoins());
};
const handleShowSelected = () => {
  isShowingSelectedOnly = !isShowingSelectedOnly;
   if (isShowingSelectedOnly) isShowingFavoritesOnly = false;
  isShowingSelectedOnly ? renderSelectedList() : renderCoins(getAllCoins());
 
};
const handleSortChange = () => {
  const { data } = sortCoins($("#sortSelect").val());
  renderCoins(data);
};

// ===== REGISTRATION =====
const setupEventListeners = () => {
  $(document)
    .on("keypress", "#searchInput", (e) => {
      if (e.key === "Enter") handleSearch();
    })
    
    .on("click", "#clearSearchBtn", handleClearSearch)
    .on("click", "#showFavoritesBtn", handleShowFavorites)
    .on("click", "#filterReportsBtn", handleShowSelected)
    .on("click", "#refreshCoinsBtn", () => showCurrenciesPage({ forceRefresh: true }))
    .on("click", ".favorite-btn", handleFavoriteToggle)
    .on("click", ".more-info", handleMoreInfo)
    .on("change", "#sortSelect", handleSortChange);
};

export const CoinEvents = { register: setupEventListeners };
