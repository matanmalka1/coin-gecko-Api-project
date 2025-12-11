import { APP_CONFIG } from "../config/app-config.js";
import { spinner } from "./Components/base-components.js";
import { formatLargeNumber, formatPercent } from "../utils/general-utils.js";

// Replaces the entire page container with provided HTML and resets cache.
const showPage = (html, containerSelector = "#content") => {
  $(containerSelector).empty().html(html);
};

// Shows a spinner placeholder with optional text.
const showSpinner = (container, message) => {
  const el = $(container);
  if (el.length) el.html(spinner(message));
};

// Opens/closes a collapse region with a smooth slide animation.
const toggleCollapse = (collapseId, show) => {
  const element = $(`#${collapseId}`);
  if (!element.length) return;

  element.toggleClass("show", show);
  show ? element.slideDown() : element.slideUp();
};

// Updates the favorites toggle button caption based on mode.
const setFavoritesButtonLabel = (showingFavorites) => {
  const label = showingFavorites
    ? APP_CONFIG.UI_FAV_HIDE
    : APP_CONFIG.UI_FAV_SHOW;
  $("#showFavoritesBtn").text(label);
};

const setStatsBar = ({ totalMarketCap, totalVolume, btcDominance, marketChange } = {}) => [
  {label: "Market Cap",value: formatLargeNumber(totalMarketCap),},
  {label: "24h Volume",value: formatLargeNumber(totalVolume),},
  {label: "BTC Dominance",value: formatPercent(btcDominance, { decimals: 1 }),},
  {label: "Market Change",value: formatPercent(marketChange, { decimals: 2, showSign: true }),},
];

const renderStatsBar = (targetSelector, props = {}) => {
  $(targetSelector).html(`
    <div class="container">
      <div class="row g-3 text-center">
        ${setStatsBar(props)
          .map((stat) => `
              <div class="col-6 col-md-3">
                <div class="card shadow-sm h-100">
                  <div class="card-body d-flex flex-column align-items-center justify-content-center text-center">
                    <div class="mb-2">${`<i class="fas fa-chart-bar"></i>`}</div>
                    <div class="text-muted small mb-1">${stat.label}</div>
                    <div class="fw-bold h5 mb-0">${stat.value}</div>
                  </div>
                </div>
              </div>
            `
          ).join("")}
      </div>
    </div>
  `);
};

export const BaseUI = {
  showPage,
  showSpinner,
  toggleCollapse,
  setFavoritesButtonLabel,
  renderStatsBar,
};
