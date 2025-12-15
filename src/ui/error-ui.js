import { ErrorResolver } from "../config/error.js";

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

const showError = (target, code, context = {}) => {
  const message = ErrorResolver.resolve(code, context);
  $(target).html(buildAlert("danger", message));
  getNotyf().error(message);
};

const showInfo = (target, message, type = "primary") => {
  $(target).html(buildAlert(type, message));
  getNotyf().success(message);
};

export const ErrorUI = {
  showError,
  showInfo,
  buildAlert,
};
