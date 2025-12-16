import { fetchWithRetry } from "./api.js";
import { getSelectedReports } from "./storage-manager.js";
import { CHART_CONFIG, CRYPTOCOMPARE_BASE, CRYPTOCOMPARE_KEY, REPORTS_UPDATE_MS } from "../config/app-config.js";
import { ERRORS } from "../config/error.js";

let liveIntervalId = null;
let liveCandlesBySymbol = {};
let isInitialHistoryLoad = false;

const updateSeriesFromPrices = (symbols, pricesBySymbol) => {
  const now = Math.floor(Date.now() / 1000);

  symbols.forEach((symbol) => {
    const price = Number(pricesBySymbol?.[symbol]?.USD);
    if (!Number.isFinite(price)) return;

    const series = (liveCandlesBySymbol[symbol] ||= []);
    series.push({ time: now, open: price, high: price, low: price, close: price });
    if (series.length > CHART_CONFIG.points) series.splice(0, series.length - CHART_CONFIG.points);
  });
  return liveCandlesBySymbol;
};

const fetchLivePrices = async (symbols) => {
  if (!symbols.length) {return { ok: false, error: ERRORS.NONE_SELECTED };}

  if (!Object.keys(liveCandlesBySymbol).length) {
    const historyResults = await Promise.all(
      symbols.map(async (symbol) => {
        const { ok, data, error, status } = await fetchWithRetry(
          `${CRYPTOCOMPARE_BASE}/histohour?fsym=${symbol}&tsym=USD&limit=${30 * 7}&api_key=${CRYPTOCOMPARE_KEY}`
        );

        const { Data: rawCandles = [] } = data || {};
        if (!ok || !Array.isArray(rawCandles)) {
          return { symbol, candles: [], ok: false, error, status };
        }

        const candles = rawCandles
          .filter(
            ({ open, high, low, close }) =>
              open !== null &&high !== null &&low !== null && close !== null 
          )
          .map(({ time, open, high, low, close }) => 
            ({ time, open, high, low, close }))

        return { symbol, candles, ok: true };
      })
    );

    historyResults.forEach(({ symbol, candles }) => {
      if (!candles.length) return;
      liveCandlesBySymbol[symbol] = candles.slice(-CHART_CONFIG.points);
    });
  }
  const fsyms = symbols.join(",");

  const { ok, data, error, status } = await fetchWithRetry(
    `${CRYPTOCOMPARE_BASE}/pricemulti?fsyms=${fsyms}&tsyms=USD&api_key=${CRYPTOCOMPARE_KEY}`
  );

  if (!ok || !data) {
    return {ok: false,error: error || ERRORS.LIVE_CHART_ERROR,status,};
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
      chartCallbacks.onError?.({ error: ERRORS.NONE_SELECTED });
      return { ok: false, error: ERRORS.NONE_SELECTED };
    }

    chartCallbacks.onChartReady?.({
      symbols: selected,
      historyPoints: CHART_CONFIG.points,
    });

    const handleResult = ({ ok, status, error, candlesBySymbol }) => {
      if (!ok) {
        chartCallbacks.onError?.({
          status,
          error: error || ERRORS.LIVE_CHART_ERROR,
        });
        return;
      }

      let dataToSend = candlesBySymbol; 
      if (!isInitialHistoryLoad) {
        isInitialHistoryLoad = true
      } else {
        dataToSend = Object.fromEntries(
          Object.entries(candlesBySymbol)
          
            .filter(([, candles]) => candles?.length) 
            .map(([symbol, candles]) => [symbol, [candles.at(-1)]])
        );
      }
      chartCallbacks.onData?.({
        candlesBySymbol: dataToSend, 
      });
    };
    
    handleResult(await fetchLivePrices(selected)); 

    liveIntervalId = setInterval(() => {
      fetchLivePrices(selected).then(handleResult); 
    }, REPORTS_UPDATE_MS || 2000);

    return { ok: true };
  };
