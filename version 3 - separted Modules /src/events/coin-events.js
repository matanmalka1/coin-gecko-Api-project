import { CoinsService } from "../services/coins-service.js";
import { StorageHelper } from "../services/storage-manager.js";
import { CoinUI } from "../ui/coin-ui.js";
import { BaseUI } from "../ui/base-ui.js";
import { ERRORS } from "../config/error.js";
import { APP_CONFIG } from "../config/app-config.js";
import { ErrorUI } from "../ui/error-ui.js";
import {
  showCurrenciesPage,
  renderCoins,
  getLoadingCoins,
  setLoadingCoins,
} from "../controllers/pages-controller.js";

const CURRENCIES = {
  USD: { symbol: APP_CONFIG.USD_SYMBOL, label: APP_CONFIG.USD_LABEL },
  EUR: { symbol: APP_CONFIG.EUR_SYMBOL, label: APP_CONFIG.EUR_LABEL },
  ILS: { symbol: APP_CONFIG.ILS_SYMBOL, label: APP_CONFIG.ILS_LABEL },
};
const FAVORITES_EMPTY = APP_CONFIG.UI_FAV_EMPTY;

let isRegistered = false;
let isShowingFavoritesOnly = false;

// ===== EVENT HANDLERS =====
const handleSearch = () => {
  const searchTerm = $("#searchInput").val();
  const { ok, code, term, data, favorites } =
    CoinsService.searchCoin(searchTerm);

  $("#clearSearchBtn").removeClass("d-none");

  if (!ok) {
    ErrorUI.showError("#coinsContainer", code, {
      term,
      defaultMessage: ERRORS.NO_MATCH(term || ""),
    });
    return;
  }

  renderCoins(data, { favorites });
};

const handleClearSearch = () => {
  $("#searchInput").val("");
  renderCoins(CoinsService.getAllCoins(), {
    favorites: StorageHelper.getFavorites(),
  });
};

const handleFavoriteToggle = (e) => {
  const coinSymbol = $(e.currentTarget).data("symbol");
  const alreadyFavorite = StorageHelper.isFavorite(coinSymbol);

  if (alreadyFavorite) {
    StorageHelper.removeFavorite(coinSymbol);
  } else {
    StorageHelper.addFavorite(coinSymbol);
  }

  CoinUI.updateFavoriteIcon(coinSymbol, !alreadyFavorite);

  if (isShowingFavoritesOnly) {
    renderFavoritesList();
  }
};

const renderFavoritesList = () => {
  const favoriteSymbols = StorageHelper.getFavorites();
  const filtered = CoinsService.getAllCoins().filter((coin) =>
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
    const { ok, data, status, error } = await CoinsService.getCoinDetails(
      coinId
    );

    if (!ok || !data) {
      ErrorUI.showError(`#${collapseId}`, "COIN_DETAILS_ERROR", {
        status,
      });
      return;
    }

    CoinUI.showCoinDetails(collapseId, data, { currencies: CURRENCIES });
  } catch (error) {
    ErrorUI.showError(`#${collapseId}`, "COIN_DETAILS_ERROR", {
      status: null,
    });
  }
};

const handleShowFavorites = () => {
  if (isShowingFavoritesOnly) {
    renderCoins(CoinsService.getAllCoins());
    BaseUI.setFavoritesButtonLabel(false);
    isShowingFavoritesOnly = false;
  } else {
    renderFavoritesList();
    BaseUI.setFavoritesButtonLabel(true);
    isShowingFavoritesOnly = true;
  }
};

const handleSortChange = () => {
  const { data } = CoinsService.sortCoins($("#sortSelect").val());
  const { favorites } = StorageHelper.getUIState();
  renderCoins(data, { favorites });
};

const handleRefreshCoins = (e) => {
  e.preventDefault();
  if (!getLoadingCoins()) {
    setLoadingCoins(true);
    showCurrenciesPage({ forceRefresh: true }).finally(() => {
      setLoadingCoins(false);
    });
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
