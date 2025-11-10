$(() => {
  const currenciesBtn = $("#currenciesBtn");
  const reportsBtn = $("#reportsBtn");
  const aboutBtn = $("#aboutBtn");
  const content = $("#content");

  let selectedReports = [];
  let cache = {};
  let allCoins = [];

  let chart;
  let updateInterval;

  const clearContent = () => content.empty();

  const showError = (container, error) => {
    let message = "Failed to load data. Please try again.";

    if (error && error.status) {
      console.error("API Error:", error);

      if (error.status === 429) {
        message = "Rate limit exceeded. Please wait and try again.";
      } else {
        message = `Error ${error.status}: Request failed.`;
      }
    } else if (typeof error === "string") {
      message = error;
    }

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
      <input type="text"
      id="searchInput" 
      placeholder="Search coin by symbol (e.g. BTC, ETH, Sol)" 
      class="form-control w-50 d-inline-block">
      <button id="searchBtn"
       class="btn btn-primary mx-2"
       >Search</button>
      <button id="filterReportsBtn"
       class="btn btn-info mx-2"
       >Show selected coins</button>
        <button id="clearSearchBtn"
       class="btn btn-outline-secondary mx-2 d-none"
       >Clear Search</button>
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
      if (allCoins.length === 0) {
        allCoins = await CoinAPI.getMarkets();
      }
      displayCoins(allCoins);
    } catch (error) {
      showError($("#coinsContainer"), error);
    }
  };

  const createCoinCard = (coin) => {
    const { id, name, symbol, image, current_price } = coin;
    const price =
      typeof current_price === "number"
        ? `$${current_price.toLocaleString()}`
        : "N/A";

    const isSelected = selectedReports.includes(symbol.toUpperCase());

    return `
    <div class="col-md-6 col-lg-4">
      <div class="card border-0 shadow-sm hover-shadow transition p-3">
        <div class="d-flex align-items-center gap-3 mb-3">
          <img src="${image}" alt="${name} icon" loading="lazy" class="rounded-circle coin-image">
          <div>
            <h6 class="fw-bold mb-0">${name}</h6>
            <small class="text-muted">${symbol.toUpperCase()}</small>
          </div>
        </div>
        <p class="mb-2"><strong>Price:</strong> ${price}</p>
        <div class="d-flex justify-content-between align-items-center">
          <button class="btn btn-sm btn-outline-primary more-info" data-id="${id}">
            <i class="fas fa-info-circle"></i> More Info
          </button>
          <label class="toggle-switch" title="Track coin">
            <input class="coin-toggle" type="checkbox"
              data-symbol="${symbol.toUpperCase()}"
              ${isSelected ? "checked" : ""}>
            <span class="slider"></span>
          </label>
        </div>
        <div class="collapse mt-3" id="collapse-${id}"></div>
      </div>
    </div>
  `;
  };

  const displayCoins = (coins) => {
    const container = $("#coinsContainer");
    container.empty();

    const cardsHTML = coins.map(createCoinCard).join("");
    container.html(cardsHTML);
  };

  const renderPrice = (label, symbol, value) => `
  <div class="price-badge mb-2 p-2 bg-white rounded ${
    value === "N/A" ? "text-muted" : ""
  }">
    ${label}: ${symbol}${value}
  </div>
`;

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
    }" class="coin-info-image rounded-circle">
        <div>
          <h6 class="mb-0">${data.name}</h6>
          <small class="text-muted">${data.symbol.toUpperCase()}</small>
        </div>
      </div>
      <div class="mb-2"><strong>Current Prices:</strong></div>
      ${renderPrice("USD", "$", usd)}
    ${renderPrice("EUR", "€", eur)}
    ${renderPrice("ILS", "₪", ils)}
      <div class="mt-3">
        <small class="text-muted">${description}</small>
      </div>
    </div>
  `);
  };

  const createReplaceList = (coins) =>
    coins
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

  const createReplaceModalHTML = (newSymbol, listItems) =>
    `
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
  </div>
