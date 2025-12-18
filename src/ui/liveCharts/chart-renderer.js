import { CHART_CONFIG } from "../../config/app-config.js";
import { ensureArray } from "../../utils/general-utils.js";

const charts = new Map();
let emblaApi = null;
let emblaSymbols = [];

const cleanup = () => {
  charts.forEach((entry) => entry?.chart?.remove());
  charts.clear();
  emblaApi?.destroy();
  emblaApi = null;
  emblaSymbols = [];
  $("#reportsPager").html("0 / 0");
};

const cleanAndValidateCandle = (candle) => {
  if (!candle || candle.time == null) return null;
  const [open, high, low, close] = [
    +candle.open,
    +candle.high,
    +candle.low,
    +candle.close,
  ];
  if (![open, high, low, close].every(Number.isFinite)) return null;
  return { time: candle.time, open, high, low, close };
};

export const setupCharts = (symbols) => {
  const track = $("#chartsTrack");
  const viewport = document.getElementById("emblaView");
  if (!track.length || !viewport) return;

  cleanup();
  track.empty();

  const height = window.innerWidth <= 576 ? 180 : 450;
  const { colors } = CHART_CONFIG;
  emblaSymbols = ensureArray(symbols);

  symbols.forEach((symbol) => {
    const containerId = `chart-${symbol}`;
    track.append(`
      <div class="embla__slide">
        <div class="card shadow-sm p-3 h-100 rounded-3">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="mb-0">${symbol}</h6>
            <small class="text-muted">${CHART_CONFIG.badge}</small>
          </div>
          <div id="${containerId}" style="height:${height}px;"></div>
        </div>
      </div>`);

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
      timeScale: { borderColor: colors.textBorder, barSpacing: 20 },
      localization: {
        timeFormatter: (ts) =>
          new Date(ts * 1000).toLocaleString("he-IL", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
      },
    });

    const series = chart.addSeries(LightweightCharts.CandlestickSeries, {
      upColor: colors.up,
      downColor: colors.down,
      borderUpColor: colors.borderUp,
      borderDownColor: colors.borderDown,
      wickUpColor: colors.wickUp,
      wickDownColor: colors.wickDown,
    });
    charts.set(symbol, { chart, series, container });
  });

  if (!window.EmblaCarousel) return;
  emblaApi = window.EmblaCarousel(viewport, { loop: false, align: "start" });

  const updateNav = () => {
    if (!emblaApi) return;
    $("#reportsPager").html(
      `${emblaApi.selectedScrollSnap() + 1} / ${
        emblaApi.scrollSnapList().length
      }`
    );
    $("#reportsPrevBtn").prop("disabled", !emblaApi.canScrollPrev());
    $("#reportsNextBtn").prop("disabled", !emblaApi.canScrollNext());
  };

  const resizeVisibleChart = () => {
    if (!emblaApi) return;
    const entry = charts.get(emblaSymbols[emblaApi.selectedScrollSnap()]);
    const { clientWidth: w, clientHeight: h } = entry.container;
    if (w && h) entry.chart.resize(w, h);
  };

  const handleCarouselChange = () => {
    updateNav();
    requestAnimationFrame(resizeVisibleChart);
  };

  $("#reportsPrevBtn")
    .off(".reports")
    .on("click.reports", () => emblaApi?.scrollPrev());
  $("#reportsNextBtn")
    .off(".reports")
    .on("click.reports", () => emblaApi?.scrollNext());

  emblaApi
    .on("init", handleCarouselChange)
    .on("select", handleCarouselChange)
    .on("reInit", handleCarouselChange);
};

export const update = (candlesBySymbol = {}) =>
  Object.entries(candlesBySymbol).forEach(([symbol, candles]) => {
    const series = charts.get(symbol)?.series;
    if (!series || !Array.isArray(candles) || !candles.length) return;

    const data =
      candles.length > 1
        ? candles.map(cleanAndValidateCandle).filter(Boolean)
        : cleanAndValidateCandle(candles[0]);

    if (!data || (Array.isArray(data) && !data.length)) return;
    try {
      Array.isArray(data) ? series.setData(data) : series.update(data);
    } catch {}
  });
