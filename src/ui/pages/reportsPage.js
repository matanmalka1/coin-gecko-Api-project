export const reportsPage = () => `
  <div class="container-fluid px-0">
    <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
      <div>
        <h2 class="fw-bold mb-1">Live Market Reports</h2>
        <p class="text-muted small mb-0">
          <span class="badge bg-success-subtle text-success border border-success-subtle me-2">
            <i class="bi bi-broadcast me-1"></i> Real-time
          </span>
          Tracking selected assets performance
        </p>
      </div>
      
      <div class="d-flex align-items-center bg-white border rounded-pill p-1 shadow-sm">
        <button type="button" class="btn btn-sm btn-light rounded-circle border-0" id="reportsPrevBtn" aria-label="Previous">
          <i class="bi bi-chevron-left"></i>
        </button>
        <span class="px-3 fw-bold text-primary small" id="reportsPager" style="min-width: 60px; text-align: center;">
          0 / 0
        </span>
        <button type="button" class="btn btn-sm btn-light rounded-circle border-0" id="reportsNextBtn" aria-label="Next">
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>

    <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
      <div class="card-body p-0">
        <div class="reports-carousel position-relative">
          <div class="embla">
            <div class="embla__viewport" id="emblaView" style="cursor: grab;">
              <div class="embla__container d-flex" id="chartsTrack">
                </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card-footer bg-light border-0 py-3 px-4">
        <div class="row align-items-center">
          <div class="col-md-6">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-info-circle text-primary"></i>
              <small class="text-muted">Swipe or use arrows to switch between charts</small>
            </div>
          </div>
          <div class="col-md-6 text-md-end mt-2 mt-md-0">
            <small class="text-muted">Powered by 
              <a href="https://www.tradingview.com" target="_blank" rel="noreferrer" class="text-decoration-none fw-bold">
                TradingView <i class="bi bi-box-arrow-up-right ms-1" style="font-size: 0.7rem;"></i>
              </a>
            </small>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4 row g-3">
      <div class="col-sm-6">
        <div class="p-3 bg-white border rounded-3 d-flex align-items-center shadow-sm">
          <div class="bg-primary-subtle text-primary rounded-3 p-2 me-3">
             <i class="bi bi-graph-up-arrow fs-4"></i>
          </div>
          <div>
            <div class="fw-bold small">Historical Context</div>
            <div class="text-muted extra-small">Includes 24h trend data</div>
          </div>
        </div>
      </div>
      <div class="col-sm-6">
        <div class="p-3 bg-white border rounded-3 d-flex align-items-center shadow-sm">
          <div class="bg-warning-subtle text-warning rounded-3 p-2 me-3">
             <i class="bi bi-lightning-charge fs-4"></i>
          </div>
          <div>
            <div class="fw-bold small">Live Updates</div>
            <div class="text-muted extra-small">New ticks every few seconds</div>
          </div>
        </div>
      </div>
    </div>
  </div>
`;