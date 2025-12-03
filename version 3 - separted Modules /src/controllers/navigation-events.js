import { AppState } from "../state/state.js";
import { UIManager } from "../ui/ui-manager.js";
import { PagesController } from "./pages-controller.js";
import { NewsController } from "./news-controller.js";

let documentEventsRegistered = false;
let navigationRegistered = false;

// Handles toggling between light and dark themes.
const handleThemeToggle = () => {
  const nextTheme = AppState.getTheme() === "light" ? "dark" : "light";
  AppState.setTheme(nextTheme);
  UIManager.applyTheme(nextTheme);
};

// Registers document-level handlers (theme/news buttons) once.
const registerDocumentEvents = () => {
  if (documentEventsRegistered) return;

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
  documentEventsRegistered = true;
};

// Binds navbar navigation buttons to their respective pages.
const registerNavigation = () => {
  if (navigationRegistered) return;

  $("#currenciesBtn, #brandHome").on("click", () => {
    PagesController.showCurrenciesPage();
  });

  $("#reportsBtn").on("click", () => {
    PagesController.showReportsPage();
  });

  $("#newsBtn").on("click", () => {
    NewsController.showNewsPage();
  });

  $("#aboutBtn").on("click", () => {
    PagesController.showAboutPage();
  });
  navigationRegistered = true;
};

export const NavigationEvents = {
  registerDocumentEvents,
  registerNavigation,
};
