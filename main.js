$(document).ready(function () {
  const currenciesBtn = $("#currenciesBtn");
  const reportsBtn = $("#reportsBtn");
  const aboutBtn = $("#aboutBtn");
  const content = $("#content");

  const coinsApi = "https://api.coingecko.com/api/v3/coins/list";

  let selectedReports = [];
  let cache = {};
  let allCoins = [];

  const clearContent = () => content.empty();

  const showError = (
    container,
    message = "Failed to load data. Please try again later."
  ) => {
    container.html(`
    <div class="alert alert-danger text-center mt-4" role="alert">
      <i class="bi bi-exclamation-triangle-fill"></i> ${message}
    </div>
  `);
  };

  const loadCurrencies = async () => {
    clearContent();
    content.html(`
    <div id="searchArea" class="my-4 text-center">
      <input type="text" id="searchInput" placeholder="Search coin by name or symbol (e.g. BTC, ETH ,Sol)" 
             class="form-control w-50 d-inline-block">
      <button id="searchBtn" class="btn btn-primary mx-2">Search</button>
    </div>

      <div id="coinsContainer" class="row g-3">
      <div class="text-center mt-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading coins...</p>
      </div>
    </div>
  `);

    try {
      if (allCoins.length === 0) allCoins = await $.get(coinsApi);

      displayCoins(allCoins.slice(0, 100));
    } catch {
      showError($("#coinsContainer"));
    }
  };

  const displayCoins = (coins) => {
    const container = $("#coinsContainer");
    container.empty();

    const cardsHTML = coins
      .map(
        ({ id, name, symbol }) => `
    <div class="col-md-6 col-lg-4">
      <div class="card crypto-card shadow-sm">
        <div class="card-header bg-white">
          <div class="d-flex justify-content-between align-items-center">
            <span class="fw-semibold">${name}</span>
            <span class="badge bg-primary crypto-symbol">${symbol.toUpperCase()}</span>
          </div>
        </div>
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <button class="btn btn-sm btn-primary more-info" data-id="${id}">
              <i class="fas fa-info-circle"></i> More Info
            </button>
            <label class="toggle-switch" title="Track coin">
              <input class="coin-toggle" type="checkbox" 
                data-symbol="${symbol.toUpperCase()}"
                ${
                  selectedReports.includes(symbol.toUpperCase())
                    ? "checked"
                    : ""
                }
                aria-label="Toggle ${symbol.toUpperCase()}">
              <span class="slider"></span>
            </label>
          </div>
          <div class="collapse mt-3" id="collapse-${id}"></div>
        </div>
      </div>
    </div>
  `
      )
      .join("");

    container.html(cardsHTML);
  };

  const showCoinInfo = (container, data) => {
    const { large: image } = data.image || {};
    const {
      usd = "N/A",
      eur = "N/A",
      ils = "N/A",
    } = data.market_data?.current_price || {};

    const description = data.description?.en
      ? data.description.en.substring(0, 200) + "..."
      : "No description available.";

    container.html(`
    <div class="more-info-content p-3 bg-light rounded">
      <div class="d-flex align-items-center gap-3 mb-3">
        <img src="${image}" alt="${
      data.name
    }" class="coin-image rounded-circle" style="width:60px;height:60px;background:#fff;">
        <div>
          <h6 class="mb-0">${data.name}</h6>
          <small class="text-muted">${data.symbol.toUpperCase()}</small>
        </div>
      </div>
      <div class="mb-2"><strong>Current Prices:</strong></div>
      <div class="price-badge mb-2 p-2 bg-white rounded"> USD: $${usd}</div>
      <div class="price-badge mb-2 p-2 bg-white rounded"> EUR: €${eur}</div>
      <div class="price-badge mb-2 p-2 bg-white rounded"> ILS: ₪${ils}</div>
      <div class="mt-3">
        <small class="text-muted">${description}</small>
      </div>
    </div>
  `);
  };

  const openReplaceModal = (newSymbol) => {
    const listItems = selectedReports
      .map(
        (coin) => `
    <li class="list-group-item d-flex justify-content-between align-items-center">
      ${coin}
      <div class="form-check">
        <input class="form-check-input replace-toggle" type="radio" name="coinToReplace" data-symbol="${coin}">
      </div>
    </li>`
      )
      .join("");

    const modalHTML = `
  <div class="modal fade" id="replaceModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Replace Coin</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <p>Choose a coin to replace with <strong>${newSymbol}</strong>:</p>
          <ul class="list-group">${listItems}</ul>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" id="confirmReplace" class="btn btn-primary">Replace</button>
        </div>
      </div>
    </div>
  </div>`;

    $("body").append(modalHTML);
    const modal = new bootstrap.Modal($("#replaceModal"));
    modal.show();

    $("#confirmReplace")
      .off()
      .click(() => {
        const selectedToRemove = $(".replace-toggle:checked").data("symbol");
        if (!selectedToRemove) return alert("Please select a coin");
        selectedReports = selectedReports.filter(
          (select) => select !== selectedToRemove
        );
        selectedReports.push(newSymbol);
        modal.hide();
        updateReportsUI();
      });

    $("#replaceModal").one("hidden.bs.modal", function () {
      if (!selectedReports.includes(newSymbol))
        $(`.coin-toggle[data-symbol="${newSymbol}"]`).prop("checked", false);
      $(this).remove();
    });
  };

  const updateReportsUI = () => {
    $(".coin-toggle").each(function () {
      const symbol = $(this).data("symbol");
      $(this).prop("checked", selectedReports.includes(symbol));
    });
  };

  currenciesBtn.click(() => {
    loadCurrencies();
  });

  reportsBtn.click(() => {
    clearContent();

    content.html(`
        <h3>Live Reports</h3>
        <p>Here you will see real-time cryptocurrency charts using Canvas.js and API data.</p>
        `);
  });

  aboutBtn.click(() => {
    clearContent();
    content.html(`
        <h3>About</h3>
        <p> This project was built as part of the John Bryce Full Stack course.<br>
      It uses <strong>jQuery</strong> and external <strong>API</strong> calls 
      to display live cryptocurrency data.<br>
      Created by <em>Matan Yehuda Malka</em>.</p>
         <img
      src="images/2.jpeg"
      alt="matan malka"
      class="img-fluid rounded mt-3"
      width="300"
    />
        `);
  });

  $(document).on("click", "#searchBtn", async () => {
    const searchInput = $("#searchInput").val().trim().toUpperCase();
    if (!searchInput) return;

    const filtered = allCoins
      .slice(0, 100)
      .filter((coin) => coin.symbol.toUpperCase() === searchInput);

    if (filtered.length === 0) {
      showError($("#coinsContainer"), `No results found for "${searchInput}".`);
      return;
    }

    displayCoins(filtered);
  });

  $(document).on("keypress", "#searchInput", function (e) {
    if (e.which === 13) {
      $("#searchBtn").click();
    }
  });

  $(document).on("click", ".more-info", async function () {
    const coinId = $(this).data("id");
    const collapseDiv = $(`#collapse-${coinId}`);
    const now = Date.now();
    const coinUrl = `https://api.coingecko.com/api/v3/coins/${coinId}`;
    const cached = cache[coinId];

    const renderCoinDetails = (container, data) => {
      showCoinInfo(container, data);
      container.addClass("show").slideDown();
    };

    if (collapseDiv.hasClass("show")) {
      collapseDiv.removeClass("show").slideUp();
      return;
    }

    if (cached && now - cached.timestamp < 120000) {
      renderCoinDetails(collapseDiv, cached.data);
      return;
    }

    collapseDiv
      .html(
        `
    <div class="text-center my-3">
      <div class="progress" style="height: 20px; width: 80%; margin: auto;">
        <div class="progress-bar progress-bar-striped progress-bar-animated bg-info"
             role="progressbar" style="width: 100%">
          Loading...
        </div>
      </div>
    </div>
  `
      )
      .slideDown();

    try {
      const data = await $.get(coinUrl);
      cache[coinId] = { data, timestamp: now };
      renderCoinDetails(collapseDiv, data);
    } catch {
      showError(collapseDiv);
    }
  });

  $(document).on("change", ".coin-toggle", function () {
    const symbol = $(this).data("symbol");

    if (!$(this).is(":checked")) {
      selectedReports = selectedReports.filter((select) => select !== symbol);
      return;
    }

    if (selectedReports.length < 5) {
      selectedReports.push(symbol);
      return;
    }

    openReplaceModal(symbol);
  });
  loadCurrencies();
});
