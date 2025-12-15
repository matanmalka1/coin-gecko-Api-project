import { formatLargeNumber, formatPercent } from "../utils/general-utils.js";

// Replaces the entire page container with provided HTML and resets cache.
export const showPage = (html, containerSelector = "#content") => {
  $(containerSelector).empty().html(html);
};

// Opens/closes a collapse region with a smooth slide animation.
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
