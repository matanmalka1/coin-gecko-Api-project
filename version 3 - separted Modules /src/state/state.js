import { CONFIG } from "../config/config.js";

export const AppState = (() => {
  let state = {
    allCoins: [],
    selectedReports: [],
    currentView: "currencies",
    searchTerm: "",
    theme: localStorage.getItem("theme") || "light",
  };

  const getState = () => ({ ...state });

  const getAllCoins = () => [...state.allCoins];

  const setAllCoins = (coins) => {
    state.allCoins = coins;
  };

  const getSelectedReports = () => [...state.selectedReports];

  const addReport = (symbol) => {
    const symbolUpper = symbol.toUpperCase();
    if (state.selectedReports.includes(symbolUpper)) return false;
    if (state.selectedReports.length >= CONFIG.REPORTS.MAX_COINS) return false;

    state.selectedReports.push(symbolUpper);
    return true;
  };
  const setTheme = (theme) => {
    state.theme = theme;
    localStorage.setItem("theme", theme);
  };

  const getTheme = () => state.theme;

  const removeReport = (symbol) => {
    const symbolUpper = symbol.toUpperCase();
    state.selectedReports = state.selectedReports.filter(
      (s) => s !== symbolUpper
    );
  };

  const toggleReport = (symbol) => {
    const symbolUpper = symbol.toUpperCase();
    if (state.selectedReports.includes(symbolUpper)) {
      removeReport(symbolUpper);
      return false;
    }
    return addReport(symbolUpper);
  };

  const hasReport = (symbol) => {
    return state.selectedReports.includes(symbol.toUpperCase());
  };

  const isReportsFull = () => {
    return state.selectedReports.length >= CONFIG.REPORTS.MAX_COINS;
  };

  const setCurrentView = (view) => {
    state.currentView = view;
  };

  const getCurrentView = () => state.currentView;

  const setSearchTerm = (term) => {
    state.searchTerm = term;
  };

  const getSearchTerm = () => state.searchTerm;

  return {
    getState,
    getAllCoins,
    setAllCoins,
    getSelectedReports,
    addReport,
    removeReport,
    toggleReport,
    hasReport,
    isReportsFull,
    setCurrentView,
    getCurrentView,
    setSearchTerm,
    getSearchTerm,
    setTheme,
    getTheme,
  };
})();
