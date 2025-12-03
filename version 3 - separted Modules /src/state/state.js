import { CACHE_CONFIG } from "../config/api-cache-config.js";
import { UI_CONFIG } from "../config/ui-config.js";
import { Storage } from "../utils/storage.js";
import { normalizeSymbol } from "../utils/general-utils.js";

const addUnique = (list, value) =>
  list.includes(value) ? list : [...list, value];

const removeItem = (list, value) => list.filter((item) => item !== value);

const { STORAGE_KEYS } = CACHE_CONFIG;
const { MAX_COINS } = UI_CONFIG.REPORTS;

const loadStoredSymbols = (key, maxItems = null) => {
  const stored = Storage.readJSON(key, []) || [];
  if (!Array.isArray(stored)) return [];

  const normalized = stored
    .filter(Boolean)
    .map(normalizeSymbol)
    .filter(Boolean);

  const unique = [...new Set(normalized)];
  return maxItems ? unique.slice(0, maxItems) : unique;
};

let state = {
  allCoins: [],
  coinsLastUpdated: 0,
  selectedReports: loadStoredSymbols(STORAGE_KEYS.REPORTS, MAX_COINS),
  favorites: loadStoredSymbols(STORAGE_KEYS.FAVORITES),
  showFavoritesOnly: false,
  compareSelection: [],
  compareModalOpen: false,
  loadingCoins: false,
  theme: Storage.readJSON(STORAGE_KEYS.THEME, "light"),
};

// ===== Coins =====
const getAllCoins = () => [...state.allCoins];

const setAllCoins = (coins, { updateTimestamp = true } = {}) => {
  if (!Array.isArray(coins)) {
    state.allCoins = [];
    if (updateTimestamp) state.coinsLastUpdated = 0;
    return;
  }

  const seen = new Set();
  state.allCoins = coins.reduce((acc, coin) => {
    if (!coin?.id || !coin?.symbol) return acc;

    const symbol = normalizeSymbol(coin.symbol);
    if (!symbol || seen.has(symbol)) return acc;

    seen.add(symbol);
    acc.push({ ...coin, symbol });
    return acc;
  }, []);

  if (updateTimestamp) {
    state.coinsLastUpdated = Date.now();
  }
};

const getCoinsLastUpdated = () => state.coinsLastUpdated;

// ===== Reports =====
const getSelectedReports = () => [...state.selectedReports];

const setSelectedReports = (reports = []) => {
  state.selectedReports = Array.isArray(reports)
    ? reports
        .filter(Boolean)
        .map(normalizeSymbol)
        .filter(Boolean)
        .slice(0, MAX_COINS)
    : [];

  Storage.writeJSON(STORAGE_KEYS.REPORTS, state.selectedReports);
};
const addReport = (symbol) => {
  const normalized = normalizeSymbol(symbol);
  if (!normalized) return;

  state.reports = addUnique(state.reports, normalized);
  Storage.writeJSON(STORAGE_KEYS.REPORTS, state.reports);
};

const removeReport = (symbol) => {
  const normalized = normalizeSymbol(symbol);
  if (!normalized) return;

  state.reports = removeItem(state.reports, normalized);
  Storage.writeJSON(STORAGE_KEYS.REPORTS, state.reports);
};

const hasReport = (symbol) =>
  !!symbol && state.selectedReports.includes(symbol);

const isReportsFull = () => state.selectedReports.length >= MAX_COINS;

// ===== Favorites =====
const addFavorite = (symbol) => {
  const normalized = normalizeSymbol(symbol);
  if (!normalized) return;

  state.favorites = addUnique(state.favorites, normalized);
  Storage.writeJSON(STORAGE_KEYS.FAVORITES, state.favorites);
};

const removeFavorite = (symbol) => {
  const normalized = normalizeSymbol(symbol);
  if (!normalized) return;

  state.favorites = removeItem(state.favorites, normalized);
  Storage.writeJSON(STORAGE_KEYS.FAVORITES, state.favorites);
};

const isFavorite = (symbol) => !!symbol && state.favorites.includes(symbol);

const getFavorites = () => [...state.favorites];

// ===== Theme =====
const setTheme = (theme) => {
  state.theme = theme;
  Storage.writeJSON(STORAGE_KEYS.THEME, theme);
};

const getTheme = () => state.theme;

// ===== Loading / filters =====
const isLoadingCoins = () => state.loadingCoins;
const setLoadingCoins = (value) => {
  state.loadingCoins = !!value;
};

const isShowingFavoritesOnly = () => state.showFavoritesOnly;
const setShowFavoritesOnly = (value) => {
  state.showFavoritesOnly = !!value;
};

// ===== Compare =====
const getCompareSelection = () => [...state.compareSelection];

const setCompareSelection = (selection = []) => {
  state.compareSelection = Array.isArray(selection)
    ? selection.map(String).filter(Boolean)
    : [];
};

const resetCompareSelection = () => {
  state.compareSelection = [];
};

const isCompareModalOpen = () => state.compareModalOpen;
const setCompareModalOpen = (isOpen) => {
  state.compareModalOpen = !!isOpen;
};

export const AppState = {
  getAllCoins,
  setAllCoins,
  getCoinsLastUpdated,
  getSelectedReports,
  setSelectedReports,
  addReport,
  removeReport,
  hasReport,
  isReportsFull,
  addFavorite,
  removeFavorite,
  isFavorite,
  getFavorites,
  setTheme,
  getTheme,
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
