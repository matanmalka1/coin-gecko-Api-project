import { CONFIG } from "../config/config.js";
import { BaseComponents } from "./Components/base-components.js";
import { PageComponents } from "./Components/page-components.js";

const newsSelectors = {
  list: () => $("#newsList"),
  status: () => $("#newsStatus"),
  generalBtn: () => $("#newsGeneralBtn"),
  favoritesBtn: () => $("#newsFavoritesBtn"),
};

const safe = (fn) => {
  try {
    fn();
  } catch (err) {
    console.warn("NewsUI render error", err);
  }
};

const showNews = (articles = [], options = {}) =>
  safe(() => {
    const emptyMessage = options.emptyMessage || CONFIG.NEWS_UI.EMPTY;
    const list = newsSelectors.list();

    if (!articles.length) {
      list.html(BaseComponents.infoAlert(emptyMessage));
      return;
    }

    const html = articles.map(PageComponents.newsArticleCard).join("");
    list.html(html);
  });

const updateNewsStatus = (text) =>
  safe(() => {
    newsSelectors.status().text(text);
  });

const showNewsLoading = (message = "Loading news...") =>
  safe(() => {
    newsSelectors.list().html(BaseComponents.newsSkeleton());
    updateNewsStatus(message);
  });

const showNewsError = (message) =>
  safe(() => {
    newsSelectors.list().html(BaseComponents.errorAlert(message));
  });

const setNewsFilterMode = (mode) =>
  safe(() => {
    const isFavorites = mode === "favorites";
    newsSelectors.generalBtn().toggleClass("active", !isFavorites);
    newsSelectors.favoritesBtn().toggleClass("active", isFavorites);
  });

export const NewsUI = {
  showNews,
  updateNewsStatus,
  showNewsLoading,
  showNewsError,
  setNewsFilterMode,
};
