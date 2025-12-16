import { ERRORS } from "../../config/error.js";
import { ErrorUI } from "../error-ui.js";
import { formatPrice, formatLargeNumber, formatPercent } from "../../utils/general-utils.js";


const replaceModal = (newSymbol, existingCoins, options = {}) => {
  const limit =
    typeof options.maxCoins === "number"
      ? options.maxCoins
      : existingCoins.length || 0;

  const listItems = existingCoins
    .map(
      (coin) =>
        `<li class="list-group-item d-flex justify-content-between align-items-center">${coin}
          <div class="form-check">
            <input class="form-check-input replace-toggle" type="radio" name="coinToReplace" data-symbol="${coin}">
          </div>
        </li>`
    )
    .join("");

  return `
  <div class="modal fade" id="replaceModal" tabindex="-1" aria-labelledby="replaceModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">

        <div class="modal-header border-bottom">
          <h5 class="modal-title fw-semibold" id="replaceModalLabel">Replace Coin</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <div class="modal-body">
          <p>You've reached the limit of ${limit} coins.</p>
          <p>Choose a coin to replace with <strong>${newSymbol}</strong>:</p>
          <ul class="list-group">${listItems}</ul>
        </div>

        <div class="modal-footer border-top">
          <button type="button" id="confirmReplace" class="btn btn-primary">Replace</button>
        </div>
      </div>
    </div>
  </div>
`;
};

const compareModal = (coinsHTML, options = {}) => `
  <div class="modal fade" id="compareModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header border-bottom">
          <h5 class="modal-title fw-semibold">${
            options.title || "Compare Coins"
          }</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          ${coinsHTML}
        </div>
      </div>
    </div>
  </div>`;

const buildCompareRow = (coin) => {
  const md = coin.market_data || {};
  return `<tr>
  <td>${coin?.symbol?.toUpperCase() || "N/A"}</td>
  <td>${formatPrice(md.current_price?.usd)}</td>
  <td>${formatLargeNumber(md.market_cap?.usd)}</td>
  <td>${formatPercent(md.price_change_percentage_24h)}</td>
  <td>${formatLargeNumber(md.total_volume?.usd)}</td></tr>`;
};

const buildCompareTable = (coins) =>
  `<table class="table table-striped text-center align-middle">
    <thead>
      <tr>
        <th>Coin</th>
        <th>Price</th>
        <th>Market Cap</th>
        <th>24h %</th>
        <th>Volume</th>
      </tr>
    </thead>
    <tbody>${coins.map(buildCompareRow).join("")}</tbody>
  </table>`;

export const showReplaceModal = (newSymbol,existingCoins,{ maxCoins, onConfirm, onClose } = {}) => {
  const modalHTML = replaceModal(newSymbol, existingCoins, { maxCoins });

  $("body").append(modalHTML);
  const $replaceModal = $("#replaceModal");
  const modal = new bootstrap.Modal($replaceModal[0]);
  modal.show();
  $("#confirmReplace")
    .off()
    .on("click", () => {
      const selectedToRemove = $(".replace-toggle:checked").data("symbol");
      if (!selectedToRemove)
        return ErrorUI.showInfo(ERRORS.REPLACE_SELECTION_REQUIRED);
      typeof onConfirm === "function"
        ? onConfirm({ remove: selectedToRemove, add: newSymbol, modal })
        : modal.hide();
    });
  $replaceModal.one("hidden.bs.modal", () => {
    $replaceModal.remove();
    onClose?.();
  });
  return modal;
};

export const showCompareModal = (coins, { missingSymbols = [], title, onClose } = {}) => {
  const content = buildCompareTable(coins);
  const modalHTML = compareModal(content, { title: title || "Compare Coins" });

  $("body").append(modalHTML);
  const $compareModal = $("#compareModal");
  const modal = new bootstrap.Modal($compareModal[0]);

  if (missingSymbols.length) {
    ErrorUI.showInfo(ERRORS.MISSING_DATA(missingSymbols.join(", ")), "warning");
  }

  $compareModal.on("hidden.bs.modal", () => {
    $compareModal.remove();
    onClose?.();
  });

  modal.show();
  return modal;
};
