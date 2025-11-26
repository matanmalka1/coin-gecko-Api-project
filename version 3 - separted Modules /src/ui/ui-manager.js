import { BaseComponents } from "./Components/base-components.js";
import { PageComponents } from "./Components/page-components.js";
import { ChartRenderer } from "./chart-renderer.js";
import { NewsUI } from "./news-ui.js";
import { CoinUI } from "./coin-ui.js";
import { BaseUI } from "./base-ui.js";

export const UIManager = (() => {
  const renderCurrenciesPage = () => {
    BaseUI.showPage(PageComponents.currenciesPage());
  };

  const renderReportsPage = () => {
    BaseUI.showPage(PageComponents.reportsPage());
  };

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

  const initLiveChart = (symbols, options = {}) => {
    ChartRenderer.init(symbols, options);
  };

  const updateLiveChart = (prices, time, options = {}) => {
    ChartRenderer.update(prices, time, options);
  };

  const clearLiveChart = () => {
    ChartRenderer.clear();
  };

  const updateToggleStates = (...args) => CoinUI.updateToggleStates(...args);

  const drawMiniChart = (...args) => CoinUI.drawMiniChart(...args);
  
  const showChartSkeleton = () => {
    $("#chartsGrid").html(BaseComponents.chartsSkeleton());
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
  };
})();
