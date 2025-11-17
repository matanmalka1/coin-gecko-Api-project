import { CONFIG } from "../config/config.js";

export const coinAPI = (() => {
  const { COINGECKO_BASE, CRYPTOCOMPARE_BASE } = CONFIG.API;
  const { COINS_PER_PAGE } = CONFIG.DISPLAY;

  const safeRequest = async (url, options = {}) => {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    }
  };

  const getMarkets = async (perPage = COINS_PER_PAGE) => {
    const params = new URLSearchParams({
      vs_currency: "usd",
      order: "market_cap_desc",
      per_page: perPage,
      page: 1,
      sparkline: false,
    });

    const url = `${COINGECKO_BASE}/coins/markets?${params.toString()}`;
    return safeRequest(url);
  };
  const getCoinDetails = async (coinId) => {
    const url = `${COINGECKO_BASE}/coins/${coinId}`;
    return safeRequest(url);
  };
  const getLivePrices = async (symbols = []) => {
    if (!Array.isArray(symbols) || symbols.length === 0) {
      return { success: false, error: "No symbols provided" };
    }

    const params = new URLSearchParams({
      fsyms: symbols.join(",").toUpperCase(),
      tsyms: "USD",
    });

    const url = `${CRYPTOCOMPARE_BASE}/pricemulti?${params.toString()}`;
    return safeRequest(url);
  };

  const getCoinMarketChart = async (coinId, days = 7) => {
    const url = `${COINGECKO_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`;
    return safeRequest(url);
  };
  return {
    getMarkets,
    getCoinDetails,
    getLivePrices,
    getCoinMarketChart,
  };
})();
