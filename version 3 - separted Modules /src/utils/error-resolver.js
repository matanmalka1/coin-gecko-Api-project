import { ERRORS } from "../config/error.js";

const handlers = {
  EMPTY_TERM: ({ term }) => ERRORS.SEARCH.EMPTY_TERM,
  LOAD_WAIT: () => ERRORS.SEARCH.LOAD_WAIT,
  NO_MATCH: ({ term }) => ERRORS.SEARCH.NO_MATCH(term || ""),
  NONE_SELECTED: () => ERRORS.REPORTS.NONE_SELECTED,
  NO_SELECTION: () => ERRORS.REPORTS.NONE_SELECTED,
  NOT_FOUND: () => ERRORS.REPORTS.NOT_FOUND,
  LIMIT: () => ERRORS.REPORTS.LIMIT,
  FULL: () => ERRORS.REPORTS.LIMIT,
  RATE_LIMIT: () => ERRORS.API.RATE_LIMIT,
  HTTP_ERROR: ({ status }) =>
    status ? ERRORS.API.REQUEST_FAILED(status) : ERRORS.API.DEFAULT,
  NO_SYMBOLS: () => ERRORS.API.NO_SYMBOLS,
  NETWORK_ERROR: () => ERRORS.API.DEFAULT,
};

export const ErrorResolver = {
  resolve(code, options = {}) {
    const { defaultMessage } = options;
    const handler = handlers[code];
    return handler ? handler(options) : defaultMessage || ERRORS.API.DEFAULT;
  },
};
