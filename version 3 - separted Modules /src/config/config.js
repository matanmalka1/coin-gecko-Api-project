export const CONFIG = {
  API: {
    COINGECKO_BASE: "https://api.coingecko.com/api/v3",
    CRYPTOCOMPARE_BASE: "https://min-api.cryptocompare.com/data",
  },

  CACHE: {
    EXPIRY_TIME: 2 * 60 * 1000,
  },

  REPORTS: {
    MAX_COINS: 5,
  },

  CHART: {
    TITLE: "Live Crypto Prices (USD)",
    UPDATE_INTERVAL_MS: 2000,
    HISTORY_POINTS: 30,
    AXIS_X_TITLE: "Time",
    AXIS_X_FORMAT: "HH:mm:ss",
    AXIS_Y_TITLE: "Price (USD)",
    AXIS_Y_PREFIX: "$",
  },

  DISPLAY: {
    COINS_PER_PAGE: 150,
  },

  CURRENCIES: {
    USD: { symbol: "$", label: "USD" },
    EUR: { symbol: "€", label: "EUR" },
    ILS: { symbol: "₪", label: "ILS" },
  },

  UI: {
    GENERIC_ERROR: "An error occurred. Please try again.",
    LOADING_COINS: "Loading coins...",
    REPLACE_ALERT: "Please select a coin to replace",
    COMPARE_TITLE: "Compare Coins",
    NO_COINS_FOUND: "No coins found.",
    FAVORITES_EMPTY: "No favorites yet. Tap the star to add coins.",
  },

  STORAGE_KEYS: {
    THEME: "theme",
    FAVORITES: "favorites",
  },
};
