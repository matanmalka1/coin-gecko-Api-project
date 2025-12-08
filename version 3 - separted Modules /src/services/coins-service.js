import { coinAPI } from "./api.js";
import { CacheManager, StorageHelper } from "./storage-manager.js";
import { API_CONFIG } from "../config/api-cache-config.js";
import { UI_CONFIG } from "../config/ui-config.js";

const { SEARCH: { MIN_LENGTH = 1, MAX_LENGTH = 50, ALLOWED_PATTERN } = {} } =
  UI_CONFIG;
const { CHART_HISTORY_DAYS } = API_CONFIG;
const {
  fetchMarketData,
  fetchCoinDetails,
  fetchCoinMarketChart,
  fetchGlobalStats,
} = coinAPI;

const COINS_CACHE_KEY = "marketData";
const COINS_TIMESTAMP_KEY = "marketDataTimestamp";

const sortFunctions = {
  price_desc: (a, b) => b.current_price - a.current_price,
  price_asc: (a, b) => a.current_price - b.current_price,
  volume_high: (a, b) => b.total_volume - a.total_volume,
  volume_low: (a, b) => a.total_volume - b.total_volume,
  marketcap_desc: (a, b) => b.market_cap - a.market_cap,
  marketcap_asc: (a, b) => a.market_cap - b.market_cap,
};

// ===== COINS DATA =====
const getAllCoins = () => {
  const cached = CacheManager.getCache(COINS_CACHE_KEY);
  return Array.isArray(cached) ? cached : [];
};

const getCoinsLastUpdated = () => {
  return StorageHelper.readJSON(COINS_TIMESTAMP_KEY, 0);
};

const setCoinsLastUpdated = (timestamp) => {
  StorageHelper.writeJSON(COINS_TIMESTAMP_KEY, timestamp);
};

const loadAllCoins = async () => {
  const { ok, data, error, status } = await fetchMarketData();

  if (!ok) {
    return { ok: false, code: "API_ERROR", error, status };
  }

  const coinsArray = Array.isArray(data) ? data : [];
  const filteredCoins = coinsArray
    .filter(({ id, symbol }) => id && symbol)
    .map((coin) => ({
      ...coin,
      symbol: String(coin.symbol).trim().toUpperCase(),
    }));

  CacheManager.setCache(COINS_CACHE_KEY, filteredCoins);
  setCoinsLastUpdated(Date.now());

  return { ok: true, data: filteredCoins };
};

const sortCoins = (sortType) => {
  const coins = getAllCoins();
  const sorter = sortFunctions[sortType];
  const sorted = sorter ? [...coins].sort(sorter) : coins;

  CacheManager.setCache(COINS_CACHE_KEY, sorted);

  return {
    ok: true,
    data: sorted,
    ...StorageHelper.getUIState(),
  };
};

const getCoinDetails = (coinId) =>
  CacheManager.fetchWithCache(coinId, () => fetchCoinDetails(coinId));

const searchCoin = (term) => {
  const trimmed = (term || "").trim();

  if (!trimmed) return { ok: false, code: "EMPTY_TERM" };
  if (trimmed.length < MIN_LENGTH)
    return { ok: false, code: "TERM_TOO_SHORT", min: MIN_LENGTH };
  if (trimmed.length > MAX_LENGTH)
    return { ok: false, code: "TERM_TOO_LONG", limit: MAX_LENGTH };
  if (ALLOWED_PATTERN && !ALLOWED_PATTERN.test(trimmed))
    return { ok: false, code: "INVALID_TERM" };

  const allCoins = getAllCoins();
  if (!allCoins.length) return { ok: false, code: "LOAD_WAIT" };

  const searchTerm = trimmed.replace(/\s+/g, " ").toLowerCase();
  const filteredCoins = allCoins.filter((coin) => {
    const symbolMatch =
      coin.symbol?.toLowerCase().includes(searchTerm) ?? false;
    const nameMatch = coin.name?.toLowerCase().includes(searchTerm) ?? false;
    return symbolMatch || nameMatch;
  });

  if (!filteredCoins.length) {
    return { ok: false, code: "NO_MATCH", term: trimmed };
  }

  return {
    ok: true,
    data: filteredCoins,
    ...StorageHelper.getUIState(),
  };
};

const filterSelectedCoins = () => {
  const selectedReports = StorageHelper.getSelectedReports();
  if (!selectedReports.length) {
    return { ok: false, code: "NONE_SELECTED" };
  }

  const allCoins = getAllCoins();
  const filtered = allCoins.filter((coin) =>
    selectedReports.includes(coin.symbol)
  );

  if (!filtered.length) {
    StorageHelper.setSelectedReports([]);
    return { ok: false, code: "NOT_FOUND" };
  }

  const validSymbols = new Set(filtered.map((coin) => coin.symbol));
  const cleanedSelection = selectedReports.filter((symbol) =>
    validSymbols.has(symbol)
  );

  StorageHelper.setSelectedReports(cleanedSelection);

  return {
    ok: true,
    data: filtered,
    ...StorageHelper.getUIState(),
  };
};

const clearSearch = () => ({
  ok: true,
  data: getAllCoins(),
  ...StorageHelper.getUIState(),
});

const getCoinMarketChart = (coinId) =>
  CacheManager.fetchWithCache(`chart:${coinId}`, () =>
    fetchCoinMarketChart(coinId, CHART_HISTORY_DAYS)
  );

const getGlobalStats = () =>
  CacheManager.fetchWithCache("globalStats", () => fetchGlobalStats());

export const CoinsService = {
  getAllCoins,
  getCoinsLastUpdated,
  loadAllCoins,
  getCoinDetails,
  searchCoin,
  filterSelectedCoins,
  clearSearch,
  sortCoins,
  getCoinMarketChart,
  getGlobalStats,
};
