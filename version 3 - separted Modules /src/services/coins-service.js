import { coinAPI } from "./api.js";
import { CacheManager } from "./cache.js";
import { AppState } from "../state/state.js";
import { UIManager } from "../ui/ui-manager.js";

export const CoinsService = (() => {
  const loadAllCoins = async () => {
    const container = $("#coinsContainer");

    if (AppState.getAllCoins().length === 0)
      UIManager.showSpinner(container, "Loading coins...");

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
    let coins = AppState.getAllCoins();

    switch (sortType) {
      case "price_desc":
        coins.sort((a, b) => b.current_price - a.current_price);
        break;
      case "price_asc":
        coins.sort((a, b) => a.current_price - b.current_price);
        break;
      case "name_asc":
        coins.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name_desc":
        coins.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "marketcap_desc":
        coins.sort((a, b) => b.market_cap - a.market_cap);
        break;
      case "marketcap_asc":
        coins.sort((a, b) => a.market_cap - b.market_cap);
        break;
      default:
        coins = AppState.getAllCoins();
    }

    UIManager.displayCoins(coins, AppState.getSelectedReports());
  };

  const getCoinDetails = async (coinId) => {
    let cached = CacheManager.getCache(coinId);

    if (cached) return cached;

    const result = await coinAPI.getCoinDetails(coinId);

    if (!result.success) return null;

    const data = result.data;
    CacheManager.setCache(coinId, data);

    return data;
  };

  const searchCoin = (term) => {
    const searchTerm = term.trim().toUpperCase();

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
      (coin) => coin.symbol.toUpperCase() === searchTerm
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

  return {
    loadAllCoins,
    getCoinDetails,
    searchCoin,
    filterSelectedCoins,
    clearSearch,
    sortCoins,
  };
})();
