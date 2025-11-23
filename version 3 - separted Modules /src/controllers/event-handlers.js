import { CoinsService } from "../services/coins-service.js";
import { ReportsService } from "../services/reports-service.js";
import { UIManager } from "../ui/ui-manager.js";
import { PagesController } from "./pages-controller.js";
import { AppState } from "../state/state.js";
import { CONFIG } from "../config/config.js";
import { ERRORS } from "../config/error.js";
import { ErrorResolver } from "../utils/error-resolver.js";
// [NEWS]
import { NewsService } from "../services/news-service.js";

export const EventHandlers = (() => {
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
    const {
      ok,
      data,
      selected = [],
      favorites = [],
    } = CoinsService.clearSearch();

    if (ok) {
      UIManager.displayCoins(data, selected, { favorites });
    }
  };

  const handleFilterReports = () => {
    const serviceResult = CoinsService.filterSelectedCoins();
    UIManager.showElement("#clearSearchBtn");

    if (!serviceResult?.ok) {
      UIManager.showError(
        "#coinsContainer",
        ErrorResolver.resolve(serviceResult.code)
      );
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

      if (!fetchedData?.ok || !fetchedData.data) {
        UIManager.showError(
          `#${detailsCollapseId}`,
          ErrorResolver.resolve(fetchedData.code, {
            defaultMessage: fetchedData?.error,
          })
        );
        return;
      }

      UIManager.showCoinDetails(detailsCollapseId, fetchedData.data, {
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

  let showingFavorites = false;

  const handleShowFavorites = () => {
    if (showingFavorites) {
      UIManager.displayCoins(
        AppState.getAllCoins(),
        AppState.getSelectedReports(),
        {
          favorites: AppState.getFavorites(),
        }
      );
      UIManager.setFavoritesButtonLabel(false);
      showingFavorites = false;
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
    showingFavorites = true;
  };

  let selectedCompare = [];
  let isCompareModalOpen = false;

  const handleCompareClick = async function () {
    if (isCompareModalOpen) return;
    const coinIdForAction = UIManager.getDataAttr(this, "id");

    const alreadySelected = selectedCompare.includes(coinIdForAction);

    if (!alreadySelected && selectedCompare.length >= 2) return;

    if (!alreadySelected) {
      selectedCompare.push(coinIdForAction);
    }

    if (selectedCompare.length >= 2) {
      const serviceResult = await ReportsService.getCompareData(
        selectedCompare
      );

      if (!serviceResult?.ok) {
        UIManager.showError(
          "#content",
          ErrorResolver.resolve(serviceResult.code, {
            defaultMessage: ERRORS.API.DEFAULT,
          })
        );
        selectedCompare = [];
        isCompareModalOpen = false;
        return;
      }

      isCompareModalOpen = true;
      UIManager.showCompareModal(serviceResult.coins, {
        missingSymbols: serviceResult.missing,
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
      })

      // [NEWS] News filter buttons inside news page
      .on("click", "#newsGeneralBtn", handleNewsGeneral)
      .on("click", "#newsFavoritesBtn", handleNewsFavorites);
  };

  // [NEWS] Toggle active state for news filter buttons
  const setNewsFilterButtons = (mode) => {
    const generalBtn = $("#newsGeneralBtn");
    const favoritesBtn = $("#newsFavoritesBtn");
    if (!generalBtn.length || !favoritesBtn.length) return;
    if (mode === "general") {
      generalBtn.addClass("active");
      favoritesBtn.removeClass("active");
    } else {
      favoritesBtn.addClass("active");
      generalBtn.removeClass("active");
    }
  };

  // [NEWS] Navigate to news page
  const handleShowNewsPage = () => {
    PagesController.showNewsPage();
  };

  // [NEWS] Load general news
  const handleNewsGeneral = async () => {
    setNewsFilterButtons("general");
    UIManager.updateNewsStatus(CONFIG.NEWS_UI.STATUS_GENERAL);
    UIManager.showNewsLoading(CONFIG.NEWS_UI.LOADING_GENERAL);

    try {
      const { articles, usedFallback } = await NewsService.getGeneralNews();
      if (usedFallback) {
        UIManager.updateNewsStatus(CONFIG.NEWS_UI.STATUS_FALLBACK_GENERAL);
      }
      UIManager.showNews(articles);
    } catch (error) {
      UIManager.showNewsError(CONFIG.NEWS_UI.ERROR_GENERAL);
    }
  };

  // [NEWS] Load favorites news
  const handleNewsFavorites = async () => {
    setNewsFilterButtons("favorites");

    const favorites = AppState.getFavorites();
    if (!favorites.length) {
      UIManager.updateNewsStatus(CONFIG.NEWS_UI.STATUS_NO_FAVORITES);
      UIManager.showNews([], { emptyMessage: CONFIG.NEWS_UI.EMPTY });
      return;
    }

    UIManager.updateNewsStatus(CONFIG.NEWS_UI.STATUS_FAVORITES);
    UIManager.showNewsLoading(CONFIG.NEWS_UI.LOADING_FAVORITES);

    try {
      const { articles, usedFallback } = await NewsService.getNewsForFavorites(
        favorites
      );
      if (usedFallback) {
        UIManager.updateNewsStatus(CONFIG.NEWS_UI.STATUS_FALLBACK_FAVORITES);
      }
      UIManager.showNews(articles);
    } catch (error) {
      UIManager.showNewsError(CONFIG.NEWS_UI.ERROR_FAVORITES);
    }
  };

  const registerNavigation = () => {
    $("#currenciesBtn").on("click", () => {
      PagesController.showCurrenciesPage();
    });

    $("#brandHome").on("click ", () => PagesController.showCurrenciesPage());

    $("#reportsBtn").on("click", () => {
      PagesController.showReportsPage();
    });

    $("#newsBtn").on("click", handleShowNewsPage);

    $("#aboutBtn").on("click", () => {
      PagesController.showAboutPage();
    });
  };

  return {
    registerEvents,
    registerNavigation,
  };
})();
