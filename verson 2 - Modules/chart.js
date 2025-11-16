import { UI } from "./ui.js";
import { CoinAPI } from "./api.js";
import { DataManager } from "./data.js";

export const ChartManager = (() => {
  let chart = null;
  let updateInterval = null;

  const startLiveReports = () => {
    const selectedReports = DataManager.getSelectedReports();

    if (!selectedReports.length) {
      UI.showError($("#content"), "Please select up to 5 coins first.");
      return;
    }

    const symbols = selectedReports.join(",");

    chart = new CanvasJS.Chart("chartContainer", {
      title: { text: "Live Crypto Prices (USD)" },
      subtitles: [{ text: "Updated every 2 seconds" }],
      axisX: { title: "Time" },
      axisY: { title: "Price (USD)" },
      legend: { cursor: "pointer" },
      data: selectedReports.map((symbol) => ({
        type: "line",
        name: symbol,
        showInLegend: true,
        dataPoints: [],
      })),
    });

    chart.render();
    updateLiveData(symbols);
    updateInterval = setInterval(() => updateLiveData(symbols), 2000);
  };

  const updateLiveData = async (symbols) => {
    try {
      const data = await CoinAPI.getLivePrices(symbols);
      const time = new Date();

      chart.options.data.forEach((series) => {
        const symbol = series.name;
        const price = data[symbol]?.USD;

        if (price) {
          series.dataPoints.push({ x: time, y: price });
          if (series.dataPoints.length > 30) series.dataPoints.shift();
        }
      });

      chart.render();
    } catch (error) {
      console.error("Live data update failed:", error);
    }
  };

  const cleanupUI = () => {
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
    startLiveReports,
    cleanupUI,
  };
})();
