import { ERRORS } from "../config/error.js";

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

const showError = (message) => {
  const resolved = (message && ERRORS[message]) || message || ERRORS.DEFAULT;
  getNotyf().error(resolved);
};

const showInfo = (message, type = "primary") => {
  if (type === "warning") {
    getNotyf().open({
      type: "warning",
      message,
      background: "#ff9800",
    });
  } else {
    getNotyf().success(message);
  }
};

export const ErrorUI = {
  showError,
  showInfo,
};

export { getNotyf };
