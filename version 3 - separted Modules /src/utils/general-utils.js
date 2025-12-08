// Trims text to a maximum length (adds ellipsis when exceeding max).
export const shortenText = (text = "", max = 200) =>
  !text ? "" : text.length > max ? `${text.slice(0, max)}...` : text;

export const formatPrice = (value, currency = {}, options = {}) => {
  if (!value || Number.isNaN(value)) return "N/A";

  const minDigits = options.minimumFractionDigits ?? 2;
  const maxDigits =
    options.maximumFractionDigits ?? (Math.abs(value) >= 1 ? minDigits : 8);

  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: minDigits,
    maximumFractionDigits: Math.max(minDigits, maxDigits),
  });

  const symbol = currency?.symbol ?? "$";
  return `${symbol}${formatted}`;
};

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

export const formatLargeNumber = (value) => {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  return `$${value.toLocaleString()}`;
};

export const formatPercent = (percentValue, options = {}) => {
  if (typeof percentValue !== "number" || Number.isNaN(percentValue))
    return "N/A";

  const { decimals = 2, showSign = false } = options;
  const signPrefix = showSign && percentValue >= 0 ? "+" : "";

  return `${signPrefix}${percentValue.toFixed(decimals)}%`;
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
