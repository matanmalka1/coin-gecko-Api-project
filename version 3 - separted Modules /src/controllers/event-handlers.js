import { CoinsService } from "../services/coins-service.js";
import { ReportsService } from "./reports-service.js";
import { UIManager } from "../ui/ui-manager.js";
import { PagesController } from "./pages-controller.js";
import { AppState } from "../state/state.js";
import { CONFIG } from "../config/config.js";
import { ERRORS } from "../config/error.js";

export const EventHandlers = (() => {
  const resolveError = (code, term) => {
    switch (code) {
      case "EMPTY_TERM":
        return ERRORS.SEARCH.EMPTY_TERM;
      case "LOAD_WAIT":
        return ERRORS.SEARCH.LOAD_WAIT;
      case "NO_MATCH":
        return ERRORS.SEARCH.NO_MATCH(term || "");
      case "NONE_SELECTED":
        return ERRORS.REPORTS.NONE_SELECTED;
      case "NOT_FOUND":
        return ERRORS.REPORTS.NOT_FOUND;
      default:
        return ERRORS.API.DEFAULT;
    }
  };

  const handleSearch = () => {
    const searchTerm = UIManager.getInputValue("#searchInput");
    const serviceResult = CoinsService.searchCoin(searchTerm);
    UIManager.showElement("#clearSearchBtn");

    if (!serviceResult?.ok) {
      UIManager.showError(
        "#coinsContainer",
        resolveError(serviceResult.code, serviceResult.term)
      );
      return;
    }

    UIManager.displayCoins(serviceResult.data, serviceResult.selected, {
      favorites: serviceResult.favorites,
    });
  };

  const handleClearSearch = () => {
    UIManager.setInputValue("#searchInput", "");
    UIManager.hideElement("#clearSearchBtn");
    const serviceResult = CoinsService.clearSearch();
    if (serviceResult?.ok) {
      UIManager.displayCoins(serviceResult.data, serviceResult.selected, {
        favorites: serviceResult.favorites,
      });
    }
  };

  const handleFilterReports = () => {
    const serviceResult = CoinsService.filterSelectedCoins();
    UIManager.showElement("#clearSearchBtn");

    if (!serviceResult?.ok) {
      UIManager.showError("#coinsContainer", resolveError(serviceResult.code));
      return;
    }

    UIManager.displayCoins(serviceResult.data, serviceResult.selected, {
      favorites: serviceResult.favorites,
    });
  };
  const handleFavoriteToggle = function () {
    const coinSymbol = UIManager.getDataAttr(this, "symbol");

    if (AppState.isFavorite(coinSymbol)) {
      AppState.removeFavorite(coinSymbol);
    } else {
      AppState.addFavorite(coinSymbol);
    }

    const serviceResult = CoinsService.refreshCoinsDisplay();
    UIManager.displayCoins(serviceResult.data, serviceResult.selected, {
      favorites: serviceResult.favorites,
    });
  };
  const handleMoreInfo = async function () {
    const coinIdentifier = UIManager.getDataAttr(this, "id");
    const detailsCollapseId = `collapse-${coinIdentifier}`;

    if (UIManager.isCollapseOpen(detailsCollapseId)) {
      UIManager.toggleCollapse(detailsCollapseId, false);
      return;
    }

    UIManager.setHtml(
      `#${detailsCollapseId}`,
      '<div class="text-center p-2"><div class="spinner-border spinner-border-sm"></div></div>'
    );
    UIManager.toggleCollapse(detailsCollapseId, true);

    try {
      const fetchedData = await CoinsService.getCoinDetails(coinIdentifier);

      if (!fetchedData) {
        UIManager.showError(`#${detailsCollapseId}`, ERRORS.API.DEFAULT);
        return;
      }

      UIManager.showCoinDetails(detailsCollapseId, fetchedData, {
        currencies: CONFIG.CURRENCIES,
      });
    } catch (error) {
      UIManager.showError(
        `#${detailsCollapseId}`,
        typeof error === "string" ? error : ERRORS.API.DEFAULT
      );
    }
  };

  const handleCoinToggle = function () {
    const coinSymbol = UIManager.getDataAttr(this, "symbol");
    const serviceResult = ReportsService.toggleCoinSelection(coinSymbol);

    if (serviceResult.ok) {
      UIManager.updateToggleStates(serviceResult.selected);
      return;
    }

    if (serviceResult.code === "FULL") {
      UIManager.openReplaceDialog(
        serviceResult.newSymbol,
        serviceResult.existing,
        {
          maxCoins: serviceResult.limit,
          onConfirm: ({ remove, add, modal }) => {
            const replaceSelectionResult = ReportsService.replaceReport(
              remove,
              add
            );
            UIManager.updateToggleStates(replaceSelectionResult.selected);
            modal.hide();
          },
          onClose: () => {
            if (!ReportsService.hasReport(serviceResult.newSymbol)) {
              $(`.coin-toggle[data-symbol="${serviceResult.newSymbol}"]`).prop(
                "checked",
                false
              );
            }
            UIManager.updateToggleStates(ReportsService.getSelectedReports());
          },
        }
      );
    }
  };

  const handleThemeToggle = () => {
    const currentTheme = AppState.getTheme();
    const nextTheme = currentTheme === "light" ? "dark" : "light";

    AppState.setTheme(nextTheme);
    UIManager.applyTheme(nextTheme);
  };

  const handleShowFavorites = () => {
    const favoriteSymbols = AppState.getFavorites().map((f) => f.toUpperCase());
    const allCoins = AppState.getAllCoins();
    const filteredCoins = allCoins.filter((c) =>
      favoriteSymbols.includes(c.symbol.toUpperCase())
    );
    UIManager.displayCoins(filteredCoins, AppState.getSelectedReports(), {
      favorites: favoriteSymbols,
    });
  };

  let selectedCompare = [];
  let isCompareModalOpen = false;

  const handleCompareClick = async function () {
    if (isCompareModalOpen) return;
    const coinIdForAction = UIManager.getDataAttr(this, "id");

    if (!selectedCompare.includes(coinIdForAction)) {
      selectedCompare.push(coinIdForAction);
    }

    if (selectedCompare.length > 2) {
      selectedCompare = selectedCompare.slice(-2);
    }

    if (selectedCompare.length >= 2) {
      const serviceResult = await ReportsService.getCompareData(
        selectedCompare
      );

      if (!serviceResult?.ok) {
        UIManager.showError("#content", ERRORS.API.DEFAULT);
        selectedCompare = [];
        isCompareModalOpen = false;
        return;
      }

      isCompareModalOpen = true;
      UIManager.showCompareModal(serviceResult.coins, {
        onClose: () => {
          selectedCompare = [];
          isCompareModalOpen = false;
        },
      });
    }
  };
  const registerEvents = () => {
    $(document)
      .on("click", "#themeToggleBtn", handleThemeToggle)

      .on("click", "#searchBtn", handleSearch)

      .on("keypress", "#searchInput", (e) => {
        if (e.which === 13) handleSearch();
      })

      .on("click", "#showFavoritesBtn", handleShowFavorites)

      .on("click", ".favorite-btn", handleFavoriteToggle)

      .on("click", "#clearSearchBtn", handleClearSearch)

      .on("click", "#filterReportsBtn", handleFilterReports)

      .on("click", ".more-info", handleMoreInfo)

      .on("change", ".coin-toggle", handleCoinToggle)

      .on("click", ".compare-btn", handleCompareClick)

      .on("change", "#sortSelect", () => {
        const sortOption = UIManager.getInputValue("#sortSelect");
        const serviceResult = CoinsService.sortCoins(sortOption);
        UIManager.displayCoins(
          serviceResult.data,
          serviceResult.selected || AppState.getSelectedReports(),
          {
            favorites: serviceResult.favorites || AppState.getFavorites(),
          }
        );
      });
  };

  const registerNavigation = () => {
    $("#currenciesBtn").on("click", () => {
      PagesController.showCurrenciesPage();
    });

    $("#reportsBtn").on("click", () => {
      PagesController.showReportsPage();
    });

    $("#aboutBtn").on("click", () => {
      PagesController.showAboutPage();
    });
  };

  return {
    registerEvents,
    registerNavigation,
  };
})();
