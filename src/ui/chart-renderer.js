import { CONFIG_CHART } from "../config/app-config.js";
import { getCoinMarketChart } from "../services/coins-service.js";
import { ErrorUI } from "./error-ui.js";

const {
  CHART_POINTS,
  CHART_H,
  CHART_H_MOBILE,
  CHART_BADGE,
  CHART_BG,
  CHART_TEXT_BORDER,
  CHART_UP,
  CHART_DOWN,
  CHART_BORDER_UP,
  CHART_BORDER_DOWN,
  CHART_WICK_UP,
  CHART_WICK_DOWN,
} = CONFIG_CHART;
// ===== LIGHTWEIGHT CHARTS (Live Reports) =====

const charts = new Map();
let maxHistoryPoints = CHART_POINTS;

const destroyAll = () => {
  charts.forEach((entry) => entry?.chart?.remove());
  charts.clear();
  maxHistoryPoints = CHART_POINTS;
};

const setupCharts = (symbols, options = {}) => {
  const grid = $("#chartsGrid");
  if (!grid.length) return;

  destroyAll();
  grid.empty();

  maxHistoryPoints = options.historyPoints ?? CHART_POINTS;

  const isMobile = window.innerWidth <= 576;
  const height = isMobile ? CHART_H_MOBILE ?? CHART_H : CHART_H;

  symbols.forEach((symbol) => {
    const containerId = `chart-${symbol}`;
    grid.append(`
      <div class="col-md-6 col-lg-4">
        <div class="card shadow-sm p-3 h-100 rounded-3">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="mb-0">${symbol}</h6>
            <small class="text-muted">${CHART_BADGE}</small>
          </div>
          <div id="${containerId}" style="height:${height}px;"></div>
        </div>
      </div>
`);

    const container = document.getElementById(containerId);
    if (!container || !window.LightweightCharts) return;

    const chart = LightweightCharts.createChart(container, {
      width: container.clientWidth,
      height,
      layout: {background: {type: "solid",color: CHART_BG,},textColor: CHART_TEXT_BORDER,},
      rightPriceScale: { borderColor: CHART_TEXT_BORDER },
      timeScale: { borderColor: CHART_TEXT_BORDER },
    });

    const series = chart.addSeries(LightweightCharts.CandlestickSeries, {
      upColor: CHART_UP,
      downColor: CHART_DOWN,
      borderUpColor: CHART_BORDER_UP,
      borderDownColor: CHART_BORDER_DOWN,
      wickUpColor: CHART_WICK_UP,
      wickDownColor: CHART_WICK_DOWN,
    });
    charts.set(symbol, { chart, series });
  });
};

const update = (candlesBySymbol = {}, options = {}) => {
  const limit = options.historyPoints ?? maxHistoryPoints;

  Object.entries(candlesBySymbol).forEach(([symbol, candles]) => {
    const entry = charts.get(symbol);
    if (!entry || !Array.isArray(candles)) return;

    const trimmed = candles.slice(-limit);
    entry.series.setData(trimmed);
  });
};

const clear = () => {
  destroyAll();
  $("#chartsGrid").empty();
};

// ===== CANVASJS MINI CHARTS (Coin Details) =====

const drawMiniChart = async (coinId) => {
  const { ok, data } = await getCoinMarketChart(coinId);

  if (!ok || !data?.prices || data.prices.length === 0) {
    ErrorUI.showInfo(
      `#miniChart-${coinId}`,
      "No chart data available for this period"
    );
    return;
  }

  const prices = data.prices.map(([time, price]) => ({
    x: new Date(time),
    y: price,
  }));

  const chart = new CanvasJS.Chart(`miniChart-${coinId}`, {
    height: 220,
    backgroundColor: "transparent",
    axisX: {
      labelFormatter: () => "",
    },
    axisY: {
      prefix: "$",
      labelFontSize: 10,
    },
    data: [
      {
        type: "line",
        dataPoints: prices,
        color: "#0d6efd",
        markerSize: 4,
        lineThickness: 2,
      },
    ],
  });

  chart.render();
};

export const ChartRenderer = {
  setupCharts,
  update,
  clear,

  drawMiniChart,
};
