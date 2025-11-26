import { CONFIG } from "../config/config.js";
import { ERRORS } from "../config/error.js";

export const coinAPI = (() => {
  const { COINGECKO_BASE, CRYPTOCOMPARE_BASE } = CONFIG.API;
  const { COINS_PER_PAGE } = CONFIG.DISPLAY;

  const fetchWithRetry = async (url, options = {}) => {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        return {
          ok: false,
          code: response.status === 429 ? "RATE_LIMIT" : "HTTP_ERROR",
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
        error: ERRORS.API.DEFAULT,
      };
    }
  };

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
  const fetchCoinDetails = async (coinId) => {
    const url = `${COINGECKO_BASE}/coins/${coinId}`;
    return fetchWithRetry(url);
  };
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

  const fetchCoinMarketChart = async (coinId, days = 7) => {
    const url = `${COINGECKO_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`;
    return fetchWithRetry(url);
  };
  return {
    fetchMarketData,
    fetchCoinDetails,
    fetchLivePrices,
    fetchCoinMarketChart,
    // Aliases to align with service usage
    getMarkets: fetchMarketData,
    getCoinDetails: fetchCoinDetails,
    getLivePrices: fetchLivePrices,
    getCoinMarketChart: fetchCoinMarketChart,
  };
})();
