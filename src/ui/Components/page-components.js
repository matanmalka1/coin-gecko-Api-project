import { APP_CONFIG } from "../../config/app-config.js";
import { shortenText } from "../../utils/general-utils.js";
import { newsCardWrapper } from "./base-components.js";

const { NEWS_DESC_MAX } = APP_CONFIG;

// Renders the currencies page shell: search/sort areas and compare status slot.
const currenciesPage = () => `
  <div id="searchArea" class="my-4 d-flex flex-column flex-md-row align-items-stretch align-items-md-center justify-content-center gap-2">
    <div class="flex-grow-1 d-flex justify-content-center justify-content-md-end">
      <input type="text" id="searchInput" class="w-100 w-md-25 rounded-pill py-2 px-4" placeholder="Search coin by symbol (e.g. BTC, ETH, SOL)" minlength="2" maxlength="20" pattern="[a-zA-Z0-9\\s.-]+">
    </div>
    <div class="d-flex flex-wrap justify-content-center justify-content-md-start gap-2">
      <button type="button" id="filterReportsBtn" class="btn btn-light mx-2">Show Selected</button>
      <button type="button" id="showFavoritesBtn" class="btn btn-light mx-2">Favorites ⭐️</button>
      <button type="button" id="clearSearchBtn" class="btn btn-light mx-2 d-none" >Clear</button>
      <button type="button" id="refreshCoinsBtn" class="btn btn-light mx-2"><i class="bi bi-arrow-clockwise"></i></button>
    </div>
  </div>

    <div id="sortArea" class="my-3">
      <select id="sortSelect" class="form-select w-auto d-inline-block">
        <option value="marketcap_desc">Top Coins (Default)</option><option value="marketcap_asc">Market Cap ↑</option>
        <option value="price_desc">Price ↓</option><option value="price_asc">Price ↑</option>
        <option value="volume_high">Volume High</option><option value="volume_low">Volume Low</option>
      </select>
     </div>
     
  <div id="compareStatus" class="d-none mb-3"></div>
  <div id="coinsContainer" class="row g-3"></div>`;

// Builds the container for the live reports (charts) page.
const reportsPage = () => `
  <h3 class="mb-4">Live Reports</h3>
  <div id="chartsGrid" class="row g-3"></div>
  <div class="mt-2"><small class="text-muted">Reports charts powered by 
    <a href="https://www.tradingview.com" target="_blank" rel="noreferrer">TradingView Lightweight Charts</a></small></div>`;

// Static about page with author details pulled from APP_CONFIG.
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

// News landing page hero + list container (general/favorites modes).
const newsPage = () => `
    <div class="news-hero mb-2 py-3 rounded-3">
          <div class="row gy-4 ">
            <div class="col-lg-7">
              <h1 class="fw-bold">Stay ahead with curated crypto headlines</h1>
              <p>Filter between global coverage or insights tailored to your favorite coins. Updated continuously through the last 5 hours.</p>
              <div class="d-flex flex-wrap">
                <button type="button" class="btn px-3 py-2 rounded-2 active" id="newsGeneralBtn"><i class="bi bi-globe2 me-2"></i>General</button>
                <button type="button" class="btn  px-3 py-2 rounded-2" id="newsFavoritesBtn"><i class="bi bi-star me-2"></i>Favorites</button>
              </div>
            </div>
            <div class="col-lg-5"><i class="bi bi-info-circle me-1"></i>Live monitor 5H freshness</div>
          </div>
    </div>
    <div id="newsList" class="row g-4"></div>
`;

// Generates a single article card including metadata and CTA link.
export const newsArticleCard = (article) => {
  const { title, description, published_at, source = {}, original_url, url, image } = article || {};
  const publishedDate = published_at
    ? new Date(published_at).toLocaleString()
    : "Unknown time";

  return `
        ${newsCardWrapper(
        `
        <div class="ratio ratio-16x9 bg-light rounded-top">
          <img src="${image || "images/2.jpeg"}" class="card-img-top h-100 w-100 object-fit-cover rounded-top" alt="${title || "matan's photo"}" loading = "lazy" />
        </div>
        <div class="card-body d-flex flex-column">
            <h5 class="card-title mb-3">
            <a href="${original_url || url || "#"}" target="_blank" rel="noopener noreferrer" class="text-decoration-none">${title || "Untitled"}</a>
            </h5>
        <div class="d-flex justify-content-between align-items-center mb-3 text-muted">
          <span class="badge text-bg-light">
              <i class="bi bi-newspaper"></i> ${source?.title || source?.domain || "Unknown source"}
          </span>
          <small class="text-muted"><i class="bi bi-clock"></i> ${publishedDate}</small>
        </div>
          ${shortenText(description, NEWS_DESC_MAX)
              ? `<p class="card-text flex-grow-1 mb-0">${shortenText(description,NEWS_DESC_MAX)}</p>`
              : `<p class="card-text flex-grow-1 mb-0 fst-italic">No description available.</p>`
          }
          <a href="${original_url || url || "#"}" class="btn btn-sm btn-primary mt-3 align-self-start" target="_blank" rel="noopener noreferrer">Read full article</a></div>
      `,
    )}
  `;
};

export const PageComponents = {
  currenciesPage,
  reportsPage,
  aboutPage,
  newsPage,
};
