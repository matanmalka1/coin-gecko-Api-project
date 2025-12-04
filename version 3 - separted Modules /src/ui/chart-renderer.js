import { UI_CONFIG } from "../config/ui-config.js";

const charts = new Map();
let maxHistoryPoints = UI_CONFIG.CHART.HISTORY_POINTS;

// Disposes all existing CanvasJS chart instances and cached data.
const destroyAll = () => {
  charts.forEach((entry) => entry?.chart?.remove?.());
  charts.clear();
  maxHistoryPoints = UI_CONFIG.CHART.HISTORY_POINTS;
};

// Creates chart containers + Lightweight Charts candlestick series for each symbol.
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

    const series = chart.addCandlestickSeries({
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

// Streams new candle sets into the charts, enforcing history limits.
const update = (candlesBySymbol = {}, options = {}) => {
  const limit = options.historyPoints ?? maxHistoryPoints;

  Object.entries(candlesBySymbol).forEach(([symbol, candles]) => {
    const entry = charts.get(symbol);
    if (!entry || !Array.isArray(candles)) return;

    const trimmed = candles.slice(-limit);
    entry.series.setData(trimmed);
  });
};

// Clears charts and removes DOM placeholders.
const clear = () => {
  destroyAll();
  $("#chartsGrid").empty();
};

export const ChartRenderer = {
  setupCharts,
  update,
  clear,
};
