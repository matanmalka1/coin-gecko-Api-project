import {getAllCoins } from "../services/coins-service.js";
import {toggleCoinSelection,replaceReport,getCompareData,} from "../services/reports-service.js";
import {setCompareHighlight,clearCompareHighlights,getCompareSelection,updateToggleStates,} from "../ui/Components/coin-components.js";
import { showReplaceModal, showCompareModal } from "../ui/Components/modals.js";
import {APP_CONFIG } from "../config/app-config.js";
import {ERRORS } from "../config/error.js";
import {ErrorUI } from "../ui/error-ui.js";
const { REPORTS_COMPARE_MAX } = APP_CONFIG;

export const updateCompareIndicator = (selected = getCompareSelection()) => {
  const selectedCount = Array.isArray(selected) ? selected.length : 0;
  const $status = $("#compareStatus"); 

  if (!selectedCount) {
    $status.addClass("d-none").empty();
    clearCompareHighlights();
    return;
  }
  
  ErrorUI.showInfo("#compareStatus", `${selectedCount} / ${REPORTS_COMPARE_MAX} coins selected`);
  $status.removeClass("d-none");
}

const openReplaceFlow = ({ newSymbol, existing, limit }) => {
  showReplaceModal(newSymbol, existing, {
    maxCoins: limit,
    onConfirm: ({ remove, add, modal }) => {
      const { ok, code, selected } = replaceReport(remove, add);
      updateToggleStates(selected);
      if (!ok) {
        ErrorUI.showError("#content", code);
        return;
      }
      modal.hide();
    },
  });
};

const handleCoinToggle = function () {
  const coinSymbol = $(this).data("symbol");
  const { ok, code, selected, ...rest } = toggleCoinSelection(coinSymbol);
  if (ok) {
    updateToggleStates(selected);
  } else if (code === "LIMIT") {
    openReplaceFlow({ code, selected, ...rest });
  }
};

const handleCompareClick = async function () {
  if ($("#compareModal").length) return;
  const coinId = String($(this).data("id"));
  const coinExists = getAllCoins().some((coin) => String(coin.id) === coinId);
  if (!coinExists) {
    ErrorUI.showError("#content", "NO_MATCH", {
      defaultMessage: ERRORS.NOT_FOUND,
    });
    return;
  }

  let currentSelection = getCompareSelection();

  if (currentSelection.includes(coinId)) {
    currentSelection = currentSelection.filter((id) => id !== coinId);
    setCompareHighlight(coinId, false);
  } else {
    if (currentSelection.length >= REPORTS_COMPARE_MAX) {
      ErrorUI.showError("#content", "COMPARE_FULL", {
        limit: REPORTS_COMPARE_MAX,
      });
      return;
    }
    currentSelection = [...currentSelection, coinId];
  }

  currentSelection.forEach((id) => setCompareHighlight(id, true));
  updateCompareIndicator(currentSelection);

  if (currentSelection.length < REPORTS_COMPARE_MAX) return;

  const { ok, code, coins, missing } = await getCompareData(currentSelection);
  if (!ok) {
    ErrorUI.showError("#content", code, { defaultMessage: ERRORS.DEFAULT });
    return;
  }

  showCompareModal(coins, {
    missingSymbols: missing,
    onClose: () => {
      clearCompareHighlights();
      updateCompareIndicator();
    },
  });
};

export const setupEventListeners = () => {
  $(document)
    .on("change", ".coin-toggle", handleCoinToggle)
    .on("click", ".compare-btn", handleCompareClick);
};

export const ReportsEvents = {
  register: setupEventListeners,
  updateCompareIndicator,
};
