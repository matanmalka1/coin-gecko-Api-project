// Trims text to a maximum length (adds ellipsis when exceeding max).
export const shortenText = (text = "", max = 200) => {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}...` : text;
};

// Normalizes coin symbols to uppercase trimmed strings.
export const normalizeSymbol = (symbol = "") =>
  String(symbol).trim().toUpperCase();

const PLACEHOLDER_THUMB = "images/cryptocurrency.png";

// Filters articles that fall within the last `maxAgeInMs` window.
export const filterLastHours = (articles = [], maxAgeInMs = 0) => {
  if (!maxAgeInMs) return articles;

  return articles.filter((item) => {
    if (!item?.published_at) return false;
    const publishedTime = Date.parse(item.published_at);

    if (Number.isNaN(publishedTime)) return false;
    return Date.now() - publishedTime <= maxAgeInMs;
  });
};

export const formatPercent = (value) =>
  typeof value === "number" ? `${value.toFixed(2)}%` : "N/A";

// Formats numeric price values into USD with fraction digits.
export const formatPrice = (value, options = {}) => {
  typeof value !== "number"
    ? `$${value.toLocaleString("en-US", {
        minimumFractionDigits: options.minimumFractionDigits ?? 2,
        maximumFractionDigits: options.maximumFractionDigits ?? 2,
      })}`
    : "N/A";
};

export const resolveImage = (image) =>
  (typeof image === "string"
    ? image
    : image?.thumb || image?.small || image?.large) || PLACEHOLDER_THUMB;

export const formatDate = (dateString) => {
  if (!dateString) return "Unknown time";
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return "Invalid date";
  }
};

export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
};

export const formatLargeNumber = (value) => {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  return `$${value.toLocaleString()}`;
};
