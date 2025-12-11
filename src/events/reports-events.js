import { filterSelectedCoins, getAllCoins } from "../services/coins-service.js";
import {toggleCoinSelection,replaceReport,getCompareData,} from "../services/reports-service.js";
import { APP_CONFIG } from "../config/app-config.js";
import { ERRORS } from "../config/error.js";
import { ErrorUI } from "../ui/error-ui.js";
import { CoinUI } from "../ui/coin-ui.js";
import { renderCoins } from "../controllers/pages-controller.js";
import { BaseUI } from "../ui/base-ui.js";
const { REPORTS_COMPARE_MAX } = APP_CONFIG;

const {
  setCompareHighlight,
  clearCompareHighlights,
  getCompareSelection,
  showReplaceModal,
  updateToggleStates,
  showCompareModal,
} = CoinUI;

let eventsRegistered = false;

const setCompareSelection = (ids) => {
  clearCompareHighlights();
  ids.forEach((id) => setCompareHighlight(id, true));
};

const resetCompareSelection = () => {
  clearCompareHighlights();
};

export const updateCompareIndicator = (selected = getCompareSelection()) => {
  const selectionArray = Array.isArray(selected) ? selected : [];
  const selectedCount = selectionArray.length;
  const $status = $("#compareStatus");

  if (!selectedCount) {
    $status.addClass("d-none").empty();
    clearCompareHighlights();
    return;
  }
  ErrorUI.showInfo(
    "#compareStatus",
    `${selectedCount} / ${REPORTS_COMPARE_MAX} coins selected`
  );
  $status.removeClass("d-none");
};

const handleFilterReports = () => {
  const { ok, code, data } = filterSelectedCoins();
  BaseUI.toggleClearButton(true);

  if (!ok) {
    ErrorUI.showError("#coinsContainer", code, {
      defaultMessage: ERRORS.NONE_SELECTED,
    });
    return;
  }
  renderCoins(data);
};

const openReplaceFlow = ({ newSymbol, existing, limit }) => {
  showReplaceModal(newSymbol, existing, {
    maxCoins: limit,
    onConfirm: ({ remove, add, modal }) => {
      const { ok, code, selected } = replaceReport(remove, add);
      updateToggleStates(selected);
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
  const alreadySelected = currentSelection.includes(coinId);

  if (alreadySelected) {
    currentSelection = currentSelection.filter((id) => id !== coinId);
    setCompareHighlight(coinId, false);
  } else {
    if (currentSelection.length >= REPORTS_COMPARE_MAX) {
      updateCompareIndicator(currentSelection);
      ErrorUI.showError("#content", "COMPARE_FULL", {
        limit: REPORTS_COMPARE_MAX,
      });
      return;
    }
    currentSelection = [...currentSelection, coinId];
  }

  setCompareSelection(currentSelection);
  updateCompareIndicator(currentSelection);

  if (currentSelection.length < REPORTS_COMPARE_MAX) return;

  const { ok, code, coins, missing } = await getCompareData(currentSelection);
  if (!ok) {
    ErrorUI.showError("#content", code, { defaultMessage: ERRORS.DEFAULT });
    resetCompareSelection();
    updateCompareIndicator();
    return;
  }

  showCompareModal(coins, {
    missingSymbols: missing,
    onClose: () => {
      const previousSelection = getCompareSelection();
      resetCompareSelection();
      updateCompareIndicator();
    },
  });
};

export const setupEventListeners = () => {
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
