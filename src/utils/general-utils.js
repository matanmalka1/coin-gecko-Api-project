// Trims text to a maximum length (adds ellipsis when exceeding max).
export const shortenText = (text = "", max = 200) =>
  !text ? "" : text.length > max ? `${text.slice(0, max)}...` : text;


export const normalizeSymbol = (symbol) => String(symbol || "").trim().toUpperCase();

export const formatPrice = (value, currency = {}, options = {}) => {
  if (!value || Number.isNaN(value)) return "N/A";
  const minDigits = options.minimumFractionDigits ?? 2;
  const maxDigits = options.maximumFractionDigits ?? (Math.abs(value) >= 1 ? minDigits : 8);
  const formatted = value.toLocaleString("en-US", {minimumFractionDigits: minDigits,maximumFractionDigits: Math.max(minDigits, maxDigits),});
  return `${currency?.symbol ?? "$"}${formatted}`;
};

export const formatPercent = (percentValue, options = {}) => {
  if (typeof percentValue !== "number" || Number.isNaN(percentValue))
    return "N/A";

  const { decimals = 2, showSign = false } = options;
  const signPrefix = showSign && percentValue >= 0 ? "+" : "";

  return `${signPrefix}${percentValue.toFixed(decimals)}%`;
};

export const formatLargeNumber = (value) => 
  value >= 1e12 ? `$${(value / 1e12).toFixed(2)}T` : 
  value >= 1e9 ? `$${(value / 1e9).toFixed(2)}B` : `$${value.toLocaleString()}`;

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



