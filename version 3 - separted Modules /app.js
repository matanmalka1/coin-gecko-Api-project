import { registerEvents, registerNavigation } from "./src/controllers/event-handlers.js";
import { showCurrenciesPage, initStatsBar } from "./src/controllers/pages-controller.js";
import { UI_CONFIG } from "./src/config/ui-config.js";

let darkmodeInstance = null;

const initDarkmodeWidget = () => {
  if (darkmodeInstance) return darkmodeInstance;

  darkmodeInstance = new Darkmode(UI_CONFIG.DARKMODE);
  darkmodeInstance.showWidget();

  return darkmodeInstance;
};

$(() => {
  registerEvents();
  registerNavigation();
  showCurrenciesPage(); 

  initDarkmodeWidget();
  initStatsBar();    
});