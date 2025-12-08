import { UI_CONFIG } from "../config/ui-config.js";
import { ERRORS } from "../config/error.js";
import { ErrorResolver } from "../utils/error-resolver.js";
import { BaseComponents } from "./Components/base-components.js";
import { formatLargeNumber, formatPercent } from "../utils/general-utils.js";

// Replaces the entire page container with provided HTML and resets cache.
const showPage = (html, containerSelector = "#content") => {
  $(containerSelector).empty().html(html);
};

// Safe wrapper for reading data-* attributes.
const getDataAttr = (element, key) => $(element).data(key);

// Renders an alert error message inside a container.
const showError = (container, codeOrMessage, context = {}) => {
  const msg = ErrorResolver.resolve(codeOrMessage, {
    defaultMessage: ERRORS.UI.GENERIC,
    ...context,
  });

  $(container).html(BaseComponents.errorAlert(msg));
};

// Shows a spinner placeholder with optional text.
const showSpinner = (container, message) => {
  const el = $(container);
  if (el.length) el.html(BaseComponents.spinner(message));
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
    ? UI_CONFIG.UI.FAVORITES_HIDE_LABEL
    : UI_CONFIG.UI.FAVORITES_SHOW_LABEL;
  $("#showFavoritesBtn").text(label);
};

const setStatsBar = ({
  totalMarketCap,
  totalVolume,
  btcDominance,
  marketChange,
} = {}) => {
  const {
    LABELS: { MARKET_CAP, VOLUME_24H, BTC_DOMINANCE, MARKET_CHANGE_24H },
  } = UI_CONFIG.STATSBAR;

  const btcDominanceText = formatPercent(btcDominance, { decimals: 1 });
  const marketChangeText = formatPercent(marketChange, {
    decimals: 2,
    showSign: true,
  });

  return [
    { label: MARKET_CAP, value: formatLargeNumber(totalMarketCap) },
    { label: VOLUME_24H, value: formatLargeNumber(totalVolume) },
    { label: BTC_DOMINANCE, value: btcDominanceText },
    { label: MARKET_CHANGE_24H, value: marketChangeText },
  ];
};

const renderStatsBar = (targetSelector, props = {}) => {
  const { ICON } = UI_CONFIG.STATSBAR;

  $(targetSelector).html(`
    <div class="container">
      <div class="row g-3 text-center">
        ${setStatsBar(props)
          .map(
            (stat) => `
              <div class="col-6 col-md-3">
                <div class="card shadow-sm h-100">
                  <div class="card-body d-flex flex-column align-items-center justify-content-center text-center">
                    <div class="mb-2">
                      ${ICON}
                    </div>
                    <div class="text-muted small mb-1">
                      ${stat.label}
                    </div>
                    <div class="fw-bold h5 mb-0">
                      ${stat.value}
                    </div>
                  </div>
                </div>
              </div>
            `
          )
          .join("")}
      </div>
    </div>
  `);
};

let notyfInstance = null;

const getNotifier = () => {
  if (!notyfInstance) {
    notyfInstance = new Notyf({
      duration: 3000,
      position: { x: "right", y: "top" },
      dismissible: true,
      types: [
        {
          type: "info",
          background: "#0ea5e9",
        },
        {
          type: "warning",
          background: "#f97316",
        },
      ],
    });
  }
  return notyfInstance;
};

const showToast = (message, type = "info") => {
  const notyf = getNotifier();

  if (type === "success") {
    notyf.success(message);
  } else if (type === "error") {
    notyf.error(message);
  } else {
    notyf.open({ type, message });
  }
};

export const BaseUI = {
  showPage,
  getDataAttr,
  showError,
  showSpinner,
  toggleCollapse,
  setFavoritesButtonLabel,
  renderStatsBar,
  showToast,
};
