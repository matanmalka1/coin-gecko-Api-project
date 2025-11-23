import { CONFIG } from "../config/config.js";

const liveCharts = {};
const liveChartData = {};

const destroyAll = () => {
  Object.keys(liveCharts).forEach((key) => {
    const chart = liveCharts[key];
    if (chart?.destroy) chart.destroy();
    delete liveCharts[key];
    delete liveChartData[key];
  });
  liveCharts.__historyPoints = undefined;
};

const buildChartCard = (id) => `
  <div class="col-md-6 col-lg-4">
    <div class="card shadow-sm p-3 h-100">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h6 class="mb-0">${id}</h6>
        <small class="text-muted">Live</small>
      </div>
      <div id="live-chart-${id}" style="height:220px;"></div>
    </div>
  </div>
`;

const init = (symbols, options = {}) => {
  const { historyPoints = CONFIG.CHART.HISTORY_POINTS } = options;
  const grid = $("#chartsGrid");
  if (!grid.length) return;

  destroyAll();
  grid.empty();

  symbols.forEach((symbol) => {
    const id = symbol;
    grid.append(buildChartCard(id));

    liveChartData[id] = [];
    liveCharts[id] = new CanvasJS.Chart(`live-chart-${id}`, {
      backgroundColor: "transparent",
      axisX: {
        valueFormatString: CONFIG.CHART.AXIS_X_FORMAT,
        labelFontSize: 10,
      },
      axisY: { prefix: "$", labelFontSize: 10 },
      data: [
        {
          type: "line",
          dataPoints: liveChartData[id],
          color: "#0d6efd",
          markerSize: 0,
          lineThickness: 2,
        },
      ],
    });
    liveCharts[id].render();
  });

  liveCharts.__historyPoints = historyPoints;
};

const update = (prices, time, options = {}) => {
  const historyPoints =
    options.historyPoints || liveCharts.__historyPoints || CONFIG.CHART.HISTORY_POINTS;

  Object.entries(prices || {}).forEach(([symbol, priceObj]) => {
    const chart = liveCharts[symbol];
    const dp = liveChartData[symbol];
    if (!chart || !dp) return;

    const price = priceObj?.USD;
    if (price == null) return;

    dp.push({ x: time, y: price });
    if (dp.length > historyPoints) dp.shift();
    chart.render();
  });
};

const clear = () => {
  destroyAll();
  $("#chartsGrid").empty();
};

export const ChartRenderer = {
  init,
  update,
  clear,
};
