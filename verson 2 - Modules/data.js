import { UI } from "./ui.js";
import { CoinAPI } from "./api.js";

export const DataManager = (() => {
  let selectedReports = [];
  let cache = {};
  let allCoins = [];

  const getFromCache = (id) => {
    const cached = cache[id];
    const now = Date.now();
    if (cached && now - cached.timestamp < 120000) {
      return cached.data;
    }
    return null;
  };

  const saveToCache = (id, data) => {
    cache[id] = { data, timestamp: Date.now() };
  };

  const loadCurrencies = async () => {
    const container = $("#coinsContainer");

    if (!container.length) return;

    if (allCoins.length === 0) {
      container.html(`
        <div class="text-center mt-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Loading coins...</p>
        </div>
      `);
    }

    try {
      if (allCoins.length === 0) {
        allCoins = await CoinAPI.getMarkets();
      }
      UI.displayCoins(allCoins, selectedReports);
    } catch (err) {
      UI.showError(container, err);
    }
  };

  const getCoinDetails = async (coinId) => {
    const cachedData = getFromCache(coinId);
    if (cachedData) return cachedData;

    const data = await CoinAPI.getCoinDetails(coinId);
    saveToCache(coinId, data);
    return data;
  };

  const performSearch = (term) => {
    const searchInput = term.trim().toUpperCase();
    if (!searchInput) return;

    if (allCoins.length === 0) {
      UI.showError($("#coinsContainer"), "Please wait for coins to load...");
      return;
    }

    const filtered = allCoins.filter(
      (coin) => coin.symbol.toUpperCase() === searchInput
    );

    if (filtered.length === 0) {
      UI.showError(
        $("#coinsContainer"),
        `No coins found matching "${searchInput}".`
      );
      return;
    }

    UI.displayCoins(filtered, selectedReports);
  };

  const updateReportsUI = () => {
    $(".coin-toggle").each(function () {
      const symbol = $(this).data("symbol");
      $(this).prop("checked", selectedReports.includes(symbol));
    });
  };

  const openReplaceModal = (newSymbol) => {
    const listItems = UI.createReplaceList(selectedReports);
    const modalHTML = UI.createReplaceModalHTML(newSymbol, listItems);
    $("body").append(modalHTML);

    const modal = new bootstrap.Modal($("#replaceModal"));
    modal.show();

    $("#confirmReplace")
      .off()
      .click(() => {
        const selectedToRemove = $(".replace-toggle:checked").data("symbol");
        if (!selectedToRemove) return alert("Please select a coin");

        selectedReports = selectedReports.filter((s) => s !== selectedToRemove);
        selectedReports.push(newSymbol);

        modal.hide();

        $("#replaceModal").one("hidden.bs.modal", function () {
          $(this).remove();
        });

        updateReportsUI();
      });

    $("#replaceModal").one("hidden.bs.modal", function () {
      if (!selectedReports.includes(newSymbol)) {
        $(`.coin-toggle[data-symbol="${newSymbol}"]`).prop("checked", false);
      }
      $(this).remove();
    });
  };

  const toggleCoinSelection = (symbol) => {
    const symbolUpper = symbol.toUpperCase();

    if (selectedReports.includes(symbolUpper)) {
      selectedReports = selectedReports.filter((s) => s !== symbolUpper);
      updateReportsUI();
      return;
    }

    if (selectedReports.length < 5) {
      selectedReports.push(symbolUpper);
      updateReportsUI();
      return;
    }

    openReplaceModal(symbolUpper);
  };

  return {
    loadCurrencies,
    getCoinDetails,
    performSearch,
    toggleCoinSelection,
    getSelectedReports: () => selectedReports,
    getAllCoins: () => allCoins,
  };
})();
