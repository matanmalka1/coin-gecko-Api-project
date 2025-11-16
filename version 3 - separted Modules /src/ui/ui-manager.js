import { UIComponents } from "./ui-components.js";

export const UIManager = (() => {
  const content = $("#content");

  const clearContent = () => {
    content.empty();
  };

  const showPage = (html) => {
    clearContent();
    content.html(html);
  };

  const showError = (container, error) => {
    let message = "Failed to load data. Please try again.";

    if (error && error.status) {
      console.error("API Error:", error);
      if (error.status === 429) {
        message = "Rate limit exceeded. Please wait and try again.";
      } else {
        message = `Error ${error.status}: Request failed.`;
      }
    } else if (typeof error === "string") {
      message = error;
    }

    $(container).html(UIComponents.errorAlert(message));
  };

  const showInfo = (container, message) => {
    $(container).html(UIComponents.infoAlert(message));
  };

  const showSpinner = (container, message) => {
    $(container).html(UIComponents.spinner(message));
  };

  const displayCoins = (coins, selectedReports = []) => {
    const container = $("#coinsContainer");
    if (!container.length) return;

    if (coins.length === 0) {
      showInfo(container, "No coins found.");
      return;
    }

    const cardsHTML = coins
      .map((coin) =>
        UIComponents.coinCard(
          coin,
          selectedReports.includes(coin.symbol.toUpperCase())
        )
      )
      .join("");

    container.html(cardsHTML);
  };

  const showCoinDetails = (containerId, data) => {
    const container = $(`#${containerId}`);
    container.html(UIComponents.coinDetails(data));
  };

  const showReplaceModal = (newSymbol, existingCoins) => {
    const modalHTML = UIComponents.replaceModal(newSymbol, existingCoins);
    $("body").append(modalHTML);
    const modal = new bootstrap.Modal($("#replaceModal"));
    modal.show();
    return modal;
  };

  const removeModal = (modalId) => {
    $(`#${modalId}`).remove();
  };

  const updateToggleStates = (selectedReports) => {
    $(".coin-toggle").each(function () {
      const symbol = $(this).data("symbol");
      $(this).prop("checked", selectedReports.includes(symbol));
    });
  };

  const toggleCollapse = (collapseId, show) => {
    const element = $(`#${collapseId}`);
    if (show) {
      element.addClass("show").slideDown();
    } else {
      element.removeClass("show").slideUp();
    }
  };

  const hideElement = (selector) => {
    $(selector).addClass("d-none");
  };

  const showElement = (selector) => {
    $(selector).removeClass("d-none");
  };

  return {
    clearContent,
    showPage,
    showError,
    showInfo,
    showSpinner,
    displayCoins,
    showCoinDetails,
    showReplaceModal,
    removeModal,
    updateToggleStates,
    toggleCollapse,
    hideElement,
    showElement,
  };
})();
