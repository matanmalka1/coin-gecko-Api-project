import { AppState } from "../state/state.js";
import { coinAPI } from "../services/api.js";

export const ReportsService = (() => {
  // ✅ רק לוגיקה - מחזיר תוצאה
  const toggleCoinSelection = (symbol) => {
    const symbolUpper = symbol.toUpperCase();

    if (AppState.hasReport(symbolUpper)) {
      AppState.removeReport(symbolUpper);
      return { success: true, action: "removed" };
    }

    if (!AppState.isReportsFull()) {
      AppState.addReport(symbolUpper);
      return { success: true, action: "added" };
    }

    return { success: false, error: "REPORTS_FULL" };
  };

  // ✅ רק לוגיקה - החלפת מטבע
  const handleReplaceCoin = (oldSymbol, newSymbol) => {
    AppState.removeReport(oldSymbol);
    AppState.addReport(newSymbol);
    return { success: true };
  };

  // ✅ בדיקה האם נדרש replacement
  const needsReplacement = (symbol) => {
    return (
      AppState.isReportsFull() && !AppState.hasReport(symbol.toUpperCase())
    );
  };

  // ✅ נקי - רק משיכת נתונים
  const getCompareData = async (ids) => {
    const dataPromises = ids.map((id) => coinAPI.getCoinDetails(id));
    const results = await Promise.all(dataPromises);
    return results.filter((r) => r.success).map((r) => r.data);
  };

  return {
    toggleCoinSelection,
    handleReplaceCoin,
    needsReplacement,
    getCompareData,
  };
})();
