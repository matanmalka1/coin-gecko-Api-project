import { AppState } from "../state/state.js";
import { coinAPI } from "./api.js";
import { normalizeSymbol } from "../utils/general-utils.js";
import { UI_CONFIG } from "../config/ui-config.js";

const { MAX_COINS } = UI_CONFIG.REPORTS;

// Reports domain logic only: no UI/DOM.
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

  const selected = AppState.getSelectedReports();

  return {
    ok: false,
    code: "FULL",
    newSymbol: symbolUpper,
    existing: selected,
    limit: MAX_COINS,
    selected,
  };
};

// Swaps one tracked symbol with another if possible.
const replaceReport = (oldSymbol, newSymbol) => {
  const oldUpper = normalizeSymbol(oldSymbol);
  const newUpper = normalizeSymbol(newSymbol);
  const currentSelected = AppState.getSelectedReports();

  if (oldUpper === newUpper) {
    return { ok: true, code: null, selected: currentSelected };
  }

  if (!AppState.hasReport(oldUpper)) {
    return { ok: false, code: "NOT_FOUND", selected: currentSelected };
  }

  if (AppState.hasReport(newUpper)) {
    return { ok: false, code: "DUPLICATE", selected: currentSelected };
  }

  const coinExists = AppState.getAllCoins().some(
    (coin) => coin.symbol === newUpper
  );

  if (!coinExists) {
    return { ok: false, code: "INVALID_SYMBOL", selected: currentSelected };
  }

  AppState.removeReport(oldUpper);
  AppState.addReport(newUpper);

  return { ok: true, code: null, selected: AppState.getSelectedReports() };
};

// Fetches coin details for compare modal (parallel requests).
const getCompareData = async (ids) => {
  const compareIds = Array.isArray(ids)
    ? ids.filter(Boolean).map((id) => id.toString())
    : [];
  const results = await Promise.all(
    compareIds.map((id) => coinAPI.fetchCoinDetails(id))
  );
  const coins = [];
  const missing = [];

  results.forEach((result, index) => {
    const id = compareIds[index];

    if (result.ok && result.data) {
      coins.push({
        ...result.data,
        symbol: normalizeSymbol(result.data.symbol),
      });
    } else {
      missing.push(id);
    }
  });

  if (!coins.length) {
    return { ok: false, code: "NO_DATA", missing };
  }

  return { ok: true, coins, missing };
};

export const ReportsService = {
  toggleCoinSelection,
  replaceReport,
  getSelectedReports,
  getCompareData,
};
