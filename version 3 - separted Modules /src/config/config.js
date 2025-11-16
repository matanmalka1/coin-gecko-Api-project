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
    UPDATE_INTERVAL: 2000,
    HISTORY_POINTS: 30,
  },

  DISPLAY: {
    COINS_PER_PAGE: 150,
  },

  CURRENCIES: {
    USD: { symbol: "$", label: "USD" },
    EUR: { symbol: "€", label: "EUR" },
    ILS: { symbol: "₪", label: "ILS" },
  },
};
