import { PagesController } from "./src/controllers/pages-controller.js";
import { EventHandlers } from "./src/controllers/event-handlers.js";

$(() => {
  EventHandlers.registerEvents();
  EventHandlers.registerNavigation();

  PagesController.showCurrenciesPage();
});