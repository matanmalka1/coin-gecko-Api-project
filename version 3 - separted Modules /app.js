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

import { APP_CONFIG } from "./src/config/app-config.js";

let darkmodeInstance = null;

const initDarkmodeWidget = () => {
  if (darkmodeInstance) return darkmodeInstance;
  // ===== DARKMODE WIDGET =====
  darkmodeInstance = new Darkmode({
    bottom: "20px",
    right: "5px",
    left: "unset",
    time: "0.3s",
    mixColor: "#fff",
    backgroundColor: "#f5f5f5",
    buttonColorDark: "#ffffff",
    buttonColorLight: "#000000",
    saveInCookies: true,
    label: "☀️",
    autoMatchOsTheme: true,
  });
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
