import { APP_CONFIG } from "../../config/app-config.js";
import { ERRORS } from "../../config/error.js";
import { ErrorUI } from "../error-ui.js";
import {shortenText,formatPrice,formatLargeNumber,formatPercent} from "../../utils/general-utils.js";
import { ChartRenderer } from "../chart-renderer.js";

const { UI_NO_COINS, UI_COMPARE_TITLE, COIN_DESC_MAX } = APP_CONFIG;
const PLACEHOLDER_THUMB = "images/2.png";

const CURRENCIES = {
  USD: { symbol: "$", label: "USD" },
  EUR: { symbol: "€", label: "EUR" },
  ILS: { symbol: "₪", label: "ILS" },
};

const coinCardHeader = (coin) => {
  const { name, symbol, image } = coin;

  const imageSource =
    (typeof image === "string"
      ? image
      : image?.thumb || image?.small || image?.large) || PLACEHOLDER_THUMB;

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

const priceItem = (label, value, curr) =>
  `<div class="price-badge mb-2 p-2 border-left rounded ${
    typeof value !== "number" ? "text-muted" : ""
  }">${label}: ${formatPrice(value, curr)}</div>`;

const coinDetails = (data = {}, currencies = {}) => {
  const { image, name, symbol, description, platforms, market_data } = data;
  const desc = description?.en
    ? shortenText(description.en, COIN_DESC_MAX)
    : "No description available.";

  const prices = market_data?.current_price || {};
  const imageSrc =
    image?.large ||
    image?.small ||
    image?.thumb ||
    (typeof image === "string" ? image : PLACEHOLDER_THUMB);
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
        ${priceItem("USD", prices.usd, currencies.USD)}
        ${priceItem("EUR", prices.eur, currencies.EUR)}
        ${priceItem("ILS", prices.ils, currencies.ILS)}
        <div class="mb-2 mt-3"><strong>All-Time High (USD):</strong></div>
        ${priceItem("ATH", market_data?.ath?.usd, currencies.USD)}
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

const replaceModal = (newSymbol, existingCoins, options = {}) => {
  const limit =
    typeof options.maxCoins === "number"
      ? options.maxCoins
      : existingCoins.length || 0;

  const listItems = existingCoins
    .map(
      (coin) =>
        `<li class="list-group-item d-flex justify-content-between align-items-center">${coin}
          <div class="form-check">
            <input class="form-check-input replace-toggle" type="radio" name="coinToReplace" data-symbol="${coin}">
          </div>
        </li>`
    )
    .join("");

  return `
  <div class="modal fade" id="replaceModal" tabindex="-1" aria-labelledby="replaceModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">

        <div class="modal-header border-bottom">
          <h5 class="modal-title fw-semibold" id="replaceModalLabel">Replace Coin</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <div class="modal-body">
          <div id="replaceModalError"></div>
          <p>You've reached the limit of ${limit} coins.</p>
          <p>Choose a coin to replace with <strong>${newSymbol}</strong>:</p>
          <ul class="list-group">${listItems}</ul>
        </div>

        <div class="modal-footer border-top">
          <button type="button" id="confirmReplace" class="btn btn-primary">Replace</button>
        </div>
      </div>
    </div>
  </div>
`;
};

const compareModal = (coinsHTML, options = {}) => `
  <div class="modal fade" id="compareModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header border-bottom">
          <h5 class="modal-title fw-semibold">${
            options.title || "Compare Coins"
          }</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div id="compareModalMessage" class="mb-3"></div>
          ${coinsHTML}
        </div>
      </div>
    </div>
  </div>`;

export const displayCoins = (coins,selectedReports,{ favorites, emptyMessage, compareSelection } = {}) => {
  const container = $("#coinsContainer");
  if (!container.length) return;

  if (!coins || coins.length === 0) {
    ErrorUI.showInfo(container, emptyMessage || UI_NO_COINS, "info");
    return;
  }
  const favoriteSymbols = Array.isArray(favorites)
    ? favorites
    : Array.isArray(favorites?.favorites)
    ? favorites.favorites
    : [];

  const favoriteSet = new Set(favoriteSymbols);
  const compareSet = new Set(
    Array.isArray(compareSelection) ? compareSelection : []
  );

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

export const showCoinDetails = (containerId,data,{ currencies = CURRENCIES } = {}) => {
  $(`#${containerId}`).html(
    coinDetails(data, currencies) + coinMiniChart(data.id)
  );
  ChartRenderer.drawMiniChart(data.id);
};

export const showReplaceModal = (
  newSymbol,
  existingCoins,
  { maxCoins, onConfirm, onClose } = {}
) => {
  const modalHTML = replaceModal(newSymbol, existingCoins, { maxCoins });

  $("body").append(modalHTML);
  const modal = new bootstrap.Modal(document.getElementById("replaceModal"));
  modal.show();
  $("#confirmReplace")
    .off()
    .on("click", () => {
      const selectedToRemove = $(".replace-toggle:checked").data("symbol");
      if (!selectedToRemove)
        return ErrorUI.showInfo("#replaceModalError", UI_NO_COINS);
      typeof onConfirm === "function"
        ? onConfirm({ remove: selectedToRemove, add: newSymbol, modal })
        : modal.hide();
    });
  $("#replaceModal").one("hidden.bs.modal", () => {
    $("#replaceModal").remove();
    onClose?.();
  });
  return modal;
};

const buildCompareRow = (coin) => {
  const md = coin.market_data || {};
  return `<tr>
  <td>${coin?.symbol?.toUpperCase() || "N/A"}</td>
  <td>${formatPrice(md.current_price?.usd)}</td>
  <td>${formatLargeNumber(md.market_cap?.usd)}</td>
  <td>${formatPercent(md.price_change_percentage_24h)}</td>
  <td>${formatLargeNumber(md.total_volume?.usd)}</td></tr>`;
};

const buildCompareTable = (coins) =>
  `<table class="table table-striped text-center align-middle">
    <thead>
      <tr>
        <th>Coin</th>
        <th>Price</th>
        <th>Market Cap</th>
        <th>24h %</th>
        <th>Volume</th>
      </tr>
    </thead>
    <tbody>${coins.map(buildCompareRow).join("")}</tbody>
  </table>`;

export const showCompareModal = (coins,{ missingSymbols = [], title, onClose } = {}) => {
  const content = buildCompareTable(coins);
  const modalHTML = compareModal(content, {title: title || UI_COMPARE_TITLE});

  $("body").append(modalHTML);
  const modal = new bootstrap.Modal(document.getElementById("compareModal"));

  if (missingSymbols.length)
    ErrorUI.showInfo(
      "#compareModalMessage",
      ERRORS.MISSING_DATA(missingSymbols.join(", ")),
      "warning"
    );

  $("#compareModal").on("hidden.bs.modal", () => {
    $("#compareModal").remove();
    onClose?.();
  });

  modal.show();
  return modal;
};

export const updateToggleStates = (selectedReports) => {
  const selectedSymbolsSet = new Set(
    Array.isArray(selectedReports) ? selectedReports : []
  );

  $("#coinsContainer .coin-toggle").each(function () {
    const $this = $(this);
    const symbol = $this.data("symbol");
    $this.prop("checked", selectedSymbolsSet.has(symbol));
  });
};

export const getCompareSelection = () =>
  $(".compare-row-active")
    .map((_, el) => String($(el).data("id")))
    .get();

export const setCompareHighlight = (coinId, isActive) => {
  const $rows = $(`.compare-row[data-id="${String(coinId)}"]`);
  $rows.toggleClass("compare-row-active", !!isActive);
  $rows.closest(".card").toggleClass("compare-card-active", !!isActive);
};

export const clearCompareHighlights = () => {
  $(".compare-row").removeClass("compare-row-active");
  $(".card.compare-card-active").removeClass("compare-card-active");
};
