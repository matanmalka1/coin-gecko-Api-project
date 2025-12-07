import { coinAPI } from "./api.js";
import { CoinsService } from "./coins-service.js";
import { StorageHelper } from "./storage-manager.js";
import { UI_CONFIG } from "../config/ui-config.js";
import { CacheManager } from "./storage-manager.js";
import { CACHE_CONFIG, API_CONFIG } from "../config/api-cache-config.js";

const { CHART_HISTORY_DAYS } = API_CONFIG;
const { HISTORY_POINTS } = UI_CONFIG.CHART;
const { HISTORY_DAYS } = UI_CONFIG.REPORTS;
const { fetchCoinOhlc } = coinAPI;
const { fetchWithCache } = CacheManager;

// ===== OHLC DATA =====
const getCoinOhlc = (symbol, days = CHART_HISTORY_DAYS) =>
  fetchWithCache(`ohlc:${symbol}:${days}`, () => fetchCoinOhlc(symbol, days));

const mapOhlcToCandles = (response) => {
  const points = response?.Data?.Data;
  if (!Array.isArray(points)) return [];

  return points.map(({ time, open, high, low, close }) => ({
    time,
    open,
    high,
    low,
    close,
  }));
};

// ===== LOAD CANDLES =====
const loadCandlesForSymbols = async (symbols) => {
  const allCoins = CoinsService.getAllCoins();
  const knownSymbols = new Set(allCoins.map(({ symbol }) => symbol));

  const pairs = await Promise.all(
    symbols.map(async (symbol) => {
      if (!knownSymbols.has(symbol)) {
        return { symbol, candles: [], code: "NO_SYMBOL" };
      }

      const { ok, data, code, error } = await getCoinOhlc(symbol, HISTORY_DAYS);

      if (!ok || !data) {
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
const cleanup = () => {};

const startLiveChart = async (chartCallbacks = {}) => {
  cleanup();

  const symbols = StorageHelper.getSelectedReports();

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
