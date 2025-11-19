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
    const container = $("#coinsContainer");

    if (AppState.getAllCoins().length === 0) {
      UIManager.showSpinner(container, "Loading coins...");
    }

    const result = await coinAPI.getMarkets();

    if (!result.success) {
      UIManager.showError(container, result.error);
      return;
    }

    const coins = result.data;
    AppState.setAllCoins(coins);

    UIManager.displayCoins(coins, AppState.getSelectedReports());
  };


  const sortCoins = (sortType) => {
    const coins = [...AppState.getAllCoins()]; 

    const sorter = SORTERS[sortType];
    if (sorter) {
      coins.sort(sorter);
    }

    UIManager.displayCoins(coins, AppState.getSelectedReports());
  };

  const refreshCoinsDisplay = () => {
    const allCoins = AppState.getAllCoins();
    UIManager.displayCoins(allCoins, AppState.getSelectedReports());
  };


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
      UIManager.showError($("#coinsContainer"), "Please enter a search term.");
      return;
    }

    const allCoins = AppState.getAllCoins();

    if (allCoins.length === 0) {
      UIManager.showError(
        $("#coinsContainer"),
        "Please wait for coins to load..."
      );
      return;
    }

    const filtered = allCoins.filter(
      (coin) =>
        coin.symbol.toLowerCase().includes(searchTerm) ||
        coin.name.toLowerCase().includes(searchTerm)
    );

    if (filtered.length === 0) {
      UIManager.showError(
        $("#coinsContainer"),
        `No coins found matching "${searchTerm}".`
      );
      return;
    }

    AppState.setSearchTerm(searchTerm);
    UIManager.displayCoins(filtered, AppState.getSelectedReports());
  };

  const filterSelectedCoins = () => {
    const selectedReports = AppState.getSelectedReports();

    if (selectedReports.length === 0) {
      UIManager.showError(
        $("#coinsContainer"),
        "No coins selected. Please choose coins first."
      );
      return;
    }

    const allCoins = AppState.getAllCoins();
    const filtered = allCoins.filter((coin) =>
      selectedReports.includes(coin.symbol.toUpperCase())
    );

    if (filtered.length === 0) {
      UIManager.showError(
        $("#coinsContainer"),
        "Selected coins not found. Try refreshing data."
      );
      return;
    }

    UIManager.displayCoins(filtered, selectedReports);
  };

  const clearSearch = () => {
    AppState.setSearchTerm("");
    UIManager.displayCoins(
      AppState.getAllCoins(),
      AppState.getSelectedReports()
    );
  };

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
    refreshCoinsDisplay,
    getCoinMarketChart,
  };
})();
