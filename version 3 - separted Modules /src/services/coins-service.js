import { coinAPI } from "./api.js";
import { CacheManager } from "./cache.js";
import { AppState } from "../state/state.js";
import { UIManager } from "../ui/ui-manager.js";

export const CoinsService = (() => {
  const SORTERS = {
    price_desc: (a, b) => b.current_price - a.current_price,
    price_asc: (a, b) => a.current_price - b.current_price,
    name_asc: (a, b) => a.name.localeCompare(b.name),
    name_desc: (a, b) => b.name.localeCompare(a.name),
    marketcap_desc: (a, b) => b.market_cap - a.market_cap,
    marketcap_asc: (a, b) => a.market_cap - b.market_cap,
  };

  const loadAllCoins = async () => {
    const result = await coinAPI.getMarkets();

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const coins = result.data;
    AppState.setAllCoins(coins);

    return { success: true, data: coins };
  };

  const refreshCoinsDisplay = () => {
    const coins = AppState.getAllCoins();
    const selected = AppState.getSelectedReports();
    UIManager.displayCoins(coins, selected);
  };

  const sortCoins = (sortType) => {
    const coins = [...AppState.getAllCoins()];

    const sorter = SORTERS[sortType];
    if (sorter) {
      coins.sort(sorter);
      AppState.setAllCoins(coins); // ⭐ שמירה חזרה ל-state
      refreshCoinsDisplay(); // ⭐ עדכון תצוגה
    }

    return coins;
  };
  const getAllCoinsForDisplay = () => {
    return AppState.getAllCoins();
  };

  // ✅ נקי - רק משיכת נתונים
  const getCoinDetails = async (coinId) => {
    const cached = CacheManager.getCache(coinId);
    if (cached) return cached;

    const result = await coinAPI.getCoinDetails(coinId);

    if (!result.success) return null;

    CacheManager.setCache(coinId, result.data);
    return result.data;
  };

  const searchCoin = (term) => {
    const searchTerm = term.trim().toLowerCase();

    if (!searchTerm) {
      return { success: false, error: "EMPTY_SEARCH" };
    }

    const allCoins = AppState.getAllCoins();

    if (allCoins.length === 0) {
      return { success: false, error: "NO_COINS_LOADED" };
    }

    const filtered = allCoins.filter(
      (coin) =>
        coin.symbol.toLowerCase().includes(searchTerm) ||
        coin.name.toLowerCase().includes(searchTerm)
    );

    if (filtered.length === 0) {
      return { success: false, error: "NO_RESULTS", term: searchTerm };
    }

    AppState.setSearchTerm(searchTerm);
    return { success: true, data: filtered };
  };

  const filterSelectedCoins = () => {
    const selectedReports = AppState.getSelectedReports();

    if (selectedReports.length === 0) {
      return { success: false, error: "NO_COINS_SELECTED" };
    }

    const allCoins = AppState.getAllCoins();
    const filtered = allCoins.filter((coin) =>
      selectedReports.includes(coin.symbol.toUpperCase())
    );

    if (filtered.length === 0) {
      return { success: false, error: "SELECTED_NOT_FOUND" };
    }

    return { success: true, data: filtered };
  };

  const clearSearch = () => {
    AppState.setSearchTerm("");
    refreshCoinsDisplay(); // ⭐ הוספה
    return AppState.getAllCoins();
  };

  // ✅ נקי - רק משיכת נתונים
  const getCoinMarketChart = async (coinId) => {
    const cacheKey = `${coinId}-chart`;
    const cached = CacheManager.getCache(cacheKey);

    if (cached) return cached;

    const result = await coinAPI.getCoinMarketChart(coinId, 7);

    if (!result.success) return null;

    CacheManager.setCache(cacheKey, result.data);
    return result.data;
  };

  return {
    loadAllCoins,
    getCoinDetails,
    searchCoin,
    filterSelectedCoins,
    clearSearch,
    sortCoins,
    getAllCoinsForDisplay,
    getCoinMarketChart,
    refreshCoinsDisplay,
  };
})();
