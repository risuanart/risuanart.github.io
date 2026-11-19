







(function () {
  function initProductTabs(root) {
    const buttons = root.querySelectorAll("[data-tab]");
    const panels = root.querySelectorAll("[data-tab-panel]");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => {
          const active = b === btn;
          b.classList.toggle("is-active", active);
          if (active) b.setAttribute("aria-current", "page");
          else b.removeAttribute("aria-current");
        });
        panels.forEach((panel) => {
          panel.hidden = panel.dataset.tabPanel !== btn.dataset.tab;
        });
      });
    });
  }

  function init() {
    document.querySelectorAll("[data-product-tabs]").forEach(initProductTabs);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
