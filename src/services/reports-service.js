import { StorageHelper } from "./storage-manager.js";
import { getAllCoins } from "./coins-service.js";
import { APP_CONFIG } from "../config/app-config.js";
import { fetchWithRetry } from "./api.js";

const { getSelectedReports, removeReport, addReport } = StorageHelper;

const { REPORTS_MAX, COINGECKO_BASE } = APP_CONFIG;

export const toggleCoinSelection = (symbol) => {
  const sym = String(symbol).trim().toUpperCase();
  const selected = getSelectedReports();
  
  if (!selected.includes(sym) && selected.length >= REPORTS_MAX) {
    return { ok: false, code: "LIMIT", newSymbol: sym, existing: selected, limit: REPORTS_MAX, selected };
  }

  selected.includes(sym) ? removeReport(sym) : addReport(sym);
  return { ok: true, code: null, selected: getSelectedReports() };
};

export const replaceReport = (oldSymbol, newSymbol) => {
  const oldSym = String(oldSymbol).trim().toUpperCase();
  const newSym = String(newSymbol).trim().toUpperCase();
  const selected = getSelectedReports();

  if (oldSym === newSym) return { ok: true, code: null, selected };
  if (!selected.includes(oldSym)) return { ok: false, code: "NOT_FOUND", selected };
  if (selected.includes(newSym)) return { ok: false, code: "DUPLICATE", selected };
  if (!getAllCoins().some(coin => coin.symbol === newSym)) return { ok: false, code: "INVALID_SYMBOL", selected };

  StorageHelper.removeReport(oldSym);
  StorageHelper.addReport(newSym);
  return { ok: true, code: null, selected: getSelectedReports() };
};

export const getCompareData = async (ids) => {
  const uniqueIds = Array.from(new Set(ids)).slice(0, REPORTS_MAX);

  const results = await Promise.all(
    uniqueIds.map((id) => fetchWithRetry(`${COINGECKO_BASE}/coins/${id}`))
  );

  const coins = [];
  const missing = [];

  results.forEach((result, index) => {
    const id = uniqueIds[index];
    if (result?.ok && result.data) {
      coins.push(result.data);
    } else {
      missing.push(id);
    }
  });

  if (!coins.length) {
    return { ok: false, code: "NO_DATA", coins: [], missing };
  }

  return { ok: true, coins, missing, limit: REPORTS_MAX };
};
