import {getAllCoins } from "../services/coins-service.js";
import {toggleCoinSelection,replaceReport,getCompareData,} from "../services/reports-service.js";
import {toggleCompareSelection,getCompareSelection,resetCompareSelection,updateToggleStates,} from "../ui/Components/coin-components.js";
import { showReplaceModal, showCompareModal } from "../ui/Components/modals.js";
import { REPORTS_COMPARE_MAX } from "../config/app-config.js";
import {ERRORS } from "../config/error.js";
import {ErrorUI } from "../ui/error-ui.js";

export const updateCompareIndicator = (selected = getCompareSelection()) => {
  const selectedCount = Array.isArray(selected) ? selected.length : 0;
  const $status = $("#compareStatus"); 

  if (!selectedCount) {
    resetCompareSelection();
    $status.addClass("d-none").empty();
    return;
  }
  
  ErrorUI.showInfo($status, `${selectedCount} / ${REPORTS_COMPARE_MAX} coins selected`);
  $status.removeClass("d-none");
}

const openReplaceFlow = ({ newSymbol, existing, limit }) => {
  showReplaceModal(newSymbol, existing, {
    maxCoins: limit,
    onConfirm: ({ remove, add, modal }) => {
      const { ok, error, selected } = replaceReport(remove, add);
      updateToggleStates(selected);
      if (!ok) {
        ErrorUI.showError("#content", error || ERRORS.DEFAULT);
        return;
      }
      modal.hide();
    },
  });
};

const handleCoinToggle = function () {
  const coinSymbol = $(this).data("symbol");
  const { ok, error, selected, limitExceeded, ...rest } = toggleCoinSelection(coinSymbol);
  if (ok) {
    updateToggleStates(selected);
  } else if (limitExceeded) {
    openReplaceFlow({ selected, ...rest });
  } else if (error) {
    ErrorUI.showError("#content", error);
  }
};

const handleCompareClick = async function () {
  if ($("#compareModal").length) return;
  const coinId = String($(this).data("id"));
  const coinExists = getAllCoins().some((coin) => String(coin.id) === coinId);
  if (!coinExists) {
    ErrorUI.showError("#content", ERRORS.NOT_FOUND);
    return;
  }

  const { ok, selected, limitExceeded, error } = toggleCompareSelection(coinId, REPORTS_COMPARE_MAX);
  if (!ok) {
    if (limitExceeded) {
      ErrorUI.showError("#content", ERRORS.COMPARE_FULL(REPORTS_COMPARE_MAX));
    } else if (error) {
      ErrorUI.showError("#content", error);
    }
    return;
  }

  const currentSelection = selected;
  updateCompareIndicator(currentSelection);

  if (currentSelection.length < REPORTS_COMPARE_MAX) return;

  const { ok: compareOk, coins, missing, error: compareError } = await getCompareData(currentSelection);
  if (!compareOk) {
    ErrorUI.showError("#content", compareError || ERRORS.DEFAULT);
    return;
  }

  showCompareModal(coins, {
    missingSymbols: missing,
    onClose: () => {
      resetCompareSelection();
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
