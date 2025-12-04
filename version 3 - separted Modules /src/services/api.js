import { API_CONFIG } from "../config/api-cache-config.js";
import { ERRORS } from "../config/error.js";

const { COINGECKO_BASE, CRYPTOCOMPARE_BASE, CHART_HISTORY_DAYS } = API_CONFIG;
const COINS_PER_PAGE = 150;

// ========== Core Fetch Layer ==========
const fetchWithRetry = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const isRateLimit = response.status === 429;
      return {
        ok: false,
        code: isRateLimit ? "RATE_LIMIT" : "HTTP_ERROR",
        error: isRateLimit
          ? ERRORS.API.RATE_LIMIT
          : ERRORS.API.HTTP_STATUS(response.status),
      };
    }

    const data = await response.json();
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      code: "NETWORK_ERROR",
      error: ERRORS.API.DEFAULT,
    };
  }
};

// ========== Simple API Builder ==========
const buildUrl = (base, path, params = {}) => {
  const url = new URL(`${base}${path}`);
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      url.searchParams.set(key, val);
    }
  });
  return url.toString();
};

// ========== CoinGecko API ==========
const coinGecko = (path, params) =>
  fetchWithRetry(buildUrl(COINGECKO_BASE, path, params));

const fetchMarketData = (perPage = COINS_PER_PAGE) =>
  coinGecko("/coins/markets", {
    vs_currency: "usd",
    order: "market_cap_desc",
    per_page: perPage,
    page: 1,
    sparkline: false,
  });

const fetchCoinDetails = (coinId) => coinGecko(`/coins/${coinId}`);

const fetchCoinMarketChart = (coinId, days = CHART_HISTORY_DAYS) =>
  coinGecko(`/coins/${coinId}/market_chart`, {
    vs_currency: "usd",
    days,
  });

const fetchCoinOhlc = (coinId, days = CHART_HISTORY_DAYS) =>
  coinGecko(`/coins/${coinId}/ohlc`, {
    vs_currency: "usd",
    days,
  });

const fetchGlobalStats = () => coinGecko("/global");

// ========== CryptoCompare API ==========
const cryptoCompare = (path, params) =>
  fetchWithRetry(buildUrl(CRYPTOCOMPARE_BASE, path, params));

const fetchLivePrices = (symbols = []) => {
  if (!Array.isArray(symbols) || !symbols.length) {
    return { ok: false, code: "NO_SYMBOLS", error: ERRORS.API.NO_SYMBOLS };
  }

  return cryptoCompare("/pricemulti", {
    fsyms: symbols.join(",").toUpperCase(),
    tsyms: "USD",
  });
};
export const coinAPI = {
  fetchMarketData,
  fetchCoinDetails,
  fetchLivePrices,
  fetchCoinMarketChart,
  fetchCoinOhlc,
  fetchGlobalStats,
};
