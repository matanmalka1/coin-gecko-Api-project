import { setupCoinsEvents } from "./src/events/coin-events.js";
import { setupReportsEvents } from "./src/events/reports-events.js";
import { showCurrenciesPage,initStatsBar,setupPagesEvents } from "./src/events/pages-events.js";

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
  showCurrenciesPage();
  initDarkmodeWidget();
  initStatsBar();
  setupCoinsEvents();
  setupReportsEvents();
  setupPagesEvents();
});
