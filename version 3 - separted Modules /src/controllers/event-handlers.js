import { CoinEvents } from "./coin-events.js";
import { ReportsEvents } from "./reports-events.js";
import { NavigationEvents } from "./navigation-events.js";

// Registers all cross-page document events (coins/reports/nav).

export const EventHandlers = {
  registerEvents: () => {
    CoinEvents.register();
    ReportsEvents.register();
    NavigationEvents.registerDocumentEvents();
  },

  registerNavigation: () => {
    NavigationEvents.registerNavigation();
  },
};
