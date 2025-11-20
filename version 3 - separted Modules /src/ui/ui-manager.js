import { UIComponents } from "./ui-components.js";
import { ChartRenderer } from "../utils/chart-renderer.js";
import { CoinsService } from "../services/coins-service.js";
import { CONFIG } from "../config/config.js";
import { ERRORS } from "../config/error.js";

export const UIManager = (() => {
  const content = $("#content");

  const clearContent = () => {
    content.empty();
  };

  const getInputValue = (selector) => {
    const el = $(selector);
    return el.length ? el.val() : "";
  };

  const setInputValue = (selector, value = "") => {
    const el = $(selector);
    if (el.length) el.val(value);
  };

  const getDataAttr = (element, key) => $(element).data(key);

  const setHtml = (selector, html) => {
    const el = $(selector);
    if (el.length) el.html(html);
  };

  const isCollapseOpen = (collapseId) => {
    const el = $(`#${collapseId}`);
    return el.length ? el.hasClass("show") : false;
  };

  const showPage = (html) => {
    clearContent();
    content.html(html);
  };

  const renderCurrenciesPage = () => {
    showPage(UIComponents.currenciesPage());
  };

  const renderReportsPage = () => {
    showPage(UIComponents.reportsPage());
  };

  const renderAboutPage = (userData) => {
    showPage(UIComponents.aboutPage(userData));
  };

  const applyTheme = (theme) => {
    const isDark = theme === "dark";
    $("html").toggleClass("dark", isDark);
    $("body").toggleClass("dark", isDark);
    $(".navbar, footer, .card").toggleClass("dark", isDark);
  };

  const showError = (container, message) => {
    const msg =
      typeof message === "string" && message.trim().length
        ? message
        : CONFIG.UI.GENERIC_ERROR;
    $(container).html(UIComponents.errorAlert(msg));
  };

  const showInfo = (container, message) => {
    $(container).html(UIComponents.infoAlert(message));
  };

  const showSpinner = (container, message) => {
    $(container).html(UIComponents.spinner(message));
  };

  const displayCoins = (coins, selectedReports = [], options = {}) => {
    const { favorites, emptyMessage } = options;
    const container = $("#coinsContainer");
    if (!container.length) return;

    if (coins.length === 0) {
      showInfo(container, emptyMessage || CONFIG.UI.NO_COINS_FOUND);
      return;
    }

    const normalizedFavorites = Array.isArray(favorites)
      ? favorites.map((f) => f.toUpperCase())
      : [];

    const cardsHTML = coins
      .map((coin) => {
        const isSelected = selectedReports.includes(coin.symbol.toUpperCase());
        const isFavorite = normalizedFavorites.includes(
          coin.symbol.toUpperCase()
        );
        return UIComponents.coinCard(coin, isSelected, { isFavorite });
      })
      .join("");

    container.html(cardsHTML);

    const isDark = $("html").hasClass("dark");
    $(".card").toggleClass("dark", isDark);
  };

  const showCoinDetails = (containerId, data, options = {}) => {
    const { currencies = {} } = options;
    const container = $(`#${containerId}`);
    const html =
      UIComponents.coinDetails(data, currencies) +
      UIComponents.coinMiniChart(data.id);
    container.html(html);

    drawMiniChart(data.id);
  };

  const showReplaceModal = (newSymbol, existingCoins, options = {}) => {
    const modalHTML = UIComponents.replaceModal(newSymbol, existingCoins, {
      maxCoins: options.maxCoins,
    });
    $("body").append(modalHTML);
    const modalElement = document.getElementById("replaceModal");
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    return modal;
  };

  const openReplaceDialog = (newSymbol, existingCoins, options = {}) => {
    const { maxCoins, onConfirm, onClose } = options;
    const modal = showReplaceModal(newSymbol, existingCoins, { maxCoins });

    $("#confirmReplace")
      .off()
      .on("click", () => {
        const selectedToRemove = $(".replace-toggle:checked").data("symbol");
        if (!selectedToRemove) {
          alert(CONFIG.UI.REPLACE_ALERT);
          return;
        }
        if (typeof onConfirm === "function") {
          onConfirm({ remove: selectedToRemove, add: newSymbol, modal });
        } else {
          modal.hide();
        }
      });

    $("#replaceModal").one("hidden.bs.modal", function () {
      removeModal("replaceModal");
      if (typeof onClose === "function") onClose();
    });

    return modal;
  };

  const removeModal = (modalId) => {
    $(`#${modalId}`).remove();
  };

  const showCompareModal = (coins, options = {}) => {
    const missingSymbols = Array.isArray(options.missingSymbols)
      ? options.missingSymbols
      : [];

    const rows = coins
      .map((c) => {
        const price = c?.market_data?.current_price?.usd;
        const marketCap = c?.market_data?.market_cap?.usd;
        const change = c?.market_data?.price_change_percentage_24h;
        const volume = c?.market_data?.total_volume?.usd;
        return `
  <tr>
    <td>${c?.symbol?.toUpperCase() || ""}</td>
    <td>${price != null ? `$${price.toLocaleString()}` : "N/A"}</td>
    <td>${marketCap != null ? `$${marketCap.toLocaleString()}` : "N/A"}</td>
    <td>${change != null ? change.toFixed(2) + "%" : "N/A"}</td>
    <td>${volume != null ? `$${volume.toLocaleString()}` : "N/A"}</td>
  </tr>
  `;
      })
      .join("");

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

    const missingNotice = missingSymbols.length
      ? `<div class="alert alert-warning mt-3" role="alert">
          ${ERRORS.REPORTS.MISSING_DATA(missingSymbols.join(", "))}
        </div>`
      : "";

    const modalHTML = UIComponents.compareModal(table + missingNotice, {
      title: options.title || CONFIG.UI.COMPARE_TITLE,
    });
    $("body").append(modalHTML);

    const modalElement = document.getElementById("compareModal");
    const modal = new bootstrap.Modal(modalElement);
    modal.show();

    $("#compareModal").on("hidden.bs.modal", () => {
      $("#compareModal").remove();
      if (typeof options.onClose === "function") options.onClose();
    });

    return modal;
  };

  const initLiveChart = (symbols, options = {}) => {
    const { updateIntervalMs, historyPoints } = options;
    ChartRenderer.init("chartContainer", symbols, {
      updateIntervalMs,
      title: CONFIG.CHART.TITLE,
      axisXTitle: CONFIG.CHART.AXIS_X_TITLE,
      axisXFormat: CONFIG.CHART.AXIS_X_FORMAT,
      axisYTitle: CONFIG.CHART.AXIS_Y_TITLE,
      axisYPrefix: CONFIG.CHART.AXIS_Y_PREFIX,
    });
    if (historyPoints) {
      ChartRenderer.update({}, new Date(), { historyPoints });
    }
  };

  const updateLiveChart = (prices, time, options = {}) => {
    ChartRenderer.update(prices, time, options);
  };

  const clearLiveChart = () => {
    ChartRenderer.destroy("chartContainer");
  };

  const updateToggleStates = (selectedReports) => {
    $(".coin-toggle").each(function () {
      const symbol = $(this).data("symbol");
      $(this).prop("checked", selectedReports.includes(symbol));
    });
  };

  const toggleCollapse = (collapseId, show) => {
    const element = $(`#${collapseId}`);
    if (show) {
      element.addClass("show").slideDown();
    } else {
      element.removeClass("show").slideUp();
    }
  };

  const hideElement = (selector) => {
    $(selector).addClass("d-none");
  };

  const showElement = (selector) => {
    $(selector).removeClass("d-none");
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
          markerSize: 0,
          lineThickness: 2,
        },
      ],
    });

    chart.render();
  };

  return {
    clearContent,
    showPage,
    renderCurrenciesPage,
    renderReportsPage,
    renderAboutPage,
    showError,
    showInfo,
    showSpinner,
    displayCoins,
    showCoinDetails,
    showReplaceModal,
    removeModal,
    updateToggleStates,
    toggleCollapse,
    hideElement,
    showElement,
    applyTheme,
    drawMiniChart,
    showCompareModal,
    initLiveChart,
    updateLiveChart,
    clearLiveChart,
    getInputValue,
    setInputValue,
    openReplaceDialog,
    getDataAttr,
    setHtml,
    isCollapseOpen,
  };
})();
