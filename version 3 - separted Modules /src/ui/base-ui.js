import { CONFIG } from "../config/config.js";
import { ERRORS } from "../config/error.js";
import { BaseComponents } from "./Components/base-components.js";

let selectorCache = {};

// Returns cached jQuery selector references to reduce repeated queries.
// Re-queries if the cached element is detached or missing.
const getCached = (selector) => {
  const cached = selectorCache[selector];
  const isAttached = cached?.length && cached[0].isConnected;

  if (!cached || !isAttached) {
    selectorCache[selector] = $(selector);
  }

  return selectorCache[selector];
};

// Clears the HTML content of a container (defaults to #content).
const clearContent = (containerSelector = "#content") => {
  const el = getCached(containerSelector);
  el.empty();
};

// Replaces the entire page container with provided HTML and resets cache.
const showPage = (html, containerSelector = "#content") => {
  selectorCache = {};
  clearContent(containerSelector);
  getCached(containerSelector).html(html);
};

// Reads the current .val() from an input safely.
const getInputValue = (selector) => {
  const el = getCached(selector);
  return el.length ? el.val() : "";
};

// Sets a value into an input if it exists.
const setInputValue = (selector, value = "") => {
  const el = getCached(selector);
  if (el.length) el.val(value);
};

// Safe wrapper for reading data-* attributes.
const getDataAttr = (element, key) => $(element).data(key);

// Checks whether a collapse element currently has the show class.
const isCollapseOpen = (collapseId) => $(`#${collapseId}`).hasClass("show");

// Applies light/dark theme classes to root + themed buttons.
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

// Renders an alert error message inside a container.
const showError = (container, message) => {
  const errorMsg =
    message && message.trim().length ? message : ERRORS.UI.GENERIC;

  getCached(container).html(BaseComponents.errorAlert(errorMsg));
};

// Shows a spinner placeholder with optional text.
const showSpinner = (container, message) => {
  const el = getCached(container);
  if (el.length) el.html(BaseComponents.spinner(message));
};

// Opens/closes a collapse region with a smooth slide animation.
const toggleCollapse = (collapseId, show) => {
  const element = $(`#${collapseId}`);
  if (!element.length) return;

  element.toggleClass("show", show);
  show ? element.slideDown() : element.slideUp();
};

// Removes d-none to reveal hidden elements.
const showElement = (selector) => {
  getCached(selector).removeClass("d-none");
};

// Updates the favorites toggle button caption based on mode.
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
