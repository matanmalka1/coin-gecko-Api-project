import { coinAPI } from "./api.js";
import { AppState } from "../state/state.js";
import { CONFIG } from "../config/config.js";

// Emits data only; no DOM/Canvas rendering.
export const ChartService = (() => {
  let updateInterval = null;

  const startLiveChart = (chartCallbacks = {}) => {
    cleanup();
    const symbols = AppState.getSelectedReports();

    if (!symbols.length) {
      return { ok: false, code: "NO_SELECTION" };
    }

    let isUpdating = false;

    const sendPriceUpdates = async () => {
      if (isUpdating) return;

      isUpdating = true;
      try {
        const result = await coinAPI.fetchLivePrices(symbols);

        if (!result.ok) {
          chartCallbacks.onError?.({
            code: result.code ?? "API_ERROR",
            error: result.error,
          });
          cleanup();
          return;
        }

        chartCallbacks.onData?.({
          time: new Date(),
          prices: result.data,
        });
      } finally {
        isUpdating = false;
      }
    };

    chartCallbacks.onChartReady?.({
      symbols,
      updateIntervalMs: CONFIG.CHART.UPDATE_INTERVAL_MS,
      historyPoints: CONFIG.CHART.HISTORY_POINTS,
    });

    sendPriceUpdates();

    updateInterval = setInterval(
      sendPriceUpdates,
      CONFIG.CHART.UPDATE_INTERVAL_MS
    );

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
