import { UI_CONFIG } from "../../config/ui-config.js";
import { shortenText } from "../../utils/general-utils.js";
import { BaseComponents } from "./base-components.js";

const { cardContainer } = BaseComponents;
const PLACEHOLDER_THUMB = "https://via.placeholder.com/50";
const PLACEHOLDER_LARGE = "https://via.placeholder.com/80";

// Formats numeric price values into USD with fraction digits.
const formatPrice = (value, options = {}) => {
  if (typeof value !== "number") return "N/A";
  const { minimumFractionDigits = 2, maximumFractionDigits = 2 } = options;
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits,
    maximumFractionDigits,
  })}`;
};

// Formats large monetary values with locale separators.
const formatLargeNumber = (value) => {
  if (typeof value !== "number") return "N/A";
  return `$${value.toLocaleString("en-US")}`;
};

// Builds a coin summary card (price, market cap, actions, toggle states).
const coinCard = (coin, isSelected = false, options = {}) => {
  const { id, name, symbol, image, current_price, market_cap } = coin;
  const { isFavorite = false, isInCompare = false } = options;
  const price = formatPrice(current_price);
  const marketCapFormatted = formatLargeNumber(market_cap);
  const displaySymbol = symbol ? symbol.toUpperCase() : "";
  const imageThumb =
    (typeof image === "string"
      ? image
      : image?.thumb || image?.small || image?.large) || PLACEHOLDER_THUMB;

  const body = `
    <div class="d-flex align-items-center gap-3 mb-3">
      <img src="${imageThumb}" alt="${symbol || ""}" loading="lazy"
           class="rounded-circle coin-image">
      <div>
        <h6 class="fw-bold mb-0">${name}</h6>
        <small class="text-muted">${displaySymbol}</small>
      </div>
    </div>
    <p class="mb-2"><strong>Price:</strong> ${price}</p>
    <p class="mb-2"><strong>Market Cap:</strong> ${marketCapFormatted}</p>
    <div class="d-flex justify-content-between align-items-center mt-2 compare-row ${
      isInCompare ? "compare-row-active" : ""
    }" data-id="${id}">
      <button class="btn btn-sm btn-outline-primary more-info"
              data-id="${id}"
              aria-label="Show more info about ${displaySymbol}">
        <i class="fas fa-info-circle"></i> More Info
      </button>
      <button type="button" class="btn btn-sm btn-outline-secondary compare-btn" 
        data-id="${id}" data-symbol="${displaySymbol}"
        aria-label="Compare ${displaySymbol}">
        <i class="fas fa-balance-scale"></i> Compare
      </button>
      <div class="d-flex align-items-center gap-2">
        <button type="button"
                class="btn btn-sm p-0 favorite-btn"
                data-symbol="${displaySymbol}">
          <i class="fas fa-star ${isFavorite ? "text-warning" : "text-muted"}"
             style="font-size: 1.2rem;"></i>
        </button>
        <div class="form-check form-switch mb-0">
          <input class="form-check-input coin-toggle"
           type="checkbox" role="switch"
           aria-label="Track ${displaySymbol}"
           data-symbol="${displaySymbol}"
                 ${isSelected ? "checked" : ""}>
         </div>
      </div>
    </div>
    <div class="collapse mt-3" id="collapse-${id}"></div>
  `;

  const cardClasses = `card border shadow-sm p-3 h-100 ${
    isInCompare ? "compare-card-active" : ""
  }`;

  return `
    <div class="col-12 col-md-6 col-lg-4" data-coin-id="${id}">
      <div class="${cardClasses}">
        ${body}
      </div>
    </div>
  `;
};

// More info panel
// Renders the expanded "more info" panel with fields from the API response.
const coinDetails = (data = {}, currencies = {}) => {
  const { image, name, symbol, description, platforms, market_data } = data;
  const desc = description?.en
    ? shortenText(description.en, UI_CONFIG.COIN_DETAILS.DESCRIPTION_MAX_CHARS)
    : "No description available.";
  const prices = market_data?.current_price || {};
  const priceUsd = prices.usd;
  const priceEur = prices.eur;
  const priceIls = prices.ils;
  const athUsd = market_data?.ath?.usd;
  const imageSrc =
    image?.large ||
    image?.small ||
    image?.thumb ||
    (typeof image === "string" ? image : PLACEHOLDER_LARGE);
  const displaySymbol = symbol ? symbol.toUpperCase() : "";

  // Helper for rendering a badge showing a specific currency value.
  const priceItem = (label, value, curr) => {
    const formatted =
      typeof value === "number"
        ? value.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : "N/A";

    return `
      <div class="price-badge mb-2 p-2 border-left rounded ${
        typeof value !== "number" ? "text-muted" : ""
      }">
        ${label}: ${curr?.symbol ?? ""}${formatted}
      </div>
    `;
  };

  const contractAddress =
    platforms && typeof platforms === "object"
      ? Object.values(platforms).find((addr) => addr)
      : null;

  const rank =
    typeof data.market_cap_rank === "number"
      ? `#${data.market_cap_rank}`
      : "N/A";

  return `
    <div class="more-info-content p-3 bg-light rounded border">
      <div class="d-flex align-items-center gap-3 mb-3">
        <img src="${imageSrc}" alt="${name}" 
          class="coin-info-image rounded-circle shadow">
        <div>
          <h6 class="mb-0">${name}</h6>
          <small class="text-muted">${displaySymbol}</small>
          <div class="text-muted small">Rank: ${rank}</div>
        </div>
      </div>
      <div class="mb-2"><strong>Current Prices:</strong></div>
      ${priceItem("USD", priceUsd, currencies.USD)}
      ${priceItem("EUR", priceEur, currencies.EUR)}
      ${priceItem("ILS", priceIls, currencies.ILS)}
      <div class="mb-2 mt-3"><strong>All-Time High (USD):</strong></div>
      ${priceItem("ATH", athUsd, currencies.USD)}
      <div class="mt-2">
        <small class="text-muted">
          <strong>CA:</strong> ${contractAddress || "N/A"}
        </small>
      </div>
      <div class="mt-3">
        <small class="text-muted">${desc}</small>
      </div>
    </div>
  `;
};

