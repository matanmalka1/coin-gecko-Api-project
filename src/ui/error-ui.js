import { ERRORS } from "../config/error.js";

const buildAlert = (type = "info", text = "") => {
  const icons = {
    danger: "bi bi-exclamation-triangle-fill",
    warning: "bi bi-exclamation-circle-fill",
    primary: "bi bi-info-circle-fill",
  };
  const icon = icons[type] || icons.primary;
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

const showError = (target, message) => {
  const resolved = (message && ERRORS[message]) || message || ERRORS.DEFAULT;
  $(target).html(buildAlert("danger", resolved));
  getNotyf().error(resolved);
};

const showInfo = (target, message, type = "primary") => {
  // $(target).html(buildAlert(type, message));
  getNotyf().success(message);
};

const handleResult = (result = {}, target, fallbackMessage = ERRORS.DEFAULT) => {
  if (result.ok) return true;
  showError(target, result.error || fallbackMessage);
  return false;
};

export const ErrorUI = {
  showError,
  showInfo,
  buildAlert,
  handleResult,
};
