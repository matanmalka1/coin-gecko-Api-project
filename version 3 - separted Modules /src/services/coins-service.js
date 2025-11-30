import { coinAPI } from "./api.js";
import { CacheManager } from "./cache.js";
import { AppState } from "../state/state.js";
import { normalizeSymbol } from "../utils/general-utils.js";

export const CoinsService = (() => {
  const sortList = (coins = [], sortType) => {
    const sortedCoins = [...coins];
    switch (sortType) {
      case "price_desc":
        sortedCoins.sort((a, b) => b.current_price - a.current_price);
        break;
      case "price_asc":
        sortedCoins.sort((a, b) => a.current_price - b.current_price);
        break;
      case "volume_high":
        sortedCoins.sort((a, b) => b.total_volume - a.total_volume);
        break;
      case "volume_low":
        sortedCoins.sort((a, b) => a.total_volume - b.total_volume);
        break;
      case "marketcap_desc":
        sortedCoins.sort((a, b) => b.market_cap - a.market_cap);
        break;
      case "marketcap_asc":
        sortedCoins.sort((a, b) => a.market_cap - b.market_cap);
        break;
      default:
        return coins;
    }
    return sortedCoins;
  };

  const loadAllCoins = async () => {
    const result = await coinAPI.fetchMarketData();

    if (!result.ok) {
      return { ok: false, code: "API_ERROR", error: result.error };
    }

    const coins = Array.isArray(result.data) ? result.data : [];
    const filteredCoins = coins
      .filter((coin) => coin && coin.id && coin.symbol)
      .map((coin) => ({
        ...coin,
        symbol: normalizeSymbol(coin.symbol),
      }));

    AppState.setAllCoins(filteredCoins);

    return { ok: true, data: filteredCoins };
  };

  const sortCoins = (sortType) => {
    const coins = AppState.getAllCoins();
    const sorted = sortList(coins, sortType);
    return { ok: true, data: sorted };
  };

  const refreshCoinsDisplay = () => {
    return {
      ok: true,
      data: AppState.getAllCoins(),
      selected: AppState.getSelectedReports(),
      favorites: AppState.getFavorites(),
      compareSelection: AppState.getCompareSelection(),
    };
  };

  const getCoinDetails = async (coinId) => {
    const cacheKey = coinId;
    const cached = CacheManager.getCache(cacheKey);

    if (cached) return { ok: true, data: cached, fromCache: true };

    const result = await coinAPI.fetchCoinDetails(coinId);

    if (!result.ok) {
      console.error("getCoinDetails failed", { coinId, error: result.error });
      return {
        ok: false,
        code: result.code || "API_ERROR",
        error: result.error,
      };
    }

    CacheManager.setCache(cacheKey, result.data);

    return { ok: true, data: result.data, fromCache: false };
  };

  const searchCoin = (term) => {
    const searchTerm = normalizeSymbol(term);

    if (!searchTerm) {
      return { ok: false, code: "EMPTY_TERM" };
    }

    const allCoins = AppState.getAllCoins();

    if (allCoins.length === 0) {
      return { ok: false, code: "LOAD_WAIT" };
    }

    const filteredCoins = allCoins.filter((coin) => coin.symbol === searchTerm);

    if (filteredCoins.length === 0) {
      return { ok: false, code: "NO_MATCH", term: searchTerm };
    }

    AppState.setSearchTerm(searchTerm);

    return {
      ok: true,
      data: filteredCoins,
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
      selectedReports.includes(coin.symbol)
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

    const result = await coinAPI.fetchCoinMarketChart(coinId, 7);

    if (!result.ok) {
      console.error("getCoinMarketChart failed", {
        coinId,
        error: result.error,
      });
      return {
        ok: false,
        code: result.code || "API_ERROR",
        error: result.error,
      };
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
