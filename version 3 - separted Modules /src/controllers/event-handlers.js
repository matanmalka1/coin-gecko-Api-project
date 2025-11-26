import { CoinEvents } from "./coin-events.js";
import { ReportsEvents } from "./reports-events.js";
import { NavigationEvents } from "./navigation-events.js";

export const EventHandlers = (() => {
  const registerEvents = () => {
    CoinEvents.register();
    ReportsEvents.register();
    NavigationEvents.registerDocumentEvents();
  };

  const registerNavigation = () => {
    NavigationEvents.registerNavigation();
  };

  return {
    registerEvents,
    registerNavigation,
  };
})();
