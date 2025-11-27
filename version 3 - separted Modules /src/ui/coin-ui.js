import { BaseComponents } from "./Components/base-components.js";
import { CoinComponents } from "./Components/coin-components.js";
import { CONFIG } from "../config/config.js";
import { ERRORS } from "../config/error.js";
import { CoinsService } from "../services/coins-service.js";

const displayCoins = (coins, selectedReports = [], options = {}) => {
  const { favorites = [], emptyMessage } = options;
  const container = $("#coinsContainer");
  if (!container.length) return;

  if (!coins.length) {
    container.html(
      BaseComponents.infoAlert(emptyMessage || CONFIG.UI.NO_COINS_FOUND)
    );
    return;
  }

  const coinCardsHtml = coins
    .map((coin) => {
      const isSelected = selectedReports.includes(coin.symbol);
      const isFavorite = favorites.includes(coin.symbol);
      return CoinComponents.coinCard(coin, isSelected, { isFavorite });
    })
    .join("");

  container.html(coinCardsHtml);
};

const showLoading = () => {
  const container = $("#coinsContainer");
  if (!container.length) return;
  container.html(BaseComponents.coinsSkeleton());
};

const updateFavoriteIcon = (symbol, isFavorite) => {
  const favoriteIcon = $(`.favorite-btn[data-symbol="${symbol}"] i`);
  if (!favoriteIcon.length) return;
  favoriteIcon.toggleClass("text-warning", isFavorite);
  favoriteIcon.toggleClass("text-muted", !isFavorite);
  const btn = favoriteIcon.closest(".favorite-btn");
  btn.attr("title", isFavorite ? "Remove from favorites" : "Add to favorites");
};

const showCoinDetails = (containerId, data, options = {}) => {
  const { currencies = {} } = options;
  const container = $(`#${containerId}`);

  const html =
    CoinComponents.coinDetails(data, currencies) +
    CoinComponents.coinMiniChart(data.id);

  container.html(html);
  drawMiniChart(data.id);
};

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
        alert(CONFIG.UI.REPLACE_ALERT);
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

const showCompareModal = (coins, options = {}) => {
  const missingSymbols = Array.isArray(options.missingSymbols)
    ? options.missingSymbols
    : [];

  const formatCurrency = (value) =>
    value != null ? `$${value.toLocaleString()}` : "N/A";

  const formatPercent = (value) =>
    value != null ? `${value.toFixed(2)}%` : "N/A";

  const compareRowsHtml = coins
    .map((coin) => {
      const {
        current_price,
        market_cap,
        price_change_percentage_24h,
        total_volume,
      } = coin?.market_data || {};

      return `
        <tr>
          <td>${coin?.symbol?.toUpperCase() || "N/A"}</td>
          <td>${formatCurrency(current_price?.usd)}</td>
          <td>${formatCurrency(market_cap?.usd)}</td>
          <td>${formatPercent(price_change_percentage_24h)}</td>
          <td>${formatCurrency(total_volume?.usd)}</td>
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
      title: options.title || CONFIG.UI.COMPARE_TITLE,
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

const updateToggleStates = (selectedReports) => {
  $(".coin-toggle").each(function () {
    const symbol = $(this).data("symbol");
    $(this).prop("checked", selectedReports.includes(symbol));
  });
};

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
};
