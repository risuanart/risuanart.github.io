/* account-widget.js —— 全站 header 的會員中心入口。
   點擊人頭圖示直接前往會員中心。登入狀態同步交給
   js/account-auth.js（window.RisuanAccount）。

   用 JS 動態插入圖示，不是直接寫進全站 42 個頁面的 HTML——
   這樣往後要調整結構／文案，只要改這一支檔案，不用一個個頁面改過去，
   也不會有「漏改某一頁」的風險。

   插入位置：塞進 .cart-badge-wrap 內部（當它的第一個子元素），不是在它
   旁邊另開一個新的固定定位容器——.cart-badge-wrap 本身在全站至少 4 份
   CSS（cart.css／home.css／home-shop.css／site-menu.css）依頁面模板／
   斷點各自有不同的 position／grid 版位覆寫（固定懸浮角落、header flex
   排版、header grid 排版都有各自的規則），如果帳號圖示另開一個容器，
   等於要把這整組覆寫規則原封不動在抄一份給新容器，任何一處漏改就會
   在某個頁面模板上位置跑掉。塞進既有容器內部，直接繼承它已經在每個
   模板都驗證過的版位，只需要讓 .cart-badge-wrap 本身多一個
   display:flex（見 css/cart.css 底部），不用動任何一條既有的版位規則。 */

(function () {
  function personIconSvg() {
    return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6"/></svg>`;
  }

  function buildWrap() {
    const wrap = document.createElement("div");
    wrap.className = "account-badge-wrap";
    wrap.innerHTML = `
      <a class="account-badge" href="${window.RisuanAccount.BASE_PREFIX}account/" aria-label="前往會員中心">
        ${personIconSvg()}
      </a>
    `;
    return wrap;
  }


  document.addEventListener("DOMContentLoaded", () => {
    const cartBadgeWrap = document.querySelector(".cart-badge-wrap");
    if (!cartBadgeWrap) return;

    const wrap = buildWrap();
    cartBadgeWrap.insertBefore(wrap, cartBadgeWrap.firstChild);

    window.RisuanAccount.syncProfile();
  });
})();
