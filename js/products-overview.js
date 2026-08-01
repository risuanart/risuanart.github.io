/* products-overview.js —— 材料包總覽購物頁（products/shop.html）：格狀商品卡，
   讀 window.RisuanCart 暴露的商品資料動態產生，不在這裡另外寫死一份商品清單——
   改價格／新增商品只要改 js/cart.js 的 PRODUCTS，這頁會自動跟著變。
   加購項目（PRODUCTS 裡標記 hidden:true，例如「延伸創作」的額外顏色沙／純貼紙）
   不是訪客會在這頁單獨瀏覽、選購的品項，過濾掉。

   每張卡片右上角「+」快速加入購物車，跟主商品頁共用同一套 initAddToCart()／
   data-add-to-cart 機制，不另外寫一套加入購物車邏輯。有色系／圖案可選的商品
   （VARIANT_OPTIONS 裡有列的），卡片裡放一個隱藏的 .variant-select，固定選
   第一個選項當快速加入的預設規格——activeScheme() 本來就支援讀 .variant-select
   的值當備援（見 cart.js），這裡沿用同一個路徑，不用另外教 initAddToCart()
   認得新的資料來源。密集格狀版面暫時不塞完整選色器，之後若要讓使用者在這裡
   也能選規格，再另外做。 */
(function () {
  const PLUS_ICON =
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';

  function priceText(product) {
    return product.price ? `$${product.price.toLocaleString()}` : "$__";
  }

  function cardHTML(key, product, cart) {
    const variants = cart.VARIANT_OPTIONS[key];
    const defaultScheme = variants && variants[0];
    const url = (cart.PRODUCT_URLS && cart.PRODUCT_URLS[key]) || "#";
    const thumb = cart.thumbHTML({ productKey: key, scheme: defaultScheme || "" }, "shop-card__thumb");
    // 電腦版 hover 換圖：只有「查得到第二張圖」的商品才輸出這個 <img>——
    // 目前只有流動畫兩個色系有真的第二張照片（內容物全展開，跟主圖不同
    // 角度），砂畫還沒有任何實拍素材，就不會有這個元素，CSS 那邊也不會有
    // 東西可以換，不是刻意關掉 hover 效果。
    const detailSrc = defaultScheme && cart.detailImageSrc ? cart.detailImageSrc(defaultScheme) : null;
    const hoverThumb = detailSrc
      ? `<img class="shop-card__thumb shop-card__thumb--hover" src="${detailSrc}" alt="" aria-hidden="true" loading="lazy">`
      : "";
    // 隱藏的規格輸入只在「這個商品真的有規格可選」時才輸出，沒有變體的商品
    // （例如自由創作組）維持跟它主商品頁按鈕一樣，不带 scope 內的 chip／select，
    // activeScheme() 自然 fallback 成 "default"。
    const variantInput = defaultScheme
      ? `<select class="variant-select" hidden aria-hidden="true"><option value="${defaultScheme}" selected></option></select>`
      : "";
    return `
      <div class="shop-card" data-product-card>
        <a class="shop-card__media" href="${url}">${thumb}${hoverThumb}</a>
        <button type="button" class="shop-card__add" data-add-to-cart data-product="${key}" aria-label="加入購物車：${product.name}">${PLUS_ICON}</button>
        ${variantInput}
        <a class="shop-card__info" href="${url}">
          <p class="shop-card__name">${product.name}</p>
          <p class="shop-card__price price-text">${priceText(product)}</p>
        </a>
      </div>`;
  }

  const escapeHtml = (str) =>
    str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // 搜尋清單直接從同一份 PRODUCTS 產生（跟卡片同一個資料來源，不用另外
  // 手key 一份重複的商品名稱／價格），比對只看商品名稱本身——「流動畫」
  // 「砂畫」「禮盒版」這些字都已經是真實商品名稱的一部分，不用額外維護
  // 一份同義字關鍵字表。
  function buildSearchItems(cart) {
    return Object.keys(cart.PRODUCTS)
      .filter((key) => !cart.PRODUCTS[key].hidden)
      .map((key) => ({
        name: cart.PRODUCTS[key].name,
        price: priceText(cart.PRODUCTS[key]),
        href: (cart.PRODUCT_URLS && cart.PRODUCT_URLS[key]) || "#",
      }));
  }

  function matchItems(items, query) {
    // 用空白／頓號／逗號拆成多個關鍵字，每個都要命中才算符合（AND），
    // 這樣「流動畫 禮盒」這種組合查詢也能找到，不會只認得單一詞。
    const terms = query.trim().toLowerCase().split(/[\s,，、]+/).filter(Boolean);
    if (!terms.length) return null;
    return items.filter((item) => {
      const haystack = item.name.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
  }

  function initQuickNavSearch(cart) {
    const input = document.getElementById("materials-search");
    const results = document.getElementById("materials-search-results");
    if (!input || !results) return;

    const items = buildSearchItems(cart);

    function render(query) {
      const matches = matchItems(items, query);
      if (matches === null) {
        results.hidden = true;
        results.innerHTML = "";
        return;
      }
      results.innerHTML = matches.length
        ? matches
            .map(
              (item) =>
                `<li><a href="${item.href}"><span>${escapeHtml(item.name)}</span><span class="result-price price-text">${escapeHtml(item.price)}</span></a></li>`
            )
            .join("")
        : `<li><span class="no-result">找不到符合「${escapeHtml(query.trim())}」的材料包</span></li>`;
      results.hidden = false;
    }

    input.addEventListener("input", (e) => render(e.target.value));
    input.addEventListener("focus", (e) => {
      if (e.target.value.trim()) render(e.target.value);
    });
    // blur 比 click 先觸發，延遲收起清單讓點擊搜尋結果的連結來得及先跳轉。
    input.addEventListener("blur", () => {
      setTimeout(() => {
        results.hidden = true;
      }, 150);
    });
    input.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      const matches = matchItems(items, input.value);
      if (matches && matches.length === 1) window.location.href = matches[0].href;
    });
  }

  function init() {
    const grid = document.getElementById("shop-grid");
    if (!grid || !window.RisuanCart) return;

    const cart = window.RisuanCart;
    const html = Object.keys(cart.PRODUCTS)
      .filter((key) => !cart.PRODUCTS[key].hidden)
      .map((key) => cardHTML(key, cart.PRODUCTS[key], cart))
      .join("");
    grid.innerHTML = html;

    // 卡片是剛剛才動態建出來的，cart.js 自己 init() 時掃過一次「加入購物車」
    // 按鈕那時候這些卡片還不存在，這裡重新呼叫一次掛上點擊行為。
    cart.initAddToCart();

    initQuickNavSearch(cart);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
