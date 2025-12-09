// Returns a spinner block with an accessible status message.
export const spinner = (message = "Loading...") => `
  <div class="text-center my-3">
    <div class="spinner-border text-primary">
      <span class="visually-hidden">${message}</span>
    </div>
    <p class="mt-2">${message}</p>
  </div>
`;

export const cardContainer = (
  content,
  colClasses = "col-md-6 col-lg-4",
  cardClasses = "card h-100 shadow-sm border"
) =>
  `<div class="${colClasses}"><div class="${cardClasses}">${content}</div></div>`;

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

  const colClasses =
    type === "news"
      ? "col-12 col-md-6 col-lg-4 d-flex"
      : "col-12 col-md-6 col-lg-4";

  const template = templates[type] || templates.coins;

  const cards = Array.from({ length: count }, () =>
    cardContainer(
      template,
      colClasses,
      "card border shadow-sm placeholder-wave h-100 p-3"
    )
  ).join("");

  return `<div class="row g-4 align-items-stretch">${cards}</div>`;
};
