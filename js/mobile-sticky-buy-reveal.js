/* mobile-sticky-buy-reveal.js —— 手機固定購買列（.mobile-sticky-buy）
   不該跟頁面裡原本那條 .product-buy-bar 同時出現在畫面上（兩組
   「加入購物車／直接購買」重複），2026-10-25 使用者反饋。

   用 IntersectionObserver 盯著 .product-buy-bar：那條還在畫面裡、或
   使用者根本還沒捲到那裡（都是 isIntersecting 以外、但 boundingRect
   還在視窗下方的情況）時，固定列維持隱藏；只有 .product-buy-bar 整個
   捲出畫面「上緣」之後（boundingClientRect.bottom < 0）才淡入固定列，
   捲回來看到 .product-buy-bar 立刻淡出，不會兩組同時出現。

   只有 products/sand-art-fu/index.html 同時有這兩個元素，其他頁面沒有
   .mobile-sticky-buy，這支腳本開頭就會直接 return，對它們無影響。 */
(function () {
  const sticky = document.querySelector(".mobile-sticky-buy");
  const trigger = document.querySelector(".product-buy-bar");
  if (!sticky || !trigger || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      const scrolledPast = !entry.isIntersecting && entry.boundingClientRect.bottom < 0;
      sticky.classList.toggle("is-visible", scrolledPast);
    },
    { threshold: 0 }
  );

  observer.observe(trigger);
})();
