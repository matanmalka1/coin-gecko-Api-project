import { REPORTS_COMPARE_MAX } from "../../config/app-config.js";
import { shortenText, formatPrice, formatLargeNumber, ensureArray } from "../../utils/general-utils.js";
import { ChartRenderer } from "../chart-renderer.js";
const COIN_DESC_MAX = 200;

let compareSelection = [];

const getCoinImage = (image) =>
  typeof image === "string"
    ? image
    : image?.thumb || image?.small || image?.large || "images/2.png";

const refreshCompareHighlights = () => {
  const selectedSet = new Set(compareSelection);

  $(".compare-row").each(function () {
    const $row = $(this);
    const isActive = selectedSet.has(String($row.data("id")));

    if ($row.hasClass("compare-row-active") !== isActive) {
      $row.toggleClass("compare-row-active", isActive);
      $row.closest(".card").toggleClass("compare-card-active", isActive);
    }
  });
};

export const getCompareSelection = () => ensureArray(compareSelection);

export const resetCompareSelection = () => {
  compareSelection = [];
  refreshCompareHighlights();
};

export const setCompareSelection = (nextSelection = []) => {
  compareSelection = ensureArray(nextSelection).map((id) => String(id));
  refreshCompareHighlights();
  return getCompareSelection();
};

export const toggleCompareSelection = (coinId, max = REPORTS_COMPARE_MAX) => {
  const id = String(coinId || "");
  if (!id) return { ok: false, error: null, selected: getCompareSelection() };

  const exists = compareSelection.includes(id);
  if (exists) {
    compareSelection = compareSelection.filter((cid) => cid !== id);
    refreshCompareHighlights();
    return { ok: true, selected: getCompareSelection(), wasAdded: false };
  }

  if (compareSelection.length >= max) {
    return { ok: false, error: null, selected: getCompareSelection(), limitExceeded: true };
  }

  compareSelection = [...compareSelection, id];
  refreshCompareHighlights();
  return { ok: true, selected: getCompareSelection(), wasAdded: true };
};

const coinCardHeader = (coin) => {
  const { name, symbol, image } = coin;

  const imageSource = getCoinImage(image);

  return `
    <div class="d-flex align-items-center gap-3 mb-3">
      <img src="${imageSource}" alt="${
    symbol?.toUpperCase() || ""
  }" loading="lazy" class="rounded-circle coin-image">
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
        <i class="fas fa-info-circle"></i> More Info
      </button>
      <button type="button" class="btn btn-sm btn-outline-primary compare-btn" data-id="${id}" data-symbol="${sym}" aria-label="Compare ${sym}">
        <i class="fas fa-balance-scale"></i> Compare
      </button>
      <div class="d-flex align-items-center gap-2">
          <button type="button" class="btn btn-sm p-0 favorite-btn" data-symbol="${sym}">
          <i class="fas fa-star ${
            isFavorite ? "text-primary" : "text-muted"
          }" style="font-size: 1.2rem;"></i>
          </button>
        <div class="form-check form-switch mb-0">
          <input class="form-check-input coin-toggle" type="checkbox" role="switch" aria-label="Track ${sym}" data-symbol="${sym}" ${
    isSelected ? "checked" : ""
  }>
        </div>
      </div>
    </div>`;
};

const coinCard = (coin, isSelected = false, options = {}) => {
  const { id, current_price, market_cap } = coin;
  return `
    <div class="col-12 col-md-6 col-lg-4" data-coin-id="${id}">
      <div class="card border shadow-sm p-3 h-100 ${
        options.isInCompare ? "compare-card-active" : ""
      } ">
        ${coinCardHeader(coin)}
        <p class="mb-2"><strong>Price:</strong> ${formatPrice(
          current_price
        )}</p>
        <p class="mb-2"><strong>Market Cap:</strong> ${formatLargeNumber(
          market_cap
        )}</p>
        ${coinCardActions(coin, isSelected, options)}
        <div class="collapse mt-3" id="collapse-${id}"></div>
      </div>
    </div>`;
};

