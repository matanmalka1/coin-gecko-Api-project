import { coinAPI } from "./api.js";
import { AppState } from "../state/state.js";
import { UI_CONFIG } from "../config/ui-config.js";
import { CacheManager } from "./cache.js";
import { CACHE_CONFIG, API_CONFIG } from "../config/api-cache-config.js";

const REPORTS_TTL = CACHE_CONFIG.REPORTS?.CHART_TTL_MS;
const { CHART_HISTORY_DAYS } = API_CONFIG;

const fetchWithCache = async (cacheKey, fetcher, ttl = REPORTS_TTL) => {
  const cached = CacheManager.getCache(cacheKey);
  if (cached) return { ok: true, data: cached, fromCache: true };

  const result = await fetcher();
  if (!result.ok)
    return {
      ok: false,
      code: result.code,
      error: result.error,
      status: result.status,
    };
  CacheManager.setCache(cacheKey, result.data, ttl);
  return { ok: true, data: result.data, fromCache: false };
};

// New: fetch candlestick-ready OHLC data for a coin id.
const getCoinOhlc = (coinId, days = CHART_HISTORY_DAYS) =>
  fetchWithCache(`ohlc:${coinId}:${days}`, () =>
    coinAPI.fetchCoinOhlc(coinId, days)
  );

// New: map CoinGecko OHLC array to Lightweight Charts candlestick points.
const mapOhlcToCandles = (ohlcArray = []) =>
  Array.isArray(ohlcArray)
    ? ohlcArray.map(([time, open, high, low, close]) => ({
        time: Math.floor(time / 1000),
        open,
        high,
        low,
        close,
      }))
    : [];

// Resolves AppState symbols to coin ids and pulls their OHLC candles.
const loadCandlesForSymbols = async (symbols) => {
  const coinsIndex = AppState.getAllCoins().reduce((acc, coin) => {
    if (coin?.symbol && coin?.id) {
      acc.set(coin.symbol, coin.id);
    }
    return acc;
  }, new Map());

  const pairs = await Promise.all(
    symbols.map(async (symbol) => {
      const coinId = coinsIndex.get(symbol);
      if (!coinId) return { symbol, candles: [], code: "NO_COIN_ID" };

      const result = await getCoinOhlc(coinId, UI_CONFIG.REPORTS.HISTORY_DAYS);

      if (!result.ok) {
        return {
          symbol,
          candles: [],
          code: result.code || "API_ERROR",
          error: result.error,
        };
      }

      return { symbol, candles: mapOhlcToCandles(result.data) };
    })
  );

  const candlesBySymbol = pairs.reduce((acc, { symbol, candles }) => {
    if (candles?.length) {
      acc[symbol] = candles;
    }
    return acc;
  }, {});

  const errors = pairs.filter((entry) => !entry.candles?.length);
  return { candlesBySymbol, errors };
};

// Stops any polling interval and resets state (no timers needed for OHLC load).
const cleanup = () => {};

// Changed: loads OHLC candles for reports and feeds the renderer (no CanvasJS).
const startLiveChart = async (chartCallbacks = {}) => {
  cleanup();

  const symbols = AppState.getSelectedReports();
  if (!symbols.length) {
    return { ok: false, code: "NONE_SELECTED" };
  }
  chartCallbacks.onChartReady?.({
    symbols,
    historyPoints: UI_CONFIG.CHART.HISTORY_POINTS,
  });

  const { candlesBySymbol, errors } = await loadCandlesForSymbols(symbols);

  if (!Object.keys(candlesBySymbol).length) {
    chartCallbacks.onError?.({
      code: errors[0]?.code || "NO_DATA",
      error: errors[0]?.error,
    });
    return { ok: false, code: "NO_DATA" };
  }

  chartCallbacks.onData?.({ candlesBySymbol });

  if (errors.length) {
    chartCallbacks.onError?.({
      code: errors[0].code,
      error: errors[0].error,
    });
  }

  return { ok: true, symbols };
};

export const ChartService = {
  startLiveChart,
  cleanup,
};
