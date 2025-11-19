import { UIManager } from "../ui/ui-manager.js";
import { UIComponents } from "../ui/ui-components.js";
import { CoinsService } from "../services/coins-service.js";
import { ChartService } from "../services/chart-service.js";
import { AppState } from "../state/state.js";

export const PagesController = (() => {
  const showCurrenciesPage = () => {
    ChartService.cleanup();
    AppState.setCurrentView("currencies");

    const pageHTML = UIComponents.currenciesPage();
    UIManager.showPage(pageHTML);

    CoinsService.loadAllCoins();
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
