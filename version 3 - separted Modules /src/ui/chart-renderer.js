import { CONFIG } from "../config/config.js";

const charts = new Map();
const chartData = new Map();
let maxHistoryPoints = CONFIG.CHART.HISTORY_POINTS;

const destroyAll = () => {
  charts.forEach((chart) => chart?.destroy?.());
  charts.clear();
  chartData.clear();
  maxHistoryPoints = CONFIG.CHART.HISTORY_POINTS;
};

const setupCharts = (symbols, options = {}) => {
  const grid = $("#chartsGrid");
  if (!grid.length) return;

  destroyAll();
  grid.empty();

  maxHistoryPoints = options.historyPoints ?? CONFIG.CHART.HISTORY_POINTS;

  const isMobile = window.innerWidth <= 576;
  const height = isMobile
    ? CONFIG.CHART.HEIGHT_MOBILE_PX ?? CONFIG.CHART.HEIGHT_PX
    : CONFIG.CHART.HEIGHT_PX;

  symbols.forEach((symbol) => {
    grid.append(`
      <div class="col-md-6 col-lg-4">
        <div class="card shadow-sm p-3 h-100 rounded-3">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="mb-0">${symbol}</h6>
              <small class="text-muted">${CONFIG.CHART.CARD_BADGE_TEXT}</small>
          </div>
          <div id="chart-${symbol}" style="height:${height}px;"></div>
        </div>
      </div>
`);

    const dataPoints = [];
    chartData.set(symbol, dataPoints);
    const chart = new CanvasJS.Chart(`chart-${symbol}`, {
      backgroundColor: "transparent",
      axisX: {
        valueFormatString: CONFIG.CHART.AXIS_X_FORMAT,
        labelFontSize: 10,
      },
      axisY: { prefix: CONFIG.CHART.AXIS_Y_PREFIX , labelFontSize: 10 },
      data: [
        {
          type: "line",
          dataPoints,
          color: "#0d6efd",
          markerSize: 8,
          lineThickness: 4,
        },
      ],
    });
    charts.set(symbol, chart);
    chart.render();
  });
};

const update = (prices, time, options = {}) => {
  const limit = options.historyPoints ?? maxHistoryPoints;

  Object.entries(prices ?? {}).forEach(([symbol, priceObj]) => {
    const chart = charts.get(symbol);
    const dataPoints = chartData.get(symbol);
    if (!chart || !dataPoints) return;

    const value =
      typeof priceObj === "number" ? priceObj : priceObj?.USD ?? priceObj?.usd;
    if (value == null || Number.isNaN(value)) return;

    dataPoints.push({ x: time, y: value });
    if (dataPoints.length > limit) dataPoints.shift();
    chart.render();
  });
};

const clear = () => {
  destroyAll();
  $("#chartsGrid").empty();
};

export const ChartRenderer = {
  setupCharts,
  update,
  clear,
};
