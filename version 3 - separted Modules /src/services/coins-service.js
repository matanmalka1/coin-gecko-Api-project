import { coinAPI } from "./api.js";
import { CacheManager } from "./cache.js";
import { AppState } from "../state/state.js";

// Services should not touch UI/DOM; return data/status only.

const normalizeCoinSymbols = (coins = []) =>
  coins.map((coin) => ({
    ...coin,
    symbol:
      typeof coin.symbol === "string" ? coin.symbol.toUpperCase() : coin.symbol,
  }));

export const CoinsService = (() => {
  const loadAllCoins = async () => {
    const result = await coinAPI.getMarkets();

    if (!result.ok) {
      return { ok: false, code: "API_ERROR", error: result.error };
    }

    const coins = normalizeCoinSymbols(result.data);
    AppState.setAllCoins(coins);

    return { ok: true, data: coins };
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
      case "volume_high":
        coins.sort((a, b) => b.total_volume - a.total_volume);
        break;
      case "volume_low":
        coins.sort((a, b) => a.total_volume - b.total_volume);
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

    return { ok: true, data: coins };
  };

  const refreshCoinsDisplay = () => {
    return {
      ok: true,
      data: AppState.getAllCoins(),
      selected: AppState.getSelectedReports(),
      favorites: AppState.getFavorites(),
    };
  };

  const getCoinDetails = async (coinId) => {
    const cacheKey = coinId;
    const cached = CacheManager.getCache(cacheKey);

    if (cached) return { ok: true, data: cached, fromCache: true };

    const result = await coinAPI.getCoinDetails(coinId);

    if (!result.ok) {
      console.error("getCoinDetails failed", { coinId, error: result.error });
      return { ok: false, code: result.code || "API_ERROR", error: result.error };
    }

    CacheManager.setCache(cacheKey, result.data);

    return { ok: true, data: result.data, fromCache: false };
  };

  const searchCoin = (term) => {
    const searchTerm = term.trim().toUpperCase();

    if (!searchTerm) {
      return { ok: false, code: "EMPTY_TERM" };
    }

    const allCoins = AppState.getAllCoins();

    if (allCoins.length === 0) {
      return { ok: false, code: "LOAD_WAIT" };
    }

    const filtered = allCoins.filter(
      (coin) => coin.symbol.toUpperCase() === searchTerm
    );

    if (filtered.length === 0) {
      return { ok: false, code: "NO_MATCH", term: searchTerm };
    }

    AppState.setSearchTerm(searchTerm);

    return {
      ok: true,
      data: filtered,
      selected: AppState.getSelectedReports(),
      favorites: AppState.getFavorites(),
    };
  };

  const filterSelectedCoins = () => {
    const selectedReports = AppState.getSelectedReports();

    if (selectedReports.length === 0) {
      return { ok: false, code: "NONE_SELECTED" };
    }

    const allCoins = AppState.getAllCoins();
    const filtered = allCoins.filter((coin) =>
      selectedReports.includes(coin.symbol.toUpperCase())
    );

    if (filtered.length === 0) {
      return { ok: false, code: "NOT_FOUND" };
    }

    return {
      ok: true,
      data: filtered,
      selected: selectedReports,
      favorites: AppState.getFavorites(),
    };
  };

  const clearSearch = () => {
    AppState.setSearchTerm("");

    return {
      ok: true,
      data: AppState.getAllCoins(),
      selected: AppState.getSelectedReports(),
      favorites: AppState.getFavorites(),
    };
  };

  const getCoinMarketChart = async (coinId) => {
    const cacheKey = `${coinId}-chart`;
    const cached = CacheManager.getCache(cacheKey);

    if (cached) return { ok: true, data: cached, fromCache: true };

    const result = await coinAPI.getCoinMarketChart(coinId, 7);

    if (!result.ok) {
      console.error("getCoinMarketChart failed", { coinId, error: result.error });
      return { ok: false, code: result.code || "API_ERROR", error: result.error };
    }

    CacheManager.setCache(cacheKey, result.data);

    return { ok: true, data: result.data, fromCache: false };
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
