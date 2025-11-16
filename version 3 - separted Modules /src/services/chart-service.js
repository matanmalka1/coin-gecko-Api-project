import { coinAPI } from "./api.js";
import { AppState } from "../state/state.js";
import { UIManager } from "../ui/ui-manager.js";
import { CONFIG } from "../config/config.js";

export const ChartService = (() => {
  let chart = null;
  let updateInterval = null;

  const startLiveChart = () => {
    const selectedReports = AppState.getSelectedReports();

    if (!selectedReports.length) {
      UIManager.showError(
        $("#chartContainer"),
        "Please select up to 5 coins first from the Currencies page."
      );
      return;
    }

    initializeChart(selectedReports);
    startUpdates(selectedReports);
  };

  const initializeChart = (symbols) => {
    chart = new CanvasJS.Chart("chartContainer", {
      title: { text: "Live Crypto Prices (USD)" },
      subtitles: [
        {
          text: `Updated every ${
            CONFIG.REPORTS.UPDATE_INTERVAL / 1000
          } seconds`,
        },
      ],
      axisX: {
        title: "Time",
        valueFormatString: "HH:mm:ss",
      },
      axisY: {
        title: "Price (USD)",
        prefix: "$",
      },
      legend: {
        cursor: "pointer",
      },
      data: symbols.map((symbol) => ({
        type: "line",
        name: symbol,
        showInLegend: true,
        dataPoints: [],
      })),
    });

    chart.render();
  };

  const startUpdates = (symbols) => {
    const symbolsString = symbols.join(",");

    updateChartData(symbolsString);

    updateInterval = setInterval(() => {
      updateChartData(symbolsString);
    }, CONFIG.REPORTS.UPDATE_INTERVAL);
  };

  const updateChartData = async (symbolsString) => {
    try {
      const result = await coinAPI.getLivePrices(symbolsString.split(","));
      if (!result.success) return;

      const data = result.data;

      const time = new Date();

      chart.options.data.forEach((series) => {
        const symbol = series.name;
        const price = data[symbol]?.USD;

        if (price) {
          series.dataPoints.push({ x: time, y: price });

          if (series.dataPoints.length > CONFIG.REPORTS.HISTORY_POINTS) {
            series.dataPoints.shift();
          }
        }
      });

      chart.render();
    } catch (error) {
      console.error("Failed to update chart:", error);
    }
  };

  const cleanup = () => {
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
    }

    if ($("#chartContainer").length) {
      $("#chartContainer").empty();
    }

    chart = null;
  };

  return {
    startLiveChart,
    cleanup,
  };
})();
