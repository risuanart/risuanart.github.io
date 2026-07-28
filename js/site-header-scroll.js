// 頂部列（.site-header）預設透明，捲動經過內容時才切換成毛玻璃效果，
// 避免使用者還在最上方（後面沒有任何圖片/文字）時就出現一塊底色。
// 這幾個子頁的實際捲動容器是 .product-page（position:fixed + overflow-y:auto），
// 不是 window，所以要監聽 .product-page 的 scroll，不能用 window.scrollY。
(function () {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const scrollEl = document.querySelector(".product-page") || window;
  const getScrollTop = () =>
    scrollEl === window ? window.scrollY : scrollEl.scrollTop;

  const THRESHOLD = 4;

  function update() {
    header.classList.toggle("is-scrolled", getScrollTop() > THRESHOLD);
  }

  scrollEl.addEventListener("scroll", update, { passive: true });
  update();
})();
