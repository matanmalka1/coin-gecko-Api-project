// Centralized error messages + resolver for the entire app.
export const ERRORS = {
  // ===== API ERRORS =====
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

  // ===== SEARCH ERRORS =====
  SEARCH: {
    EMPTY_TERM: "Please enter a search term.",
    TERM_TOO_SHORT: "Search term is too short.",
    TERM_TOO_LONG: "Search term is too long.",
    NO_MATCH: (term) => `No coins found matching "${term}".`,
  },

  // ===== REPORTS / COMPARE ERRORS =====
  REPORTS: {
    NONE_SELECTED: "No coins selected for reports.",
    LIMIT: (max) => `You can select up to ${max} coins for reports.`,
    INVALID_SYMBOL: "The selected coin is invalid.",
    DUPLICATE: "This coin is already in your reports list.",
    NOT_FOUND: "Coin not found in your reports.",
    REPLACE_SELECTION_REQUIRED: "Please choose a coin to replace.",
  },

  // ===== NEWS ERRORS =====
  NEWS: {
    GENERAL_ERROR: "Failed to load general news. Please try again later.",
    FAVORITES_ERROR: "Failed to load favorites news. Please try again later.",
    EMPTY: "No news found for the last 5 hours.",
  },

  // ===== GENERIC UI ERRORS =====
  UI: {
    GENERIC: "An error occurred. Please try again.",
  },
};

// ===== RESOLVER (לשעבר error-resolver.js) =====

const HANDLERS = {
  // Search / input
  EMPTY_TERM: () => ERRORS.SEARCH.EMPTY_TERM,
  TERM_TOO_SHORT: () => ERRORS.SEARCH.TERM_TOO_SHORT,
  TERM_TOO_LONG: () => ERRORS.SEARCH.TERM_TOO_LONG,

  // API-level errors
  API_ERROR: ({ defaultMessage }) =>
    defaultMessage || ERRORS.API.API_ERROR || ERRORS.API.DEFAULT,

  COIN_LIST_ERROR: ({ defaultMessage, status }) =>
    defaultMessage || ERRORS.API.REQUEST_FAILED(status) || ERRORS.API.DEFAULT,

  COIN_DETAILS_ERROR: ({ defaultMessage, status }) =>
    defaultMessage || ERRORS.API.REQUEST_FAILED(status) || ERRORS.API.DEFAULT,

  LIVE_CHART_ERROR: ({ defaultMessage, status }) =>
    defaultMessage || ERRORS.API.REQUEST_FAILED(status) || ERRORS.API.DEFAULT,

  HTTP_ERROR: ({ status, defaultMessage }) =>
    status
      ? ERRORS.API.REQUEST_FAILED(status)
      : defaultMessage || ERRORS.API.DEFAULT,

  RATE_LIMIT: ({ defaultMessage }) =>
    defaultMessage || ERRORS.API.RATE_LIMIT || ERRORS.API.DEFAULT,

  NO_SYMBOLS: ({ defaultMessage }) =>
    defaultMessage || ERRORS.API.NO_SYMBOLS || ERRORS.API.DEFAULT,

  // Reports / compare
  NONE_SELECTED: ({ defaultMessage }) =>
    defaultMessage || ERRORS.REPORTS.NONE_SELECTED,

  COMPARE_FULL: ({ limit, defaultMessage }) =>
    defaultMessage || ERRORS.REPORTS.LIMIT(limit),

  INVALID_SYMBOL: ({ defaultMessage }) =>
    defaultMessage || ERRORS.REPORTS.INVALID_SYMBOL,

  DUPLICATE: ({ defaultMessage }) =>
    defaultMessage || ERRORS.REPORTS.DUPLICATE,

  NOT_FOUND: ({ defaultMessage }) =>
    defaultMessage || ERRORS.REPORTS.NOT_FOUND,

  REPLACE_SELECTION_REQUIRED: ({ defaultMessage }) =>
    defaultMessage || ERRORS.REPORTS.REPLACE_SELECTION_REQUIRED,

  NEWS_ERROR: ({ defaultMessage }) =>
    defaultMessage || ERRORS.NEWS.GENERAL_ERROR,
};

export const ErrorResolver = {
  resolve(code, options = {}) {
    const handler = HANDLERS[code];
    return handler
      ? handler(options)
      : options.defaultMessage || ERRORS.API.DEFAULT;
  },
};