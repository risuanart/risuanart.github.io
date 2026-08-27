// 購物車頁「您可能對此有興趣」：從 js/cart.js 的真實 PRODUCTS 挑幾件目前
// 購物車裡還沒有的商品做推薦，最多 3 件（跟參考規格的 3 欄一致）。
// 卡片沿用 .shop-card 結構（跟 products-overview.js 同一套），但外層
// grid 是這支檔案自己的 .cart-cross-sell__grid，欄數／字級跟主要的
// .shop-grid（相關商品格狀列表）不同，所以沒有直接共用那個 class。
// 加入購物車按鈕沿用既有的 data-add-to-cart／initAddToCart() 機制，
// 不是另外寫一套。
(function () {
  const PLUS_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';

  function priceText(product) {
    return product.price ? `${product.price.toLocaleString()}` : "$__";
  }

  function cardHTML(key, product, cart) {
    const variants = cart.VARIANT_OPTIONS[key];
    const defaultScheme = variants && variants[0];
    const url = (cart.PRODUCT_URLS && cart.PRODUCT_URLS[key]) || "#";
    const thumb = cart.thumbHTML({ productKey: key, scheme: defaultScheme || "" }, "shop-card__thumb");
    const variantInput = defaultScheme
      ? `<select class="variant-select" hidden aria-hidden="true"><option value="${defaultScheme}" selected></option></select>`
      : "";
    return `
      <div class="shop-card" data-product-card>
        <a class="shop-card__media" href="${url}">${thumb}</a>
        <button type="button" class="shop-card__add" data-add-to-cart data-product="${key}" aria-label="加入購物車：${product.name}">${PLUS_ICON}</button>
        ${variantInput}
        <a class="shop-card__info" href="${url}">
          <p class="shop-card__name">${product.name}</p>
          <p class="shop-card__price price-text">${priceText(product)}</p>
        </a>
      </div>`;
  }

  function init() {
    const section = document.getElementById("cart-cross-sell");
    const grid = document.getElementById("cart-cross-sell-grid");
    if (!section || !grid || !window.RisuanCart) return;
    const cart = window.RisuanCart;

    // 只抓一次頁面載入當下的購物車內容排除掉，不是即時連動——加入推薦
    // 商品後這張卡片還是會留著，跟大部分電商「你可能也喜歡」的行為一致，
    // 不會加了就立刻從清單消失、讓人找不到剛剛按過的卡片。
    const inCart = new Set(cart.readCart().map((item) => item.productKey));
    const candidates = Object.keys(cart.PRODUCTS)
      .filter((key) => !cart.PRODUCTS[key].hidden && !inCart.has(key))
      .slice(0, 3);

    if (!candidates.length) {
      section.hidden = true;
      return;
    }

    grid.innerHTML = candidates.map((key) => cardHTML(key, cart.PRODUCTS[key], cart)).join("");
    cart.initAddToCart();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
