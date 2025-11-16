import { AppState } from "../state/state.js";
import { UIManager } from "../ui/ui-manager.js";

export const ReportsService = (() => {
  const toggleCoinSelection = (symbol) => {
    const symbolUpper = symbol.toUpperCase();

    if (AppState.hasReport(symbolUpper)) {
      AppState.removeReport(symbolUpper);
      UIManager.updateToggleStates(AppState.getSelectedReports());
      return;
    }

    if (!AppState.isReportsFull()) {
      AppState.addReport(symbolUpper);
      UIManager.updateToggleStates(AppState.getSelectedReports());
      return;
    }

    openReplaceModal(symbolUpper);
  };

  const openReplaceModal = (newSymbol) => {
    const existingCoins = AppState.getSelectedReports();

    const modal = UIManager.showReplaceModal(newSymbol, existingCoins);

    $("#confirmReplace")
      .off()
      .on("click", () => {
        const selectedToRemove = $(".replace-toggle:checked").data("symbol");

        if (!selectedToRemove) {
          alert("Please select a coin to replace");
          return;
        }

        AppState.removeReport(selectedToRemove);
        AppState.addReport(newSymbol);

        modal.hide();
      });

    $("#replaceModal").one("hidden.bs.modal", function () {
      if (!AppState.hasReport(newSymbol)) {
        $(`.coin-toggle[data-symbol="${newSymbol}"]`).prop("checked", false);
      }

      UIManager.removeModal("replaceModal");
      UIManager.updateToggleStates(AppState.getSelectedReports());
    });
  };

  return {
    toggleCoinSelection,
  };
})();
