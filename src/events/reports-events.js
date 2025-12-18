import { getAllCoins } from "../services/coins-service.js";
import {toggleCoinSelection,replaceReport,getCompareData,} from "../services/reports-service.js";
import {toggleCompareSelection,getCompareSelection,resetCompareSelection,updateToggleStates} from "../ui/pages/currenciesPage.js";
import { showReplaceModal, showCompareModal } from "../ui/modals.js";
import { REPORTS_COMPARE_MAX } from "../config/app-config.js";
import { ERRORS , showError,showInfo} from "../config/error.js";
import { ensureArray } from "../utils/general-utils.js";

const updateCompareIndicator = (selected = getCompareSelection()) => {
  const selectedCount = ensureArray(selected).length;
  const $status = $("#compareStatus");

  if (!selectedCount) {
    resetCompareSelection();
    $status.addClass("d-none");
    return;
  }
  showInfo(`${selectedCount} / ${REPORTS_COMPARE_MAX} coins selected`);
  $status.removeClass("d-none");
};

const openReplaceFlow = ({ newSymbol, existing, limit }) => {
  showReplaceModal(newSymbol, existing, {
    maxCoins: limit,
    onConfirm: ({ remove, add, modal }) => {
      const { ok, error, selected } = replaceReport(remove, add);
      updateToggleStates(selected);
      if (!ok) {
        showError(error);
        return;
      }
      showInfo(`Replaced ${remove} with ${add} in reports`);
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
      showInfo("Added to reports");
    } else {
      showInfo("Removed from reports");
    }
  } else if (limitExceeded) {
    openReplaceFlow({ selected, ...rest });
  } else if (error) {
    showError(error);
  }
};

const handleCompareClick = async function () {
  if ($("#compareModal").length) return;
  const coinId = String($(this).data("id"));
  const coinExists = getAllCoins().some((coin) => String(coin.id) === coinId);
  if (!coinExists) {
    showError(ERRORS.NOT_FOUND);
    return;
  }
  const {selected, limitExceeded } = toggleCompareSelection(coinId, REPORTS_COMPARE_MAX);

    if (limitExceeded) {showError(ERRORS.COMPARE_FULL(REPORTS_COMPARE_MAX))
    return;
  }

  const currentSelection = selected;
  updateCompareIndicator(currentSelection);

  if (currentSelection.length < REPORTS_COMPARE_MAX) return;

  const { ok: compareOk, coins, missing, error: compareError } = await getCompareData(currentSelection);
  if (!compareOk) {
    showError(compareError);
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

export const setupReportsEvents = () => {
  $(document)
    .on("change", ".coin-toggle", handleCoinToggle)
    .on("click", ".compare-btn", handleCompareClick);
};
