import { CoinsService } from "../services/coins-service.js";
import { ReportsService } from "../services/reports-service.js";
import { UIManager } from "../ui/ui-manager.js";
import { AppState } from "../state/state.js";
import { ERRORS } from "../config/error.js";
import { CONFIG } from "../config/config.js";
import { ErrorResolver } from "../utils/error-resolver.js";

const ReportsEvents = (() => {
  let isRegistered = false;
  // Syncs compare status indicator with AppState.
  const updateCompareIndicator = (
    selected = AppState.getCompareSelection()
  ) => {
    const selectionArray = Array.isArray(selected) ? selected : [];
    const selectedCount = selectionArray.length;

    UIManager.updateCompareStatus(
      selectedCount,
      CONFIG.REPORTS.MAX_COMPARE
    );

    if (selectedCount === 0) {
      UIManager.setCompareStatusVisibility(false);
      UIManager.clearCompareHighlights();
    } else {
      UIManager.setCompareStatusVisibility(true);
    }
  };

  // Filters coins list to currently selected reports.
  const handleFilterReports = () => {
    const serviceResult = CoinsService.filterSelectedCoins();
    UIManager.showElement("#clearSearchBtn");

    if (!serviceResult?.ok) {
      UIManager.showError(
        "#coinsContainer",
        ErrorResolver.resolve(serviceResult.code)
      );
      return;
    }

    UIManager.displayCoins(serviceResult.data, serviceResult.selected, {
      favorites: serviceResult.favorites,
      compareSelection: AppState.getCompareSelection(),
    });
  };

  // Opens the replace flow modal when reaching MAX reports.
  const openReplaceFlow = (serviceResult) => {
    UIManager.showReplaceModal(
      serviceResult.newSymbol,
      serviceResult.existing,
      {
        maxCoins: serviceResult.limit,
        onConfirm: ({ remove, add, modal }) => {
          const replaceSelectionResult = ReportsService.replaceReport(
            remove,
            add
          );
          UIManager.updateToggleStates(replaceSelectionResult.selected);
          modal.hide();
        },
        onClose: () => {
          UIManager.updateToggleStates(ReportsService.getSelectedReports());
        },
      }
    );
  };

  // Adds/removes a coin from the reports selection via toggle switch.
  const handleCoinToggle = function () {
    const coinSymbol = UIManager.getDataAttr(this, "symbol");
    const serviceResult = ReportsService.toggleCoinSelection(coinSymbol);

    if (serviceResult.ok) {
      UIManager.updateToggleStates(serviceResult.selected);
      return;
    }

    if (serviceResult.code === "FULL") {
      openReplaceFlow(serviceResult);
    }
  };

  // Handles clicks on compare buttons and opens the compare modal.
  const handleCompareClick = async function () {
    if (AppState.isCompareModalOpen()) return;
    const coinIdRaw = UIManager.getDataAttr(this, "id");
    const coinIdForAction = String(coinIdRaw);
    const coinExists = AppState.getAllCoins().some(
      (coin) => String(coin.id) === coinIdForAction
    );
    if (!coinExists) {
      UIManager.showError("#coinsContainer", ERRORS.REPORTS.NOT_FOUND);
      return;
    }

    const currentSelection = AppState.getCompareSelection();
    const alreadySelected = currentSelection.includes(coinIdForAction);

    if (alreadySelected) {
      const filteredSelection = currentSelection.filter(
        (id) => id !== coinIdForAction
      );
      AppState.setCompareSelection(filteredSelection);
      updateCompareIndicator(filteredSelection);
      UIManager.setCompareHighlight(coinIdForAction, false);
      return;
    }

    if (
      currentSelection.length >= CONFIG.REPORTS.MAX_COMPARE
    ) {
      updateCompareIndicator(currentSelection);
      return;
    }

    let nextSelection = [...currentSelection, coinIdForAction];
    AppState.setCompareSelection(nextSelection);
    updateCompareIndicator(nextSelection);
    UIManager.setCompareHighlight(coinIdForAction, true);

    if (nextSelection.length >= CONFIG.REPORTS.MAX_COMPARE) {
      const serviceResult = await ReportsService.getCompareData(nextSelection);

      if (!serviceResult?.ok) {
        UIManager.showError(
          "#content",
          ErrorResolver.resolve(serviceResult.code, {
            defaultMessage: ERRORS.API.DEFAULT,
          })
        );
        AppState.resetCompareSelection();
        AppState.setCompareModalOpen(false);
        updateCompareIndicator();
        return;
      }

      AppState.setCompareModalOpen(true);
      UIManager.showCompareModal(serviceResult.coins, {
        missingSymbols: serviceResult.missing,
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
    }
  };

  // Registers report-related DOM events once.
  const setupEventListeners = () => {
    if (isRegistered) return;
    $(document)
      .on("click", "#filterReportsBtn", handleFilterReports)
      .on("change", ".coin-toggle", handleCoinToggle)
      .on("click", ".compare-btn", handleCompareClick);
    isRegistered = true;
  };

  return {
    register: setupEventListeners,
  };
})();

export { ReportsEvents };
