import { CONFIG } from "../config/config.js";
import { ERRORS } from "../config/error.js";

export const coinAPI = (() => {
  const { COINGECKO_BASE, CRYPTOCOMPARE_BASE, CHART_HISTORY_DAYS } =
    CONFIG.API;
  const { COINS_PER_PAGE } = CONFIG.DISPLAY;

  // Generic fetch wrapper for CoinGecko/CryptoCompare with basic error handling.
  const fetchWithRetry = async (url, options = {}) => {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        return {
          ok: false,
          code: response.status === 429 ? "RATE_LIMIT" : "HTTP_ERROR",
          status: response.status,
          error:
            response.status === 429
              ? ERRORS.API.RATE_LIMIT
              : ERRORS.API.HTTP_STATUS(response.status),
        };
      }

      const data = await response.json();
      return { ok: true, data };
    } catch (error) {
      return {
        ok: false,
        code: "NETWORK_ERROR",
        status: null,
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

    const coingeckoMarketUrl = `${COINGECKO_BASE}/coins/markets?${params.toString()}`;
    return fetchWithRetry(coingeckoMarketUrl);
  };
  // Fetches detailed info for a given coin id.
  const fetchCoinDetails = async (coinId) => {
    const url = `${COINGECKO_BASE}/coins/${coinId}`;
    return fetchWithRetry(url);
  };
  // Fetches live prices for multiple symbols via CryptoCompare.
  const fetchLivePrices = async (symbols = []) => {
    if (!Array.isArray(symbols) || symbols.length === 0) {
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
    const url = `${COINGECKO_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`;
    return fetchWithRetry(url);
  };
  return {
    fetchMarketData,
    fetchCoinDetails,
    fetchLivePrices,
    fetchCoinMarketChart,
  };
})();
