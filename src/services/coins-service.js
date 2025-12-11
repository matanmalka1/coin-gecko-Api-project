import { fetchWithRetry } from "./api.js";
import { CacheManager, StorageHelper } from "./storage-manager.js";
import { APP_CONFIG } from "../config/app-config.js";

const { fetchWithCache, getCache, setCache } = CacheManager;
const { readJSON, writeJSON, getSelectedReports, setSelectedReports } = StorageHelper;

const {
  MIN_LENGTH,
  MAX_LENGTH,
  ALLOWED_PATTERN,
  COINGECKO_BASE,
  CHART_HISTORY_DAYS,
  COINS_PER_PAGE,
  COINS_CACHE_KEY,
  COINS_TIMESTAMP_KEY,
} = APP_CONFIG;

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

export const getCoinsLastUpdated = () => {
  return readJSON(COINS_TIMESTAMP_KEY, 0);
};

const setCoinsLastUpdated = (timestamp) => {
  writeJSON(COINS_TIMESTAMP_KEY, timestamp);
};

export const loadAllCoins = async () => {
  const { ok, data, status } = await fetchWithRetry(
    `${COINGECKO_BASE}/coins/markets` +
      `?vs_currency=usd&order=market_cap_desc` +
      `&per_page=${COINS_PER_PAGE}&page=1&sparkline=false`
  );

  if (!ok) {
    return { ok: false, code: "COIN_LIST_ERROR", status };
  }

  const coinsArray = Array.isArray(data) ? data : [];
  const filteredCoins = coinsArray
    .filter(({ id, symbol }) => id && symbol)
    .map((coin) => ({
      ...coin,
      symbol: String(coin.symbol).trim().toUpperCase(),
    }));

  setCache(COINS_CACHE_KEY, filteredCoins);
  setCoinsLastUpdated(Date.now());

  return { ok: true, data: filteredCoins };
};

export const getCoinDetails = (coinId) => 
  fetchWithCache(coinId, () => fetchWithRetry(`${COINGECKO_BASE}/coins/${coinId}`));

export const getCoinMarketChart = (coinId) =>
  fetchWithCache(`chart:${coinId}`, () =>
    fetchWithRetry(`${COINGECKO_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${CHART_HISTORY_DAYS}`));

export const getGlobalStats = () =>
  fetchWithCache("globalStats", () => fetchWithRetry(`${COINGECKO_BASE}/global`));

export const sortCoins = (sortType) => {
  const coins = getAllCoins();
  const sorter = sortFunctions[sortType];
  const sorted = sorter ? [...coins].sort(sorter) : coins;

  setCache(COINS_CACHE_KEY, sorted);

return { ok: true, data: sorted }
};

export const searchCoin = (term) => {
const cleanTerm = String(term || "").trim().toLowerCase();

  if (!cleanTerm) {return { ok: false, code: "EMPTY_TERM" };}
  if (cleanTerm.length < MIN_LENGTH) {return { ok: false, code: "TERM_TOO_SHORT", min: MIN_LENGTH };
}
  if (cleanTerm.length > MAX_LENGTH) {return { ok: false, code: "TERM_TOO_LONG", limit: MAX_LENGTH };
}
  if (ALLOWED_PATTERN && !ALLOWED_PATTERN.test(cleanTerm)) {return { ok: false, code: "INVALID_TERM" };
}

  const allCoins = getAllCoins();
  if (!allCoins.length) return { ok: false, code: "LOAD_WAIT" };

  const filteredCoins = allCoins.filter((coin) => {
  const symbolMatch = coin.symbol?.toLowerCase().includes(cleanTerm) ?? false;
  const nameMatch = coin.name?.toLowerCase().includes(cleanTerm) ?? false;
    return symbolMatch || nameMatch;
  });

  if (!filteredCoins.length) {return { ok: false, code: "NO_MATCH", term: cleanTerm };
}

  return {
    ok: true,
    data: filteredCoins,
  };
};

export const filterSelectedCoins = () => {
  const selectedReports = getSelectedReports();
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

  setSelectedReports(cleanedSelection);

  return {
    ok: true,
    data: filtered,
  };
};
