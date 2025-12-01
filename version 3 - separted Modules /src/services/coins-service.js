import { coinAPI } from "./api.js";
import { CacheManager } from "./cache.js";
import { AppState } from "../state/state.js";
import { normalizeSymbol } from "../utils/general-utils.js";
import { normalizeCoinMarketData } from "./data-normalizer.js";
import { CONFIG } from "../config/config.js";

export const CoinsService = (() => {
  const SEARCH_SETTINGS = CONFIG.SEARCH || {};
  // Helper for sorting coins array according to sortType.
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

  // Fetches full market list and stores it in AppState.
  const loadAllCoins = async () => {
    const result = await coinAPI.fetchMarketData();

    if (!result.ok) {
      return { ok: false, code: "API_ERROR", error: result.error };
    }

    const coins = Array.isArray(result.data) ? result.data : [];
    const filteredCoins = coins
      .filter((coin) => coin && coin.id && coin.symbol)
      .map((coin) => {
        const withNormalizedSymbol = {
          ...coin,
          symbol: normalizeSymbol(coin.symbol),
        };
        return normalizeCoinMarketData(withNormalizedSymbol);
      });

    AppState.setAllCoins(filteredCoins);

    return { ok: true, data: filteredCoins };
  };

  // Sorts coins according to sortType and persists the new order.
  const sortCoins = (sortType) => {
    const coins = AppState.getAllCoins();
    const sorted = sortList(coins, sortType);
    AppState.setAllCoins(sorted);
    return {
      ok: true,
      data: AppState.getAllCoins(),
      selected: AppState.getSelectedReports(),
      favorites: AppState.getFavorites(),
    };
  };

  // Retrieves detailed information for a single coin (with cache).
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

    const normalizedData = normalizeCoinMarketData(result.data);
    CacheManager.setCache(cacheKey, normalizedData);

    return { ok: true, data: normalizedData, fromCache: false };
  };

  // Performs a fuzzy search by symbol/name on the in-memory coins list.
  const searchCoin = (term) => {
    const trimmedTerm = typeof term === "string" ? term.trim() : "";
    if (!trimmedTerm) {
      return { ok: false, code: "EMPTY_TERM" };
    }

    const minLength = SEARCH_SETTINGS.MIN_LENGTH ?? 1;
    const maxLength = SEARCH_SETTINGS.MAX_LENGTH ?? 50;
    const allowedPattern = SEARCH_SETTINGS.ALLOWED_PATTERN;

    if (trimmedTerm.length < minLength) {
      return { ok: false, code: "TERM_TOO_SHORT", min: minLength };
    }

    if (trimmedTerm.length > maxLength) {
      return { ok: false, code: "TERM_TOO_LONG", limit: maxLength };
    }

    if (allowedPattern && !allowedPattern.test(trimmedTerm)) {
      return { ok: false, code: "INVALID_TERM" };
    }

    const normalizedTerm = trimmedTerm.replace(/\s+/g, " ");
    const searchTerm = normalizedTerm.toLowerCase();
    const allCoins = AppState.getAllCoins();

    if (allCoins.length === 0) {
      return { ok: false, code: "LOAD_WAIT" };
    }

    const filteredCoins = allCoins.filter((coin = {}) => {
      const symbolMatch =
        coin.symbol?.toLowerCase().includes(searchTerm) ?? false;
      const nameMatch = coin.name?.toLowerCase().includes(searchTerm) ?? false;
      return symbolMatch || nameMatch;
    });

    if (!filteredCoins.length) {
      return { ok: false, code: "NO_MATCH", term: normalizedTerm };
    }

    AppState.setSearchTerm(normalizedTerm);

    return {
      ok: true,
      data: filteredCoins,
      selected: AppState.getSelectedReports(),
      favorites: AppState.getFavorites(),
    };
  };

  // Returns the coins that are selected for reports, cleaning stale symbols.
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
      AppState.setSelectedReports([]);
      return { ok: false, code: "NOT_FOUND" };
    }

    const cleanedSelection = selectedReports.filter((symbol) =>
      filtered.some((coin) => coin.symbol === symbol)
    );
    AppState.setSelectedReports(cleanedSelection);

    return {
      ok: true,
      data: filtered,
      selected: cleanedSelection,
      favorites: AppState.getFavorites(),
    };
  };

  // Resets the stored search term and returns the full coins list.
  const clearSearch = () => {
    AppState.setSearchTerm("");

    return {
      ok: true,
      data: AppState.getAllCoins(),
      selected: AppState.getSelectedReports(),
      favorites: AppState.getFavorites(),
    };
  };

  // Fetches historical price chart data for a coin (with caching).
  const getCoinMarketChart = async (coinId) => {
    const cacheKey = `chart:${coinId}`;
    const cached = CacheManager.getCache(cacheKey);

    if (cached) return { ok: true, data: cached, fromCache: true };

    const result = await coinAPI.fetchCoinMarketChart(
      coinId,
      CONFIG.API.CHART_HISTORY_DAYS
    );

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
    getCoinMarketChart,
  };
})();
