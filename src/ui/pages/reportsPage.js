export const reportsPage = () => `
  <h3 class="mb-4">Live Reports</h3>
  <div class="reports-carousel">
   <div class="embla">
      <div class="embla__viewport" id="emblaView">
        <div class="embla__container" id="chartsTrack"></div>
      </div>
    </div>
     <div class="reports-carousel">
    <div class="reports-nav d-flex align-items-center justify-content-between mt-3">
      <button type="button" class="btn btn-light" id="reportsPrevBtn" aria-label="Previous chart">
        <i class="bi bi-chevron-left"></i>
      </button>

      <div class="text-muted small" id="reportsPager">0 / 0</div>

      <button type="button" class="btn btn-light" id="reportsNextBtn" aria-label="Next chart">
        <i class="bi bi-chevron-right"></i>
      </button>
    </div>
  </div>


  <div class="mt-2"><small class="text-muted">Reports charts powered by 
    <a href="https://www.tradingview.com" target="_blank" rel="noreferrer">TradingView Lightweight Charts</a></small></div>`;
