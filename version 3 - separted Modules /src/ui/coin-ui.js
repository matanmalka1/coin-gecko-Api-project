import { BaseComponents } from "./Components/base-components.js";
import { CoinComponents } from "./Components/coin-components.js";
import { APP_CONFIG } from "../config/app-config.js";
import { ERRORS } from "../config/error.js";
import { ErrorUI } from "./error-ui.js";
import {
  formatPrice,
  formatLargeNumber,
  formatPercent,
} from "../utils/general-utils.js";
import { ChartRenderer } from "./chart-renderer.js";

const UI_TEXT = {
  noCoins: APP_CONFIG.UI_NO_COINS,
  loadingCoins: APP_CONFIG.UI_LOAD_COINS,
  compareTitle: APP_CONFIG.UI_COMPARE_TITLE,
};

const CURRENCIES = {
  USD: { symbol: APP_CONFIG.USD_SYMBOL, label: APP_CONFIG.USD_LABEL },
  EUR: { symbol: APP_CONFIG.EUR_SYMBOL, label: APP_CONFIG.EUR_LABEL },
  ILS: { symbol: APP_CONFIG.ILS_SYMBOL, label: APP_CONFIG.ILS_LABEL },
};

// ===== COIN LIST RENDERING =====
const displayCoins = (coins, selectedReports = [], options = {}) => {
  const { favorites = [], emptyMessage, compareSelection = [] } = options;
  const container = $("#coinsContainer");
  if (!container.length) return;

  const selectedSymbols = Array.isArray(selectedReports)
    ? selectedReports
    : Array.isArray(selectedReports?.selected)
    ? selectedReports.selected
    : [];

  const favoriteSymbols = Array.isArray(favorites)
    ? favorites
    : Array.isArray(favorites?.favorites)
    ? favorites.favorites
    : [];

  if (!coins.length) {
    ErrorUI.showInfo(container, emptyMessage || UI_TEXT.noCoins);
    return;
  }

  const compareSet = new Set(
    Array.isArray(compareSelection)
      ? compareSelection.map((id) => String(id))
      : []
  );

  const html = coins
    .map((coin) =>
      CoinComponents.coinCard(coin, selectedSymbols.includes(coin.symbol), {
        isFavorite: favoriteSymbols.includes(coin.symbol),
        isInCompare: compareSet.has(String(coin.id)),
      })
    )
    .join("");

  container.html(html);
};

// ===== LOADING STATE =====
const showLoading = () => {
  const container = $("#coinsContainer");
  if (!container.length) return;

  container.html(
    `${BaseComponents.spinner(
      UI_TEXT.loadingCoins
    )}${BaseComponents.skeleton("coins", 6)}`
  );
};

// ===== FAVORITE ICON =====
const updateFavoriteIcon = (symbol, isFavorite) => {
  const favoriteIcon = $(`.favorite-btn[data-symbol="${symbol}"] i`);
  if (!favoriteIcon.length) return;
  favoriteIcon.toggleClass("text-primary", isFavorite);
  favoriteIcon.toggleClass("text-muted", !isFavorite);
  const btn = favoriteIcon.closest(".favorite-btn");
  btn.attr("title", isFavorite ? "Remove from favorites" : "Add to favorites");
};

// ===== COIN DETAILS PANEL =====
const showCoinDetails = (containerId, data, options = {}) => {
  const { currencies = {} } = options;
  const container = $(`#${containerId}`);

  const html =
    CoinComponents.coinDetails(data, currencies) +
    CoinComponents.coinMiniChart(data.id);

  container.html(html);
  ChartRenderer.drawMiniChart(data.id);
};

