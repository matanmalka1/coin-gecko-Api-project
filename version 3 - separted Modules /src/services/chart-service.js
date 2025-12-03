import { coinAPI } from "./api.js";
import { AppState } from "../state/state.js";
import { UI_CONFIG } from "../config/ui-config.js";

// Emits data only; no DOM/Canvas rendering.
let updateInterval = null;

// Stops the polling interval and resets state.
const cleanup = () => {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
};

// Starts polling live prices for the selected reports.
const startLiveChart = (chartCallbacks = {}) => {
  cleanup();

  const symbols = AppState.getSelectedReports();
  if (!symbols.length) {
    return { ok: false, code: "NONE_SELECTED" };
  }

  const { UPDATE_INTERVAL_MS, HISTORY_POINTS } = UI_CONFIG.CHART;
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
          status: result.status,
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
    updateIntervalMs: UPDATE_INTERVAL_MS,
    historyPoints: HISTORY_POINTS,
  });

  sendPriceUpdates();
  updateInterval = setInterval(sendPriceUpdates, UPDATE_INTERVAL_MS);

  return { ok: true, symbols };
};

export const ChartService = {
  startLiveChart,
  cleanup,
};
