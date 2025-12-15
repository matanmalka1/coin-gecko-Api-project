export const shortenText = (text = "", max = 200) =>
  !text ? "" : text.length > max ? `${text.slice(0, max)}...` : text;

export const normalizeSymbol = (symbol) => String(symbol || "").trim().toUpperCase();

export const formatPrice = (value, currency = {}, options = {}) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "N/A";

  const minDigits = options.minimumFractionDigits ?? 2;
  const maxDigitsRaw =
    options.maximumFractionDigits ?? (Math.abs(num) >= 1 ? minDigits : 8);
  const maxDigits = Math.max(minDigits, maxDigitsRaw);

  const formatted = num.toLocaleString("en-US", {
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits,
  });

  return `${currency?.symbol ?? "$"}${formatted}`;
};

export const formatPercent = (percentValue, options = {}) => {
  const num = Number(percentValue);
  if (!Number.isFinite(num)) return "N/A";

  const { decimals = 2, showSign = false } = options;
  const signPrefix = showSign && num >= 0 ? "+" : "";

  return `${signPrefix}${num.toFixed(decimals)}%`;
};

export const formatLargeNumber = (value) => {
  if (!value || Number.isNaN(value)) return "N/A";

  return value >= 1e12 ? `$${(value / 1e12).toFixed(2)}T` : value >= 1e9  ? `$${(value / 1e9).toFixed(2)}B` : `$${value.toLocaleString()}`;
};

export const filterLastHours = (articles = [], maxAgeInMs = 0) => {
  if (!maxAgeInMs) return articles;

  return articles.filter((item) => {
    if (!item?.published_at) return false;
    const publishedTime = Date.parse(item.published_at);

    if (Number.isNaN(publishedTime)) return false;
    return Date.now() - publishedTime <= maxAgeInMs;
  });
};
