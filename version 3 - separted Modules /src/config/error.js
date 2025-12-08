// Centralized user-facing error messages for the app.
export const ERRORS = {
  // Errors surfaced when communicating with remote APIs
  API: {
    DEFAULT: "Failed to load data. Please try again.",
    API_ERROR: "Failed to load data. Please try again.",
    COIN_LIST_ERROR: "Failed to load coins data. Please try again.",
    COIN_DETAILS_ERROR: "Failed to load coin details. Please try again.",
    LIVE_CHART_ERROR: "Failed to load live price data. Please try again.",
    RATE_LIMIT: "Rate limit exceeded. Please wait and try again.",
    REQUEST_FAILED: (status) => `Error ${status}: Request failed.`,
    HTTP_STATUS: (status) => `HTTP ${status}`,
    NO_SYMBOLS: "No symbols provided",
  },

  // Messages guiding users as they interact with the coin search UI
  SEARCH: {
    EMPTY_TERM: "Please enter a search term.",
    LOAD_WAIT: "Please wait for coins to load...",
    NO_MATCH: (term) => `No coins found matching "${term}".`,
    TERM_TOO_SHORT: (min = 1) =>
      `Please enter at least ${min} characters for search.`,
    TERM_TOO_LONG: (max = "") =>
      `Search term is too long. Maximum allowed is ${max} characters.`,
    INVALID_TERM:
      "Search term contains invalid characters. Use letters, numbers, spaces, dots or hyphens.",
  },

  // Report-builder specific validations and failures
  REPORTS: {
    NONE_SELECTED: "No coins selected. Please choose coins first.",
    NOT_FOUND: "Selected coins not found. Try refreshing data.",
    MISSING_DATA: (symbols) => `Failed to load data for: ${symbols}`,
    FULL: (limit = 5) =>
      `You can select up to ${limit} coins. Please replace an existing one.`,
    DUPLICATE: "This coin is already selected.",
    INVALID_SYMBOL: "Coin not found in the current list. Please refresh.",
    NO_DATA: "No data available for the selected coins.",
    REPLACE_SELECTION_REQUIRED:
      "Please choose a coin to replace before confirming.",
    COMPARE_FULL: (
      limit = 2 
    ) => `Maximum ${limit} coins for comparison. Deselect one first.`,
  },

  // Errors specific to the news feed module
  NEWS: {
    GENERAL_ERROR: "Failed to load general news. Please try again later.",
    FAVORITES_ERROR: "Failed to load favorites news. Please try again later.",
    EMPTY: "No news found for the last 5 hours.",
  },

  // Catch-all UI errors that are not module-specific
  UI: {
    GENERIC: "An error occurred. Please try again.",
  },
};
