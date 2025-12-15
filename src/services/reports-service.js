import { getSelectedReports, removeReport, addReport } from "./storage-manager.js";
import { getAllCoins } from "./coins-service.js";
import { APP_CONFIG } from "../config/app-config.js";
import { fetchWithRetry } from "./api.js";
import { ERRORS } from "../config/error.js";

const { REPORTS_COMPARE_MAX, REPORTS_MAX, COINGECKO_BASE } = APP_CONFIG;

export const toggleCoinSelection = (symbol) => {
  const selected = getSelectedReports();
  const alreadySelected = selected.includes(symbol);

  if (!alreadySelected && selected.length >= REPORTS_MAX) {
    return {ok: false,error: ERRORS.LIMIT(REPORTS_MAX), limitExceeded: true,newSymbol: symbol,existing: selected,limit: REPORTS_MAX,selected,};
  }
  alreadySelected ? removeReport(symbol) : addReport(symbol);
  return { ok: true, selected: getSelectedReports(), wasAdded: !alreadySelected };
};

export const replaceReport = (oldSymbol, newSymbol) => {
  const selected = getSelectedReports();

  if (oldSymbol === newSymbol) return { ok: true, selected };
  if (!selected.includes(oldSymbol)) return { ok: false, error: ERRORS.NOT_FOUND, selected };
  if (selected.includes(newSymbol)) return { ok: false, error: ERRORS.DUPLICATE, selected };
  if (!getAllCoins().some((coin) => coin.symbol === newSymbol)) return { ok: false, error: ERRORS.INVALID_SYMBOL, selected };

  removeReport(oldSymbol);
  addReport(newSymbol);
  return { ok: true, selected: getSelectedReports() };
};

export const getCompareData = async (ids) => {
  const uniqueIds = [...new Set(ids)].slice(0, REPORTS_COMPARE_MAX);
  const results = await Promise.all(
    uniqueIds.map((id) => fetchWithRetry(`${COINGECKO_BASE}/coins/${id}`))
  );

  const coins = [];
  const missing = [];

  results.forEach(({ ok, data }, index) => {
    ok && data ? coins.push(data) : missing.push(uniqueIds[index]);
  });

  return coins.length
    ? { ok: true, coins, missing, limit: REPORTS_MAX }
    : { ok: false, error: ERRORS.NO_DATA, coins: [], missing };
};
