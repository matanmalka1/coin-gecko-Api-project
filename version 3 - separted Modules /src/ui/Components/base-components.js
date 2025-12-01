// Builds a Bootstrap alert block with icon + text.
const alertBox = (type, icon, message) => `
  <div class="alert alert-${type} text-center mt-4">
    <i class="${icon}"></i> ${message}
  </div>
`;

// Returns a spinner block with an accessible status message.
const spinner = (message = "Loading...") => `
  <div class="text-center my-3">
    <div class="spinner-border text-primary">
      <span class="visually-hidden">${message}</span>
    </div>
    <p class="mt-2">${message}</p>
  </div>
`;

// Specialized variant for danger alerts.
const errorAlert = (message) =>
  alertBox("danger", "bi bi-exclamation-triangle-fill", message);

// Specialized variant for informational alerts.
const infoAlert = (message) =>
  alertBox("info", "bi bi-info-circle-fill", message);

// Wraps arbitrary content inside a styled div.
// Renders a responsive column with a Bootstrap card inside.
const cardContainer = (
  content,
  colClasses = "col-md-6 col-lg-4",
  cardClasses = "card h-100 shadow-sm border"
) => `<div class="${colClasses}">${cardShell(content, cardClasses)}</div>`;

// Builds a grid of placeholder cards using a provided builder.
const buildSkeletonGrid = (
  count,
  cardBuilder,
  rowClasses = "row g-4 align-items-stretch"
) => {
  const cards = Array.from({ length: count }, (_, idx) =>
    cardBuilder(idx)
  ).join("");
  return `<div class="${rowClasses}">${cards}</div>`;
};

// Generates placeholder cards for the news page while loading.
const newsSkeleton = (count = 3) =>
  buildSkeletonGrid(count, () =>
    cardContainer(
      `
        <div class="ratio ratio-16x9 bg-light rounded-top placeholder"></div>
        <div class="card-body">
          <h5 class="card-title placeholder-glow">
            <span class="placeholder col-8"></span>
          </h5>
          <p class="placeholder-glow">
            <span class="placeholder col-7"></span>
            <span class="placeholder col-4"></span>
            <span class="placeholder col-6"></span>
            <span class="placeholder col-8"></span>
          </p>
          <span class="placeholder col-3"></span>
        </div>
      `,
      "col-12 col-md-6 col-lg-4 d-flex",
      "card news-card h-100 border shadow placeholder-wave w-100"
    )
  );

// Generates placeholder cards for the currencies page.
const coinsSkeleton = (count = 6) =>
  buildSkeletonGrid(count, () =>
    cardContainer(
      `
        <div class="d-flex align-items-center gap-3 mb-3">
          <span class="placeholder bg-light rounded-circle" style="width:50px;height:50px;"></span>
          <div class="w-100">
            <span class="placeholder col-7 mb-2"></span>
            <span class="placeholder col-4"></span>
          </div>
        </div>
        <span class="placeholder col-9 mb-2"></span>
        <span class="placeholder col-5 mb-2"></span>
        <div class="d-flex justify-content-between mt-3">
          <span class="placeholder col-4"></span>
          <span class="placeholder col-3"></span>
          <span class="placeholder col-2"></span>
        </div>
      `,
      "col-12 col-md-6 col-lg-4",
      "card border shadow-sm placeholder-wave h-100 p-3"
    )
  );

// Generates placeholder cards for the live charts grid.
const chartsSkeleton = (count = 3) =>
  buildSkeletonGrid(count, () =>
    cardContainer(
      `
        <div class="d-flex justify-content-between mb-2">
          <span class="placeholder col-3"></span>
          <span class="placeholder col-2"></span>
        </div>
        <div class="placeholder bg-light rounded" style="height:220px;"></div>
      `,
      "col-12 col-md-6 col-lg-4",
      "card border shadow-sm placeholder-wave h-100 p-3 chartsSkeleton"
    )
  );

export const BaseComponents = {
  spinner,
  errorAlert,
  infoAlert,
  cardContainer,
  buildSkeletonGrid,
  newsSkeleton,
  coinsSkeleton,
  chartsSkeleton,
};
