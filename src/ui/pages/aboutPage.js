export const aboutPage = (userData = {}) => {
  const { image = "images/2.jpeg", name = "Matan Yehuda Malka", linkedin = "#" } = userData;
  return `
    <div id="aboutSection" class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-11 col-xl-9">
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
            <div class="row g-0">
              
              <div class="col-md-5 bg-light d-flex align-items-center justify-content-center p-4">
                <div class="position-relative">
                  <img src="${image}" alt="${name}" 
                    class="img-fluid rounded-4 shadow-sm border border-white border-4" 
                    style="max-height: 380px; object-fit: cover;" />
                  <div class="mt-3 text-center">
                    <h5 class="fw-bold mb-1">${name}</h5>
                    <p class="text-muted small">Full Stack Developer</p>
                  </div>
                </div>
              </div>

              <div class="col-md-7 p-4 p-lg-5">
                <div class="mb-4">
                  <span class="badge bg-primary-subtle text-primary mb-2">John Bryce Project</span>
                  <h2 class="fw-bold text-dark mb-3">CryptoTrack Dashboard</h2>
                  <p class="text-secondary lh-lg mb-0">
                    A sophisticated real-time cryptocurrency platform built to practice 
                    <strong>API integration</strong>, <strong>asynchronous JavaScript</strong>, 
                    and dynamic UI rendering using <strong>jQuery</strong> and <strong>Bootstrap 5</strong>.
                  </p>
                </div>

                <div class="row g-2 mb-4">
                  <div class="col-6">
                    <div class="small text-dark"><i class="bi bi-check2-circle text-primary me-2"></i>Live Data Sync</div>
                  </div>
                  <div class="col-6">
                    <div class="small text-dark"><i class="bi bi-check2-circle text-primary me-2"></i>Local Storage Cache</div>
                  </div>
                  <div class="col-6">
                    <div class="small text-dark"><i class="bi bi-check2-circle text-primary me-2"></i>Responsive Design</div>
                  </div>
                  <div class="col-6">
                    <div class="small text-dark"><i class="bi bi-check2-circle text-primary me-2"></i>Interactive Charts</div>
                  </div>
                </div>

                <div class="pt-4 border-top d-flex align-items-center justify-content-between">
                  <a href="${linkedin}" target="_blank" rel="noopener noreferrer" 
                    class="btn btn-primary px-4 rounded-pill shadow-sm d-flex align-items-center gap-2">
                    <i class="fab fa-linkedin"></i> Let's Connect
                  </a>
                  <div class="text-muted small">Built with ❤️ & JS</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};