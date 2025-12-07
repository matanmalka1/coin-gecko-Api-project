import { coinAPI } from "./api.js";
import { AppState } from "../state/state.js";
import { UI_CONFIG } from "../config/ui-config.js";
import { CacheManager } from "./storage-manager.js";
import { CACHE_CONFIG, API_CONFIG } from "../config/api-cache-config.js";

const { CHART_HISTORY_DAYS } = API_CONFIG;
const { HISTORY_POINTS } = UI_CONFIG.CHART;
const { HISTORY_DAYS } = UI_CONFIG.REPORTS;
const { fetchCoinOhlc } = coinAPI;
const { fetchWithCache } = CacheManager;

// ===== OHLC (open high low close) DATA FETCHING =====
// Fetch candlestick-ready OHLC data for a coin id.
const getCoinOhlc = (coinId, days = CHART_HISTORY_DAYS) =>
  fetchWithCache(
    `ohlc:${coinId}:${days}`,
    () => fetchCoinOhlc(coinId, days),CACHE_CONFIG.REPORTS_CACHE.CHART_TTL_MS
  );

// Map CoinGecko OHLC array to Lightweight Charts candlestick points.
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

// ===== SYMBOLS TO CANDLES LOADER =====
// Resolves AppState symbols to coin ids and pulls their OHLC candles.
const loadCandlesForSymbols = async (symbols) => {
  const allCoins = AppState.getAllCoins();

  const coinsIndex = allCoins.reduce((acc, coin) => {
    const { symbol, id } = coin || {};
    if (symbol && id) {
      acc.set(symbol, id);
    }
    return acc;
  }, new Map());

  const pairs = await Promise.all(
    symbols.map(async (symbol) => {
      const coinId = coinsIndex.get(symbol);
      if (!coinId) {
        return { symbol, candles: [], code: "NO_COIN_ID" };
      }

      const { ok, data, code, error } = await getCoinOhlc(coinId, HISTORY_DAYS);

      if (!ok) {
        return {
          symbol,
          candles: [],
          code: code || "API_ERROR",
          error,
        };
      }
      return { symbol, candles: mapOhlcToCandles(data) };
    })
  );

  const candlesBySymbol = pairs.reduce((acc, { symbol, candles }) => {
    if (candles?.length) {
      acc[symbol] = candles;
    }
    return acc;
  }, {});

  const errors = pairs.filter(({ candles }) => !candles?.length);

  return { candlesBySymbol, errors };
};

// ===== CHART LIFECYCLE =====
// Stops any polling interval and resets state (no timers needed for OHLC load).
const cleanup = () => {};

// Loads OHLC candles for reports and feeds the renderer.
const startLiveChart = async (chartCallbacks = {}) => {
  cleanup();

  const symbols = AppState.getSelectedReports();

  if (!symbols.length) {
    return { ok: false, code: "NONE_SELECTED" };
  }

  chartCallbacks.onChartReady?.({
    symbols,
    historyPoints: HISTORY_POINTS,
  });

  const { candlesBySymbol, errors } = await loadCandlesForSymbols(symbols);

  if (!Object.keys(candlesBySymbol).length) {
    const { code = "NO_DATA", error } = errors[0] || {};

    chartCallbacks.onError?.({ code, error });
    return { ok: false, code: "NO_DATA" };
  }

  chartCallbacks.onData?.({ candlesBySymbol });

  if (errors.length) {
    const { code, error } = errors[0];
    chartCallbacks.onError?.({ code, error });
  }

  return { ok: true, symbols };
};

export const ChartService = {
  startLiveChart,
  cleanup,
};
