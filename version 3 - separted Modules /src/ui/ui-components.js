import { CONFIG } from "../config/config.js";

export const UIComponents = (() => {
  // Loaders & alerts
  const spinner = (message = "Loading...") => `
    <div class="text-center my-3">
      <div class="spinner-border text-primary">
        <span class="visually-hidden">${message}</span>
      </div>
      <p class="mt-2">${message}</p>
    </div>
  `;

  const errorAlert = (message) => `
    <div class="alert alert-danger text-center mt-4">
      <i class="bi bi-exclamation-triangle-fill"></i> ${message}
    </div>
  `;

  const infoAlert = (message) => `
    <div class="alert alert-info text-center mt-4">
      <i class="bi bi-info-circle-fill"></i> ${message}
    </div>
  `;

  // Coin cards
  const coinCard = (coin, isSelected = false, options = {}) => {
    const { id, name, symbol, image, current_price } = coin;
    const { isFavorite = false } = options;

    const price =
      typeof current_price === "number"
        ? `$${current_price.toLocaleString()}`
        : "N/A";

    const favoriteState = isFavorite === true;

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
        
        <p class="mb-2">
          <strong>Market Cap:</strong> ${
            typeof coin.market_cap === "number"
              ? `$${coin.market_cap.toLocaleString()}`
              : "N/A"
          }
        </p>

     
        <div class="d-flex justify-content-between align-items-center mt-2">
          <button class="btn btn-sm btn-outline-primary more-info"
                  data-id="${id}">
            <i class="fas fa-info-circle"></i> More Info
          </button>

          <button class="btn btn-sm btn-outline-secondary compare-btn" 
            data-id="${id}" data-symbol="${symbol.toUpperCase()}">
            <i class="fas fa-balance-scale"></i> Compare
          </button>

          <div class="d-flex align-items-center gap-2">
            <button type="button"
                    class="btn btn-sm p-0 favorite-btn"
                    data-symbol="${symbol.toUpperCase()}"
                    title="${
                      favoriteState
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }">
              <i class="fas fa-star ${
                favoriteState ? "text-warning" : "text-muted"
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

  // More info panel
  const coinDetails = (data, currencies = {}) => {
    const { image, name, symbol, market_data, description, platforms } = data;
    const {
      usd = "N/A",
      eur = "N/A",
      ils = "N/A",
    } = market_data?.current_price || {};

    const { usd: athUsd = "N/A" } = market_data?.ath || {};

    const desc = description?.en
      ? description.en.substring(0, 200) + "..."
      : "No description available.";

    const priceItem = (label, value, curr) => `
      <div class="price-badge mb-2 p-2 bg-white rounded ${
        value === "N/A" ? "text-muted" : ""
      }">
        ${label}: ${curr?.symbol ?? ""}${
      value !== "N/A" ? value.toLocaleString() : value
    }
      </div>
    `;

    const contractAddress =
      platforms && typeof platforms === "object"
        ? Object.values(platforms).find((addr) => addr)
        : null;

    const rank =
      typeof data.market_cap_rank === "number"
        ? `#${data.market_cap_rank}`
        : "N/A";

    return `
      <div class="more-info-content p-3 bg-light rounded">
        <div class="d-flex align-items-center gap-3 mb-3">
          <img src="${image.large}" alt="${name}" 
            class="coin-info-image rounded-circle">
          <div>
            <h6 class="mb-0">${name}</h6>
            <small class="text-muted">${symbol.toUpperCase()}</small>
            <div class="text-muted small">Rank: ${rank}</div>
          </div>
        </div>

        <div class="mb-2"><strong>Current Prices:</strong></div>
        ${priceItem("USD", usd, currencies.USD)}
        ${priceItem("EUR", eur, currencies.EUR)}
        ${priceItem("ILS", ils, currencies.ILS)}

        <div class="mb-2 mt-3"><strong>All-Time High (USD):</strong></div>
        ${priceItem("ATH", athUsd, currencies.USD)}

        <div class="mt-2">
          <small class="text-muted">
            <strong>CA:</strong> ${contractAddress || "N/A"}
          </small>
        </div>
        <div class="mt-3">
          <small class="text-muted">${desc}</small>
        </div>
      </div>
    `;
  };

  const coinMiniChart = (id) => `
  <div id="miniChart-${id}" class="mini-chart-container mt-3"></div>
`;

  // Modals
  const replaceModal = (newSymbol, existingCoins, options = {}) => {
    const { maxCoins } = options;
    const limit =
      typeof maxCoins === "number" ? maxCoins : existingCoins.length || 0;
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
      <div class="modal fade" id="replaceModal">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Replace Coin</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <p>You've reached the limit of ${limit} coins.</p>
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

  // Pages
  const currenciesPage = () =>
    // SEARCH AREA
    `
    <div id="searchArea" class="my-4 text-center">

    <input type="text" id="searchInput"
    placeholder="Search coin by symbol (e.g. BTC, ETH, SOL)"
    class="form-control w-50 d-inline-block">

    <button id="searchBtn" class="btn btn-primary mx-2">Search</button>
    <button id="filterReportsBtn" class="btn btn-info mx-2">Show Selected</button>
    <button id="showFavoritesBtn" class="btn btn-warning mx-2">Favorites</button>
    <button id="clearSearchBtn" class="btn btn-outline-secondary mx-2">Clear</button>
    </div>

    <div id="sortArea" class="my-3">
      <select id="sortSelect" class="form-select d-inline-block">
        <option value="">Sort by default</option>
        <option value="price_desc">Price ↓</option>
        <option value="price_asc">Price ↑</option>
        <option value="marketcap_desc">Market Cap ↓</option>
        <option value="marketcap_asc">Market Cap ↑</option>
        <option value="volume_high">Volume High</option>
        <option value="volume_low">Volume Low</option>
      </select>
    </div>

    <div id="coinsContainer" class="row g-3"></div>
  `;

  const reportsPage = () => `
    <h3 class="mb-4">Live Reports</h3>
    <div id="chartsGrid" class="row g-3"></div>
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

  // [NEWS] News page layout
  const newsPage = () => `
  <section class="container py-4">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
      <h2 class="mb-0">Crypto News</h2>
      <div class="btn-group">
        <button type="button" class="btn btn-outline-primary active" id="newsGeneralBtn">
          General News
        </button>
        <button type="button" class="btn btn-outline-primary" id="newsFavoritesBtn">
          Favorites News
        </button>
      </div>
    </div>

    <div id="newsStatus" class="mb-2 small text-muted">
      ${CONFIG.NEWS_UI.STATUS_GENERAL}
    </div>

    <div id="newsList" class="row g-3"></div>
  </section>
`;

  // [NEWS] Single news article card
  const newsArticleCard = (article) => {
    const {
      title,
      description,
      published_at,
      source,
      original_url,
      url,
      image,
    } = article || {};

    const displayTitle = title || "Untitled";
    const displayDesc = description || "";
    const displaySource = source?.title || source?.domain || "Unknown source";
    const displayLink = original_url || url || "#";
    const hasLink = !!(original_url || url);
    const publishedDate = published_at
      ? new Date(published_at).toLocaleString()
      : "Unknown time";
    const imageUrl =
      image || "https://via.placeholder.com/400x200?text=Crypto+News";

    return `
    <div class="col-12 col-md-6 col-lg-4">
      <div class="card h-100 shadow-sm">
        <img
          src="${imageUrl}"
          class="card-img-top"
          alt="${displayTitle.replace(/"/g, "&quot;")}"
          onerror="this.style.display='none';"
        />
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">
            ${
              hasLink
                ? `<a href="${displayLink}" target="_blank" rel="noopener noreferrer">${displayTitle}</a>`
                : displayTitle
            }
          </h5>
          <p class="card-text small text-muted mb-1">
            <i class="bi bi-newspaper"></i> ${displaySource}
          </p>
          <p class="card-text small text-muted mb-2">
            <i class="bi bi-clock"></i> ${publishedDate}
          </p>
          ${
            displayDesc
              ? `<p class="card-text flex-grow-1">${displayDesc}</p>`
              : `<p class="card-text flex-grow-1 text-muted fst-italic">No description available.</p>`
          }
          ${
            hasLink
              ? `<a href="${displayLink}" class="btn btn-sm btn-outline-primary mt-2 align-self-start" target="_blank" rel="noopener noreferrer">Read full article</a>`
              : ""
          }
        </div>
      </div>
    </div>
  `;
  };

  // Compare modal wrapper
  const compareModal = (coinsHTML, options = {}) => {
    const { title = "Compare Coins" } = options;
    return `
  <div class="modal fade" id="compareModal">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">

        <div class="modal-header">
          <h5 class="modal-title">${title}</h5> 
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>

        <div class="modal-body">
          ${coinsHTML}
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>

      </div>
    </div>
  </div>
`;
  };

  return {
    spinner,
    errorAlert,
    infoAlert,
    coinCard,
    coinDetails,
    replaceModal,
    currenciesPage,
    reportsPage,
    aboutPage,
    compareModal,
    coinMiniChart,
    newsPage,
    newsArticleCard,
  };
})();
