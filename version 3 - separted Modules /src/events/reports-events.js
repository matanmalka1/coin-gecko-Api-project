import { CoinsService } from "../services/coins-service.js";
import { ReportsService } from "../services/reports-service.js";
import { CoinUI } from "../ui/coin-ui.js";
import { AppState } from "../state/state.js";
import { ERRORS } from "../config/error.js";
import { BaseUI } from "../ui/base-ui.js";
import { UI_CONFIG } from "../config/ui-config.js";

// ===== GLOBAL CONSTANTS =====
const { MAX_COMPARE } = UI_CONFIG.REPORTS;
const { REPORTS: REPORTS_ERRORS, API: API_ERRORS } = ERRORS;

let eventsRegistered = false;

// ===== HELPERS =====

const updateCompareIndicator = (selected = AppState.getCompareSelection()) => {
  const selectionArray = Array.isArray(selected) ? selected : [];
  const selectedCount = selectionArray.length;

  const $status = $("#compareStatus");
  $status.text(`${selectedCount} / ${MAX_COMPARE} coins selected`);

  if (!selectedCount) {
    $status.addClass("d-none");
    CoinUI.clearCompareHighlights();
  } else {
    $status.removeClass("d-none");
  }
};

// ===== EVENT HANDLERS =====

const handleFilterReports = () => {
  const { ok, code, data, selected, favorites } = CoinsService.filterSelectedCoins();
  $("#clearSearchBtn").removeClass("d-none");

  if (!ok) {
    BaseUI.showError("#coinsContainer", code, {
      defaultMessage: REPORTS_ERRORS.NONE_SELECTED,
    });
    return;
  }

  CoinUI.displayCoins(data, selected, { favorites });
};

const openReplaceFlow = (serviceResult) => {
  const { newSymbol, existing, limit } = serviceResult;
  
  CoinUI.showReplaceModal(newSymbol, existing, {
    maxCoins: limit,
    onConfirm: ({ remove, add, modal }) => {
      const { ok, code, selected } = ReportsService.replaceReport(remove, add);
      CoinUI.updateToggleStates(selected);

      if (!ok) {
        BaseUI.showError("#content", code);
        modal.hide();
        return;
      }

      modal.hide();
      updateCompareIndicator(selected);
    },
  });
};

const handleCoinToggle = function () {
  const coinSymbol = $(this).data("symbol");
  const { ok, code, selected, ...rest } = ReportsService.toggleCoinSelection(coinSymbol);

  if (ok) {
    CoinUI.updateToggleStates(selected);
  } else if (code === "FULL") {
    openReplaceFlow({ code, selected, ...rest });
  }
};

const handleCompareClick = async function () {
  if (AppState.isCompareModalOpen()) return;

  const coinId = String($(this).data("id"));
  const coinExists = AppState.getAllCoins().some(
    (coin) => String(coin.id) === coinId
  );

  if (!coinExists) {
    BaseUI.showError("#content", "NO_MATCH", {
      defaultMessage: REPORTS_ERRORS.NOT_FOUND,
    });
    return;
  }

  let currentSelection = AppState.getCompareSelection();
  const alreadySelected = currentSelection.includes(coinId);

  if (alreadySelected) {
    currentSelection = currentSelection.filter((id) => id !== coinId);
    CoinUI.setCompareHighlight(coinId, false);
  } else {
    if (currentSelection.length >= MAX_COMPARE) {
      updateCompareIndicator(currentSelection);
      return;
    }

    currentSelection = [...currentSelection, coinId];
    CoinUI.setCompareHighlight(coinId, true);
  }

  AppState.setCompareSelection(currentSelection);
  updateCompareIndicator(currentSelection);

  if (currentSelection.length < MAX_COMPARE) return;

  const { ok, code, coins, missing } = await ReportsService.getCompareData(currentSelection);

  if (!ok) {
    BaseUI.showError("#content", code, {
      defaultMessage: API_ERRORS.DEFAULT,
    });
    AppState.resetCompareSelection();
    updateCompareIndicator();
    return;
  }

  AppState.setCompareModalOpen(true);
  CoinUI.showCompareModal(coins, {
    missingSymbols: missing,
    onClose: () => {
      const previousSelection = AppState.getCompareSelection();
      AppState.resetCompareSelection();
      AppState.setCompareModalOpen(false);
      updateCompareIndicator();
      previousSelection.forEach((id) => CoinUI.setCompareHighlight(id, false));
    },
  });
};

// ===== REGISTRATION =====

const setupEventListeners = () => {
  if (eventsRegistered) return;

  $(document)
    .on("click", "#filterReportsBtn", handleFilterReports)
    .on("change", ".coin-toggle", handleCoinToggle)
    .on("click", ".compare-btn", handleCompareClick);

  eventsRegistered = true;
};

export const ReportsEvents = {
  register: setupEventListeners,
  updateCompareIndicator,
};