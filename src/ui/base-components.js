import { formatLargeNumber, formatPercent } from "../utils/general-utils.js";
// Returns a spinner block with an accessible status message.

export const spinner = (message = "Loading...") => `
  <div class="text-center my-3">
    <div class="spinner-border text-primary">
      <span class="visually-hidden">${message}</span>
    </div>
    <p class="mt-2">${message}</p>
  </div>
`;

export const skeleton = (type = "coins", count = 6) => {
  const templates = {
    news: `
      <div class="ratio ratio-16x9 bg-light rounded-top placeholder"></div>
      <div class="card-body">
        <h5 class="card-title placeholder-glow">
          <span class="placeholder col-8"></span>
        </h5>
        <p class="placeholder-glow">
          <span class="placeholder col-7"></span>
          <span class="placeholder col-4"></span>
        </p>
      </div>
    `,
    coins: `
      <div class="d-flex align-items-center gap-3 mb-3">
        <span class="placeholder bg-light rounded-circle" style="width:50px;height:50px;"></span>
        <div class="w-100">
          <span class="placeholder col-7 mb-2"></span>
          <span class="placeholder col-4"></span>
        </div>
      </div>
    `,
  };
  const colClasses =
    type === "news" || type === "coins"
      ? "col-12 col-md-6 col-lg-4 d-flex"
      : "col-12 col-md-6 col-lg-4";

  const cards = Array.from(
    { length: count },
    () =>
      `<div class="${colClasses}"><div class="card border shadow-sm placeholder-wave h-100 p-3">${templates[type]}</div></div>`
  ).join("");

  return `<div class="row g-4 align-items-stretch">${cards}</div>`;
};

export const renderStatsBar = (targetSelector, data) => {
  const {
    total_market_cap,
    total_volume,
    market_cap_percentage,
    market_cap_change_percentage_24h_usd,
  } = data;

  const stats = [
    { label: "Market Cap", value: formatLargeNumber(total_market_cap?.usd), icon: "bi-graph-up" },
    { label: "24h Volume", value: formatLargeNumber(total_volume?.usd), icon: "bi-droplet" },
    {
      label: "BTC Dominance",
      value: formatPercent(market_cap_percentage?.btc, { decimals: 1 }),
      icon: "bi-currency-bitcoin"
    },
    {
      label: "Market Change",
      value: formatPercent(market_cap_change_percentage_24h_usd, {
        decimals: 2,
        showSign: true,
      }),
      icon: "bi-activity"
    },
  ];

  $(targetSelector).html(`
    <div class="container">
      <div class="py-3 px-4 bg-white border rounded-4 shadow-sm">
        <div class="row g-3 align-items-center">
          ${stats
            .map(
              ({ label, value, icon }, index) => `
            <div class="col-6 col-md-3 ${index !== 3 ? 'border-end-md' : ''}">
              <div class="d-flex align-items-center justify-content-center justify-content-md-start px-md-3">
                <div class="flex-shrink-0 bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 40px; height: 40px;">
                  <i class="bi ${icon}"></i>
                </div>
                <div>
                  <div class="text-muted fw-medium mb-0" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px;">${label}</div>
                  <div class="fw-bold text-dark h6 mb-0">${value}</div>
                </div>
              </div>
            </div>
          `)
            .join("")}
        </div>
      </div>
    </div>
  `);
};