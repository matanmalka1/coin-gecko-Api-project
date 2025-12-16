import { fetchWithRetry } from "./api.js";
import { getCache, setCache, writeJSON, getSelectedReports, setSelectedReports } from "./storage-manager.js";
import { COINGECKO_BASE, CHART_HISTORY_DAYS, COINS_PER_PAGE, COINS_CACHE_KEY, COINS_TIMESTAMP_KEY } from "../config/app-config.js";
import { ensureArray, normalizeSymbol } from "../utils/general-utils.js";
import { ERRORS } from "../config/error.js";

const sortFunctions = {
  price_desc: (a, b) => b.current_price - a.current_price,
  price_asc: (a, b) => a.current_price - b.current_price,
  volume_high: (a, b) => b.total_volume - a.total_volume,
  volume_low: (a, b) => a.total_volume - b.total_volume,
  marketcap_desc: (a, b) => b.market_cap - a.market_cap,
  marketcap_asc: (a, b) => a.market_cap - b.market_cap,
};

// ===== COINS DATA =====
export const getAllCoins = () => getCache(COINS_CACHE_KEY) || [];

export const loadAllCoins = async () => {
  const { ok, data, status, error } = await fetchWithRetry(
    `${COINGECKO_BASE}/coins/markets` +
      `?vs_currency=usd&order=market_cap_desc` +
      `&per_page=${COINS_PER_PAGE}&page=1&sparkline=false`
  );

  if (!ok) {
    return { ok: false, error: error || ERRORS.COIN_LIST_ERROR, status };
  }

  const coinsArray = ensureArray(data);
  const filteredCoins = coinsArray
    .filter(({ id, symbol }) => id && symbol)
    .map((coin) => ({
      ...coin,
     symbol: normalizeSymbol(coin.symbol)
    }));

  setCache(COINS_CACHE_KEY, filteredCoins);
  writeJSON(COINS_TIMESTAMP_KEY, Date.now());

  return { ok: true, data: filteredCoins };
};

export const getCoinDetails = async (coinId) => {
  const cached = getCache(coinId);
  if (cached) return { ok: true, data: cached };

  const { ok, data, status, error } = await fetchWithRetry(`${COINGECKO_BASE}/coins/${coinId}`);
  if (ok) setCache(coinId, data);
  return { ok, data, status, error };
};

export const getCoinMarketChart = async (coinId) => {
  const cacheKey = `chart:${coinId}`;
  const cached = getCache(cacheKey);
  if (cached) return { ok: true, data: cached };

  const { ok, data, status, error } = await fetchWithRetry(
    `${COINGECKO_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${CHART_HISTORY_DAYS}`
  );
  if (ok) setCache(cacheKey, data);
  return { ok, data, status, error };
};

export const getGlobalStats = async () => {
  const cached = getCache("globalStats");
  if (cached) return { ok: true, data: cached };

  const { ok, data, status, error } = await fetchWithRetry(`${COINGECKO_BASE}/global`);
  if (ok) setCache("globalStats", data);
  return { ok, data, status, error };
};

export const sortCoins = (sortType, coinsToSort = null) => {
  const coins = coinsToSort ?? getAllCoins();
  const sorter = sortFunctions[sortType];
  const sorted = sorter ? [...coins].sort(sorter) : coins;

  return { ok: true, data: sorted };
};

export const searchCoin = (term) => {
  const cleanTerm = (term || "").toString().trim().toLowerCase();

  // Basic validation (HTML handles length/pattern, but check for safety)
  if (!cleanTerm || cleanTerm.length < 2) {
    return { ok: false, error: ERRORS.INVALID_TERM };
  }

  const allCoins = getAllCoins();
  if (!allCoins.length) return { ok: false, error: ERRORS.LOAD_WAIT };

  const filteredCoins = allCoins.filter((coin) => 
  coin.symbol?.toLowerCase().includes(cleanTerm) || 
  coin.name?.toLowerCase().includes(cleanTerm)
);

  if (!filteredCoins.length) return { ok: false, error: ERRORS.NO_MATCH(cleanTerm) };

  return {ok: true, data: filteredCoins,};
};

export const filterSelectedCoins = () => {
  const selectedReports = getSelectedReports();
  if (!selectedReports.length) {
    return { ok: false, error: ERRORS.NONE_SELECTED };
  }

  const selectedSet = new Set(selectedReports);
  const filtered = [];
  const validSymbols = new Set();

  getAllCoins().forEach((coin) => {
    if (selectedSet.has(coin.symbol)) {
      filtered.push(coin);
      validSymbols.add(coin.symbol);
    }
  });

  if (!filtered.length) {
    setSelectedReports([]);
    return { ok: false, error: ERRORS.NOT_FOUND };
  }
  const cleanedSelection = selectedReports.filter((symbol) =>
    validSymbols.has(symbol)
  );
  if (cleanedSelection.length !== selectedReports.length) {
    setSelectedReports(cleanedSelection);
  }

  return {ok: true, data: filtered,};
};
