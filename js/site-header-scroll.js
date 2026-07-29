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

  // 左上角「← 返回」預設回到瀏覽器上一頁，不要一律直接跳回首頁——
  // href 保留首頁連結當作沒有上一頁時（例如從外部連結直接開啟）的備援。
  // 有 data-back-fixed 的頁面（目前只有購物車頁）不套用這個行為，維持
  // 單純的 <a href>——購物車結帳流程會整頁導去綠界電子地圖選門市再導回來，
  // history.back() 這時候會回到綠界那個頁面，該頁常常已經過期／不給快取，
  // 點回去會出現 ERR_CACHE_MISS，不如固定回材料包母頁。
  const backLink = header.querySelector(".site-header__back");
  if (backLink && !backLink.hasAttribute("data-back-fixed")) {
    backLink.addEventListener("click", (e) => {
      if (window.history.length > 1) {
        e.preventDefault();
        window.history.back();
      }
    });
  }
})();
