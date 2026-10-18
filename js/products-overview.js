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

  // 商品卡最上面那行小字（呼應選物店常見的「系列名」眉標），直接從
  // PRODUCTS 既有的 category 欄位對應過來，不是另外維護一份分類資料。
  const CATEGORY_LABELS = {
    "fluid-art": "流動畫材料包",
    "sand-art": "砂畫材料包",
  };

  function priceText(product) {
    if (!product.price) return "$__";
    // 早鳥折扣用 window.RisuanCart.priceDiscountHTMLPlain（見 js/cart.js）
    // 統一算，不在這裡另外寫一次規則，改折扣期間／折數只要改那一處。
    // 2026-10-18：改用「Plain」版本（不含圓角藍底徽章），徽章改成卡片縮圖
    // 角落的 SALE 角標＋標題下方的橘色文字行，見下面 discountBadge／
    // discountTagline。
    return window.RisuanCart ? window.RisuanCart.priceDiscountHTMLPlain(product.price, 1) : `$${product.price.toLocaleString()}`;
  }

  // 這 7 款單一配色沙畫在商品頁首圖已經有「配色動態展示」輪播（出貨配色→
  // 配色示範二→配色示範三→淡回出貨配色後停止，見 js/hero-colorway-carousel.js／
  // cart.js PRODUCT_COLORWAY_FRAMES），總覽格狀卡／首頁商品格狀套同一組圖＋
  // 同一套播放邏輯。格狀卡位置太小，不塞暫停鍵／進度點點——輪播本來就只
  // 播一輪就停，不循環，沒有控制元件也不會造成困擾。
  function carouselThumbHTML(key, product, frames, className) {
    const imgs = frames
      .map((src, i) => {
        const alt = i === 0 ? `${product.name} 成品參考圖（出貨配色）` : "";
        const activeClass = i === 0 ? " is-active" : "";
        const hiddenAttr = i === 0 ? "" : ` aria-hidden="true"`;
        return `<img class="${className}${activeClass}" src="${src}" alt="${alt}"${hiddenAttr} loading="lazy" data-carousel-frame>`;
      })
      .join("");
    return imgs;
  }

  // 2026-10-18 使用者反映格狀卡片裡，20×20cm 的羊Diss舞蹈 Sheep La
  // Danse 跟其他 15×15cm 的單一配色商品看起來一樣大——卡片縮圖容器固定
  // 正方形、圖滿版鋪滿（object-fit:cover），不管成品實際尺寸，所以沒有
  // 反映出真實比例落差，不是哪次調整時改壞的，是這套版面從一開始就
  // 沒有依實際尺寸縮放的機制。這裡用 PRODUCTS 的 sizeCm（cm）算出每張
  // 卡片相對於全部卡片裡最大尺寸的比例，轉成圖片四周的留白百分比——
  // 最大尺寸的商品滿版鋪滿（留白 0%），比較小的商品按比例內縮，視覺
  // 大小才會反映實際成品尺寸差異。沒有標 sizeCm 的商品（流動畫禮盒版等
  // 不是單一方形成品的）維持原本滿版鋪滿，不強制套用這套比例。
  function sizeScalePadding(sizeCm, maxSizeCm) {
    if (!sizeCm || !maxSizeCm) return null;
    const ratio = sizeCm / maxSizeCm;
    const paddingPercent = ((1 - ratio) / 2) * 100;
    return paddingPercent > 0.05 ? paddingPercent : 0;
  }

  function cardHTML(key, product, cart, maxSizeCm) {
    const variants = cart.VARIANT_OPTIONS[key];
    const defaultScheme = variants && variants[0];
    const url = (cart.PRODUCT_URLS && cart.PRODUCT_URLS[key]) || "#";
    const colorwayFrames = cart.PRODUCT_COLORWAY_FRAMES && cart.PRODUCT_COLORWAY_FRAMES[key];
    const thumb = colorwayFrames
      ? carouselThumbHTML(key, product, colorwayFrames, "shop-card__thumb")
      : cart.thumbHTML({ productKey: key, scheme: defaultScheme || "" }, "shop-card__thumb");
    const carouselAttr = colorwayFrames ? " data-hero-carousel" : "";
    // 電腦版 hover 換圖：只有「查得到第二張圖」的商品才輸出這個 <img>——
    // 目前只有流動畫兩個色系有真的第二張照片（內容物全展開，跟主圖不同
    // 角度）。有配色動態展示的商品（colorwayFrames 存在）兩套機制互斥，
    // 不會同時輸出 hover 換圖，避免 hover 跟自動輪播互相打架。
    const detailSrc = !colorwayFrames && defaultScheme && cart.detailImageSrc ? cart.detailImageSrc(defaultScheme) : null;
    const hoverThumb = detailSrc
      ? `<img class="shop-card__thumb shop-card__thumb--hover" src="${detailSrc}" alt="" aria-hidden="true" loading="lazy">`
      : "";
    // 隱藏的規格輸入只在「這個商品真的有規格可選」時才輸出，沒有變體的商品
    // （例如自由創作組）維持跟它主商品頁按鈕一樣，不带 scope 內的 chip／select，
    // activeScheme() 自然 fallback 成 "default"。
    const variantInput = defaultScheme
      ? `<select class="variant-select" hidden aria-hidden="true"><option value="${defaultScheme}" selected></option></select>`
      : "";
    const categoryLabel = CATEGORY_LABELS[product.category];
    const eyebrow = categoryLabel ? `<p class="shop-card__category">${categoryLabel}</p>` : "";
    // 2026-10-18 使用者要求拿掉「新品」標籤，不再標示。早鳥折扣角標
    // （SALE，空心框＋warning 橘色，跟商品頁首圖角落的 .discount-badge-
    // corner 同一套樣式）改用 .shop-card__badges 容器單獨包著，貼齊
    // 圖片左上角——雖然現在只剩這一個角標，容器還是保留，之後如果
    // 又有別的角標要加，接上同一套堆疊邏輯就好，不用重新設計版面。
    const discountActive = product.price && cart.earlyBirdActive && cart.earlyBirdActive();
    const discountBadge = discountActive
      ? `<span class="discount-badge-corner">SALE</span>`
      : "";
    const badgesWrap = discountBadge
      ? `<div class="shop-card__badges">${discountBadge}</div>`
      : "";
    // 2026-10-17 使用者要求目前所有在賣的商品都標示預購，文字來源見
    // js/cart.js PREORDER_NOTE 的說明——純文字（使用者選定的方向，
    // 不加色塊／圖示），放在價格下面。
    const preorderNote = product.preorder && cart.PREORDER_NOTE
      ? `<p class="shop-card__preorder">${cart.PREORDER_NOTE}</p>`
      : "";
    // 早鳥文字行放在標題下方、價格上方，跟商品頁買列同一套文字來源
    // （cart.EARLY_BIRD_TAGLINE），不是另外寫一次「EARLY BIRD · 10% OFF」。
    const discountTagline = discountActive
      ? `<p class="shop-card__discount-tagline">${cart.EARLY_BIRD_TAGLINE}</p>`
      : "";
    // 比例內縮：見上面 sizeScalePadding() 說明。padding 加在縮圖外面
    // 再包一層 .shop-card__thumb-inset，不是直接加在 .shop-card__media
    // 本身——角標（SALE）要留在 .shop-card__media 的實際邊角，不能跟著
    // 縮圖一起內縮。
    const insetPadding = sizeScalePadding(product.sizeCm, maxSizeCm);
    const thumbInsetStyle = insetPadding ? ` style="padding:${insetPadding.toFixed(2)}%"` : "";
    const thumbBlock = insetPadding
      ? `<div class="shop-card__thumb-inset"${thumbInsetStyle}>${thumb}${hoverThumb}</div>`
      : `${thumb}${hoverThumb}`;
    return `
      <div class="shop-card" data-product-card>
        <a class="shop-card__media" href="${url}"${carouselAttr}>${thumbBlock}${badgesWrap}</a>
        <button type="button" class="shop-card__add" data-add-to-cart data-product="${key}" aria-label="加入購物車：${product.name}">${PLUS_ICON}</button>
        ${variantInput}
        <a class="shop-card__info" href="${url}">
          <div class="shop-card__heading">
            ${eyebrow}
            <p class="shop-card__name">${product.shortName || product.name}</p>
          </div>
          ${discountTagline}
          <div class="shop-card__price-group">
            <p class="shop-card__price price-text">${priceText(product)}</p>
            ${preorderNote}
          </div>
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
    const visibleKeys = Object.keys(cart.PRODUCTS).filter((key) => !cart.PRODUCTS[key].hidden);
    // 比例內縮要用「目前這個格狀頁實際會顯示的商品」裡最大的 sizeCm 當
    // 基準，不是寫死 20——之後尺寸更大的商品上架，這裡會自動跟著調整，
    // 不用回來改這個數字。
    const maxSizeCm = visibleKeys.reduce((max, key) => {
      const sizeCm = cart.PRODUCTS[key].sizeCm;
      return sizeCm && sizeCm > max ? sizeCm : max;
    }, 0);
    const html = visibleKeys
      .map((key) => cardHTML(key, cart.PRODUCTS[key], cart, maxSizeCm))
      .join("");
    grid.innerHTML = html;

    // 卡片是剛剛才動態建出來的，cart.js 自己 init() 時掃過一次「加入購物車」
    // 按鈕那時候這些卡片還不存在，這裡重新呼叫一次掛上點擊行為。
    cart.initAddToCart();

    // 同理，js/hero-colorway-carousel.js 載入時這些卡片還不存在，它自己
    // 的自動掃描（initAll(document)）掃不到，這裡卡片建好後手動呼叫一次。
    if (window.HeroColorwayCarousel) {
      window.HeroColorwayCarousel.initAll(grid);
    }

    initQuickNavSearch(cart);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
