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

const displayCoins = (
  coins,
  selectedReports = [],
  { favorites = [], emptyMessage, compareSelection = [] } = {}
) => {
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

  if (!coins.length)
    return ErrorUI.showInfo(container, emptyMessage || UI_TEXT.noCoins);

  const compareSet = new Set(
    Array.isArray(compareSelection)
      ? compareSelection.map((id) => String(id))
      : []
  );

  container.html(
    coins
      .map((coin) =>
        CoinComponents.coinCard(coin, selectedSymbols.includes(coin.symbol), {
          isFavorite: favoriteSymbols.includes(coin.symbol),
          isInCompare: compareSet.has(String(coin.id)),
        })
      )
      .join("")
  );
};

// ===== LOADING STATE =====
const showLoading = () => {
  const container = $("#coinsContainer");
  if (!container.length) return;
  container.html(
    `${BaseComponents.spinner(UI_TEXT.loadingCoins)}${BaseComponents.skeleton(
      "coins",
      6
    )}`
  );
};

// ===== FAVORITE ICON =====
const updateFavoriteIcon = (symbol, isFavorite) => {
  const favoriteIcon = $(`.favorite-btn[data-symbol="${symbol}"] i`);
  if (!favoriteIcon.length) return;
  favoriteIcon
    .toggleClass("text-primary", isFavorite)
    .toggleClass("text-muted", !isFavorite);
  favoriteIcon
    .closest(".favorite-btn")
    .attr("title", isFavorite ? "Remove from favorites" : "Add to favorites");
};

const showCoinDetails = (
  containerId,
  data,
  { currencies = CURRENCIES } = {}
) => {
  $(`#${containerId}`).html(
    CoinComponents.coinDetails(data, currencies) +
      CoinComponents.coinMiniChart(data.id)
  );
  ChartRenderer.drawMiniChart(data.id);
};

const showReplaceModal = (
  newSymbol,
  existingCoins,
  { maxCoins, onConfirm, onClose } = {}
) => {
  const modalHTML = CoinComponents.replaceModal(newSymbol, existingCoins, {
    maxCoins,
  });
  $("body").append(modalHTML);
  const modal = new bootstrap.Modal(document.getElementById("replaceModal"));
  modal.show();
  $("#confirmReplace")
    .off()
    .on("click", () => {
      const selectedToRemove = $(".replace-toggle:checked").data("symbol");
      if (!selectedToRemove)
        return ErrorUI.showInfo("#replaceModalError", UI_TEXT.noCoins);
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

const showCompareModal = (
  coins,
  { missingSymbols = [], title, onClose } = {}
) => {
  const content = buildCompareTable(coins);
  const modalHTML = CoinComponents.compareModal(content, {
    title: title || UI_TEXT.compareTitle,
  });
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

const updateToggleStates = (selectedReports) => {
  const selectedSymbols = Array.isArray(selectedReports) ? selectedReports : [];
  $(".coin-toggle").each(function () {
    const symbol = $(this).data("symbol");
    $(this).prop("checked", selectedSymbols.includes(symbol));
  });
};

const getCompareSelection = () =>
  $(".compare-row-active")
    .map((_, el) => String($(el).data("id")))
    .get();
const setCompareHighlight = (coinId, isActive) => {
  const $rows = $(`.compare-row[data-id="${String(coinId)}"]`);
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
