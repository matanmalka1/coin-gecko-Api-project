import { CHART_CONFIG } from "../config/app-config.js";
import { getCoinMarketChart } from "../services/coins-service.js";
import { ensureArray } from "../utils/general-utils.js";

// ===== LIGHTWEIGHT CHARTS (Live Reports) =====
const charts = new Map();
let maxHistoryPoints = CHART_CONFIG.points;

const destroyAll = () => {
  charts.forEach((entry) => entry?.chart?.remove());
  charts.clear();
  maxHistoryPoints = CHART_CONFIG.points;
};

const setupCharts = (symbols, options = {}) => {
  const grid = $("#chartsGrid");
  if (!grid.length) return;

  destroyAll();
  grid.empty();

  maxHistoryPoints = options.historyPoints ?? CHART_CONFIG.points;

  const isMobile = window.innerWidth <= 576;
  const height = isMobile ? 180 : 220;
  const colors = CHART_CONFIG.colors;

  symbols.forEach((symbol) => {
    const containerId = `chart-${symbol}`;
    grid.append(`
      <div class="col-md-6 col-lg-4">
        <div class="card shadow-sm p-3 h-100 rounded-3">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="mb-0">${symbol}</h6>
            <small class="text-muted">${CHART_CONFIG.badge}</small>
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
      layout: {
        background: { type: "solid", color: colors.background },
        textColor: colors.textBorder,
      },
      rightPriceScale: { borderColor: colors.textBorder },
      timeScale: { borderColor: colors.textBorder },
    });

    const series = chart.addSeries(LightweightCharts.CandlestickSeries, {
      upColor: colors.up,
      downColor: colors.down,
      borderUpColor: colors.borderUp,
      borderDownColor: colors.borderDown,
      wickUpColor: colors.wickUp,
      wickDownColor: colors.wickDown,
    });
    charts.set(symbol, { chart, series });
  });
};

const update = (candlesBySymbol = {}, options = {}) => {
  const limit = options.historyPoints ?? maxHistoryPoints;

  Object.entries(candlesBySymbol).forEach(([symbol, candles]) => {
    const entry = charts.get(symbol);
    if (!entry || ensureArray(candles)) return;

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
    $(`#miniChart-${coinId}`).html(`<p class="text-center text-muted">No chart data available</p>`);
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