// ===== REPLACE MODAL =====
const showReplaceModal = (newSymbol, existingCoins, options = {}) => {
  const { maxCoins, onConfirm, onClose } = options;

  const modalHTML = CoinComponents.replaceModal(newSymbol, existingCoins, {
    maxCoins,
  });
  $("body").append(modalHTML);
  const modalElement = document.getElementById("replaceModal");
  const modal = new bootstrap.Modal(modalElement);
  modal.show();

  $("#confirmReplace")
    .off()
    .on("click", () => {
      const selectedToRemove = $(".replace-toggle:checked").data("symbol");
      if (!selectedToRemove) {
        ErrorUI.showInfo(
          container,
          emptyMessage || UI_TEXT.noCoins
        );
        return;
      }

      typeof onConfirm === "function"
        ? onConfirm({ remove: selectedToRemove, add: newSymbol, modal })
        : modal.hide();
    });

  $("#replaceModal").one("hidden.bs.modal", function () {
    $("#replaceModal").remove();
    onClose?.();
  });

  return modal;
};

// ===== COMPARE MODAL =====
const buildCompareRow = (coin) => {
  const marketData = coin.market_data || {};
  const priceUsd = marketData.current_price?.usd;
  const marketCapUsd = marketData.market_cap?.usd;
  const changePercent = marketData.price_change_percentage_24h;
  const volumeUsd = marketData.total_volume?.usd;

  return `
    <tr>
      <td>${coin?.symbol?.toUpperCase() || "N/A"}</td>
      <td>${formatPrice(priceUsd)}</td>            
      <td>${formatLargeNumber(marketCapUsd)}</td>   
      <td>${formatPercent(changePercent)}</td>       
      <td>${formatLargeNumber(volumeUsd)}</td>       
    </tr>
  `;
};
const buildCompareTable = (coins) => {
  const rows = coins.map(buildCompareRow).join("");

  const table = `
    <table class="table table-striped text-center align-middle">
      <thead>
        <tr>
          <th>Coin</th>
          <th>Price</th>
          <th>Market Cap</th>
          <th>24h %</th>
          <th>Volume</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
  return table;
};

const showCompareModal = (coins, options = {}) => {
  const { missingSymbols = [], title, onClose } = options;

  const content = buildCompareTable(coins);
  const modalHTML = CoinComponents.compareModal(content, {
    title: title || UI_TEXT.compareTitle,
  });

  $("body").append(modalHTML);
  const modalElement = document.getElementById("compareModal");
  const modal = new bootstrap.Modal(modalElement);

  if (missingSymbols.length) {
    ErrorUI.showInfo(
      "#compareModalMessage",
      ERRORS.MISSING_DATA(missingSymbols.join(", ")),
      "warning"
    );
  }

  $("#compareModal").on("hidden.bs.modal", () => {
    $("#compareModal").remove();
    onClose?.();
  });

  modal.show();
  return modal;
};

// ===== TOGGLE STATES =====
const updateToggleStates = (selectedReports) => {
  const selectedSymbols = Array.isArray(selectedReports) ? selectedReports : [];

  $(".coin-toggle").each(function () {
    const symbol = $(this).data("symbol");
    $(this).prop("checked", selectedSymbols.includes(symbol));
  });
};

// ===== COMPARE HIGHLIGHTS =====
const getCompareSelection = () =>
  $(".compare-row-active")
    .map((_, el) => String($(el).data("id")))
    .get();

const setCompareHighlight = (coinId, isActive) => {
  const safeId = String(coinId);
  const $rows = $(`.compare-row[data-id="${safeId}"]`);
  $rows.toggleClass("compare-row-active", !!isActive);
  $rows.closest(".card").toggleClass("compare-card-active", !!isActive);
};

const clearCompareHighlights = () => {
  $(".compare-row").removeClass("compare-row-active");
  $(".card.compare-card-active").removeClass("compare-card-active");
};

export const CoinUI = {
  displayCoins,
  showLoading,
  showCoinDetails,
  showReplaceModal,
  showCompareModal,
  updateToggleStates,
  updateFavoriteIcon,
  setCompareHighlight,
  clearCompareHighlights,
  getCompareSelection,
};
