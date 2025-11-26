import { CONFIG } from "../../config/config.js";
import { shortenText } from "../../utils/general-utils.js";
import { BaseComponents } from "./base-components.js";

const { cardContainer } = BaseComponents;

const coinCard = (coin, isSelected = false, options = {}) => {
  const { id, name, symbol, image, current_price, market_cap } = coin;
  const { isFavorite = false } = options;

  const price =
    typeof current_price === "number"
      ? `$${current_price.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "N/A";

  const marketCapFormatted =
    typeof market_cap === "number" ? `$${market_cap.toLocaleString()}` : "N/A";

  const body = `
    <div class="d-flex align-items-center gap-3 mb-3">
      <img src="${image}" alt="${symbol}" loading="lazy"
           class="rounded-circle coin-image">
      <div>
        <h6 class="fw-bold mb-0">${name}</h6>
        <small class="text-muted">${symbol.toUpperCase()}</small>
      </div>
    </div>
    <p class="mb-2"><strong>Price:</strong> ${price}</p>
    <p class="mb-2"><strong>Market Cap:</strong> ${marketCapFormatted}</p>
    <div class="d-flex justify-content-between align-items-center mt-2">
      <button class="btn btn-sm btn-outline-primary more-info"
              data-id="${id}"
              aria-label="Show more info about ${symbol}">
        <i class="fas fa-info-circle"></i> More Info
      </button>
      <button type="button" class="btn btn-sm btn-outline-secondary compare-btn" 
        data-id="${id}" data-symbol="${symbol.toUpperCase()}"
        aria-label="Compare ${symbol}">
        <i class="fas fa-balance-scale"></i> Compare
      </button>
      <div class="d-flex align-items-center gap-2">
        <button type="button"
                class="btn btn-sm p-0 favorite-btn"
                data-symbol="${symbol.toUpperCase()}">
          <i class="fas fa-star ${isFavorite ? "text-warning" : "text-muted"}"
             style="font-size: 1.2rem;"></i>
        </button>
        <div class="form-check form-switch mb-0">
          <input class="form-check-input coin-toggle"
           type="checkbox" role="switch"
           aria-label="Track ${symbol}"
           data-symbol="${symbol.toUpperCase()}"
                 ${isSelected ? "checked" : ""}>
         </div>
      </div>
    </div>
    <div class="collapse mt-3" id="collapse-${id}"></div>
  `;

  return cardContainer(
    body,
    "col-12 col-md-6 col-lg-4",
    "card border-0 shadow-sm hover-shadow transition p-3 h-100"
  );
};

// More info panel
const coinDetails = (data = {}, currencies = {}) => {
  const { image, name, symbol, market_data, description, platforms } = data;
  const {
    usd = "N/A",
    eur = "N/A",
    ils = "N/A",
  } = market_data?.current_price || {};

  const { usd: athUsd = "N/A" } = market_data?.ath || {};

  const desc = description?.en
    ? shortenText(description.en, 200)
    : "No description available.";

  const priceItem = (label, value, curr) => {
    const formatted =
      value !== "N/A" && typeof value === "number"
        ? value.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : value;

    return `
      <div class="price-badge mb-2 p-2 bg-white rounded ${
        value === "N/A" ? "text-muted" : ""
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
    <div class="more-info-content p-3 bg-light rounded">
      <div class="d-flex align-items-center gap-3 mb-3">
        <img src="${image.large}" alt="${name}" 
          class="coin-info-image rounded-circle">
        <div>
          <h6 class="mb-0">${name}</h6>
          <small class="text-muted">${symbol.toUpperCase()}</small>
          <div class="text-muted small">Rank: ${rank}</div>
        </div>
      </div>
      <div class="mb-2"><strong>Current Prices:</strong></div>
      ${priceItem("USD", usd, currencies.USD)}
      ${priceItem("EUR", eur, currencies.EUR)}
      ${priceItem("ILS", ils, currencies.ILS)}
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

const coinMiniChart = (id) => `
  <div id="miniChart-${id}" class="mini-chart-container mt-3"></div>
`;

// Modals
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
          <div class="modal-header">
            <h5 class="modal-title" id="replaceModalLabel">Replace Coin</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>You've reached the limit of ${limit} coins.</p>
            <p>Choose a coin to replace with <strong>${newSymbol}</strong>:</p>
            <ul class="list-group">${listItems}</ul>
          </div>
          <div class="modal-footer">
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
          <div class="modal-header">
            <h5 class="modal-title">${title}</h5> 
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            ${coinsHTML}
          </div>
          <div class="modal-footer">
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
