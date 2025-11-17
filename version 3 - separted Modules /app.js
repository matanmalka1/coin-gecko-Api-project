import { PagesController } from "./src/controllers/pages-controller.js";
import { EventHandlers } from "./src/controllers/event-handlers.js";
import { AppState } from "./src/state/state.js";
import { UIManager } from "./src/ui/ui-manager.js";

$(() => {
  UIManager.applyTheme(AppState.getTheme());

  EventHandlers.registerEvents();
  EventHandlers.registerNavigation();

  PagesController.showCurrenciesPage();
});
