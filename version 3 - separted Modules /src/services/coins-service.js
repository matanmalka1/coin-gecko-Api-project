import { coinAPI } from "./api.js";
import { CacheManager } from "./cache.js";
import { AppState } from "../state/state.js";
import { normalizeSymbol } from "../utils/general-utils.js";
import { API_CONFIG } from "../config/api-cache-config.js";
import { UI_CONFIG } from "../config/ui-config.js";

const { SEARCH: { MIN_LENGTH = 1, MAX_LENGTH = 50, ALLOWED_PATTERN } = {} } =
  UI_CONFIG;
const { CHART_HISTORY_DAYS } = API_CONFIG;

const stateMeta = () => ({
  selected: AppState.getSelectedReports(),
  favorites: AppState.getFavorites(),
});

const sortFunctions = {
  price_desc: (a, b) => b.current_price - a.current_price,
  price_asc: (a, b) => a.current_price - b.current_price,
  volume_high: (a, b) => b.total_volume - a.total_volume,
  volume_low: (a, b) => a.total_volume - b.total_volume,
  marketcap_desc: (a, b) => b.market_cap - a.market_cap,
  marketcap_asc: (a, b) => a.market_cap - b.market_cap,
};

const fetchWithCache = async (cacheKey, fetcher) => {
  const cached = CacheManager.getCache(cacheKey);
  if (cached) return { ok: true, data: cached, fromCache: true };

  const { ok, data, code, error, status } = await fetcher();

  if (!ok) {
    return { ok: false, code: code || "API_ERROR", error, status };
  }
  CacheManager.setCache(cacheKey, normalized);
  return { ok: true, data, fromCache: false };
};

// Fetches full market list and stores it in AppState.
const loadAllCoins = async () => {
  const result = await coinAPI.fetchMarketData();

  if (!result.ok) {
    return {
      ok: false,
      code: "API_ERROR",
      error: result.error,
      status: result.status,
    };
  }

  const filteredCoins = (Array.isArray(result.data) ? result.data : [])
    .filter((coin) => coin && coin.id && coin.symbol)
    .map((coin) => ({
      ...coin,
      symbol: normalizeSymbol(coin.symbol),
    }));

  AppState.setAllCoins(filteredCoins);

  return { ok: true, data: filteredCoins };
};

// Sorts coins according to sortType and persists the new order.
const sortCoins = (sortType) => {
  const coins = AppState.getAllCoins();
  const sorter = sortFunctions[sortType];
  const sorted = sorter ? [...coins].sort(sorter) : coins;
  AppState.setAllCoins(sorted, { updateTimestamp: false });

  return {
    ok: true,
    data: AppState.getAllCoins(),
    ...stateMeta(),
  };
};

// Retrieves detailed information for a single coin (with cache).
const getCoinDetails = (coinId) =>
  fetchWithCache(coinId, () => coinAPI.fetchCoinDetails(coinId));

// Performs a fuzzy search by symbol/name on the in-memory coins list.
const searchCoin = (term) => {
  const trimmed = (term || "").trim();

  const errors = {
    empty: !trimmed,
    tooShort: trimmed.length < MIN_LENGTH,
    tooLong: trimmed.length > MAX_LENGTH,
    invalid: ALLOWED_PATTERN && !ALLOWED_PATTERN.test(trimmed),
  };

  if (errors.empty) return { ok: false, code: "EMPTY_TERM" };
  if (errors.tooShort)
    return { ok: false, code: "TERM_TOO_SHORT", min: MIN_LENGTH };
  if (errors.tooLong)
    return { ok: false, code: "TERM_TOO_LONG", limit: MAX_LENGTH };
  if (errors.invalid) return { ok: false, code: "INVALID_TERM" };

  const normalizedTerm = trimmed.replace(/\s+/g, " ");
  const searchTerm = normalizedTerm.toLowerCase();
  const allCoins = AppState.getAllCoins();

  if (!allCoins.length) {
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

  return {
    ok: true,
    data: filteredCoins,
    ...stateMeta(),
  };
};

// Returns the coins that are selected for reports, cleaning stale symbols.
const filterSelectedCoins = () => {
  const selectedReports = AppState.getSelectedReports();
  if (!selectedReports.length) {
    return { ok: false, code: "NONE_SELECTED" };
  }

  const allCoins = AppState.getAllCoins();
  const filtered = allCoins.filter((coin) =>
    selectedReports.includes(coin.symbol)
  );

  if (!filtered.length) {
    AppState.setSelectedReports([]);
    return { ok: false, code: "NOT_FOUND" };
  }

  const validSymbols = new Set(filtered.map((coin) => coin.symbol));
  const cleanedSelection = selectedReports.filter((symbol) =>
    validSymbols.has(symbol)
  );

  AppState.setSelectedReports(cleanedSelection);

  return {
    ok: true,
    data: filtered,
    ...stateMeta(),
  };
};

// Resets the stored search term and returns the full coins list.
const clearSearch = () => ({
  ok: true,
  data: AppState.getAllCoins(),
  ...stateMeta(),
});

// Fetches historical price chart data for a coin (with caching).
const getCoinMarketChart = (coinId) =>
  fetchWithCache(`chart:${coinId}`, () =>
    coinAPI.fetchCoinMarketChart(coinId, CHART_HISTORY_DAYS)
  );

export const CoinsService = {
  loadAllCoins,
  getCoinDetails,
  searchCoin,
  filterSelectedCoins,
  clearSearch,
  sortCoins,
  getCoinMarketChart,
};
