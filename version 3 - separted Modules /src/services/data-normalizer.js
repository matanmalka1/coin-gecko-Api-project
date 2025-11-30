const toNumberOrNull = (value) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

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
