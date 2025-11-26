import { CONFIG } from "../config/config.js";
import { Storage } from "../utils/storage.js";
import { normalizeSymbol } from "../utils/general-utils.js";

const loadStoredReports = () => {
  const stored =
    Storage.readJSON(CONFIG.STORAGE_KEYS.REPORTS, []) || [];
  if (!Array.isArray(stored)) return [];
  const normalized = stored
    .filter(Boolean)
    .map((symbol) => normalizeSymbol(symbol))
    .filter(Boolean);
  const unique = [...new Set(normalized)];
  return unique.slice(0, CONFIG.REPORTS.MAX_COINS);
};

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
    currentView: "currencies",
    searchTerm: "",
    showFavoritesOnly: false,
    compareSelection: [],
    compareModalOpen: false,
    loadingCoins: false,
    theme: Storage.readJSON(CONFIG.STORAGE_KEYS.THEME, "light"),
    favorites: (Storage.readJSON(CONFIG.STORAGE_KEYS.FAVORITES, []) || []).map(
      (s) => (typeof s === "string" ? s.toUpperCase() : s)
    ),
  };

  // Coins data
  const fetchAllCoins = () => [...state.allCoins];

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
  const addFavorite = (symbol) => {
    const s = normalizeSymbol(symbol);
    if (!state.favorites.includes(s)) {
      state.favorites.push(s);
      Storage.writeJSON(CONFIG.STORAGE_KEYS.FAVORITES, state.favorites);
    }
  };

  const removeFavorite = (symbol) => {
    const s = normalizeSymbol(symbol);
    state.favorites = state.favorites.filter((x) => x !== s);
    Storage.writeJSON(CONFIG.STORAGE_KEYS.FAVORITES, state.favorites);
  };

  const isFavorite = (symbol) => {
    return state.favorites.includes(normalizeSymbol(symbol));
  };

  const getFavorites = () => [...state.favorites];

  // Reports selection (used by live reports/chart)
  const getSelectedReports = () => [...state.selectedReports];
  const getCoinsLastUpdated = () => state.coinsLastUpdated;
  const setCoinsLastUpdated = (timestamp) => {
    state.coinsLastUpdated = typeof timestamp === "number" ? timestamp : Date.now();
  };

  const addReport = (symbol) => {
    const symbolUpper = normalizeSymbol(symbol);
    if (state.selectedReports.includes(symbolUpper)) return false;
    if (state.selectedReports.length >= CONFIG.REPORTS.MAX_COINS) return false;

    state.selectedReports.push(symbolUpper);
    persistSelectedReports(state.selectedReports);
    return true;
  };
  // Theme
  const setTheme = (theme) => {
    state.theme = theme;
    Storage.writeJSON(CONFIG.STORAGE_KEYS.THEME, theme);
  };

  const getTheme = () => state.theme;

  const removeReport = (symbol) => {
    const symbolUpper = normalizeSymbol(symbol);
    state.selectedReports = state.selectedReports.filter(
      (s) => s !== symbolUpper
    );
    persistSelectedReports(state.selectedReports);
  };

  const hasReport = (symbol) => {
    return state.selectedReports.includes(normalizeSymbol(symbol));
  };

  const isReportsFull = () => {
    return state.selectedReports.length >= CONFIG.REPORTS.MAX_COINS;
  };

  // View / filters / search
  const setCurrentView = (view) => {
    state.currentView = view;
  };

  const getCurrentView = () => state.currentView;

  const setSearchTerm = (term) => {
    state.searchTerm = term;
  };

  const getSearchTerm = () => state.searchTerm;

  // Loading indicators
  const isLoadingCoins = () => state.loadingCoins;
  const setLoadingCoins = (value) => {
    state.loadingCoins = Boolean(value);
  };

  const isShowingFavoritesOnly = () => state.showFavoritesOnly;

  const setShowFavoritesOnly = (value) => {
    state.showFavoritesOnly = Boolean(value);
  };

  // Compare modal state
  const getCompareSelection = () => [...state.compareSelection];

  const setCompareSelection = (selection = []) => {
    state.compareSelection = Array.isArray(selection) ? [...selection] : [];
  };

  const resetCompareSelection = () => {
    state.compareSelection = [];
  };

  const isCompareModalOpen = () => state.compareModalOpen;

  const setCompareModalOpen = (isOpen) => {
    state.compareModalOpen = Boolean(isOpen);
  };

  return {
    fetchAllCoins,
    setAllCoins,
    getSelectedReports,
    getCoinsLastUpdated,
    setCoinsLastUpdated,
    addReport,
    removeReport,
    hasReport,
    isReportsFull,
    setCurrentView,
    getCurrentView,
    setSearchTerm,
    getSearchTerm,
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
    getCompareSelection,
    setCompareSelection,
    resetCompareSelection,
    isCompareModalOpen,
    setCompareModalOpen,
  };
})();
