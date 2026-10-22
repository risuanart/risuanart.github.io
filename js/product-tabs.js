/* product-tabs.js —— 商品頁的分頁切換（參考 orlo.co 的
   Description／Shipping & Payment 樣式，2026-10-22）。通用小元件：
   掃描 [data-product-tabs] 容器，點 [data-tab] 按鈕切換對應的
   [data-tab-panel]，彼此獨立、不依賴頁面其他邏輯。目前只有
   products/sand-art-fu/index.html 的 HTML 用到這組 data 屬性，其他
   商品頁沒有 [data-product-tabs]，這支檔案對它們完全是 no-op，可以
   放心讓 js/cart.js 之類的共用腳本一起載入也不會互相影響。 */

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
