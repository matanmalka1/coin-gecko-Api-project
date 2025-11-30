import { CoinEvents } from "./coin-events.js";
import { ReportsEvents } from "./reports-events.js";
import { NavigationEvents } from "./navigation-events.js";

export const EventHandlers = (() => {
  // Registers all cross-page document events (coins/reports/nav).
  const registerEvents = () => {
    CoinEvents.register();
    ReportsEvents.register();
    NavigationEvents.registerDocumentEvents();
  };

  // Binds navigation buttons in the navbar/brand.
  const registerNavigation = () => {
    NavigationEvents.registerNavigation();
  };

  return {
    registerEvents,
    registerNavigation,
  };
})();
