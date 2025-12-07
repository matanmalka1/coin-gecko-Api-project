import { AppState } from "../state/state.js";
import { coinAPI } from "./api.js";
import { normalizeSymbol } from "../utils/general-utils.js";
import { UI_CONFIG } from "../config/ui-config.js";

const { MAX_COINS } = UI_CONFIG.REPORTS;
const { fetchCoinDetails } = coinAPI;

const getSelectedReports = () => AppState.getSelectedReports();

const toggleCoinSelection = (symbol) => {
  const symbolUpper = normalizeSymbol(symbol);
  const alreadySelected = AppState.hasReport(symbolUpper);

  if (!alreadySelected && AppState.isReportsFull()) {
    const selected = AppState.getSelectedReports();
    return {
      ok: false,
      code: "FULL",
      newSymbol: symbolUpper,
      existing: selected,
      limit: MAX_COINS,
      selected,
    };
  }

  AppState[alreadySelected ? "removeReport" : "addReport"](symbolUpper);

  return { ok: true, code: null, selected: AppState.getSelectedReports() };
};
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

const getCompareData = async (ids) => {
  const compareIds = Array.isArray(ids)
    ? ids.filter(Boolean).map((id) => String(id))
    : [];

  const results = await Promise.all(
    compareIds.map((id) => fetchCoinDetails(id))
  );

  const coins = [];
  const missing = [];

  results.forEach(({ ok, data }, index) => {
    if (ok && data) {
      coins.push({
        ...data,
        symbol: normalizeSymbol(data.symbol),
      });
    } else {
      missing.push(compareIds[index]);
    }
  });

  if (!coins.length) {
    return { ok: false, code: "NO_DATA", missing };
  }

  return { ok: true, coins, missing };
};

export const ReportsService = {
  getSelectedReports,
  toggleCoinSelection,
  replaceReport,
  getCompareData,
};
