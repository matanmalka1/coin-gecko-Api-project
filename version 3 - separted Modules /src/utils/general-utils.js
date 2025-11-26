export const shortenText = (text = "", max = 200) => {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}...` : text;
};

export const normalizeSymbol = (symbol = "") =>
  String(symbol).trim().toUpperCase();

// News-Utils -
export const filterLastHours = (articles = [], maxAgeInMs = 0) => {
  if (!maxAgeInMs) return articles;
  const now = Date.now();
  return articles.filter((item) => {
    if (!item?.published_at) return false;
    const publishedTime = Date.parse(item.published_at);
    if (Number.isNaN(publishedTime)) return false;
    return now - publishedTime <= maxAgeInMs;
  });
};
