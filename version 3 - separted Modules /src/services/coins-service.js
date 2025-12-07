import { coinAPI } from "./api.js";
import { CacheManager } from "./storage-manager.js";
import { AppState } from "../state/state.js";
import { normalizeSymbol } from "../utils/general-utils.js";
import { API_CONFIG } from "../config/api-cache-config.js";
import { UI_CONFIG } from "../config/ui-config.js";

const {SEARCH: { MIN_LENGTH = 1, MAX_LENGTH = 50, ALLOWED_PATTERN } = {},} = UI_CONFIG;
const { CHART_HISTORY_DAYS } = API_CONFIG;
const {fetchMarketData,fetchCoinDetails,fetchCoinMarketChart,fetchGlobalStats,} = coinAPI;

const ReportAndFavorites = () => ({
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

// Fetches full market list and stores it in AppState.
const loadAllCoins = async () => {
  const { ok, data, error, status } = await fetchMarketData();

  if (!ok) {
    return {ok: false,code: "API_ERROR",error,status,};
  }
  const coinsArray = Array.isArray(data) ? data : [];

  const filteredCoins = coinsArray
    .filter(({ id, symbol }) => id && symbol)
    .map((coin) => ({...coin,symbol: normalizeSymbol(coin.symbol),
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
    ...ReportAndFavorites(),
  };
};

// Retrieves detailed information for a single coin (with cache).
const getCoinDetails = (coinId) =>
  CacheManager.fetchWithCache(coinId, () => fetchCoinDetails(coinId));

// Performs a fuzzy search by symbol/name on the in-memory coins list.
const searchCoin = (term) => {
  const trimmed = (term || "").trim();

  if (!trimmed) return { ok: false, code: "EMPTY_TERM" };
  if (trimmed.length < MIN_LENGTH) return { ok: false, code: "TERM_TOO_SHORT", min: MIN_LENGTH };
  if (trimmed.length > MAX_LENGTH) return { ok: false, code: "TERM_TOO_LONG", limit: MAX_LENGTH };
  if (ALLOWED_PATTERN && !ALLOWED_PATTERN.test(trimmed)) return { ok: false, code: "INVALID_TERM" };

 const allCoins = AppState.getAllCoins();
  if (!allCoins.length) return { ok: false, code: "LOAD_WAIT" };

  const searchTerm = trimmed.replace(/\s+/g, " ").toLowerCase();
  const filteredCoins = allCoins.filter((coin) => {
  const symbolMatch = coin.symbol?.toLowerCase().includes(searchTerm) ?? false;
  const nameMatch = coin.name?.toLowerCase().includes(searchTerm) ?? false;
    return symbolMatch || nameMatch;
  });

  if (!filteredCoins.length) {
    return { ok: false, code: "NO_MATCH", term: normalizedTerm };
  }

  return {
    ok: true,
    data: filteredCoins,
    ...ReportAndFavorites(),
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
    ...ReportAndFavorites(),
  };
};

// Resets the stored search term and returns the full coins list.
const clearSearch = () => ({
  ok: true,
  data: AppState.getAllCoins(),
  ...ReportAndFavorites(),
});

// Fetches historical price chart data for a coin (with caching).
const getCoinMarketChart = (coinId) =>
  CacheManager.fetchWithCache(`chart:${coinId}`, () =>
    fetchCoinMarketChart(coinId, CHART_HISTORY_DAYS)
  );
const getGlobalStats = () =>
  CacheManager.fetchWithCache("globalStats", () => fetchGlobalStats());

export const CoinsService = {
  loadAllCoins,
  getCoinDetails,
  searchCoin,
  filterSelectedCoins,
  clearSearch,
  sortCoins,
  getCoinMarketChart,
  getGlobalStats,
};
