import { AppState } from "../state/state.js";
import { UIManager } from "../ui/ui-manager.js";
import {showCurrenciesPage,showReportsPage,showAboutPage,} from "../controllers/pages-co
import { showNewsPage, showFavoritesNewsPage } from "./news-controller.js";

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
  $("#currenciesBtn, #brandHome").on("click", showCurrenciesPage);
  $("#reportsBtn").on("click", showReportsPage);
  $("#newsBtn").on("click", showNewsPage);
  $("#newsFavoritesBtn").on("click", showFavoritesNewsPage);
  $("#aboutBtn").on("click", showAboutPage);

  navigationRegistered = true;
};

export const NavigationEvents = {
  registerDocumentEvents,
  registerNavigation,
};
