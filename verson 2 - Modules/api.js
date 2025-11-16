export const CoinAPI = {
  baseUrl: "https://api.coingecko.com/api/v3",

  async getMarkets() {
    return await $.get(`${this.baseUrl}/coins/markets`, {
      vs_currency: "usd",
      order: "market_cap_desc",
      per_page: 100,
      page: 1,
      sparkline: false,
    });
  },

  async getCoinDetails(id) {
    return await $.get(`${this.baseUrl}/coins/${id}`);
  },

  async getLivePrices(symbols) {
    const url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symbols}&tsyms=USD`;
    return await $.get(url);
  },
};
