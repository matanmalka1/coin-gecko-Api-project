import { ERRORS } from "../../config/error.js";
import { shortenText } from "../../utils/general-utils.js";
import { NEWS_DESC_MAX } from "../../config/app-config.js";

const NEWS_FALLBACK_IMAGE = "images/2.jpeg";

export const newsArticleCard = (article) => {
  const { title, description, published_at, source = {}, original_url, url, image } = article || {};
  const publishedDate = published_at
    ? new Date(published_at).toLocaleString()
    : "Unknown time";
  const imageSrc = image || NEWS_FALLBACK_IMAGE;

  return `
    <div class="col-12 col-md-6 col-lg-4 d-flex"><div class="card news-card h-100 shadow-sm border-0">
        <div class="ratio ratio-16x9 bg-light rounded-top">
          <img src="${imageSrc}" onerror="this.onerror=null;this.src='${NEWS_FALLBACK_IMAGE}';" class="card-img-top h-100 w-100 object-fit-cover rounded-top" alt="${title || "matan's photo"}" loading="lazy" />
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
      </div></div>
  `;
};

export const showNews = (articles = [], { emptyMessage = ERRORS.EMPTY } = {}) => {
  if (!articles.length) {
    $("#newsList").html(`<p class="text-center text-muted py-5">${emptyMessage}</p>`);
    return;
  }
  $("#newsList").html(articles.map(newsArticleCard).join(""));
};

// Toggles the active state between General/Favorites filters.
export const setNewsFilterMode = (mode) => {
  const isFavorites = mode === "favorites";
  $("#newsGeneralBtn").toggleClass("active", !isFavorites);
  $("#newsFavoritesBtn").toggleClass("active", isFavorites);
  
};export const newsPage = () => `
  <div class="news-hero mb-4 p-4 rounded-4 bg-light border shadow-sm">
    <div class="row align-items-center gy-4">
      
      <div class="col-lg-8">
        <h2 class="fw-bold text-dark mb-2">Crypto News Feed</h2>
        <p class="text-secondary mb-4">
          Stay ahead with curated headlines. Filter between global coverage or your 
          <span class="text-primary fw-bold">favorite coins</span>.
        </p>
        
        <div class="d-flex flex-wrap gap-2">
          <button type="button" class="btn btn-primary px-4 py-2 rounded-pill active shadow-sm" id="newsGeneralBtn">
            <i class="bi bi-globe2 me-2"></i>General
          </button>
          <button type="button" class="btn btn-outline-dark px-4 py-2 rounded-pill bg-white shadow-sm" id="newsFavoritesBtn">
            <i class="bi bi-star me-2"></i>Favorites
          </button>
        </div>
      </div>

      <div class="col-lg-4 text-lg-end">
        <div class="d-inline-flex align-items-center px-3 py-2 bg-white border rounded-3 shadow-sm">
          <div class="spinner-grow spinner-grow-sm text-success me-2" role="status"></div>
          <small class="fw-bold text-muted uppercase" style="font-size: 0.75rem;">
            Live: 5H Freshness
          </small>
        </div>
      </div>

    </div>
  </div>

  <div id="newsList" class="row g-4"></div>
`;

