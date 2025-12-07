import { coinAPI } from "./api.js";
import { CoinsService } from "./coins-service.js";
import { StorageHelper } from "./storage-manager.js";
import { UI_CONFIG } from "../config/ui-config.js";
import { CacheManager } from "./storage-manager.js";
import { CACHE_CONFIG, API_CONFIG } from "../config/api-cache-config.js";

const { CHART_HISTORY_DAYS } = API_CONFIG;
const { HISTORY_POINTS, UPDATE_INTERVAL_MS } = UI_CONFIG.CHART;
const { HISTORY_DAYS } = UI_CONFIG.REPORTS;
const { fetchCoinOhlc, fetchSimplePrices } = coinAPI;
const { fetchWithCache } = CacheManager;

let updateInterval = null;
let currentCallbacks = null;
let currentSymbols = [];
let currentCoinIds = new Map();
let historicalCandles = {};

// ===== OHLC DATA =====
const getCoinOhlc = (coinId, days = CHART_HISTORY_DAYS) =>
  fetchWithCache(
    `ohlc:${coinId}:${days}`,
    () => fetchCoinOhlc(coinId, days),
    CACHE_CONFIG.REPORTS_CACHE.CHART_TTL_MS
  );

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

const buildCoinsIndex = () => {
  const allCoins = CoinsService.getAllCoins();
  return allCoins.reduce((acc, coin) => {
    const { symbol, id } = coin || {};
    if (symbol && id) {
      acc.set(symbol, id);
    }
    return acc;
  }, new Map());
};
// ===== LOAD CANDLES =====
const loadHistoricalCandles = async (symbols) => {
  const coinsIndex = buildCoinsIndex();

  const pairs = await Promise.all(
    symbols.map(async (symbol) => {
      const coinId = coinsIndex.get(symbol);
      if (!coinId) {
        return { symbol, candles: [], code: "NO_COIN_ID" };
      }

      const { ok, data, code, error } = await getCoinOhlc(coinId, HISTORY_DAYS);

      if (!ok || !data) {
        return {
          symbol,
          candles: [],
          code: code || "API_ERROR",
          error,
        };
      }
      const candles = mapOhlcToCandles(data);

      historicalCandles[symbol] = candles;

      return { symbol, candles, coinId };
    })
  );

  pairs.forEach(({ symbol, coinId }) => {
    if (coinId) {
      currentCoinIds.set(symbol, coinId);
    }
  });

  const candlesBySymbol = pairs.reduce((acc, { symbol, candles }) => {
    if (candles?.length) {
      acc[symbol] = candles;
    }
    return acc;
  }, {});

  const errors = pairs.filter(({ candles }) => !candles?.length);

  return { candlesBySymbol, errors };
};
// ===== UPDATE LIVE PRICES =====
const updateLivePrices = async () => {
  if (!currentSymbols.length || !currentCallbacks) {
    return;
  }

  try {
    // קבל את coinIds
    const coinIds = currentSymbols
      .map((symbol) => currentCoinIds.get(symbol))
      .filter(Boolean);

    if (!coinIds.length) {
      console.warn("No coin IDs available for live updates");
      return;
    }

    // קרא מחירים חיים
    const { ok, data } = await fetchSimplePrices(coinIds);

    if (!ok || !data) {
      console.warn("Failed to fetch live prices");
      return;
    }

    // עדכן כל סמל
    const updatedCandles = {};
    const now = Math.floor(Date.now() / 1000);

    currentSymbols.forEach((symbol) => {
      const coinId = currentCoinIds.get(symbol);
      const priceData = data[coinId];

      if (!priceData || !priceData.usd) {
        // אם אין מחיר חדש, השתמש בהיסטורי
        updatedCandles[symbol] = historicalCandles[symbol] || [];
        return;
      }

      const currentPrice = priceData.usd;
      const candles = [...(historicalCandles[symbol] || [])];

      if (candles.length === 0) {
        updatedCandles[symbol] = [];
        return;
      }

      // שכפל את הנר האחרון ועדכן אותו
      const lastCandle = { ...candles[candles.length - 1] };

      // עדכן הנר האחרון עם המחיר החדש
      lastCandle.time = now;
      lastCandle.close = currentPrice;
      lastCandle.high = Math.max(lastCandle.high, currentPrice);
      lastCandle.low = Math.min(lastCandle.low, currentPrice);

      // החלף את הנר האחרון
      candles[candles.length - 1] = lastCandle;

      updatedCandles[symbol] = candles;
    });
  
    if (Object.keys(updatedCandles).length) {
      currentCallbacks.onData?.({ candlesBySymbol: updatedCandles });
    }
  } catch (error) {
    console.error("Live update failed:", error);
  }
};

// ===== CHART LIFECYCLE =====
const cleanup = () => {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
  currentCallbacks = null;
  currentSymbols = [];
  currentCoinIds.clear();
  historicalCandles = {};
  console.log("Live chart stopped and reset");
};

const startLiveChart = async (chartCallbacks = {}) => {
  cleanup();

  const symbols = StorageHelper.getSelectedReports();

  if (!symbols.length) {
    return { ok: false, code: "NONE_SELECTED" };
  }
  currentSymbols = symbols;
  currentCallbacks = chartCallbacks;

  chartCallbacks.onChartReady?.({
    symbols,
    historyPoints: HISTORY_POINTS,
  });

  console.log("Loading historical data...");
  const { candlesBySymbol, errors } = await loadHistoricalCandles(symbols);

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
  updateInterval = setInterval(updateLivePrices, UPDATE_INTERVAL_MS);

  console.log(
    `🚀 Live chart started! Updating every ${UPDATE_INTERVAL_MS / 1000}s`
  );

  return { ok: true, symbols };
};

export const ChartService = {
  startLiveChart,
  cleanup,
};
