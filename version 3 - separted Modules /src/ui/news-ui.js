import { CONFIG } from "../config/config.js";
import { BaseComponents } from "./Components/base-components.js";
import { PageComponents } from "./Components/page-components.js";

const showNews = (articles = [], options = {}) => {
  const emptyMessage = options.emptyMessage || CONFIG.NEWS_UI.EMPTY;
  const list = $("#newsList");

  if (!articles.length) {
    list.html(BaseComponents.infoAlert(emptyMessage));
    return;
  }

  const html = articles.map(PageComponents.newsArticleCard).join("");
  list.html(html);
};

const updateNewsStatus = (text) => {
  $("#newsStatus").html(text);
};

const showNewsLoading = (message = "Loading news...") => {
  $("#newsList").html(BaseComponents.newsSkeleton());
  updateNewsStatus(message);
};

const showNewsError = (message) => {
  $("#newsList").html(BaseComponents.errorAlert(message));
};

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