const priceItem = (label, value, symbol) =>
  `<div class="price-badge mb-2 p-2 border-left rounded ${
    typeof value !== "number" ? "text-muted" : ""
  }">${label}: ${formatPrice(value, { symbol })}</div>`;

const coinDetails = (data = {}) => {
  const { image, name, symbol, description, platforms, market_data } = data;
  const desc = description?.en
    ? shortenText(description.en, COIN_DESC_MAX)
    : "No description available.";

  const prices = market_data?.current_price || {};
  const imageSrc = getCoinImage(image);
  const sym = (symbol || "").toUpperCase();

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
          <div>
            <h6 class="mb-0">${name}</h6>
            <small class="text-muted">${sym}</small>
            <div class="text-muted small">Rank: ${rank}</div>
          </div>
        </div>
        <div class="mb-2"><strong>Current Prices:</strong></div>
        ${priceItem("USD", prices.usd, "$")}
        ${priceItem("EUR", prices.eur, "€")}
        ${priceItem("ILS", prices.ils, "₪")}
        <div class="mb-2 mt-3"><strong>All-Time High (USD):</strong></div>
        ${priceItem("ATH", market_data?.ath?.usd, "$")}
        <div class="mt-2"><small class="text-muted"><strong>CA:</strong> ${
          contractAddress || "N/A"
        }</small></div>
        <div class="mt-3"><small class="text-muted">${desc}</small>
      </div>
    </div>`;
};

const coinMiniChart = (id) => `
  <div id="miniChart-${id}" class="mini-chart-container mt-3"></div>
`;

export const displayCoins = (coins,selectedReports,{ favorites, emptyMessage, compareSelection } = {}) => {
  const container = $("#coinsContainer");
  if (!container.length) return;

  if (!coins || coins.length === 0) {
    return;
  }
  const favoriteSymbols = ensureArray(favorites);

  const favoriteSet = new Set(favoriteSymbols);
  const compareSet = new Set(ensureArray(compareSelection));

  const html = coins
    .map((coin) =>
      coinCard(coin, selectedReports.includes(coin.symbol), {
        isFavorite: favoriteSet.has(coin.symbol),
        isInCompare: compareSet.has(String(coin.id)),
      })
    )
    .join("");

  container.html(html);
};

export const updateFavoriteIcon = (symbol, isFavorite) => {
  const favoriteIcon = $(`.favorite-btn[data-symbol="${symbol}"] i`);
  if (!favoriteIcon.length) return;
  favoriteIcon
    .toggleClass("text-primary", isFavorite)
    .toggleClass("text-muted", !isFavorite);
  favoriteIcon
    .closest(".favorite-btn")
    .attr("title", isFavorite ? "Remove from favorites" : "Add to favorites");
};

export const showCoinDetails = (containerId,data) => {
  $(`#${containerId}`).html(coinDetails(data) + coinMiniChart(data.id));
  ChartRenderer.drawMiniChart(data.id);
};

export const updateToggleStates = (selectedReports) => {
  const selectedSymbolsSet = new Set(ensureArray(selectedReports));

  $("#coinsContainer .coin-toggle").each(function () {
    const $this = $(this);
    const symbol = $this.data("symbol");
    $this.prop("checked", selectedSymbolsSet.has(symbol));
  });
};

// Deprecated: highlights now driven by compareSelection state; left for compatibility
export const setCompareHighlight = (coinId, isActive) => {
  if (!isActive) {
    compareSelection = compareSelection.filter((id) => id !== String(coinId));
  } else if (!compareSelection.includes(String(coinId))) {
    compareSelection = [...compareSelection, String(coinId)];
  }
  refreshCompareHighlights();
};

export const clearCompareHighlights = () => {
  resetCompareSelection();
};
