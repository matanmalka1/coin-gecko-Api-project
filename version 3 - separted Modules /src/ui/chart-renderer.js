import { APP_CONFIG } from "../config/app-config.js";
import { CoinsService } from "../services/coins-service.js";
import { ErrorUI } from "./error-ui.js";

// ===== LIGHTWEIGHT CHARTS (Live Reports) =====

const charts = new Map();
let maxHistoryPoints = APP_CONFIG.CHART_POINTS;

const destroyAll = () => {
  charts.forEach((entry) => entry?.chart?.remove());
  charts.clear();
  maxHistoryPoints = APP_CONFIG.CHART_POINTS;
};

const setupCharts = (symbols, options = {}) => {
  const grid = $("#chartsGrid");
  if (!grid.length) return;

  destroyAll();
  grid.empty();

  maxHistoryPoints = options.historyPoints ?? APP_CONFIG.CHART_POINTS;

  const isMobile = window.innerWidth <= 576;
  const height = isMobile
    ? APP_CONFIG.CHART_H_MOBILE ?? APP_CONFIG.CHART_H
    : APP_CONFIG.CHART_H;

  symbols.forEach((symbol) => {
    const containerId = `chart-${symbol}`;
    grid.append(`
      <div class="col-md-6 col-lg-4">
        <div class="card shadow-sm p-3 h-100 rounded-3">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="mb-0">${symbol}</h6>
            <small class="text-muted">${APP_CONFIG.CHART_BADGE}</small>
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
        background: {
          type: "solid",
          color: APP_CONFIG.CHART_BG,
        },
        textColor: APP_CONFIG.CHART_TEXT,
      },
      rightPriceScale: { borderColor: APP_CONFIG.CHART_BORDER },
      timeScale: { borderColor: APP_CONFIG.CHART_BORDER },
    });

    const series = chart.addSeries(LightweightCharts.CandlestickSeries, {
      upColor: APP_CONFIG.CHART_UP,
      downColor: APP_CONFIG.CHART_DOWN,
      borderUpColor: APP_CONFIG.CHART_BORDER_UP,
      borderDownColor: APP_CONFIG.CHART_BORDER_DOWN,
      wickUpColor: APP_CONFIG.CHART_WICK_UP,
      wickDownColor: APP_CONFIG.CHART_WICK_DOWN,
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
  const { ok, data } = await CoinsService.getCoinMarketChart(coinId);

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

// ===== EXPORTS =====

export const ChartRenderer = {
  // Lightweight Charts (Live Reports)
  setupCharts,
  update,
  clear,

  // CanvasJS Mini Charts (Coin Details)
  drawMiniChart,
};
