import { CONFIG } from "../../config/config.js";
import { shortenText } from "../../utils/general-utils.js";
import { BaseComponents } from "./base-components.js";

const { cardContainer } = BaseComponents;

// Pages
const currenciesPage = () => `
  <div id="searchArea" class="my-4 text-center">
    <input type="text" id="searchInput" class="form-control-md w-25 rounded-pill py-2 px-4"
        placeholder="Search coin by symbol (e.g. BTC, ETH, SOL)">
<button type="button" id="filterReportsBtn" class="btn btn-light btn-theme-switch mx-2">Show Selected</button>
<button type="button" id="showFavoritesBtn" class="btn btn-light btn-theme-switch mx-2">Favorites</button>
<button type="button" id="clearSearchBtn" class="btn btn-light btn-theme-switch mx-2">Clear</button>
<button type="button" id="refreshCoinsBtn" class="btn btn-light btn-theme-switch mx-2">
  <i class="bi bi-arrow-clockwise"></i> 
</button>
  </div>
  <div id="sortArea" class="my-3">
    <select id="sortSelect" class="form-select w-auto d-inline-block">
      <option value="">Sort by default</option>
      <option value="price_desc">Price ↓</option>
      <option value="price_asc">Price ↑</option>
      <option value="marketcap_desc">Market Cap ↓</option>
      <option value="marketcap_asc">Market Cap ↑</option>
      <option value="volume_high">Volume High</option>
      <option value="volume_low">Volume Low</option>
    </select>
  </div>
  <div id="compareStatus" class="alert alert-info py-2 px-3 small d-none"></div>
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
<section class="news-hero mb-2 py-3 rounded-3">
    <div class="container">
      <div class="row gy-4 align-items-center">
        <div class="col-lg-7">
          <p class="text-uppercase small mb-2 text-white-50">Live feed</p>
          <h1 class="display-5 fw-bold text-white mb-3">Stay ahead with curated crypto headlines</h1>
          
          <p class="text-white-75 mb-4">
            Filter between global coverage or insights tailored to your favorite coins. Updated continuously through the last 5 hours.
          </p>
          
          <div class="d-flex flex-wrap gap-2">
            <button type="button" class="btn  px-3 py-2 rounded-2 active" id="newsGeneralBtn">              
              <i class="bi bi-globe2 me-2"></i>General
            </button>

            <button type="button" class="btn  px-3 py-2 rounded-2" id="newsFavoritesBtn">
              <i class="bi bi-star me-2"></i>Favorites
            </button>
            
            <div class="badge bg-white text-dark fw-semibold">
              <i class="bi bi-clock-history me-1"></i> 5h freshness
            </div>
          </div>
        </div>

          <div class="col-lg-5">
            <div class="card news-card h-100 shadow-sm border-0 rounded-3">
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
  const { title, description, published_at, source, original_url, url, image } =
    article || {};

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
          <h5 class="card-title mb-3">
            <a href="${link}" target="_blank" rel="noopener noreferrer" class="text-decoration-none">${displayTitle}</a>
          </h5>
          <div class="d-flex justify-content-between align-items-center mb-3 text-muted">
            <span class="badge text-bg-light">
              <i class="bi bi-newspaper"></i> ${displaySource}
            </span>
            <small class="text-muted">
              <i class="bi bi-clock"></i> ${publishedDate}
            </small>
          </div>
          ${
            displayDesc
              ? `<p class="card-text flex-grow-1 mb-0">${displayDesc}</p>`
              : `<p class="card-text flex-grow-1 mb-0 fst-italic">No description available.</p>`
          }
          <a href="${link}" class="btn btn-sm btn-primary mt-3 align-self-start" target="_blank" rel="noopener noreferrer">Read full article</a>
        </div>
      `,
      "col-12 col-md-6 col-lg-4 d-flex",
      "card news-card h-100 shadow-sm border-0"
    )}
  `;
};

export const PageComponents = {
  currenciesPage,
  reportsPage,
  aboutPage,
  newsPage,
  newsArticleCard,
};
