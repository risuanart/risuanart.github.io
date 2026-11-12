// 購物車頁「您可能對此有興趣」：從 js/cart.js 的真實 PRODUCTS 挑 4 件
// 目前購物車裡還沒有的商品做推薦，每次重新整理隨機洗牌（不是固定依照
// PRODUCTS 物件裡的宣告順序），但洗牌後還是照規則篩選，不是純隨機：
// 1. 偵測購物車目前的商品屬於哪些技法（category）——如果購物車裡完全
//    沒有流動畫，強制挑 1 件流動畫進這 4 格；同理，沒有砂畫就強制挑
//    1 件砂畫進來。讓客人結帳前看得到自己這次「沒選到」的另一種技法，
//    不是只看到跟購物車內容同類型的東西。購物車兩種技法都有，或是
//    是空的（兩種都「沒有」，兩種各強制挑 1 件當預設組合）才會套用
//    這條規則，不是每次都強制。
// 2. 流動畫（category:"fluid-art"）最多只讓 1 件入選，避免 4 格裡一次
//    出現兩件流動畫，看起來像同一種材料包的重複推薦。
// 3. 砂畫（category:"sand-art"）入選的幾件彼此價格要不一樣，避免同時
//    推薦兩件剛好同價位的砂畫款式（例如都是 $640 的春聯砂畫材料包），
//    讓這組推薦看起來更有「選擇範圍」而不是同一層級的重複。
// 如果嚴格套用這些規則湊不滿 4 件（候選商品本來就少的情況），退回
// 補滿剩下的名額，不強行砍成少於 4 件。
// 卡片沿用 .shop-card 結構（跟 products-overview.js 同一套），外層
// grid 直接沿用 .shop-grid（固定兩欄，4 件自然排成 2x2，不用額外
// 調整欄數）。加入購物車按鈕沿用既有的 data-add-to-cart／
// initAddToCart() 機制，不是另外寫一套。
(function () {
  const PLUS_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';

  // 2026-10-23：跟商品總覽卡片（js/products-overview.js）同一套早鳥折扣
  // 呈現方式，原本這裡用的是購物車頁那套圓角藍底徽章
  // （priceDiscountHTML），這張卡片本來就是直接沿用 .shop-card 結構，
  // 理當跟真正的商品總覽卡片長一樣，不是另外一套樣式。
  function priceText(product) {
    if (!product.price) return "$__";
    return window.RisuanCart ? window.RisuanCart.priceDiscountHTMLPlain(product, 1) : `$${product.price.toLocaleString()}`;
  }

  function cardHTML(key, product, cart) {
    const variants = cart.VARIANT_OPTIONS[key];
    const defaultScheme = variants && variants[0];
    const url = (cart.PRODUCT_URLS && cart.PRODUCT_URLS[key]) || "#";
    const thumb = cart.thumbHTML({ productKey: key, scheme: defaultScheme || "" }, "shop-card__thumb");
    const variantInput = defaultScheme
      ? `<select class="variant-select" hidden aria-hidden="true"><option value="${defaultScheme}" selected></option></select>`
      : "";
    const discountActive = product.price && !product.noEarlyBird && cart.earlyBirdActive && cart.earlyBirdActive();
    const cornerBadge = discountActive ? `<span class="discount-badge-corner discount-badge-corner--standalone">SALE</span>` : "";
    const discountTagline = discountActive ? `<p class="shop-card__discount-tagline">${cart.EARLY_BIRD_TAGLINE}</p>` : "";
    return `
      <div class="shop-card" data-product-card>
        <a class="shop-card__media" href="${url}">${thumb}${cornerBadge}</a>
        <button type="button" class="shop-card__add" data-add-to-cart data-product="${key}" aria-label="加入購物車：${product.name}">${PLUS_ICON}</button>
        ${variantInput}
        <a class="shop-card__info" href="${url}">
          <p class="shop-card__name">${product.name}</p>
          ${discountTagline}
          <p class="shop-card__price price-text">${priceText(product)}</p>
        </a>
      </div>`;
  }

  const RECOMMEND_COUNT = 4;

  // Fisher-Yates 洗牌，每次重新整理順序都不一樣。
  function shuffle(arr) {
    const result = arr.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  // 依照上面說明的規則，從洗牌後的候選清單依序挑選，額滿就停。
  // forcedKeys（購物車缺的技法，見 init() 裡怎麼算）優先塞進去，
  // 之後才輪到洗牌後的候選名單照規則遞補。
  function pickDiverse(shuffledKeys, products, count, forcedKeys) {
    const picked = [];
    let fluidArtPicked = false;
    const usedSandArtPrices = new Set();

    function tryAdd(key) {
      if (picked.length >= count || picked.includes(key)) return;
      const product = products[key];
      if (product.category === "fluid-art" && fluidArtPicked) return;
      if (product.category === "sand-art" && usedSandArtPrices.has(product.price)) return;
      picked.push(key);
      if (product.category === "fluid-art") fluidArtPicked = true;
      if (product.category === "sand-art") usedSandArtPrices.add(product.price);
    }

    (forcedKeys || []).forEach(tryAdd);
    shuffledKeys.forEach(tryAdd);

    // 候選商品本來就少、規則湊不滿額度時，退回補滿剩下的名額，
    // 不要為了守規則硬是少顯示幾件。
    if (picked.length < count) {
      shuffledKeys.forEach((key) => {
        if (picked.length >= count || picked.includes(key)) return;
        picked.push(key);
      });
    }

    return picked;
  }

  function init() {
    const section = document.getElementById("cart-cross-sell");
    const grid = document.getElementById("cart-cross-sell-grid");
    if (!section || !grid || !window.RisuanCart) return;
    const cart = window.RisuanCart;

    // 只抓一次頁面載入當下的購物車內容排除掉，不是即時連動——加入推薦
    // 商品後這張卡片還是會留著，跟大部分電商「你可能也喜歡」的行為一致，
    // 不會加了就立刻從清單消失、讓人找不到剛剛按過的卡片。
    const cartItems = cart.readCart();
    const inCart = new Set(cartItems.map((item) => item.productKey));
    const cartCategories = new Set(
      cartItems
        .map((item) => cart.PRODUCTS[item.productKey] && cart.PRODUCTS[item.productKey].category)
        .filter(Boolean)
    );

    const pool = Object.keys(cart.PRODUCTS).filter(
      (key) => !cart.PRODUCTS[key].hidden && !inCart.has(key)
    );
    const shuffledPool = shuffle(pool);

    // 購物車缺哪個技法，就從洗牌後的名單裡找一件該技法的商品強制塞入
    // （見檔案開頭說明）；兩種技法都有的話這裡維持空陣列，交給下面
    // pickDiverse() 照規則隨機挑。
    const forced = [];
    ["fluid-art", "sand-art"].forEach((category) => {
      if (cartCategories.has(category)) return;
      const pick = shuffledPool.find(
        (key) => cart.PRODUCTS[key].category === category && !forced.includes(key)
      );
      if (pick) forced.push(pick);
    });

    const candidates = pickDiverse(shuffledPool, cart.PRODUCTS, RECOMMEND_COUNT, forced);

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
