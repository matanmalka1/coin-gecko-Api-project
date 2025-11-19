import { CoinsService } from "../services/coins-service.js";
import { ReportsService } from "../services/reports-service.js";
import { UIManager } from "../ui/ui-manager.js";
import { PagesController } from "./pages-controller.js";
import { AppState } from "../state/state.js";

export const EventHandlers = (() => {
  const handleSearch = () => {
    const term = $("#searchInput").val();
    const result = CoinsService.searchCoin(term);

    if (!result.success) {
      const messages = {
        EMPTY_SEARCH: "Please enter a search term.",
        NO_COINS_LOADED: "Please wait for coins to load...",
        NO_RESULTS: `No coins found matching "${result.term}".`,
      };
      UIManager.showError($("#coinsContainer"), messages[result.error]);
      return;
    }

    UIManager.displayCoins(result.data, AppState.getSelectedReports());
    UIManager.showElement("#clearSearchBtn");
  };

  const handleThemeToggle = () => {
    const currentTheme = AppState.getTheme();
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    AppState.setTheme(newTheme);
    UIManager.applyTheme(newTheme);

    const icon = $("#themeToggleBtn i");
    if (newTheme === "dark") {
      icon.removeClass("bi-moon-stars-fill").addClass("bi-sun-fill");
    } else {
      icon.removeClass("bi-sun-fill").addClass("bi-moon-stars-fill");
    }
  };

  const handleCoinToggle = function () {
    const symbol = $(this).data("symbol");
    const isChecked = $(this).prop("checked");

    if (isChecked) {
      const result = ReportsService.toggleCoinSelection(symbol);

      if (!result.success && result.error === "REPORTS_FULL") {
        $(this).prop("checked", false);

        const existingCoins = AppState.getSelectedReports();
        const modal = UIManager.showReplaceModal(symbol, existingCoins);

        $("#confirmReplace").on("click", function () {
          const oldSymbol = $("input[name='coinToReplace']:checked").data(
            "symbol"
          );

          if (oldSymbol) {
            ReportsService.handleReplaceCoin(oldSymbol, symbol);
            CoinsService.refreshCoinsDisplay();
            modal.hide();
          }
        });
      }
    } else {
      ReportsService.toggleCoinSelection(symbol);
    }

    CoinsService.refreshCoinsDisplay();
  };

  const handleClearSearch = () => {
    $("#searchInput").val("");
    UIManager.hideElement("#clearSearchBtn");
    CoinsService.clearSearch();
  };

  const handleFilterReports = () => {
    CoinsService.filterSelectedCoins();
    UIManager.showElement("#clearSearchBtn");
  };
  const handleFavoriteToggle = function () {
    const symbol = $(this).data("symbol");

    if (AppState.isFavorite(symbol)) {
      AppState.removeFavorite(symbol);
    } else {
      AppState.addFavorite(symbol);
    }

    CoinsService.refreshCoinsDisplay();
  };
  // coins-service.js או event-handlers.js
  const handleMoreInfo = async function () {
    const coinId = $(this).data("id");
    const collapseDiv = $(`#collapse-${coinId}`);

    if (collapseDiv.hasClass("show")) {
      UIManager.toggleCollapse(`collapse-${coinId}`, false);
      return;
    }

    collapseDiv.html(
      '<div class="text-center p-2"><div class="spinner-border spinner-border-sm"></div></div>'
    );
    UIManager.toggleCollapse(`collapse-${coinId}`, true);

    try {
      const [coinDetails, chartData] = await Promise.all([
        CoinsService.getCoinDetails(coinId),
        CoinsService.getCoinMarketChart(coinId),
      ]);

      UIManager.showCoinDetails(`collapse-${coinId}`, coinDetails);
      UIManager.drawMiniChart(coinId, chartData);
    } catch (error) {
      UIManager.showError(collapseDiv, error);
    }
  };

  const handleShowFavorites = () => {
    const fav = AppState.getFavorites();
    const all = AppState.getAllCoins();
    const filtered = all.filter((c) => fav.includes(c.symbol.toUpperCase()));
    UIManager.displayCoins(filtered, AppState.getSelectedReports());
  };

  // event-handlers.js - עדכן
  const handleCompareClick = async function () {
    const id = $(this).data("id");
    const $btn = $(this);
    const currentSelection = AppState.getCompareSelection();

    if (currentSelection.includes(id)) {
      AppState.removeFromCompare(id);
      $btn.removeClass("btn-primary").addClass("btn-outline-secondary");
    } else {
      AppState.addToCompare(id);
      $btn.removeClass("btn-outline-secondary").addClass("btn-primary");
    }

    const newSelection = AppState.getCompareSelection();

    $(".compare-btn").prop(
      "disabled",
      newSelection.length >= 2 && !newSelection.includes(id)
    );

    if (newSelection.length === 2) {
      const coins = await ReportsService.getCompareData([...newSelection]);
      UIManager.showCompareModalWithData(coins);

      AppState.clearCompareSelection();
      $(".compare-btn")
        .removeClass("btn-primary")
        .addClass("btn-outline-secondary")
        .prop("disabled", false);
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
        CoinsService.sortCoins($("#sortSelect").val());
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
