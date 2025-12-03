import { API_CONFIG } from "../config/api-cache-config.js";
import { UI_CONFIG } from "../config/ui-config.js";
import { ERRORS } from "../config/error.js";

const { COINGECKO_BASE, CRYPTOCOMPARE_BASE, CHART_HISTORY_DAYS } = API_CONFIG;
const { COINS_PER_PAGE } = UI_CONFIG.DISPLAY;

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

// Fetches the paginated market list from CoinGecko.
const fetchMarketData = async (perPage = COINS_PER_PAGE) => {
  const params = new URLSearchParams({
    vs_currency: "usd",
    order: "market_cap_desc",
    per_page: perPage,
    page: 1,
    sparkline: false,
  });

  const geckoMarketUrl = `${COINGECKO_BASE}/coins/markets?${params.toString()}`;
  return fetchWithRetry(geckoMarketUrl);
};
// Fetches detailed info for a given coin id.
const fetchCoinDetails = async (coinId) => {
  return fetchWithRetry(`${COINGECKO_BASE}/coins/${coinId}`);
};
// Fetches live prices for multiple symbols via CryptoCompare.
const fetchLivePrices = async (symbols = []) => {
  if (!Array.isArray(symbols) || symbols.length) {
    return { ok: false, code: "NO_SYMBOLS", error: ERRORS.API.NO_SYMBOLS };
  }

  const params = new URLSearchParams({
    fsyms: symbols.join(",").toUpperCase(),
    tsyms: "USD",
  });

  const cryptoCompareUrl = `${CRYPTOCOMPARE_BASE}/pricemulti?${params.toString()}`;
  return fetchWithRetry(cryptoCompareUrl);
};

// Fetches historical market chart data for a coin id.
const fetchCoinMarketChart = async (coinId, days = CHART_HISTORY_DAYS) => {
  const params = new URLSearchParams({
    vs_currency: "usd",
    days: days,
  });

  return fetchWithRetry(
    `${COINGECKO_BASE}/coins/${coinId}/market_chart?${params.toString()}`
  );
};
export const coinAPI = {
  fetchMarketData,
  fetchCoinDetails,
  fetchLivePrices,
  fetchCoinMarketChart,
};
