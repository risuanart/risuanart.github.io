/* product-price-discount.js —— 商品頁標題買列的價格（.work-heading__price）
   原本是寫死在 HTML 裡的靜態數字，跟購物車／商品總覽卡片不一樣，沒有走
   js/cart.js 那套動態渲染，早鳥折扣上線後這裡會對不起來（HTML 寫死的
   價格看不到折扣）。這支檔案在頁面載入時找到買列裡的主商品
   [data-add-to-cart]（跟 .work-heading__price 同一個 .work-heading__buy-row
   容器），對回 window.RisuanCart.PRODUCTS 查到的原價，用跟購物車同一套
   window.RisuanCart.priceDiscountHTML() 規則算出折扣後的顯示內容，直接
   覆寫原本寫死的文字——折扣期間過了（window.RisuanCart.earlyBirdPrice
   回傳 amount 0）就自動不出手，維持原本的純數字，不用屆時回來改 14 個
   商品頁的 HTML。 */
(function () {
  if (!window.RisuanCart) return;
  const { PRODUCTS, priceDiscountHTML } = window.RisuanCart;

  document.querySelectorAll(".work-heading__buy-row").forEach((row) => {
    const priceEl = row.querySelector(".work-heading__price");
    const addBtn = row.querySelector("[data-add-to-cart]");
    if (!priceEl || !addBtn) return;
    const product = PRODUCTS[addBtn.dataset.product];
    if (!product || !product.price) return;
    priceEl.innerHTML = priceDiscountHTML(product.price, 1);
  });
})();
