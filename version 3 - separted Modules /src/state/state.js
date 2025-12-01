import { CONFIG } from "../config/config.js";
import { Storage } from "../utils/storage.js";
import { normalizeSymbol } from "../utils/general-utils.js";

// Loads persisted reports selection and normalizes/sanitizes the symbols.
const loadStoredReports = () => {
  const stored = Storage.readJSON(CONFIG.STORAGE_KEYS.REPORTS, []) || [];
  if (!Array.isArray(stored)) return [];
  const normalized = stored
    .filter(Boolean)
    .map((symbol) => normalizeSymbol(symbol))
    .filter(Boolean);
  const unique = [...new Set(normalized)];
  return unique.slice(0, CONFIG.REPORTS.MAX_COINS);
};

// Persists the selected reports array into storage.
const persistSelectedReports = (reports) => {
  Storage.writeJSON(
    CONFIG.STORAGE_KEYS.REPORTS,
    Array.isArray(reports) ? reports : []
  );
};

export const AppState = (() => {
  let state = {
    allCoins: [],
    coinsLastUpdated: 0,
    selectedReports: loadStoredReports(),
    showFavoritesOnly: false,
    compareSelection: [],
    compareModalOpen: false,
    loadingCoins: false,
    theme: Storage.readJSON(CONFIG.STORAGE_KEYS.THEME, "light"),
    favorites: (Storage.readJSON(CONFIG.STORAGE_KEYS.FAVORITES, []) || []).map(
      (s) => (typeof s === "string" ? normalizeSymbol(s) : s)
    ),
  };
  // Returns all cached coins (in their current sorted order).
  const getAllCoins = () => [...state.allCoins];

  // Replaces the cached coins list while deduplicating by normalized symbol.
  const setAllCoins = (coins) => {
    if (!Array.isArray(coins)) {
      state.allCoins = [];
      state.coinsLastUpdated = 0;
      return;
    }

    const seen = new Set();
    state.allCoins = coins.reduce((acc, coin) => {
      if (!coin || !coin.id || !coin.symbol) return acc;
      const symbol = normalizeSymbol(coin.symbol);
      if (seen.has(symbol)) return acc;
      seen.add(symbol);
      acc.push({ ...coin, symbol });
      return acc;
    }, []);
    state.coinsLastUpdated = Date.now();
  };

  // Favorites
  // Adds a coin symbol to the favorites list and persists it.
  const addFavorite = (symbol) => {
    const normalized = normalizeSymbol(symbol);
    if (!state.favorites.includes(normalized)) {
      state.favorites.push(normalized);
      Storage.writeJSON(CONFIG.STORAGE_KEYS.FAVORITES, state.favorites);
    }
  };

  // Removes a coin symbol from the persisted favorites list.
  const removeFavorite = (symbol) => {
    state.favorites = state.favorites.filter(
      (favSymbol) => favSymbol !== normalizeSymbol(symbol)
    );
    Storage.writeJSON(CONFIG.STORAGE_KEYS.FAVORITES, state.favorites);
  };

  // Checks if a given symbol is currently favorite.
  const isFavorite = (symbol) => {
    return state.favorites.includes(normalizeSymbol(symbol));
  };

  // Returns the favorites list clone for external use.
  const getFavorites = () => [...state.favorites];

  // Exposes the normalized reports selection used for live charts.
  const getSelectedReports = () => [...state.selectedReports];

  // Exposes the timestamp of the last successful coins fetch.
  const getCoinsLastUpdated = () => state.coinsLastUpdated;

  // Fully replaces the reports selection list and persists it.
  const setSelectedReports = (reports = []) => {
    state.selectedReports = Array.isArray(reports)
      ? reports.map((symbol) => normalizeSymbol(symbol)).filter(Boolean)
      : [];
    persistSelectedReports(state.selectedReports);
  };

  // Adds a symbol to the reports selection (if available).
  const addReport = (symbol) => {
    if (state.selectedReports.includes(normalizeSymbol(symbol))) return false;
    if (state.selectedReports.length >= CONFIG.REPORTS.MAX_COINS) return false;

    state.selectedReports.push(normalizeSymbol(symbol));
    persistSelectedReports(state.selectedReports);
    return true;
  };
  // Theme
  // Persists the UI theme preference (light/dark).
  const setTheme = (theme) => {
    state.theme = theme;
    Storage.writeJSON(CONFIG.STORAGE_KEYS.THEME, theme);
  };

  // Returns the current theme selection.
  const getTheme = () => state.theme;

  // Removes a symbol from the reports list and persists the change.
  const removeReport = (symbol) => {
    const normalized = normalizeSymbol(symbol);
    state.selectedReports = state.selectedReports.filter(
      (s) => s !== normalized
    );
    persistSelectedReports(state.selectedReports);
  };

  // Checks if a given symbol is part of the reports selection.
  const hasReport = (symbol) => {
    const normalized = normalizeSymbol(symbol);
    return state.selectedReports.includes(normalized);
  };

  // Indicates if selected reports already reached the configured maximum.
  const isReportsFull = () => {
    return state.selectedReports.length >= CONFIG.REPORTS.MAX_COINS;
  };

  // Loading indicators
  // Whether a coins fetch request is in-flight.
  const isLoadingCoins = () => state.loadingCoins;

  // Toggles the loading state for coins requests.
  const setLoadingCoins = (value) => {
    state.loadingCoins = !!value;
  };

  // True if only favorites should be shown in the list.
  const isShowingFavoritesOnly = () => state.showFavoritesOnly;

  // Toggles the favorites-only filter.
  const setShowFavoritesOnly = (value) => {
    state.showFavoritesOnly = !!value;
  };

  // Compare modal state
  // Returns the current compare selection array clone.
  const getCompareSelection = () => [...state.compareSelection];

  // Overrides the compare selection with sanitized string identifiers.
  const setCompareSelection = (selection = []) => {
    state.compareSelection = Array.isArray(selection)
      ? selection.map((id) => String(id)).filter(Boolean)
      : [];
  };

  // Clears the compare selection entirely.
  const resetCompareSelection = () => {
    state.compareSelection = [];
  };

  // Indicates if the compare modal is currently open.
  const isCompareModalOpen = () => state.compareModalOpen;

  // Sets the open/closed flag for the compare modal.
  const setCompareModalOpen = (isOpen) => {
    state.compareModalOpen = !!isOpen;
  };

  return {
    getAllCoins,
    setAllCoins,
    getSelectedReports,
    getCoinsLastUpdated,
    addReport,
    removeReport,
    hasReport,
    isReportsFull,
    setTheme,
    getTheme,
    addFavorite,
    removeFavorite,
    isFavorite,
    getFavorites,
    isLoadingCoins,
    setLoadingCoins,
    isShowingFavoritesOnly,
    setShowFavoritesOnly,
    setSelectedReports,
    getCompareSelection,
    setCompareSelection,
    resetCompareSelection,
    isCompareModalOpen,
    setCompareModalOpen,
  };
})();
