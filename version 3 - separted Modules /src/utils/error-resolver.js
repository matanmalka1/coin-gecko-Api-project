import { ERRORS } from "../config/error.js";

// Maps specific error codes to user-facing messages.
const handlers = {
  EMPTY_TERM: ({ term }) => ERRORS.SEARCH.EMPTY_TERM,
  API_ERROR: ({ defaultMessage }) =>
    defaultMessage || ERRORS.API.API_ERROR || ERRORS.API.DEFAULT,
  HTTP_ERROR: ({ status, defaultMessage }) =>
    status
      ? ERRORS.API.REQUEST_FAILED(status)
      : defaultMessage || ERRORS.API.DEFAULT,
  LOAD_WAIT: () => ERRORS.SEARCH.LOAD_WAIT,
  NETWORK_ERROR: () => ERRORS.API.DEFAULT,
  NO_MATCH: ({ term }) => ERRORS.SEARCH.NO_MATCH(term || ""),
  NONE_SELECTED: () => ERRORS.REPORTS.NONE_SELECTED,
  NO_SYMBOLS: () => ERRORS.API.NO_SYMBOLS,
  NOT_FOUND: () => ERRORS.REPORTS.NOT_FOUND,
  RATE_LIMIT: () => ERRORS.API.RATE_LIMIT,
  TERM_TOO_SHORT: ({ min }) => ERRORS.SEARCH.TERM_TOO_SHORT(min),
  TERM_TOO_LONG: ({ limit }) => ERRORS.SEARCH.TERM_TOO_LONG(limit),
  INVALID_TERM: () => ERRORS.SEARCH.INVALID_TERM,
  FULL: ({ limit }) => ERRORS.REPORTS.FULL(limit),
  DUPLICATE: () => ERRORS.REPORTS.DUPLICATE,
  INVALID_SYMBOL: () => ERRORS.REPORTS.INVALID_SYMBOL,
  NO_DATA: () => ERRORS.REPORTS.NO_DATA,
  NEWS_ERROR: ({ defaultMessage }) =>
    defaultMessage || ERRORS.NEWS.GENERAL_ERROR,
};

export const ErrorResolver = {
  // Resolves an error code to its message or falls back to default.
  resolve(code, options = {}) {
    const handler = handlers[code];
    return handler
      ? handler(options)
      : options.defaultMessage || ERRORS.API.DEFAULT;
  },
};
