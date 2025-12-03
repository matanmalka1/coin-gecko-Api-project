// Trims text to a maximum length (adds ellipsis when exceeding max).
export const shortenText = (text = "", max = 200) => {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}...` : text;
};

// Normalizes coin symbols to uppercase trimmed strings.
export const normalizeSymbol = (symbol = "") =>
  String(symbol).trim().toUpperCase();

// Converts non-finite values into null to keep numeric fields consistent.
const toNumberOrNull = (value) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

// Normalizes raw coin data from various APIs into a shared structure.
export const normalizeCoinMarketData = (coin = {}, source = "coingecko") => {
  const marketData = coin.market_data || {};
  const currentPrice = marketData.current_price || coin.current_price || {};
  const marketCap = marketData.market_cap || coin.market_cap || {};
  const totalVolume = marketData.total_volume || coin.total_volume || {};
  const ath = marketData.ath || coin.ath || {};
  const changePercent =
    marketData.price_change_percentage_24h ??
    coin.price_change_percentage_24h ??
    null;
  const imageObj =
    coin.image && typeof coin.image === "object" ? coin.image : {};
  const imageUrl = typeof coin.image === "string" ? coin.image : "";

  const normalized = {
    source,
    prices: {
      usd: toNumberOrNull(currentPrice.usd),
      eur: toNumberOrNull(currentPrice.eur),
      ils: toNumberOrNull(currentPrice.ils),
    },
    marketCapUsd: toNumberOrNull(marketCap.usd),
    volumeUsd: toNumberOrNull(totalVolume.usd),
    changePercent24h: toNumberOrNull(changePercent),
    athUsd: toNumberOrNull(ath.usd),
    image: {
      large:
        imageObj.large ||
        imageObj.small ||
        imageObj.thumb ||
        coin.image_large ||
        imageUrl ||
        "",
      thumb:
        imageObj.thumb ||
        imageObj.small ||
        imageObj.large ||
        imageUrl ||
        "",
    },
  };

  return {
    ...coin,
    normalized,
  };
};

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
