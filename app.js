import { CoinEvents } from "./src/events/coin-events.js";
import { ReportsEvents } from "./src/events/reports-events.js";
import {showCurrenciesPage,showReportsPage,showNewsPage,showAboutPage,initStatsBar,} from "./src/controllers/pages-controller.js";

  // ===== DARKMODE WIDGET =====
const initDarkmodeWidget = () => {
  const darkmode = new Darkmode({
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
  darkmode.showWidget();
};

$(() => {
  CoinEvents.register();
  ReportsEvents.register();

  $("#currenciesBtn, #brandHome").on("click", () => showCurrenciesPage());
  $("#reportsBtn").on("click", () => showReportsPage());
  $("#newsBtn").on("click", () => showNewsPage());
  $("#aboutBtn").on("click", () => showAboutPage());

  $(document)
    .on("click", "#newsGeneralBtn", () => {showNewsPage("general")})
    .on("click", "#newsFavoritesBtn", () => {showNewsPage("favorites")});

  showCurrenciesPage();
  initDarkmodeWidget();
  initStatsBar();
});
