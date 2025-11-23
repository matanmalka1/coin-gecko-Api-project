import { UIComponents } from "./ui-components.js";
import { CoinsService } from "../services/coins-service.js";
import { CONFIG } from "../config/config.js";
import { ERRORS } from "../config/error.js";

export const UIManager = (() => {
  const content = $("#content");
  const liveCharts = {};
  const liveChartData = {};

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
    const isDarkMode = theme === "dark";
    $("html").toggleClass("dark", isDarkMode);
    $("body").toggleClass("dark", isDarkMode);
    $(".navbar, footer, .card").toggleClass("dark", isDarkMode);
  };

  const showError = (container, message) => {
    const errorMsg =
      typeof message === "string" && message.trim().length
        ? message
        : CONFIG.UI.GENERIC_ERROR;
    $(container).html(UIComponents.errorAlert(errorMsg));
  };

  const showSpinner = (container, message) => {
    $(container).html(UIComponents.spinner(message));
  };

  const displayCoins = (coins, selectedReports = [], options = {}) => {
    const { favorites, emptyMessage } = options;
    const container = $("#coinsContainer");
    if (!container.length) return;

    if (coins.length === 0) {
      container.html(
        UIComponents.infoAlert(emptyMessage || CONFIG.UI.NO_COINS_FOUND)
      );
      return;
    }

    const coinCardsHtml = coins
      .map((coin) => {
        const isSelected = selectedReports.includes(coin.symbol);
        const isFavorite = favorites?.includes(coin.symbol);
        return UIComponents.coinCard(coin, isSelected, { isFavorite });
      })
      .join("");

    container.html(coinCardsHtml);

    const isDarkMode = $("html").hasClass("dark");
    $(".card").toggleClass("dark", isDarkMode);
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

    const compareRowsHtml = coins
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
      ? `<div class="alert alert-warning mt-3" role="alert">
          ${ERRORS.REPORTS.MISSING_DATA(missingSymbols.join(", "))}
        </div>`
      : "";

    const modalHTML = UIComponents.compareModal(
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
      if (typeof options.onClose === "function") options.onClose();
    });

    return modal;
  };

  const initLiveChart = (symbols, options = {}) => {
    const { historyPoints = CONFIG.CHART.HISTORY_POINTS } = options;
    const grid = $("#chartsGrid");
    if (!grid.length) return;

    // clean previous
    Object.keys(liveCharts).forEach((key) => {
      const chart = liveCharts[key];
      if (chart?.destroy) chart.destroy();
      delete liveCharts[key];
      delete liveChartData[key];
    });
    grid.empty();

    symbols.forEach((symbol) => {
      const id = symbol;
      const chartContainerId = `live-chart-${id}`;
      const card = `
        <div class="col-md-6 col-lg-4">
          <div class="card shadow-sm p-3 h-100">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h6 class="mb-0">${id}</h6>
              <small class="text-muted">Live</small>
            </div>
            <div id="${chartContainerId}" style="height:220px;"></div>
          </div>
        </div>
      `;
      grid.append(card);

      liveChartData[id] = [];
      liveCharts[id] = new CanvasJS.Chart(chartContainerId, {
        backgroundColor: "transparent",
        axisX: {
          valueFormatString: CONFIG.CHART.AXIS_X_FORMAT,
          labelFontSize: 10,
        },
        axisY: { prefix: "$", labelFontSize: 10 },
        data: [
          {
            type: "line",
            dataPoints: liveChartData[id],
            color: "#0d6efd",
            markerSize: 0,
            lineThickness: 2,
          },
        ],
      });
      liveCharts[id].render();
    });

    liveCharts.__historyPoints = historyPoints;
  };

  const updateLiveChart = (prices, time, options = {}) => {
    const historyPoints =
      options.historyPoints || liveCharts.__historyPoints || 30;

    Object.entries(prices || {}).forEach(([symbol, priceObj]) => {
      const id = symbol;
      const chart = liveCharts[id];
      const dp = liveChartData[id];
      if (!chart || !dp) return;

      const price = priceObj?.USD;
      if (price == null) return;

      dp.push({ x: time, y: price });
      if (dp.length > historyPoints) dp.shift();
      chart.render();
    });
  };

  const clearLiveChart = () => {
    Object.keys(liveCharts).forEach((key) => {
      const chart = liveCharts[key];
      if (chart?.destroy) chart.destroy();
      delete liveCharts[key];
      delete liveChartData[key];
    });
    liveCharts.__historyPoints = undefined;
    $("#chartsGrid").empty();
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
