let chart = null;

export const ChartRenderer = {
  init(containerId, symbols = [], options = {}) {
    const {
      updateIntervalMs = 2000,
      title = "Live Crypto Prices (USD)",
      axisXTitle = "Time",
      axisXFormat = "HH:mm:ss",
      axisYTitle = "Price (USD)",
      axisYPrefix = "$",
    } = options;

    chart = new CanvasJS.Chart(containerId, {
      title: { text: title },
      subtitles: [
        {
          text: `Updated every ${updateIntervalMs / 1000} seconds`,
        },
      ],
      axisX: {
        title: axisXTitle,
        valueFormatString: axisXFormat,
      },
      axisY: {
        title: axisYTitle,
        prefix: axisYPrefix,
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
  },

  update(prices = {}, time = new Date(), options = {}) {
    if (!chart) return;
    const { historyPoints = 30 } = options;

    chart.options.data.forEach((series) => {
      const symbol = series.name;
      const price = prices[symbol]?.USD;

      if (price) {
        series.dataPoints.push({ x: time, y: price });

        if (series.dataPoints.length > historyPoints) {
          series.dataPoints.shift();
        }
      }
    });

    chart.render();
  },

  destroy(containerId) {
    if (chart && typeof chart.destroy === "function") {
      chart.destroy();
    }
    if (containerId && typeof document !== "undefined") {
      const el = document.getElementById(containerId);
      if (el) el.innerHTML = "";
    }
    chart = null;
  },
};
