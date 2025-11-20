import { coinAPI } from "./api.js";
import { AppState } from "../state/state.js";
import { CONFIG } from "../config/config.js";

// Emits data only; no DOM/Canvas rendering.
export const ChartService = (() => {
  let updateInterval = null;

  const startLiveChart = (callbacks = {}) => {
    cleanup();
    const symbols = AppState.getSelectedReports();

    if (!symbols.length) {
      return { ok: false, code: "NO_SELECTION" };
    }

    const symbolsString = symbols.join(",");

    const emitData = async () => {
      const result = await coinAPI.getLivePrices(symbolsString.split(","));
      if (!result.ok) {
        callbacks.onError?.({
          code: result.code || "API_ERROR",
          error: result.error,
        });
        cleanup();
        return;
      }

      callbacks.onData?.({
        time: new Date(),
        prices: result.data,
      });
    };

    callbacks.onChartReady?.({
      symbols,
      updateIntervalMs: CONFIG.CHART.UPDATE_INTERVAL_MS,
      historyPoints: CONFIG.CHART.HISTORY_POINTS,
    });

    emitData();

    updateInterval = setInterval(emitData, CONFIG.CHART.UPDATE_INTERVAL_MS);

    return { ok: true, symbols };
  };

  const cleanup = () => {
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
    }
  };

  return {
    startLiveChart,
    cleanup,
  };
})();
