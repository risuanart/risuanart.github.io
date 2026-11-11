/* mobile-sticky-buy-reveal.js —— 手機固定購買列（.mobile-sticky-buy）
   不該跟頁面裡原本那條 .product-buy-bar 同時出現在畫面上（兩組
   「加入購物車／直接購買」重複），2026-10-25 使用者反饋。

   用 IntersectionObserver 盯著 .product-buy-bar：那條還在畫面裡、或
   使用者根本還沒捲到那裡（都是 isIntersecting 以外、但 boundingRect
   還在視窗下方的情況）時，固定列維持隱藏；只有 .product-buy-bar 整個
   捲出畫面「上緣」之後（boundingClientRect.bottom < 0）才淡入固定列，
   捲回來看到 .product-buy-bar 立刻淡出，不會兩組同時出現。

   沒有 .mobile-sticky-buy 的頁面，這支腳本開頭就會直接 return，對它們
   無影響。

   2026-11-11：補上加購頁（漸層沙／金屬色／像框／24色等）的支援——這些
   頁面的買列是 .work-heading__buy-row（數量＋按鈕都包在同一列的
   .buy-action 裡面），不是 .product-buy-bar 那種獨立滿版 CTA 列，
   退回找 .work-heading__buy-row 當作捲動觸發點，邏輯完全一樣，不用
   另外寫一份。 */
(function () {
  const sticky = document.querySelector(".mobile-sticky-buy");
  const trigger = document.querySelector(".product-buy-bar") || document.querySelector(".work-heading__buy-row");
  if (!sticky || !trigger || !("IntersectionObserver" in window)) return;

  function update() {
    sticky.classList.toggle("is-visible", trigger.getBoundingClientRect().bottom < 0);
  }
  let scheduled = false;
  const scrollRoot = trigger.closest('.product-page') || window;
  scrollRoot.addEventListener('scroll', () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; update(); });
  }, { passive: true });
  window.addEventListener('resize', update);
  new IntersectionObserver(update, { threshold: 0 }).observe(trigger);
  update();
})();
