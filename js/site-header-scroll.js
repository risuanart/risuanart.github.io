// 頂部列（.site-header）預設透明，捲動經過內容時才切換成毛玻璃效果，
// 避免使用者還在最上方（後面沒有任何圖片/文字）時就出現一塊底色。
// 這幾個子頁的實際捲動容器是 .product-page（position:fixed + overflow-y:auto），
// 不是 window，所以要監聽 .product-page 的 scroll，不能用 window.scrollY。
(function () {
  const header = document.querySelector(".site-header");
  if (!header) return;

  // 跑馬燈列（首頁限定，見 css/home-shop.css .promo-bar）跟頂部列共用
  // 同一個捲動偵測，捲動超過門檻就一起隱藏，不是各自寫一套判斷。
  const promoBar = document.querySelector(".promo-bar");

  const scrollEl = document.querySelector(".product-page") || window;
  const getScrollTop = () =>
    scrollEl === window ? window.scrollY : scrollEl.scrollTop;

  const THRESHOLD = 4;

  function update() {
    const isScrolled = getScrollTop() > THRESHOLD;
    header.classList.toggle("is-scrolled", isScrolled);
    if (promoBar) promoBar.classList.toggle("is-scrolled", isScrolled);
  }

  scrollEl.addEventListener("scroll", update, { passive: true });
  update();

  // 左上角原本是「← 返回」文字連結（可能攔截成 history.back()），後來
  // 改成固定連回首頁的品牌 logo，2026-09-13 再統一改成漢堡選單按鈕
  // （見 js/site-menu.js），這裡從頭到尾都跟左上角本身的點擊行為無關，
  // 只負責頂部列的捲動毛玻璃效果，不用調整。
})();

// 共用回頂端：使用頁面真正的捲動容器，首頁則使用 window。
(function () {
  const scroller = document.querySelector('.product-page') || window;
  const header = document.querySelector('.site-header');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'site-back-top';
  button.hidden = true;
  button.setAttribute('aria-label', '回到頁面頂端');
  button.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20V4M5 11l7-7 7 7"/></svg>';
  const style = document.createElement('style');
  style.textContent = '.site-back-top{position:fixed;right:var(--space-6);bottom:calc(var(--space-6) + env(safe-area-inset-bottom,0px));z-index:24;width:44px;height:44px;display:grid;place-items:center;padding:0;border:0;border-radius:0;background:color-mix(in srgb,var(--page-bg) 65%,transparent);backdrop-filter:blur(6px);color:var(--color-text-primary);cursor:pointer}.site-back-top[hidden]{display:none}.site-back-top:focus-visible{outline:2px solid var(--color-brand);outline-offset:3px}body:has(dialog[open],.site-menu.is-open,.cart-sheet.is-open) .site-back-top{display:none}';
  document.head.appendChild(style);
  document.body.appendChild(button);
  const top = () => scroller === window ? window.scrollY : scroller.scrollTop;
  const update = () => { button.hidden = top() < 400; };
  function backTop() {
    scroller.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  }
  button.addEventListener('click', backTop);
  scroller.addEventListener('scroll', update, {passive:true});
  if (header) header.addEventListener('click', event => {
    if (event.target.closest('a,button,input,select,textarea,[role="button"],nav')) return;
    backTop();
  });
  update();
})();
