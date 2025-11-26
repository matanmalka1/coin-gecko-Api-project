import { CoinsService } from "../services/coins-service.js";
import { UIManager } from "../ui/ui-manager.js";
import { AppState } from "../state/state.js";
import { CONFIG } from "../config/config.js";
import { ERRORS } from "../config/error.js";
import { ErrorResolver } from "../utils/error-resolver.js";
import { CoinUI } from "../ui/coin-ui.js";
import { PagesController } from "./pages-controller.js";

const CoinEvents = (() => {
  const handleSearch = () => {
    const searchTerm = UIManager.getInputValue("#searchInput");
    const serviceResult = CoinsService.searchCoin(searchTerm);
    UIManager.showElement("#clearSearchBtn");

    if (!serviceResult?.ok) {
      UIManager.showError(
        "#coinsContainer",
        ErrorResolver.resolve(serviceResult.code, {
          term: serviceResult.term,
        })
      );
      return;
    }

    UIManager.displayCoins(serviceResult.data, serviceResult.selected, {
      favorites: serviceResult.favorites,
    });
  };

  const handleClearSearch = () => {
    UIManager.setInputValue("#searchInput", "");
    const { data, selected = [], favorites = [] } = CoinsService.clearSearch();
    UIManager.displayCoins(data, selected, { favorites });
  };

  const handleFavoriteToggle = (e) => {
    const coinSymbol = UIManager.getDataAttr(e.currentTarget, "symbol");
    const alreadyFavorite = AppState.isFavorite(coinSymbol);

    if (alreadyFavorite) {
      AppState.removeFavorite(coinSymbol);
    } else {
      AppState.addFavorite(coinSymbol);
    }

    CoinUI.updateFavoriteIcon(coinSymbol, !alreadyFavorite);
  };

  const showMoreInfoError = (collapseId, result) => {
    UIManager.showError(
      `#${collapseId}`,
      ErrorResolver.resolve(result?.code, {
        defaultMessage:
          typeof result?.error === "string" ? result.error : ERRORS.API.DEFAULT,
      })
    );
  };

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
        currencies: CONFIG.CURRENCIES,
      });
    } catch (error) {
      showMoreInfoError(collapseId, { error });
    }
  };

  const handleShowFavorites = () => {
    if (AppState.isShowingFavoritesOnly()) {
      UIManager.displayCoins(
        AppState.getAllCoins(),
        AppState.getSelectedReports(),
        {
          favorites: AppState.getFavorites(),
        }
      );
      UIManager.setFavoritesButtonLabel(false);
      AppState.setShowFavoritesOnly(false);
      return;
    }

    const favoriteSymbols = AppState.getFavorites();
    const allCoins = AppState.getAllCoins();
    const filteredCoins = allCoins.filter((c) =>
      favoriteSymbols.includes(c.symbol)
    );
    UIManager.displayCoins(filteredCoins, AppState.getSelectedReports(), {
      favorites: favoriteSymbols,
      emptyMessage: CONFIG.UI.FAVORITES_EMPTY,
    });
    UIManager.setFavoritesButtonLabel(true);
    AppState.setShowFavoritesOnly(true);
  };

  const handleSortChange = () => {
    const sortOption = UIManager.getInputValue("#sortSelect");
    const serviceResult = CoinsService.sortCoins(sortOption);
    UIManager.displayCoins(
      serviceResult.data,
      serviceResult.selected || AppState.getSelectedReports(),
      {
        favorites: serviceResult.favorites || AppState.getFavorites(),
      }
    );
  };

  const handleRefreshCoins = (e) => {
    e.preventDefault();
    if (AppState.isLoadingCoins()) return;
    PagesController.showCurrenciesPage({ forceRefresh: true });
  };

  const setupEventListeners = () => {
    $(document)
      .on("click", "#searchBtn", handleSearch)
      .on("keypress", "#searchInput", (e) => {
        if (e.key === "Enter") handleSearch();
      })
      .on("click", "#clearSearchBtn", handleClearSearch)
      .on("click", "#showFavoritesBtn", handleShowFavorites)
      .on("click", "#refreshCoinsBtn", handleRefreshCoins)
      .on("click", ".favorite-btn", handleFavoriteToggle)
      .on("click", ".more-info", handleMoreInfo)
      .on("change", "#sortSelect", handleSortChange);
  };

  return {
    register: setupEventListeners,
  };
})();

export { CoinEvents };
