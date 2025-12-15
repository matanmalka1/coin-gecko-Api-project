import { formatLargeNumber, formatPercent } from "../../utils/general-utils.js";
// Returns a spinner block with an accessible status message.
export const spinner = (message = "Loading...") => `
  <div class="text-center my-3">
    <div class="spinner-border text-primary">
      <span class="visually-hidden">${message}</span>
    </div>
    <p class="mt-2">${message}</p>
  </div>
`;

export const coinCardWrapper = (content) =>
  `<div class="col-md-6 col-lg-4"><div class="card h-100 shadow-sm border">${content}</div></div>`;

export const newsCardWrapper = (content) =>
  `<div class="col-12 col-md-6 col-lg-4 d-flex"><div class="card news-card h-100 shadow-sm border-0">${content}</div></div>`;

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
    charts: `
      <div class="d-flex justify-content-between mb-2">
        <span class="placeholder col-3"></span>
        <span class="placeholder col-2"></span>
      </div>
      <div class="placeholder bg-light rounded" style="height:220px;"></div>
    `,
  };

  const template = templates[type] || templates.coins;
  const colClasses =
    type === "news"
      ? "col-12 col-md-6 col-lg-4 d-flex"
      : "col-12 col-md-6 col-lg-4";

  const cards = Array.from({ length: count }, () =>
    `<div class="${colClasses}"><div class="card border shadow-sm placeholder-wave h-100 p-3">${template}</div></div>`
  ).join("");

  return `<div class="row g-4 align-items-stretch">${cards}</div>`;
};

export const toggleCollapse = (collapseId, show) => {
  const element = $(`#${collapseId}`);
  if (!element.length) return;

  element.toggleClass("show", show)[show ? "slideDown" : "slideUp"]();
};


export const renderStatsBar = (targetSelector, data) => {
  const {total_market_cap,total_volume,market_cap_percentage,market_cap_change_percentage_24h_usd } = data;
  
  const stats = [
    { label: "Market Cap", value: formatLargeNumber(total_market_cap?.usd) },
    { label: "24h Volume", value: formatLargeNumber(total_volume?.usd) },
    { label: "BTC Dominance", value: formatPercent(market_cap_percentage?.btc, { decimals: 1 }) },
    { label: "Market Change", value: formatPercent(market_cap_change_percentage_24h_usd, { decimals: 2, showSign: true }) },
  ];

  $(targetSelector).html(`
    <div class="container">
      <div class="row g-3 text-center">
        ${stats.map(({ label, value }) => `
          <div class="col-6 col-md-3">
            <div class="card shadow-sm h-100">
              <div class="card-body d-flex flex-column align-items-center justify-content-center text-center">
                <div class="mb-2"><i class="fas fa-chart-bar"></i></div>
                <div class="text-muted small mb-1">${label}</div>
                <div class="fw-bold h5 mb-0">${value}</div>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `);
};
