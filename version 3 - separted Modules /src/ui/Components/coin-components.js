import { APP_CONFIG } from "../../config/app-config.js";
import {
  shortenText,
  formatPrice,
  formatLargeNumber,
} from "../../utils/general-utils.js";

const PLACEHOLDER_THUMB = "images/3.png";

// Builds a coin summary card (price, market cap, actions, toggle states).
const coinCardHeader = (coin) => {
  const { name, symbol, image } = coin;

  const imageSource =
    (typeof image === "string"
      ? image
      : image?.thumb || image?.small || image?.large) || PLACEHOLDER_THUMB;

  return `
    <div class="d-flex align-items-center gap-3 mb-3">
      <img src="${imageSource}" 
           alt="${symbol?.toUpperCase() || ""}" 
           loading="lazy"
           class="rounded-circle coin-image">
      <div>
        <h6 class="fw-bold mb-0">${name}</h6>
        <small class="text-muted">${symbol?.toUpperCase() || ""}</small>
      </div>
    </div>
  `;
};
const coinCardActions = (
  coin,
  isSelected,
  { isFavorite = false, isInCompare = false } = {}
) => {
  const { id, symbol } = coin;
  const sym = symbol?.toUpperCase() || "";
  return `
    <div class="d-flex justify-content-between align-items-center mt-2 compare-row ${
      isInCompare ? "compare-row-active" : ""
    }" data-id="${id}">
      <button class="btn btn-sm btn-outline-primary more-info" data-id="${id}" aria-label="Show more info about ${sym}">
        <i class="fas fa-info-circle"></i> More Info</button>

      <button type="button" class="btn btn-sm btn-outline-primary compare-btn" data-id="${id}" data-symbol="${sym}" aria-label="Compare ${sym}">
        <i class="fas fa-balance-scale"></i> Compare</button>

      <div class="d-flex align-items-center gap-2">
        <button type="button" class="btn btn-sm p-0 favorite-btn" data-symbol="${sym}">
          <i class="fas fa-star ${
            isFavorite ? "text-primary" : "text-muted"
          }" style="font-size: 1.2rem;"></i></button>
        <div class="form-check form-switch mb-0">
          <input class="form-check-input coin-toggle" type="checkbox" role="switch" aria-label="Track ${sym}" data-symbol="${sym}" ${
    isSelected ? "checked" : ""
  }></div>
          </div></div>`;
};

export const coinCard = (coin, isSelected = false, options = {}) => {
  const { id, current_price, market_cap } = coin;
  return `
    <div class="col-12 col-md-6 col-lg-4" data-coin-id="${id}">
      <div class="card border shadow-sm p-3 h-100 ${
        options.isInCompare ? "compare-card-active" : ""
      }">
        ${coinCardHeader(coin)}
        <p class="mb-2"><strong>Price:</strong> ${formatPrice(
          current_price
        )}</p>
        <p class="mb-2"><strong>Market Cap:</strong> ${formatLargeNumber(
          market_cap
        )}</p>
        ${coinCardActions(coin, isSelected, options)}
        <div class="collapse mt-3" id="collapse-${id}"></div></div></div>`;
};

// More info panel
// Renders the expanded "more info" panel with fields from the API response.
export const coinDetails = (data = {}, currencies = {}) => {
  const { image, name, symbol, description, platforms, market_data } = data;
  const desc = description?.en
    ? shortenText(description.en, APP_CONFIG.COIN_DESC_MAX)
    : "No description available.";
  const prices = market_data?.current_price || {};
  const imageSrc =
    image?.large ||
    image?.small ||
    image?.thumb ||
    (typeof image === "string" ? image : PLACEHOLDER_THUMB);
  const sym = symbol ? symbol.toUpperCase() : "";
  const priceItem = (label, value, curr) =>
    `<div class="price-badge mb-2 p-2 border-left rounded ${
      typeof value !== "number" ? "text-muted" : ""
    }">${label}: ${formatPrice(value, curr)}</div>`;
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
        <img src="${imageSrc}" alt="${name}" class="coin-info-image rounded-circle shadow">
        <div><h6 class="mb-0">${name}</h6><small class="text-muted">${sym}</small><div class="text-muted small">Rank: ${rank}</div></div></div>
      <div class="mb-2"><strong>Current Prices:</strong></div>
      ${priceItem("USD", prices.usd, currencies.USD)}${priceItem(
    "EUR",
    prices.eur,
    currencies.EUR
  )}${priceItem("ILS", prices.ils, currencies.ILS)}
      <div class="mb-2 mt-3"><strong>All-Time High (USD):</strong></div>${priceItem(
        "ATH",
        market_data?.ath?.usd,
        currencies.USD
      )}
      <div class="mt-2"><small class="text-muted"><strong>CA:</strong> ${
        contractAddress || "N/A"
      }</small></div>
      <div class="mt-3"><small class="text-muted">${desc}</small></div></div>`;
};

// Placeholder container for attaching a small inline chart per coin.
export const coinMiniChart = (id) => `
  <div id="miniChart-${id}" class="mini-chart-container mt-3"></div>
`;

// Modals
// Modal for replacing an existing report when the max selection limit is hit.
export const replaceModal = (newSymbol, existingCoins, options = {}) => {
  const limit =
    typeof options.maxCoins === "number"
      ? options.maxCoins
      : existingCoins.length || 0;
  const listItems = existingCoins
    .map(
      (coin) =>
        `<li class="list-group-item d-flex justify-content-between align-items-center">${coin}
      <div class="form-check"><input class="form-check-input replace-toggle" type="radio" name="coinToReplace" data-symbol="${coin}"></div></li>`
    )
    .join("");

  return `
    <div class="modal fade" id="replaceModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog"><div class="modal-content">
          <div class="modal-header border-bottom"><h5 class="modal-title fw-semibold" id="replaceModalLabel">Replace Coin</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
          <div class="modal-body"><div id="replaceModalError"></div>
            <p>You've reached the limit of ${limit} coins.</p><p>Choose a coin to replace with <strong>${newSymbol}</strong>:</p>
            <ul class="list-group">${listItems}</ul></div>
          <div class="modal-footer border-top"><button type="button" id="confirmReplace" class="btn btn-primary">Replace</button></div>
        </div></div></div>`;
};

// Compare modal wrapper
export const compareModal = (coinsHTML, options = {}) => `
  <div class="modal fade" id="compareModal">
    <div class="modal-dialog modal-lg"><div class="modal-content">
        <div class="modal-header border-bottom"><h5 class="modal-title fw-semibold">${
          options.title || "Compare Coins"
        }</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
        <div class="modal-body"><div id="compareModalMessage" class="mb-3"></div>${coinsHTML}</div>
      </div></div></div>`;
