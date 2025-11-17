import { CONFIG } from "../config/config.js";
import { AppState } from "../state/state.js";

export const UIComponents = (() => {
  const spinner = (message = "Loading...") => `
    <div class="text-center my-3">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">${message}</span>
      </div>
      <p class="mt-2">${message}</p>
    </div>
  `;

  const progressBar = (message = "Loading...") => `
    <div class="text-center my-3">
      <div class="progress progress-loader">
        <div class="progress-bar progress-bar-striped progress-bar-animated bg-info"
          role="progressbar" style="width: 100%">${message}</div>
      </div>
    </div>
  `;

  const errorAlert = (message) => `
    <div class="alert alert-danger text-center mt-4" role="alert">
      <i class="bi bi-exclamation-triangle-fill"></i> ${message}
    </div>
  `;

  const infoAlert = (message) => `
    <div class="alert alert-info text-center mt-4" role="alert">
      <i class="bi bi-info-circle-fill"></i> ${message}
    </div>
  `;

  const coinCard = (coin, isSelected = false) => {
    const { id, name, symbol, image, current_price } = coin;

    const price =
      typeof current_price === "number"
        ? `$${current_price.toLocaleString()}`
        : "N/A";

    const isFavorite = AppState.isFavorite(symbol);

    return `
    <div class="col-md-6 col-lg-4">
      <div class="card border-0 shadow-sm hover-shadow transition p-3 h-100">
        
        <div class="d-flex align-items-center gap-3 mb-3">
          <img src="${image}" alt="${name}" loading="lazy"
               class="rounded-circle coin-image">
          <div>
            <h6 class="fw-bold mb-0">${name}</h6>
            <small class="text-muted">${symbol.toUpperCase()}</small>
          </div>
        </div>

        <p class="mb-2">
          <strong>Price:</strong> ${price}
        </p>

        <div class="d-flex justify-content-between align-items-center mt-2">
          <button class="btn btn-sm btn-outline-primary more-info"
                  data-id="${id}">
            <i class="fas fa-info-circle"></i> More Info
          </button>

          <div class="d-flex align-items-center gap-2">
            <button type="button"
                    class="btn btn-sm p-0 favorite-btn"
                    data-symbol="${symbol.toUpperCase()}"
                    title="${
                      isFavorite ? "Remove from favorites" : "Add to favorites"
                    }">
              <i class="fas fa-star ${
                isFavorite ? "text-warning" : "text-muted"
              }"
                 style="font-size: 1.2rem;"></i>
            </button>

            <label class="toggle-switch mb-0" title="Track coin">
              <input class="coin-toggle" type="checkbox"
                     data-symbol="${symbol.toUpperCase()}"
                     ${isSelected ? "checked" : ""}>
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <div class="collapse mt-3" id="collapse-${id}"></div>
      </div>
    </div>
  `;
  };

  const coinDetails = (data) => {
    const { image, name, symbol, market_data, description } = data;
    const {
      usd = "N/A",
      eur = "N/A",
      ils = "N/A",
    } = market_data?.current_price || {};

    const currencies = CONFIG.CURRENCIES;
    const desc = description?.en
      ? description.en.substring(0, 200) + "..."
      : "No description available.";

    const priceItem = (label, value, curr) => `
      <div class="price-badge mb-2 p-2 bg-white rounded ${
        value === "N/A" ? "text-muted" : ""
      }">
        ${label}: ${curr.symbol}${
      value !== "N/A" ? value.toLocaleString() : value
    }
      </div>
    `;

    return `
      <div class="more-info-content p-3 bg-light rounded">
        <div class="d-flex align-items-center gap-3 mb-3">
          <img src="${image.large}" alt="${name}" 
            class="coin-info-image rounded-circle">
          <div>
            <h6 class="mb-0">${name}</h6>
            <small class="text-muted">${symbol.toUpperCase()}</small>
          </div>
        </div>
        <div class="mb-2"><strong>Current Prices:</strong></div>
        ${priceItem("USD", usd, currencies.USD)}
        ${priceItem("EUR", eur, currencies.EUR)}
        ${priceItem("ILS", ils, currencies.ILS)}
        <div class="mt-3">
          <small class="text-muted">${desc}</small>
        </div>
      </div>
    `;
  };

  const replaceModal = (newSymbol, existingCoins) => {
    const listItems = existingCoins
      .map(
        (coin) => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          ${coin}
          <div class="form-check">
            <input class="form-check-input replace-toggle" type="radio" 
              name="coinToReplace" data-symbol="${coin}">
          </div>
        </li>
      `
      )
      .join("");

    return `
      <div class="modal fade" id="replaceModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Replace Coin</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <p>You've reached the limit of ${CONFIG.REPORTS.MAX_COINS} coins.</p>
              <p>Choose a coin to replace with <strong>${newSymbol}</strong>:</p>
              <ul class="list-group">${listItems}</ul>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" 
                data-bs-dismiss="modal">Cancel</button>
              <button type="button" id="confirmReplace" 
                class="btn btn-primary">Replace</button>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const currenciesPage = () => `
    <div id="searchArea" class="my-4 text-center">

    <button id="showFavoritesBtn" class="btn btn-warning mx-2">Favorites ⭐</button>
    
      <input type="text" id="searchInput"
        placeholder="Search coin by symbol (e.g. BTC, ETH, SOL)"
        class="form-control w-50 d-inline-block">
      <button id="searchBtn" class="btn btn-primary mx-2">Search</button>
      <button id="filterReportsBtn" class="btn btn-info mx-2">Show Selected</button>
      <button id="clearSearchBtn" class="btn btn-outline-secondary mx-2 d-none">Clear</button>
    </div>

    <div id="sortArea" class="my-3">
      <select id="sortSelect" class="form-select w-25 d-inline-block">
        <option value="">Sort by...</option>
        <option value="price_desc">Price ↓</option>
        <option value="price_asc">Price ↑</option>
        <option value="name_asc">Name A-Z</option>
        <option value="name_desc">Name Z-A</option>
        <option value="marketcap_desc">Market Cap ↓</option>
        <option value="marketcap_asc">Market Cap ↑</option>
      </select>
    </div>
  </div>

    <div id="coinsContainer" class="row g-3"></div>
  `;

  const reportsPage = () => `
    <h3 class="mb-4">Live Reports</h3>
    <div id="chartContainer"></div>
  `;

  const aboutPage = (userData) => `
    <div id="aboutSection" class="container my-5">
      <div class="row align-items-center">
        <div class="col-md-6 text-center mb-4 mb-md-0">
          <img src="${userData.image}" alt="${userData.name}"
            class="img-fluid rounded shadow-lg mb-3" />
        </div>
        <div class="col-md-6">
          <h2 class="fw-bold mb-3 text-primary">About This Project</h2>
          <p class="lead">
            This project was built as part of the 
            <strong>John Bryce Full Stack Development Course</strong>.<br><br>
            It showcases how to work with <strong>APIs</strong>, 
            <strong>jQuery</strong>, and modern web technologies 
            to display live cryptocurrency market data.
          </p>
          <p class="text-muted">
            Designed and developed by <strong>${userData.name}</strong>.<br>
            Built with ❤️, JavaScript, and Bootstrap 5.
          </p>
          <div class="mt-4">
            <a href="${userData.linkedin}" target="_blank" 
              rel="noopener noreferrer" class="btn btn-outline-primary">
              <i class="fab fa-linkedin"></i> View My LinkedIn
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  return {
    spinner,
    progressBar,
    errorAlert,
    infoAlert,
    coinCard,
    coinDetails,
    replaceModal,
    currenciesPage,
    reportsPage,
    aboutPage,
  };
})();
