import { AppState } from "../state/state.js";
import { coinAPI } from "./api.js";
import { CONFIG } from "../config/config.js";

// Reports domain logic only: no UI/DOM.
export const ReportsService = (() => {
  const getSelectedReports = () => AppState.getSelectedReports();
  const hasReport = (symbol) => AppState.hasReport(symbol);

  const toggleCoinSelection = (symbol) => {
    const symbolUpper = symbol.toUpperCase();

    if (AppState.hasReport(symbolUpper)) {
      AppState.removeReport(symbolUpper);
      return { ok: true, selected: AppState.getSelectedReports() };
    }

    if (!AppState.isReportsFull()) {
      AppState.addReport(symbolUpper);
      return { ok: true, selected: AppState.getSelectedReports() };
    }

    return {
      ok: false,
      code: "FULL",
      newSymbol: symbolUpper,
      existing: AppState.getSelectedReports(),
      limit: CONFIG.REPORTS.MAX_COINS,
    };
  };

  const replaceReport = (oldSymbol, newSymbol) => {
    const oldUpper = oldSymbol.toUpperCase();
    const newUpper = newSymbol.toUpperCase();

    AppState.removeReport(oldUpper);
    AppState.addReport(newUpper);

    return { ok: true, selected: AppState.getSelectedReports() };
  };

  const getCompareData = async (ids) => {
    const dataPromises = ids.map((id) => coinAPI.getCoinDetails(id));
    const results = await Promise.all(dataPromises);

    const coins = [];
    const missing = [];

    results.forEach((result, idx) => {
      if (result.ok) {
        coins.push(result.data);
      } else {
        missing.push(ids[idx]);
      }
    });

    if (!coins.length) {
      return { ok: false, code: "NO_DATA", missing };
    }

    return { ok: true, coins, missing };
  };

  return {
    toggleCoinSelection,
    replaceReport,
    hasReport,
    getSelectedReports,
    getCompareData,
  };
})();
