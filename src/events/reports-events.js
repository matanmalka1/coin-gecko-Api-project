import { getAllCoins } from "../services/coins-service.js";
import { toggleCoinSelection, replaceReport, getCompareData } from "../services/reports-service.js";
import { toggleCompareSelection, getCompareSelection, resetCompareSelection, updateToggleStates } from "../ui/Components/coin-components.js";
import { showReplaceModal, showCompareModal } from "../ui/Components/modals.js";
import { REPORTS_COMPARE_MAX } from "../config/app-config.js";
import { ERRORS } from "../config/error.js";
import { ErrorUI } from "../ui/error-ui.js";
import { ensureArray } from "../utils/general-utils.js";

export const updateCompareIndicator = (selected = getCompareSelection()) => {
  const selectedCount = ensureArray(selected).length;
  const $status = $("#compareStatus"); 

  if (!selectedCount) {
    resetCompareSelection();
    $status.addClass("d-none");
    return;
  }
  
  ErrorUI.showInfo(`${selectedCount} / ${REPORTS_COMPARE_MAX} coins selected`);
  $status.removeClass("d-none");
}

const openReplaceFlow = ({ newSymbol, existing, limit }) => {
  showReplaceModal(newSymbol, existing, {
    maxCoins: limit,
    onConfirm: ({ remove, add, modal }) => {
      const { ok, error, selected } = replaceReport(remove, add);
      updateToggleStates(selected);
      if (!ok) {
        ErrorUI.showError(error);
        return;
      }
      ErrorUI.showInfo(`Replaced ${remove} with ${add} in reports`);
      modal.hide();
    },
  });
};

const handleCoinToggle = function () {
  const coinSymbol = $(this).data("symbol");
  const { ok, error, selected, limitExceeded, ...rest } = toggleCoinSelection(coinSymbol);
  if (ok) {
    updateToggleStates(selected);
    const wasAdded = rest.wasAdded;
    if (wasAdded) {
      ErrorUI.showInfo("Added to reports");
    } else {
      ErrorUI.showInfo("Removed from reports");
    }
  } else if (limitExceeded) {
    openReplaceFlow({ selected, ...rest });
  } else if (error) {
    ErrorUI.showError(error);
  }
};

const handleCompareClick = async function () {
  if ($("#compareModal").length) return;
  const coinId = String($(this).data("id"));
  const coinExists = getAllCoins().some((coin) => String(coin.id) === coinId);
  if (!coinExists) {
    ErrorUI.showError(ERRORS.NOT_FOUND);
    return;
  }

  const { ok, selected, limitExceeded, error } = toggleCompareSelection(coinId, REPORTS_COMPARE_MAX);
  if (!ok) {
    if (limitExceeded) {
      ErrorUI.showError(ERRORS.COMPARE_FULL(REPORTS_COMPARE_MAX));
    } else if (error) {
      ErrorUI.showError(error);
    }
    return;
  }

  const currentSelection = selected;
  updateCompareIndicator(currentSelection);

  if (currentSelection.length < REPORTS_COMPARE_MAX) return;

  const { ok: compareOk, coins, missing, error: compareError } = await getCompareData(currentSelection);
  if (!compareOk) {
    ErrorUI.showError(compareError);
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
