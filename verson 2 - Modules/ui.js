export const UI = (() => {
  const content = $("#content");

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

  const createCoinCard = (coin, selectedReports = []) => {
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

  const displayCoins = (coins, selectedReports = []) => {
    const container = $("#coinsContainer");
    container.empty();
    const cardsHTML = coins
      .map((c) => createCoinCard(c, selectedReports))
      .join("");
    container.html(cardsHTML);
  };

  const renderSpinner = () => `
    <div class="text-center my-3">
      <div class="progress progress-loader">
        <div class="progress-bar progress-bar-striped progress-bar-animated bg-info"
          role="progressbar" style="width: 100%">Loading...</div>
      </div>
    </div>`;

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

  const createReplaceModalHTML = (newSymbol, listItems) => `
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

  const renderTemplate = (html) => {
    clearContent();
    content.html(html);
  };

  return {
    clearContent,
    showError,
    createCoinCard,
    displayCoins,
    renderSpinner,
    showCoinInfo,
    createReplaceList,
    createReplaceModalHTML,
    renderTemplate,
  };
})();
