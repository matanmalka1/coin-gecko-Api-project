import { CONFIG } from "../config/config.js";
import { ERRORS } from "../config/error.js";
import { BaseComponents } from "./Components/base-components.js";

let selectorCache = {};

const getCached = (selector) => {
  if (!selectorCache[selector]) {
    selectorCache[selector] = $(selector);
  }
  return selectorCache[selector];
};

const clearContent = (containerSelector = "#content") => {
  const el = getCached(containerSelector);
  el.empty();
};

const showPage = (html, containerSelector = "#content") => {
  selectorCache = {};
  clearContent(containerSelector);
  getCached(containerSelector).html(html);
};

const getInputValue = (selector) => {
  const el = getCached(selector);
  return el.length ? el.val() : "";
};

const setInputValue = (selector, value = "") => {
  const el = getCached(selector);
  if (el.length) el.val(value);
};

const getDataAttr = (element, key) => $(element).data(key);

const isCollapseOpen = (collapseId) => $(`#${collapseId}`).hasClass("show");

const applyTheme = (theme) => {
  const isDarkMode = theme === "dark";
  $("html").toggleClass("dark", isDarkMode);
  $("body").toggleClass("dark", isDarkMode);

  const themeButtons = $(".btn-theme-switch");
  if (isDarkMode) {
    themeButtons
      .removeClass("btn-light btn-outline-light")
      .addClass("btn-link text-white");
  } else {
    themeButtons
      .removeClass("btn-link text-white btn-outline-light")
      .addClass("btn-light");
  }
};

const showError = (container, message) => {
  const errorMsg =
    message && message.trim().length ? message : ERRORS.UI.GENERIC;

  getCached(container).html(BaseComponents.errorAlert(errorMsg));
};

const showSpinner = (container, message) => {
  const el = getCached(container);
  if (el.length) el.html(BaseComponents.spinner(message));
};

const toggleCollapse = (collapseId, show) => {
  const element = $(`#${collapseId}`);
  if (!element.length) return;

  element.toggleClass("show", show);
  show ? element.slideDown() : element.slideUp();
};

const showElement = (selector) => {
  getCached(selector).removeClass("d-none");
};

const setFavoritesButtonLabel = (showingFavorites) => {
  const label = showingFavorites
    ? CONFIG.UI.FAVORITES_HIDE_LABEL
    : CONFIG.UI.FAVORITES_SHOW_LABEL;
  getCached("#showFavoritesBtn").text(label);
};

export const BaseUI = {
  showPage,
  clearContent,
  getInputValue,
  setInputValue,
  getDataAttr,
  isCollapseOpen,
  applyTheme,
  showError,
  showSpinner,
  toggleCollapse,
  showElement,
  setFavoritesButtonLabel,
  getCached,
};
