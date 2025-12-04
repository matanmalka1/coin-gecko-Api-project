import {
  showCurrenciesPage,
  showReportsPage,
  showAboutPage,
} from "./pages-controller.js";
import { showNewsPage, showFavoritesNewsPage } from "./news-controller.js";

let documentEventsRegistered = false;
let navigationRegistered = false;

// Registers document-level handlers (news buttons) once.
const registerDocumentEvents = () => {
  if (documentEventsRegistered) return;

  $(document)
    .on("click", "#newsGeneralBtn", (e) => {
      e.preventDefault();
      showNewsPage();
    })
    .on("click", "#newsFavoritesBtn", (e) => {
      e.preventDefault();
      showFavoritesNewsPage();
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
