export const UI_CONFIG = {
  UI: {
    LOADING_COINS: "Loading coins...",
    REPLACE_ALERT: "Please select a coin to replace",
    COMPARE_TITLE: "Compare Coins",
    NO_COINS_FOUND: "No coins found.",
    FAVORITES_EMPTY: "No favorites yet. Tap the star to add coins.",
    FAVORITES_SHOW_LABEL: "Favorites ⭐",
    FAVORITES_HIDE_LABEL: "All Coins",
  },
  NEWS_UI: {
    STATUS_GENERAL: "Showing general crypto news from the last 5 hours.",
    STATUS_FAVORITES:
      "Showing news for your favorite coins from the last 5 hours.",
    STATUS_NO_FAVORITES:
      "No favorite coins selected. Please add favorites to see related news.",
    STATUS_FALLBACK_GENERAL:
      "No articles from the last 5 hours. Showing latest available news.",
    STATUS_FALLBACK_FAVORITES:
      "No articles from the last 5 hours. Showing latest available favorites news.",
    LOADING_GENERAL: "Loading news...",
    LOADING_FAVORITES: "Loading favorites news...",
    DESC_MAX: 200,
  },
  CHART: {
    TITLE: "Live Crypto Prices (USD)",
    UPDATE_INTERVAL_MS: 2000,
    HISTORY_POINTS: 70,
    AXIS_X_TITLE: "Time",
    AXIS_X_FORMAT: "HH:mm:ss",
    AXIS_Y_TITLE: "Price (USD)",
    AXIS_Y_PREFIX: "$",
    CARD_BADGE_TEXT: "Live",
    HEIGHT_PX: 220,
    HEIGHT_MOBILE_PX: 180,
  },
  DISPLAY: {
    COINS_PER_PAGE: 150,
  },
  REPORTS: {
    MAX_COINS: 5,
    MAX_COMPARE: 5,
  },
  CURRENCIES: {
    USD: { symbol: "$", label: "USD" },
    EUR: { symbol: "€", label: "EUR" },
    ILS: { symbol: "₪", label: "ILS" },
  },
  ABOUT: {
    NAME: "Matan Yehuda Malka",
    IMAGE: "images/2.jpeg",
    LINKEDIN: "https://www.linkedin.com/in/matanyehudamalka",
  },
  NEWS: {
    DEFAULT_QUERY: "crypto OR cryptocurrency",
    LANGUAGE: "en",
    CACHE_KEYS: {
      GENERAL: "news_cache_general",
      FAVORITES: "news_cache_favorites",
    },
  },
};
