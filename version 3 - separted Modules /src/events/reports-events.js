import { CoinsService } from "../services/coins-service.js";
import { ReportsService } from "../services/reports-service.js";
import { CoinUI } from "../ui/coin-ui.js";
import { AppState } from "../state/state.js";
import { ERRORS } from "../config/error.js";
import { BaseUI } from "../ui/base-ui.js";
import { UI_CONFIG } from "../config/ui-config.js";

const { REPORTS } = UI_CONFIG;

// ===== HELPERS =====

const updateCompareIndicator = (selected = AppState.getCompareSelection()) => {
  const selectionArray = Array.isArray(selected) ? selected : [];
  const selectedCount = selectionArray.length;

  const $status = $("#compareStatus");
  $status.text(`${selectedCount} / ${REPORTS.MAX_COMPARE} coins selected`);

  if (!selectedCount) {
    $status.addClass("d-none");
    CoinUI.clearCompareHighlights();
  } else {
    $status.removeClass("d-none");
  }
};

// ===== EVENT HANDLERS =====

const handleFilterReports = () => {
  const serviceResult = CoinsService.filterSelectedCoins();
  $("#clearSearchBtn").removeClass("d-none");

  if (!serviceResult?.ok) {
    BaseUI.showError("#coinsContainer", serviceResult.code, {
      defaultMessage: ERRORS.REPORTS.NONE_SELECTED,
    });
    return;
  }

  CoinUI.displayCoins(serviceResult.data, serviceResult.selected, {
    favorites: serviceResult.favorites,
  });
};

const openReplaceFlow = (serviceResult) => {
  CoinUI.showReplaceModal(serviceResult.newSymbol, serviceResult.existing, {
    maxCoins: serviceResult.limit,
    onConfirm: ({ remove, add, modal }) => {
      const replaceSelectionResult = ReportsService.replaceReport(remove, add);
      CoinUI.updateToggleStates(replaceSelectionResult.selected);

      if (!replaceSelectionResult?.ok) {
        BaseUI.showError("#content", replaceSelectionResult.code);
        modal.hide();
        return;
      }

      modal.hide();
      updateCompareIndicator(replaceSelectionResult.selected);
    },
  });
};

const handleCoinToggle = function () {
  const coinSymbol = $(this).data("symbol");
  const { ok, code, selected, ...result } =
    ReportsService.toggleCoinSelection(coinSymbol);

  if (ok) {
    CoinUI.updateToggleStates(selected);
  } else if (code === "FULL") {
    openReplaceFlow({ code, selected, ...result });
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
      defaultMessage: ERRORS.REPORTS.NOT_FOUND,
    });
    return;
  }

  let currentSelection = AppState.getCompareSelection();
  const alreadySelected = currentSelection.includes(coinId);

  if (alreadySelected) {
    currentSelection = currentSelection.filter((id) => id !== coinId);
    CoinUI.setCompareHighlight(coinId, false);
  } else {
    if (currentSelection.length >= REPORTS.MAX_COMPARE) {
      updateCompareIndicator(currentSelection);
      return;
    }

    currentSelection = [...currentSelection, coinId];
    CoinUI.setCompareHighlight(coinId, true);
  }

  AppState.setCompareSelection(currentSelection);
  updateCompareIndicator(currentSelection);

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
