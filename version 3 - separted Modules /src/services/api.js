import { API_CONFIG } from "../config/api-cache-config.js";
import { ERRORS } from "../config/error.js";

const { COINGECKO_BASE, CRYPTOCOMPARE_BASE, CHART_HISTORY_DAYS } = API_CONFIG;
const { API: API_ERRORS } = ERRORS;
const COINS_PER_PAGE = 100;

// ========== Core Fetch Layer ==========
const fetchWithRetry = async (url, options = {}, retries = 1) => {
  try {
    const response = await fetch(url, options);
    const { ok, status } = response;

    if (!ok) {
      if (status === 429 && retries > 0) {
        console.warn(`Rate limit hit, retrying (${retries} attempts left)...`);
        await new Promise((resolve) => setTimeout(resolve, 60000));
        return fetchWithRetry(url, options, retries - 1);
      }
      
      if (status === 429) {
        return { ok: false, code: "RATE_LIMIT", error: API_ERRORS.RATE_LIMIT, status };
      }
      
      return { ok: false, code: "HTTP_ERROR", error: API_ERRORS.HTTP_STATUS(status), status };
    }
    
    const data = await response.json();
    return { ok: true, data, status };
  } catch {
    return { ok: false, code: "NETWORK_ERROR", error: ERRORS.API.DEFAULT };
  }
};

// ========== Simple API Builder ==========
const buildUrl = (base, path, params = {}) => {
  const url = new URL(`${base}${path}`);
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
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
  coinGecko(`/coins/${coinId}/market_chart`, { vs_currency: "usd", days });

const fetchCoinOhlc = (coinId, days = CHART_HISTORY_DAYS) =>
  coinGecko(`/coins/${coinId}/ohlc`, { vs_currency: "usd", days });

const fetchGlobalStats = () => coinGecko("/global");

// ========== CryptoCompare API ==========
const cryptoCompare = (path, params) =>
  fetchWithRetry(buildUrl(CRYPTOCOMPARE_BASE, path, params));

// const fetchLivePrices = (symbols = []) => {
//   if (!symbols.length) {
//     return { ok: false, code: "NO_SYMBOLS", error: ERRORS.API.NO_SYMBOLS };
//   }
//   return cryptoCompare("/pricemulti", {
//     fsyms: symbols.join(",").toUpperCase(),
//     tsyms: "USD",
//   });
// };

// ========== NewsData API ==========
const fetchNewsData = (params = {}) => {
  const { BASE_URL, API_KEY, LANGUAGE } = API_CONFIG.NEWS;
  return fetchWithRetry(
    buildUrl(BASE_URL, "", {
      apikey: API_KEY,
      ...(LANGUAGE ? { language: LANGUAGE } : {}),
      ...params,
    })
  );
};

export const coinAPI = {
  fetchMarketData,
  fetchCoinDetails,
  // fetchLivePrices,
  fetchCoinMarketChart,
  fetchCoinOhlc,
  fetchGlobalStats,
  fetchNewsData,
};
