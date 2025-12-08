// src/ui/error-ui.js
import { ErrorResolver } from "../utils/error-resolver.js";

const ICON_CLASSES = {
  danger: "bi bi-exclamation-triangle-fill",
  warning: "bi bi-exclamation-circle-fill",
  info: "bi bi-info-circle-fill",
  success: "bi bi-check-circle-fill",
};

const getContainer = (target) =>
  typeof target === "string" ? $(target) : $(target);

const buildAlert = (type = "info", text = "") => {
  const icon = ICON_CLASSES[type] || ICON_CLASSES.info;
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

  getContainer(target).html(buildAlert("danger", message));

  if (context.silentToast) return;

  const toastMessage =
    context.toastMessage ||
    (typeof message === "string"
      ? message
      : message?.message || "An unexpected error occurred");

  getNotyf().error(toastMessage);
};

const showInfo = (target, message, type = "info") => {
  getContainer(target).html(buildAlert(type, message));
};

export const ErrorUI = {
  showError,
  showInfo,
  buildAlert,
};
