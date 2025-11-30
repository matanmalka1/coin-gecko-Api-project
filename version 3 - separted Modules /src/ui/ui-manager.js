import { BaseComponents } from "./Components/base-components.js";
import { PageComponents } from "./Components/page-components.js";
import { ChartRenderer } from "./chart-renderer.js";
import { NewsUI } from "./news-ui.js";
import { CoinUI } from "./coin-ui.js";
import { BaseUI } from "./base-ui.js";

export const UIManager = (() => {
  // Mounts the currencies page template into #content.
  const renderCurrenciesPage = () => {
    BaseUI.showPage(PageComponents.currenciesPage());
  };

  // Renders live reports (charts) shell.
  const renderReportsPage = () => {
    BaseUI.showPage(PageComponents.reportsPage());
  };

  // Shows the About page with user metadata.
  const renderAboutPage = (userData) => {
    BaseUI.showPage(PageComponents.aboutPage(userData));
  };

  const showNews = (...args) => NewsUI.showNews(...args);
  const updateNewsStatus = (...args) => NewsUI.updateNewsStatus(...args);
  const showNewsLoading = (...args) => NewsUI.showNewsLoading(...args);
  const showNewsError = (...args) => NewsUI.showNewsError(...args);
  const setNewsFilterMode = (...args) => NewsUI.setNewsFilterMode(...args);

  const displayCoins = (...args) => CoinUI.displayCoins(...args);
  const showCoinsLoading = () => CoinUI.showLoading();

  const showCoinDetails = (...args) => CoinUI.showCoinDetails(...args);

  const showReplaceModal = (...args) => CoinUI.showReplaceModal(...args);
  const showCompareModal = (...args) => CoinUI.showCompareModal(...args);

  // Initializes live charts for selected symbols.
  const initLiveChart = (symbols, options = {}) => {
    ChartRenderer.setupCharts(symbols, options);
  };

  // Pushes new datapoints into the CanvasJS charts.
  const updateLiveChart = (prices, time, options = {}) => {
    ChartRenderer.update(prices, time, options);
  };

  // Removes all chart instances from the DOM and memory.
  const clearLiveChart = () => {
    ChartRenderer.clear();
  };

  const updateToggleStates = (...args) => CoinUI.updateToggleStates(...args);

  const drawMiniChart = (...args) => CoinUI.drawMiniChart(...args);

  // Shows skeleton placeholders before actual chart creation.
  const showChartSkeleton = () => {
    $("#chartsGrid").html(BaseComponents.chartsSkeleton());
  };

  // Updates the compare status alert text and styling.
  const updateCompareStatus = (selectedCount, maxCount) => {
    const $status = $("#compareStatus");
    if (!$status.length) return;

    const remaining = Math.max(maxCount - selectedCount, 0);
    const baseText = `Selected: ${selectedCount} / ${maxCount}`;

    if (remaining === 0) {
      $status
        .removeClass("alert-info")
        .addClass("alert-warning")
        .text(`${baseText} – maximum reached`);
    } else {
      $status
        .removeClass("alert-warning")
        .addClass("alert-info")
        .text(`${baseText} – you can select ${remaining} more`);
    }
  };

  // Hides/shows the compare status alert.
  const setCompareStatusVisibility = (isVisible) => {
    const $status = $("#compareStatus");
    if (!$status.length) return;

    $status.toggleClass("d-none", !isVisible);
  };

  // Pass-through helpers for coin card highlighting.
  const setCompareHighlight = (coinId, isActive) => {
    CoinUI.setCompareHighlight(coinId, isActive);
  };

  const clearCompareHighlights = () => {
    CoinUI.clearCompareHighlights();
  };

  return {
    showPage: BaseUI.showPage,
    displayCurrencyPage: renderCurrenciesPage,
    renderReportsPage,
    renderAboutPage,
    showNews,
    updateNewsStatus,
    showNewsLoading,
    showNewsError,
    setNewsFilterMode,
    setFavoritesButtonLabel: BaseUI.setFavoritesButtonLabel,
    showError: BaseUI.showError,
    showSpinner: BaseUI.showSpinner,
    displayCoins,
    showCoinsLoading,
    showCoinDetails,
    showReplaceModal,
    updateToggleStates,
    toggleCollapse: BaseUI.toggleCollapse,
    showElement: BaseUI.showElement,
    applyTheme: BaseUI.applyTheme,
    drawMiniChart,
    showChartSkeleton,
    showCompareModal,
    initLiveChart,
    updateLiveChart,
    clearLiveChart,
    getInputValue: BaseUI.getInputValue,
    setInputValue: BaseUI.setInputValue,
    getDataAttr: BaseUI.getDataAttr,
    isCollapseOpen: BaseUI.isCollapseOpen,
    updateCompareStatus,
    setCompareStatusVisibility,
    setCompareHighlight,
    clearCompareHighlights,
  };
})();
