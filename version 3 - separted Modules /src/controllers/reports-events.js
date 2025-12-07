import { CoinsService } from "../services/coins-service.js";
import { ReportsService } from "../services/reports-service.js";
import { UIManager } from "../ui/ui-manager.js";
import { AppState } from "../state/state.js";
import { ERRORS } from "../config/error.js";
import { BaseUI } from "../ui/base-ui.js";
import { UI_CONFIG } from "../config/ui-config.js";

const { REPORTS } = UI_CONFIG;

// Syncs compare status indicator with AppState.
const updateCompareIndicator = (selected = AppState.getCompareSelection()) => {
  const selectionArray = Array.isArray(selected) ? selected : [];
  const selectedCount = selectionArray.length;

  UIManager.updateCompareStatus(selectedCount, REPORTS.MAX_COMPARE);

  if (!selectedCount) {
    UIManager.setCompareStatusVisibility(false);
    UIManager.clearCompareHighlights();
  } else {
    UIManager.setCompareStatusVisibility(true);
  }
};

// Filters coins list to currently selected reports.
const handleFilterReports = () => {
  const serviceResult = CoinsService.filterSelectedCoins();
  $("#clearSearchBtn").removeClass("d-none");

  if (!serviceResult?.ok) {
    BaseUI.showError("#coinsContainer", serviceResult.code, {
      defaultMessage: ERRORS.REPORTS.NONE_SELECTED,
    });
    return;
  }

  UIManager.displayCoins(serviceResult.data, serviceResult.selected, {
    favorites: serviceResult.favorites,
  });
};

// Opens the replace flow modal when reaching MAX reports.
const openReplaceFlow = (serviceResult) => {
  UIManager.showReplaceModal(serviceResult.newSymbol, serviceResult.existing, {
    maxCoins: serviceResult.limit,
    onConfirm: ({ remove, add, modal }) => {
      const replaceSelectionResult = ReportsService.replaceReport(remove, add);
      UIManager.updateToggleStates(replaceSelectionResult.selected);

      if (!replaceSelectionResult?.ok) {
        BaseUI.showError("#content", replaceSelectionResult.code);
        modal.hide();
        return;
      }

      modal.hide();
      UIManager.updateCompareStatus(
        replaceSelectionResult.selected.length,
        replaceSelectionResult.limit
      );
    },
  });
};

// Adds/removes a coin from the reports selection via toggle switch.
const handleCoinToggle = function () {
  const coinSymbol = $(this).data("symbol");
  const { ok, code, selected, ...result } = ReportsService.toggleCoinSelection(
    $(e.currentTarget).data("id")
  );

  if (ok) {
    UIManager.updateToggleStates(selected);
  } else if (code === "FULL") {
    openReplaceFlow({ code, selected, ...result });
  }
};

// Handles clicks on compare buttons and opens the compare modal.
const handleCompareClick = async function () {
  if (AppState.isCompareModalOpen()) return;

  const coinId = String($(this).data("id"));
  const coinExists = AppState.getAllCoins().some(
    (coin) => String(coin.id) === coinId
  );

  if (!coinExists) {
    BaseUI.showError("#content", "NO_MATCH", {
      defaultMessage: ERRORS.REPORTS.NOT_FOUND,
    });
    return;
  }

  let currentSelection = AppState.getCompareSelection();
  const alreadySelected = currentSelection.includes(coinId);

  if (alreadySelected) {
    currentSelection = currentSelection.filter((id) => id !== coinId);
    UIManager.setCompareHighlight(coinId, false);
  } else {
    if (currentSelection.length >= REPORTS.MAX_COMPARE) {
      updateCompareIndicator(currentSelection);
      return;
    }

    currentSelection = [...currentSelection, coinId];
    UIManager.setCompareHighlight(coinId, true);
  }

  AppState.setCompareSelection(currentSelection);
  updateCompareIndicator(currentSelection);

  // Need at least MAX_COMPARE coins selected to open compare modal
  if (currentSelection.length < REPORTS.MAX_COMPARE) return;

  const { ok, code, coins, missing } = await ReportsService.getCompareData(
    currentSelection
  );

  if (!ok) {
    BaseUI.showError("#content", code, {
      defaultMessage: ERRORS.API.DEFAULT,
    });
    AppState.resetCompareSelection();
    updateCompareIndicator();
    return;
  }

  AppState.setCompareModalOpen(true);
  UIManager.showCompareModal(coins, {
    missingSymbols: missing,
    onClose: () => {
      const previousSelection = AppState.getCompareSelection();
      AppState.resetCompareSelection();
      AppState.setCompareModalOpen(false);
      updateCompareIndicator();
      previousSelection.forEach((id) =>
        UIManager.setCompareHighlight(id, false)
      );
    },
  });
};

// Registers report-related DOM events once.
let eventsRegistered = false;
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
