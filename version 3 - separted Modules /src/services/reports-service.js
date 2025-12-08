import { StorageHelper } from "./storage-manager.js";
import { CoinsService } from "./coins-service.js";
import { APP_CONFIG } from "../config/app-config.js";
import { fetchWithRetry } from "./api.js";

const { getSelectedReports, removeReport, addReport } = StorageHelper;
const { getAllCoins } = CoinsService;

const { REPORTS_MAX: MAX_COINS, COINGECKO_URL: COINGECKO_BASE } = APP_CONFIG;

const toggleCoinSelection = (symbol) => {
  if (
    !getSelectedReports().includes(String(symbol).trim().toUpperCase()) &&
    getSelectedReports().length >= MAX_COINS
  ) {
    return {
      ok: false,
      code: "FULL",
      newSymbol: String(symbol).trim().toUpperCase(),
      existing: getSelectedReports(),
      limit: MAX_COINS,
      selected: getSelectedReports(),
    };
  }

  if (getSelectedReports().includes(String(symbol).trim().toUpperCase())) {
    removeReport(String(symbol).trim().toUpperCase());
  } else {
    addReport(String(symbol).trim().toUpperCase());
  }

  return { ok: true, code: null, selected: getSelectedReports() };
};

const replaceReport = (oldSymbol, newSymbol) => {
  if (
    String(oldSymbol).trim().toUpperCase() ===
    String(newSymbol).trim().toUpperCase()
  ) {
    return { ok: true, code: null, selected: getSelectedReports() };
  }

  if (!getSelectedReports().includes(String(oldSymbol).trim().toUpperCase())) {
    return { ok: false, code: "NOT_FOUND", selected: getSelectedReports() };
  }

  if (getSelectedReports().includes(String(newSymbol).trim().toUpperCase())) {
    return { ok: false, code: "DUPLICATE", selected: getSelectedReports() };
  }

  const coinExists = getAllCoins().some(
    (coin) => coin.symbol === String(newSymbol).trim().toUpperCase()
  );

  if (!coinExists) {
    return {
      ok: false,
      code: "INVALID_SYMBOL",
      selected: getSelectedReports(),
    };
  }

  StorageHelper.removeReport(String(oldSymbol).trim().toUpperCase());
  StorageHelper.addReport(String(newSymbol).trim().toUpperCase());

  return { ok: true, code: null, selected: getSelectedReports() };
};

const getCompareData = async (ids) => {
  const uniqueIds = Array.from(new Set(ids)).slice(0, MAX_COINS);

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

  return { ok: true, coins, missing, limit: MAX_COINS };
};

export const ReportsService = {
  toggleCoinSelection,
  replaceReport,
  getCompareData,
};
