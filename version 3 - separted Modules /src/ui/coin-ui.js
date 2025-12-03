import { BaseComponents } from "./Components/base-components.js";
import { CoinComponents } from "./Components/coin-components.js";
import { UI_CONFIG } from "../config/ui-config.js";
import { ERRORS } from "../config/error.js";
import { CoinsService } from "../services/coins-service.js";

// Efficiently renders coins list (with caching) including favorites/compare state.
const displayCoins = (coins, selectedReports = [], options = {}) => {
  const { favorites = [], emptyMessage, compareSelection = [] } = options;
  const container = $("#coinsContainer");
  if (!container.length) return;

  if (!coins.length) {
    container.html(
      BaseComponents.infoAlert(emptyMessage || UI_CONFIG.UI.NO_COINS_FOUND)
    );
    container.data("coinCardCache", new Map());
    return;
  }

  const compareSet = new Set(
    Array.isArray(compareSelection)
      ? compareSelection.map((id) => String(id))
      : []
  );

  let cardCache = container.data("coinCardCache");
  if (!cardCache) {
    cardCache = new Map();
    container.data("coinCardCache", cardCache);
  }

  const activeIds = new Set();

  container.empty();

  coins.forEach((coin) => {
    const isSelected = selectedReports.includes(coin.symbol);
    const isFavorite = favorites.includes(coin.symbol);
    const isInCompare = compareSet.has(String(coin.id));

    const snapshot = JSON.stringify({
      id: coin.id,
      symbol: coin.symbol,
      price: coin.normalized?.prices?.usd ?? coin.current_price,
      marketCap: coin.normalized?.marketCapUsd ?? coin.market_cap,
      isSelected,
      isFavorite,
      isInCompare,
    });

    let cacheEntry = cardCache.get(coin.id);
    if (!cacheEntry || cacheEntry.snapshot !== snapshot) {
      const cardHtml = CoinComponents.coinCard(coin, isSelected, {
        isFavorite,
        isInCompare,
      });
      const cardElement = $(cardHtml);
      if (cacheEntry) {
        cacheEntry.element.replaceWith(cardElement);
      }
      cacheEntry = { snapshot, element: cardElement };
      cardCache.set(coin.id, cacheEntry);
    }

    container.append(cacheEntry.element);
    activeIds.add(coin.id);
  });

  cardCache.forEach((entry, id) => {
    if (!activeIds.has(id)) {
      entry.element.remove();
      cardCache.delete(id);
    }
  });
};

// Displays a skeleton grid while coins data is loading.
const showLoading = () => {
  const container = $("#coinsContainer");
  if (!container.length) return;

  container.html(
    `${BaseComponents.spinner(
      UI_CONFIG.UI.LOADING_COINS
    )}${BaseComponents.coinsSkeleton()}`
  );
};

// Toggles the star icon state when marking/unmarking favorites.
const updateFavoriteIcon = (symbol, isFavorite) => {
  const favoriteIcon = $(`.favorite-btn[data-symbol="${symbol}"] i`);
  if (!favoriteIcon.length) return;
  favoriteIcon.toggleClass("text-warning", isFavorite);
  favoriteIcon.toggleClass("text-muted", !isFavorite);
  const btn = favoriteIcon.closest(".favorite-btn");
  btn.attr("title", isFavorite ? "Remove from favorites" : "Add to favorites");
};

// Injects the "more info" section and triggers its mini chart draw.
const showCoinDetails = (containerId, data, options = {}) => {
  const { currencies = {} } = options;
  const container = $(`#${containerId}`);

  const html =
    CoinComponents.coinDetails(data, currencies) +
    CoinComponents.coinMiniChart(data.id);

  container.html(html);
  drawMiniChart(data.id);
};

// Opens the replace coin modal and wires confirm/close handlers.
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
        alert(UI_CONFIG.UI.REPLACE_ALERT);
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

// Builds and presents the compare modal table (with missing data notice).
const showCompareModal = (coins, options = {}) => {
  const missingSymbols = Array.isArray(options.missingSymbols)
    ? options.missingSymbols
    : [];

  const formatCurrency = (value) =>
    typeof value === "number" ? `$${value.toLocaleString()}` : "N/A";

  const formatPercent = (value) =>
    typeof value === "number" ? `${value.toFixed(2)}%` : "N/A";

  const compareRowsHtml = coins
    .map((coin) => {
      const normalized = coin.normalized || {};
      const prices = normalized.prices || {};

      return `
        <tr>
          <td>${coin?.symbol?.toUpperCase() || "N/A"}</td>
          <td>${formatCurrency(prices.usd)}</td>
          <td>${formatCurrency(normalized.marketCapUsd)}</td>
          <td>${formatPercent(normalized.changePercent24h)}</td>
          <td>${formatCurrency(normalized.volumeUsd)}</td>
        </tr>
      `;
    })
    .join("");

  const compareTableHtml = `
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
      <tbody>${compareRowsHtml}</tbody>
    </table>
  `;

  const missingNotice = missingSymbols.length
    ? `<div class="alert alert-warning mt-3">
          ${ERRORS.REPORTS.MISSING_DATA(missingSymbols.join(", "))}
        </div>`
    : "";

  const modalHTML = CoinComponents.compareModal(
    compareTableHtml + missingNotice,
    {
      title: options.title || UI_CONFIG.UI.COMPARE_TITLE,
    }
  );
  $("body").append(modalHTML);

  const modalElement = document.getElementById("compareModal");
  const modal = new bootstrap.Modal(modalElement);
  modal.show();

  $("#compareModal").on("hidden.bs.modal", () => {
    $("#compareModal").remove();
    options.onClose?.();
  });

  return modal;
};

// Syncs all toggle switches against the selectedReports array.
const updateToggleStates = (selectedReports) => {
  $(".coin-toggle").each(function () {
    const symbol = $(this).data("symbol");
    $(this).prop("checked", selectedReports.includes(symbol));
  });
};

// Fetches sparkline data per coin and renders a CanvasJS chart.
const drawMiniChart = async (coinId) => {
  const chartResult = await CoinsService.getCoinMarketChart(coinId);

  if (!chartResult?.ok || !chartResult.data?.prices) return;

  const prices = chartResult.data.prices.map(([time, price]) => ({
    x: new Date(time),
    y: price,
  }));

  const chart = new CanvasJS.Chart(`miniChart-${coinId}`, {
    height: 220,
    backgroundColor: "transparent",
    axisX: {
      labelFormatter: () => "",
    },
    axisY: {
      prefix: "$",
      labelFontSize: 10,
    },
    data: [
      {
        type: "line",
        dataPoints: prices,
        color: "#0d6efd",
        markerSize: 4,
        lineThickness: 2,
      },
    ],
  });

  chart.render();
};

export const CoinUI = {
  displayCoins,
  showLoading,
  showCoinDetails,
  showReplaceModal,
  showCompareModal,
  updateToggleStates,
  drawMiniChart,
  updateFavoriteIcon,
  // Highlights/unhighlights all compare affordances for a specific coin ID.
  setCompareHighlight: (coinId, isActive) => {
    const safeId = String(coinId);
    const $rows = $(`.compare-row[data-id="${safeId}"]`);
    $rows.toggleClass("compare-row-active", !!isActive);
    $rows.closest(".card").toggleClass("compare-card-active", !!isActive);
  },
  // Clears all compare highlights globally (used after modal close).
  clearCompareHighlights: () => {
    $(".compare-row").removeClass("compare-row-active");
    $(".card.compare-card-active").removeClass("compare-card-active");
  },
};
