import { fetchWithRetry } from "./api.js";
import { getSelectedReports } from "./storage-manager.js";
import { APP_CONFIG, CONFIG_CHART } from "../config/app-config.js";

const { CRYPTOCOMPARE_BASE, CRYPTOCOMPARE_KEY, REPORTS_UPDATE_MS } = APP_CONFIG;
const { CHART_POINTS } = CONFIG_CHART;

let liveIntervalId = null;
let liveCandlesBySymbol = {};

const updateSeriesFromPrices = (symbols, pricesBySymbol) => {
  const now = Math.floor(Date.now() / 1000);

  symbols.forEach((symbol) => {
    const price = pricesBySymbol[String(symbol).trim().toUpperCase()].USD;

    const candle = {
      time: now,
      open: price,
      high: price,
      low: price,
      close: price,
    };

   const series =
      liveCandlesBySymbol[String(symbol).trim().toUpperCase()] || [];

    const updated = [...series, candle].slice(-CHART_POINTS);

    liveCandlesBySymbol[String(symbol).trim().toUpperCase()] = [
      ...series,
      candle,
    ].slice(-CHART_POINTS);
  });


  return liveCandlesBySymbol;
};
const fetchLivePrices = async (symbols) => {
  if (!symbols.length) {
    return { ok: false, code: "NONE_SELECTED" };
  }
  if (!Object.keys(liveCandlesBySymbol).length) {
    const historyResults = await Promise.all(
      symbols.map(async (symbol) => {
        const upper = String(symbol).trim().toUpperCase();

        const { ok, data, error, status } = await fetchWithRetry(
          `${CRYPTOCOMPARE_BASE}/histohour?fsym=${upper}&tsym=USD&limit=${
            24 * 7
          }`
        );

        if (!ok || !data?.Data) {
          return { symbol: upper, candles: [], ok: false, error, status };
        }

        const candles = data.Data.map((point) => ({
          time: point.time, // CryptoCompare מחזיר time בשניות כבר
          open: point.open,
          high: point.high,
          low: point.low,
          close: point.close,
        }));

        return { symbol: upper, candles, ok: true };
      })
    );

    historyResults.forEach(({ symbol, candles }) => {
      if (!candles.length) return;
      liveCandlesBySymbol[symbol] = candles.slice(-CHART_POINTS);
    });
  }

  const fsyms = symbols.map((s) => String(s).trim().toUpperCase()).join(",");

  const { ok, data, error, status } = await fetchWithRetry(
    `${CRYPTOCOMPARE_BASE}/pricemulti?fsyms=${fsyms}&tsyms=USD&api_key=${CRYPTOCOMPARE_KEY}`
  );

  if (!ok || !data) {
    return { ok: false, code: "API_ERROR", error, status };
  }

  const candlesBySymbol = updateSeriesFromPrices(symbols, data);
  return { ok: true, candlesBySymbol };
};

// ===== CHART LIFECYCLE =====
export const cleanup = () => {
  if (liveIntervalId) {
    clearInterval(liveIntervalId);
    liveIntervalId = null;
  }
  liveCandlesBySymbol = {};
};

export const startLiveChart = async (chartCallbacks = {}) => {
  cleanup();

  const selected = getSelectedReports();
  if (!selected.length) {
    chartCallbacks.onError?.({ code: "NONE_SELECTED" });
    return { ok: false, code: "NONE_SELECTED" };
  }

  chartCallbacks.onChartReady?.({
    symbols: selected,
    historyPoints: CHART_POINTS,
  });

  const handleResult = (result) => {
    if (!result.ok) {
      chartCallbacks.onError?.({
        code: result.code || "API_ERROR",
        status: result.status,
        error: result.error,
      });
      return;
    }

    chartCallbacks.onData?.({
      candlesBySymbol: result.candlesBySymbol,
    });
  };

  handleResult(await fetchLivePrices(selected));

  liveIntervalId = setInterval(() => {
    fetchLivePrices(selected).then(handleResult);
  }, REPORTS_UPDATE_MS || 2000);

  return { ok: true };
};
