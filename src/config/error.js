//  error messages + resolver for the entire app.
export const ERRORS = {
  DEFAULT: "Failed to load data. Please try again.",
  COIN_LIST_ERROR: "Failed to load coins data. Please try again.",
  COIN_DETAILS_ERROR: "Failed to load coin details. Please try again.",
  LIVE_CHART_ERROR: "Failed to load live price data. Please try again.",
  RATE_LIMIT: "Rate limit exceeded. Please wait and try again.",
  REQUEST_FAILED: (status) => `Error ${status}: Request failed.`,
  HTTP_STATUS: (status) => `HTTP ${status}`,
  NETWORK_ERROR: "Network error. Please try again.",
  NO_SYMBOLS: "No symbols provided",

  // ===== SEARCH ERRORS =====
  EMPTY_TERM: "Please enter a search term.",
  LOAD_WAIT: "Please wait for coins to load...",
  NO_MATCH: (term = "") => `No coins found matching "${term}".`,
  TERM_TOO_SHORT: (min = 1) =>
    `Search term is too short. Minimum ${min} characters.`,
  TERM_TOO_LONG: (max = 40) =>
    `Search term is too long. Maximum allowed is ${max} characters.`,
  INVALID_TERM:
    "Search term contains invalid characters. Use letters, numbers, spaces, dots or hyphens.",
  
  // ===== REPORTS / COMPARE ERRORS =====
  NONE_SELECTED: "No coins selected.",
  LIMIT: (max = 5) => `You can select up to ${max} coins for reports.`,
  COMPARE_FULL: (limit = 2) =>
    `Maximum ${limit} coins for comparison. Deselect one first.`,
  INVALID_SYMBOL: "The selected coin is invalid.",
  DUPLICATE: "This coin is already in your reports list.",
  NOT_FOUND: "Coin not found in your reports.",
  NO_DATA: "No data available for the selected coins.",
  MISSING_DATA: (symbols) => `Failed to load data for: ${symbols}`,
  REPLACE_SELECTION_REQUIRED: "Please choose a coin to replace.",

  // ===== NEWS ERRORS =====
  NEWS_ERROR: "Failed to load news. Please try again later.",
  NO_FAVORITES: "No favorites yet. Tap the star to add coins.",
  EMPTY: "No news found for the last 5 hours.",

  // ===== GENERIC UI ERRORS =====
  GENERIC: "An error occurred. Please try again.",
};

// ===== RESOLVER =====
export const ErrorResolver = {
  resolve(code, context = {}) {
    const error = ERRORS[code];
    if (context.defaultMessage) {
      return context.defaultMessage;
    }

    if (!error) {
      console.warn(`Unknown error code: ${code}`);
      return context.defaultMessage || ERRORS.DEFAULT;
    }

    if (typeof error === "function") {
      const param =
        context.term ||
        context.limit ||
        context.max ||
        context.min ||
        context.symbols ||
        context.status;
      const result = error(param);
      return result;
    }
    return error;
  },
};
