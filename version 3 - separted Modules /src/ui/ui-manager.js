import { BaseUI } from "./base-ui.js";
import { CoinUI } from "./coin-ui.js";
import { NewsUI } from "./news-ui.js";
import { BaseComponents } from "../ui/Components/base-components.js";
import { PageComponents } from "../ui/Components/page-components.js";
import { ChartRenderer } from "./chart-renderer.js";
import { UI_CONFIG } from "../config/ui-config.js";

const { REPORTS } = UI_CONFIG;

const renderCurrenciesPage = () =>
  BaseUI.showPage(PageComponents.currenciesPage());

const renderReportsPage = () => BaseUI.showPage(PageComponents.reportsPage());

const renderAboutPage = (data) =>
  BaseUI.showPage(PageComponents.aboutPage(data));

const renderNewsPage = () => BaseUI.showPage(PageComponents.newsPage());

const showChartSkeleton = () =>
  $("#chartsGrid").html(BaseComponents.skeleton());

const initLiveChart = (symbols, options) =>
  ChartRenderer.setupCharts(symbols, options);

const updateLiveChart = (candlesBySymbol, options) =>
  ChartRenderer.update(candlesBySymbol, options);

const clearLiveChart = () => ChartRenderer.clear();

const updateCompareStatus = (count, max = REPORTS.MAX_COMPARE) =>
  $("#compareStatus").text(`${count} / ${max} coins selected`);

const setCompareStatusVisibility = (visible) => {
  $("#compareStatus").toggleClass("d-none", !visible);
};

export const UIManager = {
  ...BaseUI,
  ...CoinUI,
  ...NewsUI,

  renderCurrenciesPage,
  renderReportsPage,
  renderAboutPage,
  renderNewsPage,

  showChartSkeleton,
  initLiveChart,
  updateLiveChart,
  clearLiveChart,

  updateCompareStatus,
  setCompareStatusVisibility,
};