// Placeholder container for attaching a small inline chart per coin.
const coinMiniChart = (id) => `
  <div id="miniChart-${id}" class="mini-chart-container mt-3"></div>
`;

// Modals
// Modal for replacing an existing report when the max selection limit is hit.
const replaceModal = (newSymbol, existingCoins, options = {}) => {
  const { maxCoins } = options;
  const limit =
    typeof maxCoins === "number" ? maxCoins : existingCoins.length || 0;
  const listItems = existingCoins
    .map(
      (coin) => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          ${coin}
          <div class="form-check">
            <input class="form-check-input replace-toggle" type="radio" 
              name="coinToReplace" data-symbol="${coin}">
          </div>
        </li>
      `
    )
    .join("");

  return `
    <div class="modal fade" id="replaceModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header border-bottom">
            <h5 class="modal-title fw-semibold" id="replaceModalLabel">Replace Coin</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>You've reached the limit of ${limit} coins.</p>
            <p>Choose a coin to replace with <strong>${newSymbol}</strong>:</p>
            <ul class="list-group">${listItems}</ul>
          </div>
          <div class="modal-footer border-top">
            <button type="button" class="btn btn-secondary" 
              data-bs-dismiss="modal">Cancel</button>
            <button type="button" id="confirmReplace" 
              class="btn btn-primary">Replace</button>
          </div>
        </div>
      </div>
    </div>
  `;
};

// Compare modal wrapper
const compareModal = (coinsHTML, options = {}) => {
  const { title = "Compare Coins" } = options;
  return `
    <div class="modal fade" id="compareModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header border-bottom">
            <h5 class="modal-title fw-semibold">${title}</h5> 
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            ${coinsHTML}
          </div>
          <div class="modal-footer border-top">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  `;
};

export const CoinComponents = {
  coinCard,
  coinDetails,
  coinMiniChart,
  replaceModal,
  compareModal,
};
