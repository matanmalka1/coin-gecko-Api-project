import { API_CONFIG } from "../config/api-cache-config.js";
import { ERRORS } from "../config/error.js";

const { COINGECKO_BASE, CRYPTOCOMPARE_BASE, CHART_HISTORY_DAYS } = API_CONFIG;
const COINS_PER_PAGE = 150;

// Generic fetch wrapper for CoinGecko/CryptoCompare with basic error handling.
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

const buildAndFetch = async (base, path, params = {}) => {
  const url = new URL(`${base}${path}`);
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      url.searchParams.set(key, val);
    }
  });
  return fetchWithRetry(url.toString());
};

// Fetches the paginated market list from CoinGecko.
const fetchMarketData = (perPage = COINS_PER_PAGE) =>
  buildAndFetch(COINGECKO_BASE, "/coins/markets", {
    vs_currency: "usd",
    order: "market_cap_desc",
    per_page: perPage,
    page: 1,
    sparkline: false,
  });

// Fetches detailed info for a given coin id.
const fetchCoinDetails = (coinId) =>
  buildAndFetch(COINGECKO_BASE, `/coins/${coinId}`);

// Fetches live prices for multiple symbols via CryptoCompare.
const fetchLivePrices = (symbols = []) => {
  if (!Array.isArray(symbols) || !symbols.length) {
    return { ok: false, code: "NO_SYMBOLS", error: ERRORS.API.NO_SYMBOLS };
  }

  return buildAndFetch(CRYPTOCOMPARE_BASE, "/pricemulti", {
    fsyms: symbols.join(",").toUpperCase(),
    tsyms: "USD",
  });
};

// Fetches historical market chart data for a coin id.
const fetchCoinMarketChart = (coinId, days = CHART_HISTORY_DAYS) =>
  buildAndFetch(COINGECKO_BASE, `/coins/${coinId}/market_chart`, {
    vs_currency: "usd",
    days,
  });
const fetchCoinOhlc = (coinId, days = CHART_HISTORY_DAYS) =>
  buildAndFetch(COINGECKO_BASE, `/coins/${coinId}/ohlc`, {
    vs_currency: "usd",
    days,
  });

const fetchGlobalStats = () => buildAndFetch(COINGECKO_BASE, "/global");
export const coinAPI = {
  fetchMarketData,
  fetchCoinDetails,
  fetchLivePrices,
  fetchCoinMarketChart,
  fetchCoinOhlc,
  fetchGlobalStats,
};
