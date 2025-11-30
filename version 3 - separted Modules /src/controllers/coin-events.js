import { CoinsService } from "../services/coins-service.js";
import { UIManager } from "../ui/ui-manager.js";
import { AppState } from "../state/state.js";
import { CONFIG } from "../config/config.js";
import { ERRORS } from "../config/error.js";
import { ErrorResolver } from "../utils/error-resolver.js";
import { CoinUI } from "../ui/coin-ui.js";
import { PagesController } from "./pages-controller.js";

from functions.update_plan to=functions.apply_patch to=functions.shell_command to=functions.apply_patch to=functions.shell_command to=functions.apply_patch to=functions.shell_command to=functions.apply_patch to=functions.shell_command to=functions.apply_patch to=functions.shell_command to=functions.apply_patch to=functions.shell_command to=functions.apply_patch to=functions.shell_command to=functions.apply_patch to=functions.shell_command to=functions.apply_patch to=functions.shell_command to=functions.apply_patch to=functions.shell_command to=functions.apply_patch to=functions.shell_command to=functions.apply_patch to=functions.shell_command to=functions.apply_patch to=functions.shell_command to=functions.apply_patch to=functions.shell_command to=functions.apply_patch to=functions.shell_command to=functions.apply_patch to=functions.shell_command to=functions.apply_patch to=functions.shell_command to=functions.apply_patch to=functions.shell_command to=functions.apply_patch to=functions.shell_command to=functions.apply_patch to=functions.shell_command to=functions.apply_patch to=functions.shell_command to=functions.apply_patch Error: Attempted to call two tools at once. You must wait for the previous tool call to complete. You can check the tool queue to check the status of the tools being executed.
  let isRegistered = false;
  // Handles "Enter" search in the currencies page.
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
      compareSelection: AppState.getCompareSelection(),
    });
  };

  // Clears the search input and resets coins list.
  const handleClearSearch = () => {
    UIManager.setInputValue("#searchInput", "");
    const { data, selected = [], favorites = [] } = CoinsService.clearSearch();
    UIManager.displayCoins(data, selected, {
      favorites,
      compareSelection: AppState.getCompareSelection(),
    });
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
  };

  // Utility to show error on the "more info" collapse area.
  const showMoreInfoError = (collapseId, result) => {
    UIManager.showError(
      `#${collapseId}`,
      ErrorResolver.resolve(result?.code, {
        defaultMessage:
          typeof result?.error === "string" ? result.error : ERRORS.API.DEFAULT,
      })
    );
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
        currencies: CONFIG.CURRENCIES,
      });
    } catch (error) {
      showMoreInfoError(collapseId, { error });
    }
  };

  // Filters the coin list to favorites only or toggles back.
  const handleShowFavorites = () => {
    if (AppState.isShowingFavoritesOnly()) {
      UIManager.displayCoins(
        AppState.getAllCoins(),
        AppState.getSelectedReports(),
        {
          favorites: AppState.getFavorites(),
          compareSelection: AppState.getCompareSelection(),
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
      compareSelection: AppState.getCompareSelection(),
    });
    UIManager.setFavoritesButtonLabel(true);
    AppState.setShowFavoritesOnly(true);
  };

  // Updates the sort order based on user's selection.
  const handleSortChange = () => {
    const sortOption = UIManager.getInputValue("#sortSelect");
    const serviceResult = CoinsService.sortCoins(sortOption);
    UIManager.displayCoins(
      serviceResult.data,
      serviceResult.selected || AppState.getSelectedReports(),
      {
        favorites: serviceResult.favorites || AppState.getFavorites(),
        compareSelection: AppState.getCompareSelection(),
      }
    );
  };

  // Forces re-fetch of coins data via currencies page.
  const handleRefreshCoins = (e) => {
    e.preventDefault();
    if (AppState.isLoadingCoins()) return;
    PagesController.showCurrenciesPage({ forceRefresh: true });
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

  return {
    register: setupEventListeners,
  };
})();

export { CoinEvents };
