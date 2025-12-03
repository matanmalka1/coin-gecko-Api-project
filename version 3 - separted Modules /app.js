// src/app.js

import { AppState } from "./src/state/state.js";
import { UIManager } from "./src/ui/ui-manager.js";
import {
  registerEvents,
  registerNavigation,
} from "./src/controllers/event-handlers.js";
import { showCurrenciesPage } from "./src/controllers/pages-controller.js";

$(() => {
  // 1. החלת theme ראשוני מה-LocalStorage (light/dark)
  UIManager.applyTheme(AppState.getTheme());

  // 2. רישום כל האירועים (coins / reports / nav / וכו')
  registerEvents();

  // 3. רישום אירועי ניווט של ה-navbar
  registerNavigation();

  // 4. הצגת דף ברירת המחדל – רשימת המטבעות
  showCurrenciesPage();
});
