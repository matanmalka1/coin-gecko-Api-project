import { CoinsService } from "../services/coins-service.js";
import { ReportsService } from "../services/reports-service.js";
import { UIManager } from "../ui/ui-manager.js";
import { AppState } from "../state/state.js";
import { ERRORS } from "../config/error.js";
import { ErrorResolver } from "../utils/error-resolver.js";
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
  const result = CoinsService.filterSelectedCoins();
  UIManager.showElement("#clearSearchBtn");

  if (!result?.ok) {
    UIManager.showError("#coinsContainer", ErrorResolver.resolve(result.code));
    return;
  }

  UIManager.displayCoins(result.data, result.selected, {
    favorites: result.favorites,
    compareSelection: AppState.getCompareSelection(),
  });
};

// Opens the replace flow modal when reaching MAX reports.
const openReplaceFlow = (result) => {
  UIManager.showReplaceModal(result.newSymbol, result.existing, {
    maxCoins: result.limit,
    onConfirm: ({ remove, add, modal }) => {
      const { selected } = ReportsService.replaceReport(remove, add);
      UIManager.updateToggleStates(selected);
      modal.hide();
    },
    onClose: () => {
      UIManager.updateToggleStates(ReportsService.getSelectedReports());
    },
  });
};

// Adds/removes a coin from the reports selection via toggle switch.
const handleCoinToggle = function () {
  const coinSymbol = UIManager.getDataAttr(this, "symbol");
  const result = ReportsService.toggleCoinSelection(coinSymbol);

  if (result.ok) {
    UIManager.updateToggleStates(result.selected);
  } else if (result.code === "FULL") {
    openReplaceFlow(result);
  }
};
// Handles clicks on compare buttons and opens the compare modal.
const handleCompareClick = async function () {
  if (AppState.isCompareModalOpen()) return;

  const coinId = String(UIManager.getDataAttr(this, "id"));
  const coinExists = AppState.getAllCoins().some(
    (coin) => String(coin.id) === coinId
  );

  if (!coinExists) {
    UIManager.showError("#coinsContainer", ERRORS.REPORTS.NOT_FOUND);
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

  if (currentSelection.length < REPORTS.MAX_COMPARE) return;

  const result = await ReportsService.getCompareData(currentSelection);

  if (!result?.ok) {
    UIManager.showError(
      "#content",
      ErrorResolver.resolve(result.code, {
        defaultMessage: ERRORS.API.DEFAULT,
      })
    );
    AppState.resetCompareSelection();
    updateCompareIndicator();

    currentSelection.forEach((id) => UIManager.setCompareHighlight(id, false));
    return;
  }

  AppState.setCompareModalOpen(true);
  UIManager.showCompareModal(result.coins, {
    missingSymbols: result.missing,
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
