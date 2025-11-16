$(document).ready(function () {
  const content = $("#content");
  const coinsApi = "https://api.coingecko.com/api/v3/coins/list";
  const cache = {};
  let selectedCoins = [];

  const clearContent = () => content.empty();

  const displayCoins = (coins) => {
    const container = $("#coinsContainer");
    container.empty();

    coins.forEach((coin) => {
      const isSelected = selectedCoins.includes(coin.symbol.toUpperCase());

      const card = $(`
        <div class="col-md-4 col-lg-3">
          <div class="card p-3 shadow-sm">
            <h5 class="card-title">${coin.name}</h5>
            <p class="card-text text-muted">Symbol: ${
              coin.symbol.charAt(0).toUpperCase() + coin.symbol.slice(1)
            }</p>
               <p class="card-text small text-secondary">
            ID: ${coin.id}
          </p>

          <div class="form-check form-switch mb-3">
            <input class="form-check-input coin-toggle" type="checkbox" 
              id="toggle-${coin.id}" 
              data-symbol="${coin.symbol.toUpperCase()}"
              ${isSelected ? "checked" : ""}>
            <label class="form-check-label" for="toggle-${coin.id}"></label>
          </div>
            <button class="btn btn-outline-primary more-info" data-id="${
              coin.id
            }">
              More Info
            </button>
            <div class="collapse mt-3" id="collapse-${coin.id}"></div>
          </div>
        </div>
      `);
      container.append(card);
    });
  };

  $("#homeBtn").click(() => {
    clearContent();

    const title = $("<h2>").html("Welcome to the digital currency world");
    const paragraph = $("<p>").html(
      "Here you can view up-to-date information about currencies, prices, and charts in real time."
    );

    content.append(title, paragraph);
  });

  $("#coinsBtn").click(() => {
    clearContent();

    const searchArea = $(`
      <div id="searchArea" class="my-4 text-center">
      <input type="text" id=searchInput placeholder="Search coin by name or symbol" class="form-control w-50 d-inline-block">
      <button id="searchBtn" class="btn btn-primary mx-2">Search</button>
      </div>
      `);

    const coinsContainer = $(`<div id="coinsContainer" class=row g-3></div>`);
    content.append(searchArea, coinsContainer);

    $.ajax({
      url: coinsApi,
      method: "GET",
      success: (data) => {
        const coins = data.slice(0, 100);
        displayCoins(coins);
      },
      error: () => {
        coinsContainer.html(
          `<p class="text-danger">Failed to load coins. try again later</p>`
        );
      },
    });
  });

  $("#aboutBtn").click(() => {
    clearContent();

    const title = $("<h2>").html("About");
    const paragraph = $("<p>").html(`
      This project was built as part of the John Bryce Full Stack course.<br>
      It uses <strong>jQuery</strong> and external <strong>API</strong> calls 
      to display live cryptocurrency data.<br>
      Created by <em>Matan Yehuda Malka</em>.
    `);
    const image = $("<img>")
      .attr("src", "your-photo.jpg")
      .attr("alt", "Matan Malka")
      .addClass("img-fluid rounded mt-3")
      .attr("width", "300");

    content.append(title, paragraph, image);
  });

  $("#reportsBtn").click(() => {
    clearContent();

    const title = $("<h2>").html("Live Reports");
    const paragraph = $("<p>").html(
      "Here you will see real-time cryptocurrency charts using Canvas.js and API data."
    );
    content.append(title, paragraph);
  });

  $(document).on("click", "#searchBtn", () => {
    const query = $("#searchInput").val().trim().toLowerCase();

    if (!query) return;

    $.ajax({
      url: "https://api.coingecko.com/api/v3/coins/list",
      method: "GET",
      success: (data) => {
        const filtered = data
          .filter(
            (coin) =>
              coin.name.toLowerCase().includes(query) ||
              coin.symbol.toLowerCase().includes(query)
          )
          .slice(0, 100);
        displayCoins(filtered);
      },
    });
  });

  $(document).on("click", ".more-info", function () {
    const coinId = $(this).data("id");
    const collapseDiv = $(`#collapse-${coinId}`);

    if (collapseDiv.hasClass("show")) {
      collapseDiv.removeClass("show").slideUp();
      return;
    }
    const now = new Date().getTime();
    const cached = cache[coinId];

    if (cached && now - cached.timestamp < 2 * 60 * 1000) {
      collapseDiv.html(cached.html).addClass("show").hide().slideDown();
      return;
    }
    collapseDiv.html(`
    <div class="text-center my-3">
      <div class="progress" style="height: 20px; width: 80%; margin: auto;">
        <div class="progress-bar progress-bar-striped progress-bar-animated bg-info"
             role="progressbar"
             style="width: 100%">
          Loading...
        </div>
      </div>
    </div>
  `);
    $.ajax({
      url: `https://api.coingecko.com/api/v3/coins/${coinId}`,
      method: "GET",
      success: (data) => {
        const img = data.image?.small || "";
        const prices = data.market_data.current_price;
        const info = `
            <div class="text-center">
              <img src="${img}" alt="${data.name}" class="img-fluid mb-2">
              <p><strong>USD:</strong> $${prices.usd}</p>
              <p><strong>EUR:</strong> €${prices.eur}</p>
              <p><strong>ILS:</strong> ₪${prices.ils}</p>
            </div>
          `;
        cache[coinId] = { html: info, timestamp: now };
        collapseDiv.html(info).addClass("show").hide().slideDown();
      },
      error: () => {
        collapseDiv.html(
          "<p class='text-danger'>Failed to load coin details.</p>"
        );
      },
    });
  });

  $(document).on("change", ".coin-toggle", function () {
    const symbol = $(this).data("symbol");
    const isChecked = $(this).is(":checked");

    if (isChecked) {
      if (selectedCoins.length >= 5) {
        $(this).prop("checked", false);
        showModal(symbol);
        return;
      }
      selectedCoins.push(symbol);
    } else {
      selectedCoins = selectedCoins.filter((s) => s !== symbol);
    }

    console.log("Selected Coins:", selectedCoins);
  });
});
