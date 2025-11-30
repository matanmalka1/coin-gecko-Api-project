import { ChartService } from "../services/chart-service.js";

export const ChartController = (() => {
  const cleanupAll = () => {
    ChartService.cleanup();
  };

  const startLiveChart = (options = {}) => {
    return ChartService.startLiveChart(options);
  };

  return {
    cleanupAll,
    startLiveChart,
  };
})();
