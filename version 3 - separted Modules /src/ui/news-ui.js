import { ERRORS } from "../config/error.js";
import { BaseComponents } from "./Components/base-components.js";
import { PageComponents } from "./Components/page-components.js";

// Renders the list of article cards or an empty-state message.
const showNews = (articles = [], options = {}) => {
  const emptyMessage = options.emptyMessage || ERRORS.NEWS.EMPTY;
  const list = $("#newsList");

  if (!articles.length) {
    list.html(BaseComponents.infoAlert(emptyMessage));
    return;
  }

  const html = articles.map(PageComponents.newsArticleCard).join("");
  list.html(html);
};

// Updates the hero status text (freshness/fallback).
const updateNewsStatus = (text) => {
  $("#newsStatus").html(text);
};

// Shows placeholder skeleton cards while fetching headlines.
const showNewsLoading = (message = "Loading news...") => {
  $("#newsList").html(BaseComponents.newsSkeleton());
  updateNewsStatus(message);
};

// Displays an error alert within the news list container.
const showNewsError = (message) => {
  $("#newsList").html(BaseComponents.errorAlert(message));
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
  showNewsError,
  setNewsFilterMode,
};
