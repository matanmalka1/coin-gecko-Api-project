import { CoinsService } from "../services/coins-service.js";
import { ReportsService } from "../services/reports-service.js";
import { ERRORS } from "../config/error.js";
import { APP_CONFIG } from "../config/app-config.js";
import { ErrorUI } from "../ui/error-ui.js";
import { CoinUI } from "../ui/coin-ui.js";

const MAX_COMPARE = APP_CONFIG.REPORTS_COMPARE_MAX;

let eventsRegistered = false;
let compareModalOpen = false;

const setCompareSelection = (ids) => {
  CoinUI.clearCompareHighlights();
  ids.forEach((id) => CoinUI.setCompareHighlight(id, true));
};

const resetCompareSelection = () => {
  CoinUI.clearCompareHighlights();
};

const updateCompareIndicator = (selected = CoinUI.getCompareSelection()) => {
  const selectionArray = Array.isArray(selected) ? selected : [];
  const selectedCount = selectionArray.length;
  const $status = $("#compareStatus");
  if (!selectedCount) {
    $status.addClass("d-none").empty();
    CoinUI.clearCompareHighlights();
    return;
  }
  ErrorUI.showInfo(
    "#compareStatus",
    `${selectedCount} / ${MAX_COMPARE} coins selected`
  );
  $status.removeClass("d-none");
};

const handleFilterReports = () => {
  const { ok, code, data, selected, favorites } =
    CoinsService.filterSelectedCoins();
  $("#clearSearchBtn").removeClass("d-none");
  if (!ok) {
    ErrorUI.showError("#coinsContainer", code, {
      defaultMessage: ERRORS.NONE_SELECTED,
    });
    return;
  }
  CoinUI.displayCoins(data, selected, { favorites });
};

const openReplaceFlow = ({ newSymbol, existing, limit }) => {
  CoinUI.showReplaceModal(newSymbol, existing, {
    maxCoins: limit,
    onConfirm: ({ remove, add, modal }) => {
      const { ok, code, selected } = ReportsService.replaceReport(remove, add);
      CoinUI.updateToggleStates(selected);
      if (!ok) {
        ErrorUI.showError("#content", code);
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
    ErrorUI.showError("#content", "NO_MATCH", {
      defaultMessage: ERRORS.NOT_FOUND,
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
      ErrorUI.showError("#content", "COMPARE_FULL", { limit: MAX_COMPARE });
      return;
    }
    currentSelection = [...currentSelection, coinId];
  }

  setCompareSelection(currentSelection);
  updateCompareIndicator(currentSelection);

  if (currentSelection.length < MAX_COMPARE) return;

  const { ok, code, coins, missing } = await ReportsService.getCompareData(
    currentSelection
  );
  if (!ok) {
    ErrorUI.showError("#content", code, { defaultMessage: ERRORS.DEFAULT });
    resetCompareSelection();
    updateCompareIndicator();
    return;
  }

  compareModalOpen = true;
  CoinUI.showCompareModal(coins, {
    missingSymbols: missing,
    onClose: () => {
      const previousSelection = CoinUI.getCompareSelection();
      resetCompareSelection();
      compareModalOpen = false;
      updateCompareIndicator();
    },
  });
};

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
