import { UIManager } from "../ui/ui-manager.js";
import { UIComponents } from "../ui/ui-components.js";
import { CoinsService } from "../services/coins-service.js";
import { ChartService } from "../services/chart-service.js";
import { AppState } from "../state/state.js";

export const PagesController = (() => {
  const showCurrenciesPage = async () => {
    // ⭐ הוסף async
    ChartService.cleanup();
    AppState.setCurrentView("currencies");

    const pageHTML = UIComponents.currenciesPage();
    UIManager.showPage(pageHTML);

    // ⭐ הצג spinner
    UIManager.showSpinner($("#coinsContainer"), "Loading cryptocurrencies...");

    // ⭐ טען מטבעות
    const result = await CoinsService.loadAllCoins();

    if (result.success) {
      UIManager.displayCoins(result.data, AppState.getSelectedReports());
    } else {
      UIManager.showError($("#coinsContainer"), result.error);
    }
  };

  const showReportsPage = () => {
    ChartService.cleanup();
    AppState.setCurrentView("reports");

    const pageHTML = UIComponents.reportsPage();
    UIManager.showPage(pageHTML);

    ChartService.startLiveChart();
  };

  const showAboutPage = () => {
    ChartService.cleanup();
    AppState.setCurrentView("about");

    const userData = {
      name: "Matan Yehuda Malka",
      image: "images/2.jpeg",
      linkedin: "https://www.linkedin.com/in/matanyehudamalka",
    };

    const pageHTML = UIComponents.aboutPage(userData);
    UIManager.showPage(pageHTML);
  };

  return {
    showCurrenciesPage,
    showReportsPage,
    showAboutPage,
  };
})();