`;

  const openReplaceModal = (newSymbol) => {
    const listItems = createReplaceList(selectedReports);
    const modalHTML = createReplaceModalHTML(newSymbol, listItems);
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

  const startLiveReports = () => {
    if (!selectedReports.length)
      return showError(content, "Please select up to 5 coins first.");

    const symbols = selectedReports.join(",");

    chart = new CanvasJS.Chart("chartContainer", {
      title: { text: "Live Crypto Prices (USD)" },
      subtitles: [
        {
          text: "Updated every 2 seconds",
        },
      ],
      axisX: { title: "Time" },
      axisY: { title: "Price (USD)" },
      legend: { cursor: "pointer" },
      data: selectedReports.map((symbol) => ({
        type: "line",
        name: symbol,
        showInLegend: true,
        dataPoints: [],
      })),
    });

    chart.render();

    updateLiveData(symbols);

    updateInterval = setInterval(() => updateLiveData(symbols), 2000);
  };

  const updateLiveData = async (symbols) => {
    try {
      const data = await CoinAPI.getLivePrices(symbols);
      const time = new Date();

      chart.options.data.forEach((series) => {
        const symbol = series.name;
        const price = data[symbol]?.USD;

        if (price) {
          series.dataPoints.push({ x: time, y: price });
        }

        if (series.dataPoints.length > 30) series.dataPoints.shift();
      });

      chart.render();
    } catch (error) {
      console.error("Live data update failed:", error);
    }
  };

  const cleanupUI = () => {
    clearInterval(updateInterval);
    updateInterval = null;

    if ($("#chartContainer").length) $("#chartContainer").empty();
    chart = null;

    clearContent();
  };

  currenciesBtn.click(() => {
    cleanupUI();
    loadCurrencies();
  });

  reportsBtn.click(() => {
    cleanupUI();
    content.html(`
    <h3 class="mb-4">Live Reports</h3>
    <div id="chartContainer"></div>
  `);

    if (selectedReports.length === 0) {
      showError(content, "Please select coins first (up to 5).");
      return;
    }

    startLiveReports();
  });

  aboutBtn.click(() => {
    cleanupUI();
    content.html(`
       <div id="aboutSection" class="container my-5">
      <div class="row align-items-center">
        <div class="col-md-6 text-center mb-4 mb-md-0">
          <img
            src="images/2.jpeg"
            alt="Matan Yehuda Malka"
            class="img-fluid rounded shadow-lg mb-3"/>
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

  const renderCoinDetails = (container, data) => {
    showCoinInfo(container, data);
    container.addClass("show").slideDown();
  };

  const renderSpinner = () =>
    `
  <div class="text-center my-3">
    <div class="progress progress-loader">
      <div class="progress-bar progress-bar-striped progress-bar-animated bg-info"
           role="progressbar" style="width: 100%">Loading...</div>
    </div>
  </div>
`;

  const performSearch = () => {
    const searchInput = $("#searchInput").val().trim().toUpperCase();
    if (!searchInput) return;

    if (allCoins.length === 0) {
      showError($("#coinsContainer"), "Please wait for coins to load...");
      return;
    }

    const filtered = allCoins.filter(
      (coin) => coin.symbol.toUpperCase() === searchInput
    );

    if (filtered.length === 0) {
      showError(
        $("#coinsContainer"),
        `No coins found matching "${searchInput}".`
      );
      return;
    }

    displayCoins(filtered);
    $("#clearSearchBtn").removeClass("d-none");
  };

  $(document).on("click", "#searchBtn", performSearch);

  $(document).on("keypress", "#searchInput", function (e) {
    if (e.which === 13) performSearch();
  });

  $(document).on("click", "#clearSearchBtn", () => {
    $("#searchInput").val("");
    $("#clearSearchBtn").addClass("d-none");
    displayCoins(allCoins);
  });

  $(document).on("click", "#filterReportsBtn", () => {
    if (selectedReports.length === 0) {
      showError(
        $("#coinsContainer"),
        "No coins in report. Please choose coins first."
      );
      return;
    }

    const filtered = allCoins.filter((coin) =>
      selectedReports.includes(coin.symbol.toUpperCase())
    );

    displayCoins(filtered);
    $("#clearSearchBtn").removeClass("d-none");
  });

  $(document).on("click", ".more-info", async function () {
    const coinId = $(this).data("id");
    const collapseDiv = $(`#collapse-${coinId}`);
    const now = Date.now();
    const cached = cache[coinId];

    if (collapseDiv.hasClass("show")) {
      collapseDiv.removeClass("show").slideUp();
      return;
    }

    if (cached && now - cached.timestamp < 120000) {
      renderCoinDetails(collapseDiv, cached.data);
      return;
    }

    collapseDiv.html(renderSpinner()).slideDown();

    try {
      const data = await CoinAPI.getCoinDetails(coinId);
      cache[coinId] = { data, timestamp: now };
      renderCoinDetails(collapseDiv, data);
    } catch (error) {
      showError(collapseDiv, error);
    }
  });

  $(document).on("change", ".coin-toggle", function () {
    const symbol = $(this).data("symbol");
    const isChecked = $(this).is(":checked");

    if (!isChecked) {
      selectedReports = selectedReports.filter((select) => select !== symbol);
      return;
    }

    if (selectedReports.includes(symbol)) return;

    if (selectedReports.length < 5) {
      selectedReports.push(symbol);
      return;
    }

    openReplaceModal(symbol);
  });
  loadCurrencies();
});
