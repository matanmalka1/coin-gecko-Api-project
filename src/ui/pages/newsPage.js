import { ERRORS } from "../../config/error.js";
import { shortenText } from "../../utils/general-utils.js";
import { NEWS_DESC_MAX } from "../../config/app-config.js";

export const newsArticleCard = (article) => {
  const { title, description, published_at, source = {}, original_url, url, image } = article || {};
  const publishedDate = published_at
    ? new Date(published_at).toLocaleString()
    : "Unknown time";

  return `
    <div class="col-12 col-md-6 col-lg-4 d-flex"><div class="card news-card h-100 shadow-sm border-0">
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
};
export const newsPage = () => `
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


