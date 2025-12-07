import { CoinEvents } from "./src/events/coin-events.js";
import { ReportsEvents } from "./src/events/reports-events.js";
import {
  showCurrenciesPage,
  showReportsPage,
  showNewsPage,
  showFavoritesNewsPage,
  showAboutPage,
  initStatsBar,
} from "./src/controllers/pages-controller.js";
import { UI_CONFIG } from "./src/config/ui-config.js";

let darkmodeInstance = null;

const initDarkmodeWidget = () => {
  if (darkmodeInstance) return darkmodeInstance;

  darkmodeInstance = new Darkmode(UI_CONFIG.DARKMODE);
  darkmodeInstance.showWidget();

  return darkmodeInstance;
};

$(() => {
  // ===== EVENT HANDLERS REGISTRATION =====
  CoinEvents.register();
  ReportsEvents.register();

  // ===== NAVIGATION - Navbar =====
  $("#currenciesBtn, #brandHome").on("click", () => showCurrenciesPage());
  $("#reportsBtn").on("click", () => showReportsPage());
  $("#newsBtn").on("click", () => showNewsPage());
  $("#aboutBtn").on("click", () => showAboutPage());

  // ===== NEWS FILTERS (event delegation News) =====
  $(document)
    .on("click", "#newsGeneralBtn", (e) => {
      e.preventDefault();
      showNewsPage();
    })
    .on("click", "#newsFavoritesBtn", (e) => {
      e.preventDefault();
      showFavoritesNewsPage();
    });

  // ===== INITIALIZATION =====
  showCurrenciesPage();
  initDarkmodeWidget();
  initStatsBar();
});
