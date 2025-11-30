// Centralized user-facing error messages for the app.
export const ERRORS = {
  API: {
    DEFAULT: "Failed to load data. Please try again.",
    RATE_LIMIT: "Rate limit exceeded. Please wait and try again.",
    REQUEST_FAILED: (status) => `Error ${status}: Request failed.`,
    HTTP_STATUS: (status) => `HTTP ${status}`,
    NO_SYMBOLS: "No symbols provided",
  },

  SEARCH: {
    EMPTY_TERM: "Please enter a search term.",
    LOAD_WAIT: "Please wait for coins to load...",
    NO_MATCH: (term) => `No coins found matching "${term}".`,
  },

  REPORTS: {
    NONE_SELECTED: "No coins selected. Please choose coins first.",
    NOT_FOUND: "Selected coins not found. Try refreshing data.",
    LIMIT: "Please select up to 5 coins first from the Currencies page.",
    SELECT_REPLACEMENT: "Please select a coin to replace",
    MISSING_DATA: (symbols) => `Failed to load data for: ${symbols}`,
  },

  NEWS: {
    GENERAL_ERROR: "Failed to load general news. Please try again later.",
    FAVORITES_ERROR: "Failed to load favorites news. Please try again later.",
    EMPTY: "No news found for the last 5 hours.",
  },

  UI: {
    GENERIC: "An error occurred. Please try again.",
  },
};
