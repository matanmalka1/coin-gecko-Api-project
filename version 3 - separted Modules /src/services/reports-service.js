import { AppState } from "../state/state.js";
import { coinAPI } from "./api.js";
import { CONFIG } from "../config/config.js";
import { normalizeSymbol } from "../utils/general-utils.js";

// Reports domain logic only: no UI/DOM.
export const ReportsService = (() => {
  const getSelectedReports = () => AppState.getSelectedReports();
  const hasReport = (symbol) => AppState.hasReport(symbol);

  const toggleCoinSelection = (symbol) => {
    const symbolUpper = normalizeSymbol(symbol);

    if (AppState.hasReport(symbolUpper)) {
      AppState.removeReport(symbolUpper);
      return {
        ok: true,
        code: null,
        selected: AppState.getSelectedReports(),
      };
    }

    if (!AppState.isReportsFull()) {
      AppState.addReport(symbolUpper);
      return {
        ok: true,
        code: null,
        selected: AppState.getSelectedReports(),
      };
    }

    return {
      ok: false,
      code: "FULL",
      newSymbol: symbolUpper,
      existing: AppState.getSelectedReports(),
      limit: CONFIG.REPORTS.MAX_COINS,
      selected: AppState.getSelectedReports(),
    };
  };

  const replaceReport = (oldSymbol, newSymbol) => {
    const oldUpper = normalizeSymbol(oldSymbol);
    const newUpper = normalizeSymbol(newSymbol);

    if (!AppState.hasReport(oldUpper)) {
      return {
        ok: false,
        code: "NOT_FOUND",
        selected: AppState.getSelectedReports(),
      };
    }

    if (AppState.hasReport(newUpper)) {
      return {
        ok: false,
        code: "DUPLICATE",
        selected: AppState.getSelectedReports(),
      };
    }

    const coinExists = AppState.fetchAllCoins().some((coin) => coin.symbol === newUpper);
    if (!coinExists) {
      return {
        ok: false,
        code: "INVALID_SYMBOL",
        selected: AppState.getSelectedReports(),
      };
    }

    AppState.removeReport(oldUpper);
    AppState.addReport(newUpper);

    return { ok: true, code: null, selected: AppState.getSelectedReports() };
  };

  const fetchCompareData = async (ids) => {
    const dataPromises = ids.map((id) => coinAPI.getCoinDetails(id));
    const results = await Promise.all(dataPromises);
    return results.map((result, idx) => ({ result, id: ids[idx] }));
  };

  const mapCompareResults = (mappedResults) => {
    const coins = [];
    const missing = [];

    mappedResults.forEach(({ result, id }) => {
      if (result.ok) {
        coins.push(result.data);
      } else {
        missing.push(id);
      }
    });

    if (!coins.length) {
      return { ok: false, code: "NO_DATA", missing };
    }

    return { ok: true, coins, missing };
  };

  const getCompareData = async (ids) => {
    const validIds = Array.isArray(ids)
      ? ids.filter(Boolean).map((id) => id.toString())
      : [];
    const mappedResults = await fetchCompareData(validIds);
    return mapCompareResults(mappedResults);
  };

  return {
    toggleCoinSelection,
    replaceReport,
    hasReport,
    getSelectedReports,
    getCompareData,
  };
})();
