import { UI_CONFIG } from "../config/ui-config.js";
import { ERRORS } from "../config/error.js";
import { ErrorResolver } from "../utils/error-resolver.js";
import { BaseComponents } from "./Components/base-components.js";

// Clears the HTML content of a container (defaults to #content).
const clearContent = (containerSelector = "#content") => {
  const el = $(containerSelector);
  el.empty();
};

// Simple cache wrapper to avoid repeated selector lookups.
const getCached = (selector) => $(selector);

// Replaces the entire page container with provided HTML and resets cache.
const showPage = (html, containerSelector = "#content") => {
  $(containerSelector).empty().html(html);
};

// Reads the current .val() from an input safely.
const getInputValue = (selector) => {
  const el = $(selector);
  return el.length ? el.val() : "";
};

// Sets a value into an input if it exists.
const setInputValue = (selector, value = "") => {
  const el = $(selector);
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
const showError = (container, codeOrMessage, context = {}) => {
  const msg = ErrorResolver.resolve(codeOrMessage, {
    defaultMessage: ERRORS.UI.GENERIC,
    ...context,
  });

  getCached(container).html(BaseComponents.errorAlert(msg));
};

// Shows a spinner placeholder with optional text.
const showSpinner = (container, message) => {
  const el = $(container);
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
  $(selector).removeClass("d-none");
};

// Updates the favorites toggle button caption based on mode.
const setFavoritesButtonLabel = (showingFavorites) => {
  const label = showingFavorites
    ? UI_CONFIG.UI.FAVORITES_HIDE_LABEL
    : UI_CONFIG.UI.FAVORITES_SHOW_LABEL;
  $("#showFavoritesBtn").text(label);
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
};
