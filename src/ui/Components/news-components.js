import { ERRORS } from "../../config/error.js";
import { skeleton } from "./base-components.js";
import { newsArticleCard } from "./page-components.js";
import { ErrorUI } from "../error-ui.js";

// Renders the list of article cards or an empty-state message.
const showNews = (articles = [], { emptyMessage = ERRORS.EMPTY } = {}) => {
  if (!articles.length) {
    ErrorUI.showInfo("#newsList", emptyMessage);
    return;
  }
  $("#newsList").html(articles.map(newsArticleCard).join(""));
};

// Shows placeholder skeleton cards while fetching headlines.
const showNewsLoading = (message = "Loading news...") => {
  $("#newsList").html(skeleton("news", 3));
};

// Toggles the active state between General/Favorites filters.
const setNewsFilterMode = (mode) => {
  const isFavorites = mode === "favorites";
  $("#newsGeneralBtn").toggleClass("active", !isFavorites);
  $("#newsFavoritesBtn").toggleClass("active", isFavorites);
};

export const NewsUI = {
  showNews,
  showNewsLoading,
  setNewsFilterMode,
};
