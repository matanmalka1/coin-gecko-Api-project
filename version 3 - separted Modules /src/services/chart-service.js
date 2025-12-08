import { fetchWithRetry } from "./api.js";
import { CoinsService } from "./coins-service.js";
import { StorageHelper, CacheManager } from "./storage-manager.js";
import { APP_CONFIG } from "../config/app-config.js";

const { fetchWithCache } = CacheManager;
const { getAllCoins } = CoinsService;
const { getSelectedReports } = StorageHelper;
const {COINGECKO_BASE, CHART_HISTORY_DAYS, CHART_POINTS, REPORTS_DAYS, REPORTS_CHART_TTL } = APP_CONFIG;

// ===== OHLC DATA =====
const getCoinOhlc = (coinId, days = CHART_HISTORY_DAYS) =>
  fetchWithCache(
    `ohlc:${coinId}:${days}`,
    () =>
      fetchWithRetry(
        `${COINGECKO_BASE}/coins/${coinId}/ohlc` +
          `?vs_currency=usd&days=${days}`
      ),
    REPORTS_CHART_TTL
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

// ===== LOAD CANDLES =====
const loadCandlesForSymbols = async (symbols) => {
  const allCoins = getAllCoins();

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

      const { ok, data, code, error } = await getCoinOhlc(coinId, REPORTS_DAYS);

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

  const symbols = getSelectedReports();

  if (!symbols.length) {
    return { ok: false, code: "NONE_SELECTED" };
  }

  chartCallbacks.onChartReady?.({
    symbols,
    historyPoints: CHART_POINTS,
  });

  const { candlesBySymbol, errors } = await loadCandlesForSymbols(symbols);

  if (errors.length > 0) {
    errors.forEach(({ symbol, code, error }) => {
      chartCallbacks.onError?.({
        symbol,
        code,
        error,
      });
    });
  }

  if (Object.keys(candlesBySymbol).length > 0) {
    chartCallbacks.onData?.({ candlesBySymbol });
    return { ok: true, symbols: Object.keys(candlesBySymbol) };
  }

  chartCallbacks.onError?.({ code: "NO_DATA" });
  return { ok: false, code: "NO_DATA" };
};

export const ChartService = {
  cleanup,
  startLiveChart,
};
