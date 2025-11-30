import { CoinsService } from "../services/coins-service.js";
import { ReportsService } from "../services/reports-service.js";
import { UIManager } from "../ui/ui-manager.js";
import { AppState } from "../state/state.js";
import { ERRORS } from "../config/error.js";
import { CONFIG } from "../config/config.js";
import { ErrorResolver } from "../utils/error-resolver.js";

const ReportsEvents = (() => {
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
    });
  };

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

  const handleCompareClick = async function () {
    if (AppState.isCompareModalOpen()) return;
    const coinIdForAction = UIManager.getDataAttr(this, "id");

    const currentSelection = AppState.getCompareSelection();
    const alreadySelected = currentSelection.includes(coinIdForAction);

    if (
      !alreadySelected &&
      currentSelection.length >= CONFIG.REPORTS.MAX_COMPARE
    )
      return;

    let nextSelection = currentSelection;
    if (!alreadySelected) {
      nextSelection = [...currentSelection, coinIdForAction];
      AppState.setCompareSelection(nextSelection);
    }

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
        return;
      }

      AppState.setCompareModalOpen(true);
      UIManager.showCompareModal(serviceResult.coins, {
        missingSymbols: serviceResult.missing,
        onClose: () => {
          AppState.resetCompareSelection();
          AppState.setCompareModalOpen(false);
        },
      });
    }
  };

  const setupEventListeners = () => {
    $(document)
      .on("click", "#filterReportsBtn", handleFilterReports)
      .on("change", ".coin-toggle", handleCoinToggle)
      .on("click", ".compare-btn", handleCompareClick);
  };

  return {
    register: setupEventListeners,
  };
})();

export { ReportsEvents };
