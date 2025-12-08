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

  darkmodeInstance = new Darkmode({
    bottom: APP_CONFIG.DM_BOTTOM,
    right: APP_CONFIG.DM_RIGHT,
    left: APP_CONFIG.DM_LEFT,
    time: APP_CONFIG.DM_TIME,
    mixColor: APP_CONFIG.DM_MIX,
    backgroundColor: APP_CONFIG.DM_BG,
    buttonColorDark: APP_CONFIG.DM_BTN_DARK,
    buttonColorLight: APP_CONFIG.DM_BTN_LIGHT,
    saveInCookies: APP_CONFIG.DM_SAVE_COOKIES,
    label: APP_CONFIG.DM_LABEL,
    autoMatchOsTheme: APP_CONFIG.DM_AUTO_OS,
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
