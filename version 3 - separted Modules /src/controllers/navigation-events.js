import { AppState } from "../state/state.js";
import { UIManager } from "../ui/ui-manager.js";
import { PagesController } from "./pages-controller.js";
import { NewsController } from "./news-controller.js";

const NavigationEvents = (() => {
  const handleThemeToggle = () => {
    const currentTheme = AppState.getTheme();
    const nextTheme = currentTheme === "light" ? "dark" : "light";
    AppState.setTheme(nextTheme);
    UIManager.applyTheme(nextTheme);
  };

  const registerDocumentEvents = () => {
    $(document)
      .on("click", "#themeToggleBtn", handleThemeToggle)
      .on("click", "#newsGeneralBtn", (e) => {
        e.preventDefault();
        NewsController.loadGeneral();
      })
      .on("click", "#newsFavoritesBtn", (e) => {
        e.preventDefault();
        NewsController.loadFavorites();
      });
  };

  const registerNavigation = () => {
    $("#currenciesBtn").on("click", () => {
      PagesController.showCurrenciesPage();
    });

    $("#brandHome").on("click", () => PagesController.showCurrenciesPage());

    $("#reportsBtn").on("click", () => {
      PagesController.showReportsPage();
    });

    $("#newsBtn").on("click", () => {
      NewsController.showNewsPage();
    });

    $("#aboutBtn").on("click", () => {
      PagesController.showAboutPage();
    });
  };

  return {
    registerDocumentEvents,
    registerNavigation,
  };
})();

export { NavigationEvents };
