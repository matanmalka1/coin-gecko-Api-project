 $(function () {
      // -------- Global State --------
      let allCoins = [];              // [{id,symbol,name,image,current_price, ...}]
      let selectedCoins = loadLS("selectedCoins", []); // store CoinGecko IDs
      let coinCache = {};             // { id: { data, timestamp } }
      let chart = null;
      let chartInterval = null;
      let filterActive = loadLS("filterActive", false);
      const MAX_SELECTED = 5;

      // -------- Init --------
      initNav();
      loadCoinsMarkets(); // faster: one endpoint with prices & images
      if (filterActive) $("#filterSelected").html('<i class="fas fa-times"></i> Show All');

      // -------- Navigation --------
      function initNav() {
        $(".nav-link").on("click", function (e) {
          e.preventDefault();
          $(".nav-link").removeClass("active");
          $(this).addClass("active");
          const page = $(this).data("page");
          $(".page-section").removeClass("active");
          if (page === "home") {
            $("#homePage").addClass("active");
            stopChart();
          } else if (page === "reports") {
            $("#reportsPage").addClass("active");
            startChart();
          } else {
            $("#aboutPage").addClass("active");
            stopChart();
          }
        });
      }

      // -------- Utilities --------
      function saveLS(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
      function loadLS(key, fallback){
        try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; }
        catch(e){ return fallback; }
      }
      function debounce(fn, ms){
        let t; return function(...args){ clearTimeout(t); t = setTimeout(() => fn.apply(this,args), ms); };
      }

      // -------- Load Coins (Markets) --------
      function loadCoinsMarkets() {
        // Top 250 by market cap (first page), can adjust per_page=100..250
        $.ajax({
          url: "https://api.coingecko.com/api/v3/coins/markets",
          method: "GET",
          data: {
            vs_currency: "usd",
            order: "market_cap_desc",
            per_page: 150,
            page: 1,
            sparkline: false,
            price_change_percentage: "24h"
          },
          beforeSend: () => {
            $("#coinsContainer").html(`
              <div class="col-12">
                <div class="skeleton" style="height:84px;margin-bottom:12px;"></div>
                <div class="skeleton" style="height:84px;margin-bottom:12px;"></div>
                <div class="skeleton" style="height:84px;margin-bottom:12px;"></div>
              </div>
            `);
          },
          success: function(data) {
            allCoins = data; // already rich objects
            displayCoins(filterActive ? filterSelectedOnly() : allCoins);
          },
          error: function(err) {
            console.error("Error loading markets:", err);
            $("#coinsContainer").html(`
              <div class="col-12 text-center">
                <div class="alert alert-danger">Failed to load data. Please try again.</div>
              </div>
            `);
          }
        });
      }

      // -------- Render Coins --------
      function displayCoins(coins) {
        const container = $("#coinsContainer");
        container.empty();

        if (!coins || coins.length === 0) {
          container.html('<div class="col-12 text-center"><p class="text-muted">No cryptocurrencies found.</p></div>');
          return;
        }

        coins.forEach((coin) => {
          const isSelected = selectedCoins.includes(coin.id);
          const price = typeof coin.current_price === "number" ? `$${coin.current_price.toLocaleString()}` : "N/A";
          const change = coin.price_change_percentage_24h;
          const changeBadge = (typeof change === "number")
            ? `<span class="badge ${change >= 0 ? "bg-success" : "bg-danger"} ms-2">${change.toFixed(2)}%</span>`
            : "";

          const cardHtml = `
            <div class="col-md-6 col-lg-4" role="listitem">
              <div class="crypto-card card">
                <div class="card-header">
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="d-flex align-items-center gap-2">
                      <img src="${coin.image}" alt="${coin.name} icon" style="width:24px;height:24px;border-radius:50%;background:#fff"/>
                      ${coin.name}
                    </span>
                    <span class="crypto-symbol" title="Symbol">${coin.symbol.toUpperCase()}</span>
                  </div>
                </div>
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <span class="fw-semibold">Price:</span> <span class="ms-1">${price}</span> ${changeBadge}
                    </div>
                    <label class="toggle-switch" title="Track coin">
                      <input type="checkbox" class="coin-toggle" data-coin-id="${coin.id}" ${isSelected ? "checked" : ""} aria-label="Toggle ${coin.symbol.toUpperCase()}"/>
                      <span class="slider"></span>
                    </label>
                  </div>
                  <div class="d-flex justify-content-between">
                    <button class="btn btn-sm btn-primary more-info-btn" data-coin-id="${coin.id}" aria-expanded="false">
                      <i class="fas fa-info-circle"></i> More Info
                    </button>
                    <button class="btn btn-sm btn-outline-secondary quick-add" data-coin-id="${coin.id}">
                      <i class="fas fa-plus"></i> Quick Add
                    </button>
                  </div>
                  <div class="more-info-collapse" id="info-${coin.id}" style="display:none;"></div>
                </div>
              </div>
            </div>
          `;
          container.append(cardHtml);
        });

        attachEventHandlers();
        updateSelectedCoinsText(); // keep header in sync if user is on Reports
      }

      // -------- Event Handlers --------
      function attachEventHandlers() {
        // More Info
        $(".more-info-btn").off("click").on("click", function(){
          const coinId = $(this).data("coin-id");
          const infoDiv = $(`#info-${coinId}`);
          const expanded = $(this).attr("aria-expanded") === "true";

          if (expanded) {
            infoDiv.slideUp(150);
            $(this).attr("aria-expanded","false");
          } else {
            loadCoinInfo(coinId);
            $(this).attr("aria-expanded","true");
          }
        });

        // Toggle add/remove
        $(".coin-toggle").off("change").on("change", function(){
          const coinId = $(this).data("coin-id");
          const isChecked = $(this).is(":checked");
          if (isChecked) {
            if (selectedCoins.length >= MAX_SELECTED) {
              $(this).prop("checked", false);
              showSelectionModal(coinId);
              return;
            }
            selectedCoins.push(coinId);
          } else {
            selectedCoins = selectedCoins.filter(id => id !== coinId);
          }
          saveLS("selectedCoins", selectedCoins);
          updateSelectedCoinsText();
        });

        // Quick Add button (same rule with limit)
        $(".quick-add").off("click").on("click", function(){
          const coinId = $(this).data("coin-id");
          const toggle = $(`.coin-toggle[data-coin-id="${coinId}"]`);
          if (selectedCoins.includes(coinId)) {
            // Remove
            selectedCoins = selectedCoins.filter(id => id !== coinId);
            toggle.prop("checked", false);
          } else {
            if (selectedCoins.length >= MAX_SELECTED) {
              showSelectionModal(coinId);
              return;
            }
            selectedCoins.push(coinId);
            toggle.prop("checked", true);
          }
          saveLS("selectedCoins", selectedCoins);
          updateSelectedCoinsText();
        });
      }

      // -------- Load Coin Info (with cache) --------
      function loadCoinInfo(coinId) {
        const infoDiv = $(`#info-${coinId}`);
        // skeleton
        infoDiv.html(`<div class="skeleton"></div>`).slideDown(150);

        const now = Date.now();
        const cached = coinCache[coinId];
        if (cached && (now - cached.timestamp < 120000)) {
          displayCoinInfo(coinId, cached.data);
          return;
        }

        $.ajax({
          url: `https://api.coingecko.com/api/v3/coins/${coinId}`,
          method: "GET",
          success: function(data) {
            coinCache[coinId] = { data, timestamp: now };
            displayCoinInfo(coinId, data);
          },
          error: function(err) {
            console.error("Error loading coin info:", err);
            infoDiv.html(`<div class="alert alert-warning">Failed to load info. Try again.</div>`);
          }
        });
      }

      function displayCoinInfo(coinId, data) {
        const infoDiv = $(`#info-${coinId}`);
        const imageUrl = data.image?.large || data.image?.small || "";
        const priceUSD = data.market_data?.current_price?.usd;
        const priceEUR = data.market_data?.current_price?.eur;
        const priceILS = data.market_data?.current_price?.ils;

        const desc = data.description?.en ? data.description.en.slice(0, 240) + "..." : "No description available.";

        const infoHtml = `
          <div class="more-info-content">
            <div class="d-flex align-items-center gap-3 mb-3">
              ${imageUrl ? `<img src="${imageUrl}" alt="${data.name} image" class="coin-image">` : ""}
              <div>
                <h6 class="mb-0">${data.name}</h6>
                <small class="text-muted">${(data.categories||[]).slice(0,2).join(" • ")}</small>
              </div>
            </div>
            <div class="mb-2"><strong>Current Prices:</strong></div>
            <div class="price-badge">💵 USD: ${typeof priceUSD === "number" ? "$" + priceUSD.toLocaleString() : "N/A"}</div>
            <div class="price-badge">💶 EUR: ${typeof priceEUR === "number" ? "€" + priceEUR.toLocaleString() : "N/A"}</div>
            <div class="price-badge">💰 ILS: ${typeof priceILS === "number" ? "₪" + priceILS.toLocaleString() : "N/A"}</div>
            <div class="mt-3"><small class="text-muted">${desc}</small></div>
          </div>
        `;
        infoDiv.hide().html(infoHtml).slideDown(150);
      }

      // -------- Selection Modal --------
      function showSelectionModal(newCoinId) {
        const listDiv = $("#selectedCoinsList");
        listDiv.empty();
        selectedCoins.forEach((coinId) => {
          const coin = allCoins.find(c => c.id === coinId);
          if (!coin) return;
          const itemHtml = `
            <div class="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
              <span><strong>${coin.name}</strong> (${coin.symbol.toUpperCase()})</span>
              <button class="btn btn-sm btn-danger remove-coin-btn" data-coin-id="${coinId}" data-new-coin-id="${newCoinId}">
                <i class="fas fa-times"></i> Remove
              </button>
            </div>
          `;
          listDiv.append(itemHtml);
        });

        // bind once per open
        listDiv.off("click", ".remove-coin-btn").on("click", ".remove-coin-btn", function(){
          const coinId = $(this).data("coin-id");
          const newId = $(this).data("new-coin-id");
          selectedCoins = selectedCoins.filter(id => id !== coinId);
          if (!selectedCoins.includes(newId) && selectedCoins.length < MAX_SELECTED) {
            selectedCoins.push(newId);
          }
          // Reflect toggles
          $(`.coin-toggle[data-coin-id="${coinId}"]`).prop("checked", false);
          $(`.coin-toggle[data-coin-id="${newId}"]`).prop("checked", true);
          saveLS("selectedCoins", selectedCoins);
          updateSelectedCoinsText();
          $("#selectionModal").modal("hide");
        });

        $("#selectionModal").modal("show");
      }

      // -------- Search (fuzzy: name/symbol contains) --------
      $("#searchBtn").on("click", performSearch);
      $("#searchInput").on("input", debounce(performSearch, 300));
      $("#searchInput").on("keypress", function(e){ if (e.which === 13) performSearch(); });

      function performSearch() {
        const q = $("#searchInput").val().trim().toLowerCase();
        if (!q) {
          displayCoins(filterActive ? filterSelectedOnly() : allCoins);
          return;
        }
        const filtered = (filterActive ? filterSelectedOnly() : allCoins).filter(coin => {
          return coin.symbol.toLowerCase().includes(q) || coin.name.toLowerCase().includes(q);
        });
        displayCoins(filtered);
      }

      // -------- Filter Selected --------
      $("#filterSelected").on("click", function(){
        filterActive = !filterActive;
        saveLS("filterActive", filterActive);
        if (filterActive) {
          displayCoins(filterSelectedOnly());
          $(this).html('<i class="fas fa-times"></i> Show All');
        } else {
          displayCoins(allCoins);
          $(this).html('<i class="fas fa-filter"></i> Show Selected Only');
        }
      });

      function filterSelectedOnly(){
        return allCoins.filter(coin => selectedCoins.includes(coin.id));
      }

      // -------- Chart --------
      function startChart() {
        if (selectedCoins.length === 0) {
          $("#chartContainer").html('<div class="alert alert-info text-center">Please select cryptocurrencies to track by toggling them on the Currencies page.</div>');
          return;
        }
        updateSelectedCoinsText();
        initChart();
        updateChart(); // initial
        chartInterval = setInterval(updateChart, 2000);
      }

      function stopChart(){
        if (chartInterval) clearInterval(chartInterval);
        chartInterval = null;
      }

      function initChart(){
        const dataSeries = selectedCoins.map((id, idx) => ({
          type: "line",
          name: id.toUpperCase(),
          showInLegend: true,
          dataPoints: []
        }));
        chart = new CanvasJS.Chart("chartContainer", {
          animationEnabled: true,
          title: { text: "Live Cryptocurrency Prices (USD)" },
          axisX: { title: "Time", valueFormatString: "HH:mm:ss" },
          axisY: { title: "Price (USD)", prefix: "$" },
          legend: { cursor: "pointer", verticalAlign: "top" },
          data: dataSeries
        });
        chart.render();
      }

      function updateChart(){
        if (!selectedCoins.length || !chart) return;
        const idsCsv = selectedCoins.join(",");
        $.ajax({
          url: "https://api.coingecko.com/api/v3/simple/price",
          method: "GET",
          data: { ids: idsCsv, vs_currencies: "usd" },
          success: function(data){
            const now = new Date();
            selectedCoins.forEach((id, i) => {
              const price = data[id]?.usd;
              if (typeof price === "number" && chart.options.data[i]) {
                chart.options.data[i].dataPoints.push({ x: now, y: price });
                if (chart.options.data[i].dataPoints.length > 30) {
                  chart.options.data[i].dataPoints.shift();
                }
              }
            });
            chart.render();
          },
          error: function(err){ console.error("Chart update error:", err); }
        });
      }

      function updateSelectedCoinsText(){
        const text = selectedCoins.length ? selectedCoins.map(id => id.toUpperCase()).join(", ") : "None";
        $("#selectedCoinsText").text(text);
      }
    });