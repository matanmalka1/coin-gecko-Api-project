import { CoinsService } from "../services/coins-service.js";
import { ReportsService } from "../services/reports-service.js";
import { CoinUI } from "../ui/coin-ui.js";
import { ERRORS } from "../config/error.js";
import { BaseUI } from "../ui/base-ui.js";
import { UI_CONFIG } from "../config/ui-config.js";

const { MAX_COMPARE } = UI_CONFIG.REPORTS;
const { REPORTS: REPORTS_ERRORS, API: API_ERRORS } = ERRORS;

let eventsRegistered = false;
let compareModalOpen = false;

// ===== HELPERS =====

const setCompareSelection = (ids) => {
  CoinUI.clearCompareHighlights();
  ids.forEach((id) => CoinUI.setCompareHighlight(id, true));
};

const resetCompareSelection = () => {
  CoinUI.clearCompareHighlights();
  updateCompareIndicator([]);
};

const updateCompareIndicator = (selected = CoinUI.getCompareSelection()) => {
  const selectionArray = Array.isArray(selected) ? selected : [];
  const selectedCount = selectionArray.length;

  const $status = $("#compareStatus");

  if (selectedCount === 0) {
    $status.addClass("d-none").empty();
    CoinUI.clearCompareHighlights();
    return;
  }

  $status
    .removeClass("d-none")
    .text(`${selectedCount} / ${MAX_COMPARE} coins selected`);
};

// ===== EVENT HANDLERS =====
const handleFilterReports = () => {
  const { ok, code, data, selected, favorites } =
    CoinsService.filterSelectedCoins();
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
    },
  });
};

const handleCoinToggle = function () {
  const coinSymbol = $(this).data("symbol");
  const { ok, code, selected, ...rest } =
    ReportsService.toggleCoinSelection(coinSymbol);

  if (ok) {
    CoinUI.updateToggleStates(selected);
  } else if (code === "FULL") {
    openReplaceFlow({ code, selected, ...rest });
  }
};

const handleCompareClick = async function () {
  if (compareModalOpen) return;

  const coinId = String($(this).data("id"));
  const coinExists = CoinsService.getAllCoins().some(
    (coin) => String(coin.id) === coinId
  );

  if (!coinExists) {
    BaseUI.showError("#content", "NO_MATCH", {
      defaultMessage: REPORTS_ERRORS.NOT_FOUND,
    });
    return;
  }

  let currentSelection = CoinUI.getCompareSelection();
  const alreadySelected = currentSelection.includes(coinId);

  if (alreadySelected) {
    currentSelection = currentSelection.filter((id) => id !== coinId);
    CoinUI.setCompareHighlight(coinId, false);
  } else {
    if (currentSelection.length >= MAX_COMPARE) {
      updateCompareIndicator(currentSelection);
      BaseUI.showError("#content", "COMPARE_FULL", {
        defaultMessage: `Maximum ${MAX_COMPARE} coins for comparison. Deselect one first.`,
      });
      return;
    }

    currentSelection = [...currentSelection, coinId];
    CoinUI.setCompareHighlight(coinId, true);
  }

  setCompareSelection(currentSelection);
  updateCompareIndicator(currentSelection);

  if (currentSelection.length !== MAX_COMPARE) {
    return;
  }

  const { ok, code, coins, missing } = await ReportsService.getCompareData(
    currentSelection
  );

  if (!ok) {
    BaseUI.showError("#content", code, {
      defaultMessage: API_ERRORS.DEFAULT,
    });
    resetCompareSelection();
    return;
  }

  compareModalOpen = true;
  CoinUI.showCompareModal(coins, {
    missingSymbols: missing,
    onClose: () => {
      resetCompareSelection();
      compareModalOpen = false;
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
