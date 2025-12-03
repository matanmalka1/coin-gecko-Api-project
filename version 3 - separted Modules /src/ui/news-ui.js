import { ERRORS } from "../config/error.js";
import { BaseComponents } from "./Components/base-components.js";
import { PageComponents } from "./Components/page-components.js";

// Renders the list of article cards or an empty-state message.
const showNews = (articles = [], { emptyMessage = ERRORS.NEWS.EMPTY } = {}) =>
  $("#newsList").html(
    articles.length
      ? articles.map(PageComponents.newsArticleCard).join("")
      : BaseComponents.infoAlert(emptyMessage)
  );

// Updates the hero status text (freshness/fallback).
const updateNewsStatus = (text) => {
  $("#newsStatus").html(text);
};

// Shows placeholder skeleton cards while fetching headlines.
const showNewsLoading = (message = "Loading news...") => {
  $("#newsList").html(BaseComponents.skeleton("news", 3));
  updateNewsStatus(message);
};

// Toggles the active state between General/Favorites filters.
const setNewsFilterMode = (mode) => {
  const isFavorites = mode === "favorites";
  $("#newsGeneralBtn").toggleClass("active", !isFavorites);
  $("#newsFavoritesBtn").toggleClass("active", isFavorites);
};

export const NewsUI = {
  showNews,
  updateNewsStatus,
  showNewsLoading,
  setNewsFilterMode,
};
