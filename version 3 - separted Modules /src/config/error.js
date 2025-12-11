// Centralized error messages + resolver for the entire app.
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
  NO_FAVORITES: "No favorite coins selected.",
  EMPTY: "No news found for the last 5 hours.",

  // ===== GENERIC UI ERRORS =====
  GENERIC: "An error occurred. Please try again.",
};

// ===== RESOLVER (לשעבר error-resolver.js) =====
const HANDLERS = {
  // Search / input
  EMPTY_TERM: () => ERRORS.EMPTY_TERM,
  LOAD_WAIT: () => ERRORS.LOAD_WAIT,
  NO_MATCH: ({ term }) => ERRORS.NO_MATCH(term),
  TERM_TOO_SHORT: ({ min }) => ERRORS.TERM_TOO_SHORT(min),
  TERM_TOO_LONG: ({ limit }) => ERRORS.TERM_TOO_LONG(limit),
  INVALID_TERM: () => ERRORS.INVALID_TERM,

  // API-level errors
  COIN_LIST_ERROR: ({ defaultMessage, status }) =>
    defaultMessage ||
    (status ? ERRORS.REQUEST_FAILED(status) : null) ||
    ERRORS.COIN_LIST_ERROR,
  COIN_DETAILS_ERROR: ({ defaultMessage, status }) =>
    defaultMessage ||
    (status ? ERRORS.REQUEST_FAILED(status) : null) ||
    ERRORS.COIN_DETAILS_ERROR,
  LIVE_CHART_ERROR: ({ defaultMessage, status }) =>
    defaultMessage ||
    (status ? ERRORS.REQUEST_FAILED(status) : null) ||
    ERRORS.LIVE_CHART_ERROR,
  HTTP_ERROR: ({ status, defaultMessage }) =>
    status
      ? ERRORS.REQUEST_FAILED(status)
      : defaultMessage || ERRORS.DEFAULT,
  RATE_LIMIT: ({ defaultMessage }) =>
    defaultMessage || ERRORS.RATE_LIMIT || ERRORS.DEFAULT,
  NETWORK_ERROR: ({ defaultMessage }) =>
    defaultMessage || ERRORS.NETWORK_ERROR || ERRORS.DEFAULT,
  NO_SYMBOLS: ({ defaultMessage }) =>
    defaultMessage || ERRORS.NO_SYMBOLS || ERRORS.DEFAULT,

  // Reports / compare
  NONE_SELECTED: ({ defaultMessage }) =>
    defaultMessage || ERRORS.NONE_SELECTED,
  LIMIT: ({ limit, defaultMessage }) =>
    defaultMessage || ERRORS.LIMIT(limit),
  COMPARE_FULL: ({ limit, defaultMessage }) =>
    defaultMessage || ERRORS.COMPARE_FULL(limit),
  INVALID_SYMBOL: ({ defaultMessage }) =>
    defaultMessage || ERRORS.INVALID_SYMBOL,
  DUPLICATE: ({ defaultMessage }) => defaultMessage || ERRORS.DUPLICATE,
  NOT_FOUND: ({ defaultMessage }) => defaultMessage || ERRORS.NOT_FOUND,
  NO_DATA: ({ defaultMessage }) => defaultMessage || ERRORS.NO_DATA,
  NO_COIN_ID: ({ defaultMessage }) => defaultMessage || ERRORS.NO_DATA,
  MISSING_DATA: ({ symbols, defaultMessage }) =>
    defaultMessage || ERRORS.MISSING_DATA(symbols || ""),
  REPLACE_SELECTION_REQUIRED: ({ defaultMessage }) =>
    defaultMessage || ERRORS.REPLACE_SELECTION_REQUIRED,

  // News
  NEWS_ERROR: ({ defaultMessage }) =>
    defaultMessage || ERRORS.NEWS_ERROR || ERRORS.DEFAULT,
  NEWS_HTTP_ERROR: ({ status, defaultMessage }) =>
    defaultMessage ||
    (status ? ERRORS.REQUEST_FAILED(status) : ERRORS.NEWS_ERROR),
  NO_FAVORITES: ({ defaultMessage }) =>
    defaultMessage || ERRORS.NO_FAVORITES,
};

export const ErrorResolver = {
  resolve(code, options = {}) {
    const handler = HANDLERS[code];
    return handler
      ? handler(options)
      : options.defaultMessage || ERRORS.DEFAULT;
  },
};
