import { CoinsService } from "../services/coins-service.js";
import { ReportsService } from "../services/reports-service.js";
import { UIManager } from "../ui/ui-manager.js";
import { PagesController } from "./pages-controller.js";
import { AppState } from "../state/state.js";

export const EventHandlers = (() => {
  const handleSearch = () => {
    const term = $("#searchInput").val();
    CoinsService.searchCoin(term);
    UIManager.showElement("#clearSearchBtn");
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
      const data = await CoinsService.getCoinDetails(coinId);
      UIManager.showCoinDetails(`collapse-${coinId}`, data);
    } catch (error) {
      UIManager.showError(collapseDiv, error);
    }
  };

  const handleCoinToggle = function () {
    const symbol = $(this).data("symbol");
    ReportsService.toggleCoinSelection(symbol);
  };

  const handleThemeToggle = () => {
    const current = AppState.getTheme();
    const next = current === "light" ? "dark" : "light";

    AppState.setTheme(next);
    UIManager.applyTheme(next);
  };

  const handleShowFavorites = () => {
    const fav = AppState.getFavorites();
    const all = AppState.getAllCoins();
    const filtered = all.filter((c) => fav.includes(c.symbol.toUpperCase()));
    UIManager.displayCoins(filtered, AppState.getSelectedReports());
  };

  let selectedCompare = [];

  const handleCompareClick = function () {
    const id = $(this).data("id");
    const $btn = $(this);

    if (selectedCompare.includes(id)) {
      // הסר מהבחירה
      selectedCompare = selectedCompare.filter((x) => x !== id);
      $btn.removeClass("btn-primary").addClass("btn-outline-secondary");
    } else {
      selectedCompare.push(id);
      $btn.removeClass("btn-outline-secondary").addClass("btn-primary");
    }

    // עדכן כפתורים
    $(".compare-btn").prop(
      "disabled",
      selectedCompare.length >= 2 && !selectedCompare.includes(id)
    );

    if (selectedCompare.length === 2) {
      UIManager.openCompareModal([...selectedCompare]);

      
      selectedCompare = [];
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
