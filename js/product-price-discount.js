/* product-price-discount.js —— 商品頁標題買列的價格（.work-heading__price）
   原本是寫死在 HTML 裡的靜態數字，跟購物車／商品總覽卡片不一樣，沒有走
   js/cart.js 那套動態渲染，早鳥折扣上線後這裡會對不起來（HTML 寫死的
   價格看不到折扣）。這支檔案在頁面載入時找到買列裡的主商品
   [data-add-to-cart]（跟 .work-heading__price 同一個 .work-heading__buy-row
   容器），對回 window.RisuanCart.PRODUCTS 查到的原價，用跟購物車同一套
   window.RisuanCart.priceDiscountHTMLPlain() 規則算出折扣後的顯示內容，直接
   覆寫原本寫死的文字——折扣期間過了（window.RisuanCart.earlyBirdPrice
   回傳 amount 0）就自動不出手，維持原本的純數字，不用屆時回來改 14 個
   商品頁的 HTML。

   2026-10-18：早鳥折扣的呈現方式改成仿 koyama／simpleisstudio——價格旁邊
   不再掛圓角藍底徽章（priceDiscountHTMLPlain 不含徽章），改成：
   1. 買列價格上方一行橘色文字「EARLY BIRD · 10% OFF」（.work-heading__
      discount-tagline，文字來源 window.RisuanCart.EARLY_BIRD_TAGLINE）
   2. 首圖角落一個空心「SALE」角標（.discount-badge-corner），貼在
      .work__gallery-main 或 .work__intro-photo 容器裡——兩種首圖呈現
      方式都有，誰存在就貼誰，貼完就不會再貼第二次（hasAttribute 擋）。
   折扣期間過了，這兩個都不會出現，維持原本單純的版面。 */
(function () {
  if (!window.RisuanCart) return;
  const { PRODUCTS, priceDiscountHTMLPlain, earlyBirdActive, EARLY_BIRD_TAGLINE } = window.RisuanCart;

  document.querySelectorAll(".work-heading__buy-row").forEach((row) => {
    const priceEl = row.querySelector(".work-heading__price");
    const addBtn = row.querySelector("[data-add-to-cart]");
    if (!priceEl || !addBtn) return;
    const product = PRODUCTS[addBtn.dataset.product];
    if (!product || !product.price) return;
    priceEl.innerHTML = priceDiscountHTMLPlain(product.price, 1);

    if (earlyBirdActive() && !priceEl.dataset.discountTaglineInjected) {
      const tagline = document.createElement("p");
      tagline.className = "work-heading__discount-tagline";
      tagline.textContent = EARLY_BIRD_TAGLINE;
      priceEl.insertAdjacentElement("beforebegin", tagline);
      priceEl.dataset.discountTaglineInjected = "1";

      const header = row.closest(".work__intro");
      const photoWrap = header && header.querySelector(".work__gallery-main, .work__intro-photo");
      if (photoWrap && !photoWrap.querySelector(".discount-badge-corner")) {
        const badge = document.createElement("span");
        badge.className = "discount-badge-corner";
        badge.textContent = "SALE";
        photoWrap.appendChild(badge);
      }
    }

    // 2026-10-17 使用者要求目前所有在賣的商品都標示預購，文字來源跟
    // 商品總覽卡片（js/products-overview.js）同一個 window.RisuanCart.
    // PREORDER_NOTE，純文字接在價格下面，不加色塊／圖示。只插入一次
    // （這支腳本理論上只會在頁面載入時跑一次，但用 hasAttribute 擋一下
    // 比較保險，避免以後有人不小心讓這段邏輯跑第二次，價格下面疊兩行
    // 一樣的字）。
    if (product.preorder && window.RisuanCart.PREORDER_NOTE && !priceEl.dataset.preorderInjected) {
      const note = document.createElement("p");
      note.className = "work-heading__preorder";
      note.textContent = window.RisuanCart.PREORDER_NOTE;
      priceEl.insertAdjacentElement("afterend", note);
      priceEl.dataset.preorderInjected = "1";
    }
  });
})();
