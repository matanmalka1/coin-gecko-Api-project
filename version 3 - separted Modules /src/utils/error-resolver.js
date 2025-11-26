import { ERRORS } from "../config/error.js";

const handlers = {
  EMPTY_TERM: ({ term }) => ERRORS.SEARCH.EMPTY_TERM,
  FULL: () => ERRORS.REPORTS.LIMIT,
  HTTP_ERROR: ({ status }) =>
    status ? ERRORS.API.REQUEST_FAILED(status) : ERRORS.API.DEFAULT,
  LOAD_WAIT: () => ERRORS.SEARCH.LOAD_WAIT,
  NETWORK_ERROR: () => ERRORS.API.DEFAULT,
  NO_MATCH: ({ term }) => ERRORS.SEARCH.NO_MATCH(term || ""),
  NONE_SELECTED: () => ERRORS.REPORTS.NONE_SELECTED,
  NO_SELECTION: () => ERRORS.REPORTS.NONE_SELECTED,
  NO_SYMBOLS: () => ERRORS.API.NO_SYMBOLS,
  NOT_FOUND: () => ERRORS.REPORTS.NOT_FOUND,
  RATE_LIMIT: () => ERRORS.API.RATE_LIMIT,
};

export const ErrorResolver = {
  resolve(code, options = {}) {
    const handler = handlers[code];
    return handler
      ? handler(options)
      : options.defaultMessage || ERRORS.API.DEFAULT;
  },
};
