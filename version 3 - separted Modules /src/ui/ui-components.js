import { CONFIG } from "../config/config.js";
import { shortenText } from "../utils/general-utils.js";

export const UIComponents = (() => {
  // Loaders & alerts
  const alertBox = (type, icon, message) => `
    <div class="alert alert-${type} text-center mt-4">
      <i class="${icon}"></i> ${message}
    </div>
  `;

  const spinner = (message = "Loading...") => `
    <div class="text-center my-3">
      <div class="spinner-border text-primary">
        <span class="visually-hidden">${message}</span>
      </div>
      <p class="mt-2">${message}</p>
    </div>
  `;

  const errorAlert = (message) =>
    alertBox("danger", "bi bi-exclamation-triangle-fill", message);

  const infoAlert = (message) =>
    alertBox("info", "bi bi-info-circle-fill", message);

  // Skeleton Area
  const cardShell = (content, classes = "") =>
    `<div class="${classes}">${content}</div>`;

  const cardContainer = (
    content,
    colClasses = "col-md-6 col-lg-4",
    cardClasses = "card h-100 shadow-sm border-0"
  ) => `<div class="${colClasses}">${cardShell(content, cardClasses)}</div>`;

  const buildSkeletonGrid = (
    count,
    cardBuilder,
    rowClasses = "row g-4 align-items-stretch"
  ) => {
    const cards = Array.from({ length: count }, (_, idx) =>
      cardBuilder(idx)
    ).join("");
    return `<div class="${rowClasses}">${cards}</div>`;
  };

  const newsSkeleton = (count = 3) =>
    buildSkeletonGrid(count, () =>
      cardContainer(
        `
        <div class="ratio ratio-16x9 bg-light rounded-top placeholder"></div>
        <div class="card-body">
          <h5 class="card-title placeholder-glow">
            <span class="placeholder col-8"></span>
          </h5>
          <p class="placeholder-glow">
            <span class="placeholder col-7"></span>
            <span class="placeholder col-4"></span>
            <span class="placeholder col-6"></span>
            <span class="placeholder col-8"></span>
          </p>
          <span class="placeholder col-3"></span>
        </div>
      `,
        "col-12 col-md-6 col-lg-4 d-flex",
        "card news-card h-100 border-0 shadow-md placeholder-wave w-100"
      )
    );

  const coinsSkeleton = (count = 6) =>
    buildSkeletonGrid(count, () =>
      cardContainer(
        `
        <div class="d-flex align-items-center gap-3 mb-3">
          <span class="placeholder bg-light rounded-circle" style="width:50px;height:50px;"></span>
          <div class="w-100">
            <span class="placeholder col-7 mb-2"></span>
            <span class="placeholder col-4"></span>
          </div>
        </div>
        <span class="placeholder col-9 mb-2"></span>
        <span class="placeholder col-5 mb-2"></span>
        <div class="d-flex justify-content-between mt-3">
          <span class="placeholder col-4"></span>
          <span class="placeholder col-3"></span>
          <span class="placeholder col-2"></span>
        </div>
      `,
        "col-12 col-md-6 col-lg-4",
        "card border-0 shadow-sm placeholder-wave h-100 p-3"
      )
    );

  const chartsSkeleton = (count = 3) =>
    buildSkeletonGrid(count, () =>
      cardContainer(
        `
        <div class="d-flex justify-content-between mb-2">
          <span class="placeholder col-3"></span>
          <span class="placeholder col-2"></span>
        </div>
        <div class="placeholder bg-light rounded" style="height:220px;"></div>
      `,
        "col-12 col-md-6 col-lg-4",
        "card border-0 shadow-sm placeholder-wave h-100 p-3 chartsSkeleton"
      )
    );
  // End Of Skeleton Area

  const coinCard = (coin, isSelected = false, options = {}) => {
    const { id, name, symbol, image, current_price, market_cap } = coin;
    const { isFavorite = false } = options;

    const price =
      typeof current_price === "number"
        ? `$${current_price.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`
        : "N/A";

    const marketCapFormatted =
      typeof market_cap === "number"
        ? `$${market_cap.toLocaleString()}`
        : "N/A";

    const body = `
      <div class="d-flex align-items-center gap-3 mb-3">
        <img src="${image}" alt="${symbol}" loading="lazy"
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
        <strong>Market Cap:</strong> ${marketCapFormatted}
      </p>

      <div class="d-flex justify-content-between align-items-center mt-2">
        <button class="btn btn-sm btn-outline-primary more-info"
                data-id="${id}"
                aria-label="Show more info about ${symbol}">
          <i class="fas fa-info-circle"></i> More Info
        </button>

        <button type="button" class="btn btn-sm btn-outline-secondary compare-btn" 
          data-id="${id}" data-symbol="${symbol.toUpperCase()}"
          aria-label="Compare ${symbol}">
          <i class="fas fa-balance-scale"></i> Compare
        </button>

        <div class="d-flex align-items-center gap-2">
          <button type="button"
                  class="btn btn-sm p-0 favorite-btn"
                  data-symbol="${symbol.toUpperCase()}">
            <i class="fas fa-star ${isFavorite ? "text-warning" : "text-muted"}"
               style="font-size: 1.2rem;"></i>
          </button>

          <div class="form-check form-switch mb-0">
            <input class="form-check-input coin-toggle"
             type="checkbox" role="switch"
             aria-label="Track ${symbol}"
             data-symbol="${symbol.toUpperCase()}"
                   ${isSelected ? "checked" : ""}>
           </div>
        </div>
      </div>

      <div class="collapse mt-3" id="collapse-${id}"></div>
    `;

    return cardContainer(
      body,
      "col-12 col-md-6 col-lg-4",
      "card border-0 shadow-sm hover-shadow transition p-3 h-100"
    );
  };

  // More info panel
  const coinDetails = (data = {}, currencies = {}) => {
    const { image, name, symbol, market_data, description, platforms } = data;
    const {
      usd = "N/A",
      eur = "N/A",
      ils = "N/A",
    } = market_data?.current_price || {};

    const { usd: athUsd = "N/A" } = market_data?.ath || {};

    const desc = description?.en
      ? shortenText(description.en, 200)
      : "No description available.";

    const priceItem = (label, value, curr) => {
      const formatted =
        value !== "N/A" && typeof value === "number"
          ? value.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : value;

      return `
    <div class="price-badge mb-2 p-2 bg-white rounded ${
      value === "N/A" ? "text-muted" : ""
    }">
      ${label}: ${curr?.symbol ?? ""}${formatted}
    </div>
  `;
    };

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
      <div class="modal fade" id="replaceModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="replaceModalLabel">Replace Coin</h5>
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
    `
    <div id="searchArea" class="my-4 text-center">

    <input type="text" id="searchInput"
    placeholder="Search coin by symbol (e.g. BTC, ETH, SOL)"
    class="form-control w-50 d-inline-block rounded-pill" 
    />

    <button type="button" id="searchBtn" class="btn mx-2">Search</button>
    <button type="button" id="filterReportsBtn" class="btn mx-2">Show Selected</button>
    <button type="button" id="showFavoritesBtn" class="btn mx-2">Favorites</button>
    <button type="button" id="clearSearchBtn" class="btn mx-2">Clear</button>
    <button type="button" id="refreshCoinsBtn" class="btn mx-2">
      <i class="bi bi-arrow-clockwise"></i> Refresh
    </button>
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

  const aboutPage = (userData = {}) => {
    const { image, name, linkedin } = userData;
    return `
    <div id="aboutSection" class="container my-5">
      <div class="row align-items-center">
        <div class="col-md-6 text-center mb-4 mb-md-0">
          <img src="${image}" alt="${name}"
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
            Designed and developed by <strong>${name}</strong>.<br>
            Built with ❤️, JavaScript, and Bootstrap 5.
          </p>
          <div class="mt-4">
            <a href="${linkedin}" target="_blank" 
              rel="noopener noreferrer" class="btn btn-outline-primary">
              <i class="fab fa-linkedin"></i> View My LinkedIn
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
  };

  // [NEWS] News page layout
  const newsPage = () => `
  <section class="news-hero mb-4">
    <div class="container">
      <div class="row gy-4 align-items-center">
        <div class="col-lg-7">
          <p class="text-uppercase small mb-2 text-white-50">Live feed</p>
          <h1 class="display-5 fw-bold text-white mb-3">Stay ahead with curated crypto headlines</h1>
          <p class="text-white-75 mb-4">
            Filter between global coverage or insights tailored to your favorite coins. Updated continuously through the last 5 hours.
          </p>
          <div class="d-flex flex-wrap gap-2">
            <button type="button"  class="btn news-filter active" id="newsGeneralBtn">
              <i class="bi bi-globe2 me-2"></i>General
            </button>
            <button type="button" class="btn news-filter" id="newsFavoritesBtn">
              <i class="bi bi-star me-2"></i>Favorites
            </button>
            <div class="badge bg-white text-dark fw-semibold">
              <i class="bi bi-clock-history me-1"></i> 5h freshness
            </div>
          </div>
        </div>
        <div class="col-lg-5">
          <div class="news-hero-card p-4">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <span class="text-uppercase small text-muted">Status</span>
              <span class="badge text-bg-light">
                <i class="bi bi-info-circle me-1"></i>Live monitor
              </span>
            </div>
            <p id="newsStatus" class="mb-0 text-white-75">${CONFIG.NEWS_UI.STATUS_GENERAL}</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <div class="container">
    <div id="newsList" class="row g-4"></div>
  </div>
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
    const displayDesc = shortenText(description, CONFIG.NEWS_UI.DESC_MAX);
    const link = original_url || url || "#";
    const publishedDate = published_at
      ? new Date(published_at).toLocaleString()
      : "Unknown time";
    const displaySource = source?.title || source?.domain || "Unknown source";

    return `
    ${cardContainer(
      `
        <div class="ratio ratio-16x9 bg-light rounded-top">
          ${
            image
              ? `<img
            src="${image}"
            class="card-img-top h-100 w-100 object-fit-cover rounded-top"
          />`
              : `<div class="bg-secondary-subtle h-100 w-100 rounded-top d-flex align-items-center justify-content-center text-muted">
                  <i class="bi bi-image"></i>
                </div>`
          }
        </div>
        <div class="card-body d-flex flex-column">
          <h5 class="card-title news-card-title mb-3">
            <a href="${link}" target="_blank" rel="noopener noreferrer" class="text-decoration-none">${displayTitle}</a>
          </h5>
          <div class="d-flex justify-content-between align-items-center mb-3 news-card-meta">
            <span class="badge text-bg-light">
              <i class="bi bi-newspaper"></i> ${displaySource}
            </span>
            <small class="text-muted">
              <i class="bi bi-clock"></i> ${publishedDate}
            </small>
          </div>
          ${
            displayDesc
              ? `<p class="card-text flex-grow-1 mb-0 news-desc">${displayDesc}</p>`
              : `<p class="card-text flex-grow-1 text-muted fst-italic news-desc">No description available.</p>`
          }
          ${`<a href="${link}" class="btn btn-sm btn-primary mt-3 align-self-start" target="_blank" rel="noopener noreferrer">Read full article</a>`}
        </div>
      `,
      "col-12 col-md-6 col-lg-4 d-flex",
      "card news-card h-100 shadow-sm border-0"
    )}
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
    newsSkeleton,
    coinsSkeleton,
    chartsSkeleton,
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

