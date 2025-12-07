import { UI_CONFIG } from "../config/ui-config.js";
import { CoinsService } from "../services/coins-service.js";
import { BaseComponents } from "./Components/base-components.js";

// ===== LIGHTWEIGHT CHARTS (Live Reports) =====

const charts = new Map();
let maxHistoryPoints = UI_CONFIG.CHART.HISTORY_POINTS;

const destroyAll = () => {
  charts.forEach((entry) => entry?.chart?.remove());
  charts.clear();
  maxHistoryPoints = UI_CONFIG.CHART.HISTORY_POINTS;
};

const setupCharts = (symbols, options = {}) => {
  const grid = $("#chartsGrid");
  if (!grid.length) return;

  destroyAll();
  grid.empty();

  maxHistoryPoints = options.historyPoints ?? UI_CONFIG.CHART.HISTORY_POINTS;

  const isMobile = window.innerWidth <= 576;
  const height = isMobile
    ? UI_CONFIG.CHART.HEIGHT_MOBILE_PX ?? UI_CONFIG.CHART.HEIGHT_PX
    : UI_CONFIG.CHART.HEIGHT_PX;

  symbols.forEach((symbol) => {
    const containerId = `chart-${symbol}`;
    grid.append(`
      <div class="col-md-6 col-lg-4">
        <div class="card shadow-sm p-3 h-100 rounded-3">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="mb-0">${symbol}</h6>
            <small class="text-muted">${UI_CONFIG.CHART.CARD_BADGE_TEXT}</small>
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
        background: { type: "solid", color: UI_CONFIG.CHART.LAYOUT.BACKGROUND },
        textColor: UI_CONFIG.CHART.LAYOUT.TEXT,
      },
      rightPriceScale: { borderColor: UI_CONFIG.CHART.LAYOUT.BORDER },
      timeScale: { borderColor: UI_CONFIG.CHART.LAYOUT.BORDER },
    });

    const series = chart.addSeries(LightweightCharts.CandlestickSeries, {
      upColor: UI_CONFIG.CHART.CANDLE_COLORS.UP,
      downColor: UI_CONFIG.CHART.CANDLE_COLORS.DOWN,
      borderUpColor: UI_CONFIG.CHART.CANDLE_COLORS.BORDER_UP,
      borderDownColor: UI_CONFIG.CHART.CANDLE_COLORS.BORDER_DOWN,
      wickUpColor: UI_CONFIG.CHART.CANDLE_COLORS.WICK_UP,
      wickDownColor: UI_CONFIG.CHART.CANDLE_COLORS.WICK_DOWN,
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
    $(`#miniChart-${coinId}`).html(
      BaseComponents.infoAlert("No chart data available for this period")
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
