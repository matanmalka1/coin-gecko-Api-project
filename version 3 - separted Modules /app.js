import { CoinEvents } from "./src/controllers/coin-events.js";
import { ReportsEvents } from "./src/controllers/reports-events.js";
import { NavigationEvents } from "./src/controllers/navigation-events.js";
import {
  showCurrenciesPage,
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
  CoinEvents.register();
  ReportsEvents.register();
  NavigationEvents.registerDocumentEvents();
  NavigationEvents.registerNavigation();

  showCurrenciesPage();

  initDarkmodeWidget();
  initStatsBar();
});
