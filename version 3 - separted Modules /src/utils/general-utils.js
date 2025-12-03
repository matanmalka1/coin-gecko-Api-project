// Trims text to a maximum length (adds ellipsis when exceeding max).
export const shortenText = (text = "", max = 200) => {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}...` : text;
};

// Normalizes coin symbols to uppercase trimmed strings.
export const normalizeSymbol = (symbol = "") =>
  String(symbol).trim().toUpperCase();

// News-Utils -
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

// Formats numeric price values into USD with fraction digits.
export const formatCurrency = (value, options = {}) => {
  if (typeof value !== "number" || isNaN(value)) return "N/A";
  const {
    prefix = "$",
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options;
  return `${prefix}${value.toLocaleString("en-US", {
    minimumFractionDigits,
    maximumFractionDigits,
  })}`;
};

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
