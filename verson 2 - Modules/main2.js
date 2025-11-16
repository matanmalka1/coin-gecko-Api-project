import { UI } from "./ui.js";
import { DataManager } from "./data.js";
import { ChartManager } from "./chart.js";

$(() => {
  const currenciesBtn = $("#currenciesBtn");
  const reportsBtn = $("#reportsBtn");
  const aboutBtn = $("#aboutBtn");
  const content = $("#content");

  const clearContent = () => {
    ChartManager.cleanupUI();
    UI.clearContent();
  };

  currenciesBtn.on("click", () => {
    clearContent();
    content.html(`
      <div id="searchArea" class="my-4 text-center">
        <input type="text" id="searchInput"
          placeholder="Search coin by symbol (e.g. BTC, ETH, SOL)"
          class="form-control w-50 d-inline-block">
        <button id="searchBtn" class="btn btn-primary mx-2">Search</button>
        <button id="filterReportsBtn" class="btn btn-info mx-2">Show selected coins</button>
        <button id="clearSearchBtn" class="btn btn-outline-secondary mx-2 d-none">Clear Search</button>
      </div>
      <div id="coinsContainer" class="row g-3"></div>
    `);

    DataManager.loadCurrencies();
  });

  reportsBtn.on("click", () => {
    clearContent();
    content.html(`
      <h3 class="mb-4">Live Reports</h3>
      <div id="chartContainer"></div>
    `);
    ChartManager.startLiveReports();
  });

  aboutBtn.on("click", () => {
    clearContent();
    content.html(`
      <div id="aboutSection" class="container my-5">
        <div class="row align-items-center">
          <div class="col-md-6 text-center mb-4 mb-md-0">
            <img src="images/2.jpeg" alt="Matan Yehuda Malka"
              class="img-fluid rounded shadow-lg mb-3" />
          </div>
          <div class="col-md-6">
            <h2 class="fw-bold mb-3 text-primary">About This Project</h2>
            <p class="lead">
              This project was built as part of the 
              <strong>John Bryce Full Stack Development Course</strong>.<br><br>
              It showcases how to work with <strong>APIs</strong>, 
              <strong>jQuery</strong>, and modern web technologies 
              to display live cryptocurrency market data from 
              <em>CoinGecko API</em>.
            </p>
            <p class="text-muted">
              Designed and developed by <strong>Matan Yehuda Malka</strong>.<br>
              Built with ❤️, JavaScript, and Bootstrap 5.
            </p>
            <div class="mt-4">
              <a href="https://www.linkedin.com/in/matanyehudamalka"
                 target="_blank" rel="noopener noreferrer"
                 class="btn btn-outline-primary">
                <i class="fab fa-linkedin"></i> View My LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    `);
  });

  $(document).on("click", "#searchBtn", () => {
    const term = $("#searchInput").val();
    DataManager.performSearch(term);
    $("#clearSearchBtn").removeClass("d-none");
  });

  $(document).on("keypress", "#searchInput", (e) => {
    if (e.which === 13) {
      const term = $("#searchInput").val();
      DataManager.performSearch(term);
      $("#clearSearchBtn").removeClass("d-none");
    }
  });

  $(document).on("click", "#clearSearchBtn", () => {
    $("#searchInput").val("");
    $("#clearSearchBtn").addClass("d-none");
    DataManager.loadCurrencies();
  });

  $(document).on("click", "#filterReportsBtn", () => {
    const selectedReports = DataManager.getSelectedReports();
    if (!selectedReports.length) {
      UI.showError(
        $("#coinsContainer"),
        "No coins in report. Please choose coins first."
      );
      return;
    }

    const allCoins = DataManager.getAllCoins();
    const filtered = allCoins.filter((coin) =>
      selectedReports.includes(coin.symbol.toUpperCase())
    );

    UI.displayCoins(filtered, selectedReports);
    $("#clearSearchBtn").removeClass("d-none");
  });

  $(document).on("click", ".more-info", async function () {
    const coinId = $(this).data("id");
    const collapseDiv = $(`#collapse-${coinId}`);

    if (collapseDiv.hasClass("show")) {
      collapseDiv.removeClass("show").slideUp();
      return;
    }

    collapseDiv.html(UI.renderSpinner()).slideDown();

    try {
      const data = await DataManager.getCoinDetails(coinId);
      UI.showCoinInfo(collapseDiv, data);
      collapseDiv.addClass("show").slideDown();
    } catch (error) {
      UI.showError(collapseDiv, error);
    }
  });

  $(document).on("change", ".coin-toggle", function () {
    const symbol = $(this).data("symbol");
    DataManager.toggleCoinSelection(symbol);
  });

  currenciesBtn.trigger("click");
});
