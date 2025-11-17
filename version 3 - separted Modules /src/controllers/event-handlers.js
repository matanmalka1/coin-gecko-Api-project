import { CoinsService } from "../services/coins-service.js";
import { ReportsService } from "./reports-service.js";
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
  
  const registerEvents = () => {
    $(document)
      .on("click", "#themeToggleBtn", handleThemeToggle)

      .on("click", "#searchBtn", handleSearch)

      .on("keypress", "#searchInput", (e) => {
        if (e.which === 13) handleSearch();
      })

      .on("click", "#clearSearchBtn", handleClearSearch)

      .on("click", "#filterReportsBtn", handleFilterReports)

      .on("click", ".more-info", handleMoreInfo)

      .on("change", ".coin-toggle", handleCoinToggle)

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
