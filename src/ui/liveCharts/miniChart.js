import { getCoinMarketChart } from "../../services/coins-service.js";

export const drawMiniChart = async (coinId) => {
  const { ok, data } = await getCoinMarketChart(coinId);
  const prices = data?.prices;

  if (!ok || !prices || prices.length === 0) {
    $(`#miniChart-${coinId}`).html(
      `<p class="text-center text-muted">No chart data available</p>`
    );
    return;
  }

  const dataPoints = prices.map(([time, price]) => ({
    x: new Date(time),
    y: price,
  }));

  const chart = new CanvasJS.Chart(`miniChart-${coinId}`, {
    height: 220,
    backgroundColor: "transparent",
    axisX: {
      labelFormatter: () => "",
    },
    axisY: {
      prefix: "$",
      labelFontSize: 10,
    },
    data: [
      {
        type: "line",
        dataPoints: dataPoints,
        color: "#0d6efd",
        markerSize: 4,
        lineThickness: 2,
      },
    ],
  });

  chart.render();
};
