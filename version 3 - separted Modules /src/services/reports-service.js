import { StorageHelper } from "./storage-manager.js";
import { CoinsService } from "./coins-service.js";
import { coinAPI } from "./api.js";
import { UI_CONFIG } from "../config/ui-config.js";

const { MAX_COINS } = UI_CONFIG.REPORTS;
const { fetchCoinDetails } = coinAPI;

const getSelectedReports = () => StorageHelper.getSelectedReports();

const isReportsFull = () => getSelectedReports().length >= MAX_COINS;

const toggleCoinSelection = (symbol) => {
  const symbolUpper = String(symbol).trim().toUpperCase();
  const currentReports = getSelectedReports();
  const alreadySelected = currentReports.includes(symbolUpper);

  if (!alreadySelected && isReportsFull()) {
    return {
      ok: false,
      code: "FULL",
      newSymbol: symbolUpper,
      existing: currentReports,
      limit: MAX_COINS,
      selected: currentReports,
    };
  }

  if (alreadySelected) {
    StorageHelper.removeReport(symbolUpper);
  } else {
    StorageHelper.addReport(symbolUpper);
  }

  return { ok: true, code: null, selected: getSelectedReports() };
};

const replaceReport = (oldSymbol, newSymbol) => {
  const oldUpper = String(oldSymbol).trim().toUpperCase();
  const newUpper = String(newSymbol).trim().toUpperCase();
  const currentSelected = getSelectedReports();

  if (oldUpper === newUpper) {
    return { ok: true, code: null, selected: currentSelected };
  }

  if (!currentSelected.includes(oldUpper)) {
    return { ok: false, code: "NOT_FOUND", selected: currentSelected };
  }

  if (currentSelected.includes(newUpper)) {
    return { ok: false, code: "DUPLICATE", selected: currentSelected };
  }

  const coinExists = CoinsService.getAllCoins().some(
    (coin) => coin.symbol === newUpper
  );
  
  if (!coinExists) {
    return { ok: false, code: "INVALID_SYMBOL", selected: currentSelected };
  }

  StorageHelper.removeReport(oldUpper);
  StorageHelper.addReport(newUpper);

  return { ok: true, code: null, selected: getSelectedReports() };
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
        symbol: String(data.symbol).trim().toUpperCase(),
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
