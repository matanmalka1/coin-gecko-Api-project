import { AppState } from "../state/state.js";
import { coinAPI } from "../services/api.js";
import { UIManager } from "../ui/ui-manager.js";
import { UIComponents } from "../ui/ui-components.js";

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
  const openCompareModal = async (ids) => {
    const dataPromises = ids.map((id) => coinAPI.getCoinDetails(id));
    const results = await Promise.all(dataPromises);

    const coins = results.filter((r) => r.success).map((r) => r.data);

    const rows = coins
      .map(
        (c) => `
  <tr>
    <td>$${c.market_data.current_price.usd.toLocaleString()}</td>
    <td>$${c.market_data.market_cap.usd.toLocaleString()}</td>
    <td>${c.market_data.price_change_percentage_24h.toFixed(2)}%</td>
    <td>$${c.market_data.total_volume.usd.toLocaleString()}</td>  
  </tr>
  `
      )
      .join("");

    const table = `
    <table class="table table-striped text-center align-middle">
      <thead>
        <tr>
          <th>Coin</th>
          <th>Price</th>
          <th>Market Cap</th>
          <th>24h %</th>
          <th>Volume</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

    const modalHTML = UIComponents.compareModal(table);
    $("body").append(modalHTML);

    const modal = new bootstrap.Modal($("#compareModal"));
    modal.show();

    $("#compareModal").on("hidden.bs.modal", () => {
      $("#compareModal").remove();
      ids.length = 0;
    });
  };

  return {
    toggleCoinSelection,
    openCompareModal,
  };
})();
