import { AppState } from "../state/state.js";
import { coinAPI } from "./api.js";
import {
  normalizeSymbol,
  normalizeCoinMarketData,
} from "../utils/general-utils.js";
import { UI_CONFIG } from "../config/ui-config.js";

// Reports domain logic only: no UI/DOM.
export const ReportsService = (() => {
  const getSelectedReports = () => AppState.getSelectedReports();

  // Adds or removes a symbol from the tracked reports list.
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
      limit: UI_CONFIG.REPORTS.MAX_COINS,
      selected: AppState.getSelectedReports(),
    };
  };

  // Swaps one tracked symbol with another if possible.
  const replaceReport = (oldSymbol, newSymbol) => {
    const oldUpper = normalizeSymbol(oldSymbol);
    const newUpper = normalizeSymbol(newSymbol);

    if (oldUpper === newUpper) {
      return {
        ok: true,
        code: null,
        selected: AppState.getSelectedReports(),
      };
    }

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

    const coinExists = AppState.getAllCoins().some((coin) => coin.symbol === newUpper);
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

  // Fetches coin details for compare modal (parallel requests).
  const fetchCompareData = async (ids) => {
    const dataPromises = ids.map((id) => coinAPI.fetchCoinDetails(id));
    const results = await Promise.all(dataPromises);
    return results.map((result, idx) => ({ result, id: ids[idx] }));
  };

  // Maps API responses to normalized compare data and tracks missing ids.
  const mapCompareResults = (mappedResults) => {
    const coins = [];
    const missing = [];

    mappedResults.forEach(({ result, id }) => {
      if (result.ok) {
        coins.push(normalizeCoinMarketData(result.data));
      } else {
        missing.push(id);
      }
    });

    if (!coins.length) {
      return { ok: false, code: "NO_DATA", missing };
    }

    return { ok: true, coins, missing };
  };

  // Public helper that validates ids and returns normalized compare data.
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
    getSelectedReports,
    getCompareData,
  };
})();
