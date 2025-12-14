import { ErrorResolver } from "../config/error.js";

const ICONS = {
  danger: "bi bi-exclamation-triangle-fill",
  warning: "bi bi-exclamation-circle-fill",
  info: "bi bi-info-circle-fill",
  success: "bi bi-check-circle-fill",
};

const buildAlert = (type = "info", text = "") => {
  const icon = ICONS[type] || ICONS.info;
  const message = typeof text === "string" ? text : text?.toString() || "";

  return `
    <div class="alert alert-${type} d-flex align-items-center gap-2 mb-3" role="alert">
      <i class="${icon}"></i>
      <div>${message}</div>
    </div>
  `;
};

let notyf;

const getNotyf = () => {
  if (!notyf) {
    notyf = new Notyf({
      duration: 3000,
      position: { x: "right", y: "top" },
      dismissible: true,
    });
  }
  return notyf;
};

const showError = (target, code, context = {}) => {  
  const message = ErrorResolver.resolve(code, context);
  const target =  $(target);
  target.html(buildAlert("danger", message));

  if (context.silentToast) return;
  getNotyf().error(message);
};

const showInfo = (target, message, type = "info") => {
  const $target =  $(target);
  target.html(buildAlert(type, message));
};

const showSuccess = (target, message, type = "success") => {
  getNotyf().success(message);
  
  if (options.showAlert && options.target) {
    const target =  $(options.target);
    target.html(buildAlert("success", message));
  }
};

export const ErrorUI = {
  showError,
  showInfo,
  buildAlert,
  showSuccess
};
