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
  // 卡片相對於全部卡片裡最大尺寸的比例，轉成圖片四周的留白百分比，
  // 讓視覺大小反映實際成品尺寸差異。沒有標 sizeCm 的商品（流動畫等不是
  // 乾淨去背菱形圖的）維持原本滿版鋪滿，不強制套用這套比例。
  //
  // MAX_FILL_RATIO：使用者反饋最大尺寸的商品（目前是 20cm 羊Diss舞蹈）
  // 滿版鋪滿（留白 0%）看起來太大，改成最大尺寸也留一點邊（82% 滿版），
  // 其他商品依「20cm 改小後的新基準」照比例再縮小，不是相對滿版的
  // 100% 去算，兩層縮放疊在一起算進同一個 padding 百分比裡。
  const MAX_FILL_RATIO = 0.82;

  function sizeScalePadding(sizeCm, maxSizeCm) {
    if (!sizeCm || !maxSizeCm) return null;
    const ratio = (sizeCm / maxSizeCm) * MAX_FILL_RATIO;
    const paddingPercent = ((1 - ratio) / 2) * 100;
    return paddingPercent > 0.05 ? paddingPercent : 0;
  }

  // 2026-10-24 新增：參考 orlo.co 商品卡片下方可以直接點縮圖切換顏色的
  // 做法——有多個色號可選的商品（12 色漸層沙／24 色任選組），卡片上原本
  // 只顯示預設色，使用者要進商品頁才看得到其他色。這裡在卡片裡加一排
  // 小縮圖，點了就直接換主圖＋更新 .variant-select 的值（給「加入購物
  // 車」讀取），不用整頁跳轉。只有 2 個以上色號的商品才輸出這排（單一
  // 配色的商品只有一個選項，點了也沒有變化，不需要這排 UI）。
  function swatchesHTML(variants, cart) {
    if (!variants || variants.length < 2) return "";
    const chips = variants
      .map((scheme, i) => {
        const src = cart.schemeImageSrc(scheme);
        const name = cart.SCHEME_NAMES[scheme] || scheme;
        const activeClass = i === 0 ? " is-active" : "";
        const bg = src ? ` style="background-image:url('${src}')"` : "";
        return `<button type="button" class="shop-card__swatch${activeClass}" data-swatch-scheme="${scheme}" aria-label="${name}"${bg}></button>`;
      })
      .join("");
    return `<div class="shop-card__swatches" role="group" aria-label="選擇色號">${chips}</div>`;
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
    // 2026-10-24：原本固定只放第一個選項（反正只是給「加入購物車」讀取
    // 預設規格用），現在卡片上多了可以切換色號的縮圖排（見下面
    // swatchesHTML()），<select> 要放「全部」選項，點縮圖時才能把這個
    // <select> 的 value 換成對應色號——initSwatches() 靠 cart.js 既有的
    // activeScheme() 讀 .variant-select 的值，不用另外教 initAddToCart()
    // 認得新的資料來源。
    const variantInput = defaultScheme
      ? `<select class="variant-select" hidden aria-hidden="true">${variants.map((v, i) => `<option value="${v}"${i === 0 ? " selected" : ""}></option>`).join("")}</select>`
      : "";
    const swatches = swatchesHTML(variants, cart);
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
        ${swatches}
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

  function initShopGrid() {
    const grid = document.getElementById("shop-grid");
    if (!grid || !window.RisuanCart) return;

    const cart = window.RisuanCart;
    let visibleKeys = Object.keys(cart.PRODUCTS).filter((key) => !cart.PRODUCTS[key].hidden);
    // 2026-10-24：首頁「流動畫／砂畫」分類區塊的「更多」按鈕連到這裡，
    // 帶 ?category=fluid-art／sand-art，讓商品總覽頁直接落在對應分類，
    // 不是連過來才發現沒有真的篩選、看到一樣的全部商品。
    const categoryParam = new URLSearchParams(window.location.search).get("category");
    if (categoryParam) {
      visibleKeys = visibleKeys.filter((key) => cart.PRODUCTS[key].category === categoryParam);
    }
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

  // 2026-10-24：首頁「流動畫／砂畫」分類區塊（參考 miyukifactory.com 的
  // 新品／精選分區，見 css/hub-blocks.css 說明）——跟上面 init() 的
  // #shop-grid 是不同元素（[data-shop-grid-category]），兩套邏輯不會
  // 互相影響：商品總覽頁只有 #shop-grid，首頁只有這幾個分類 grid，不會
  // 同一頁兩套都跑到。卡片一樣重用 cardHTML()，不是另外寫一份。
  function initCategoryGrids() {
    const grids = document.querySelectorAll("[data-shop-grid-category]");
    if (!grids.length || !window.RisuanCart) return;
    const cart = window.RisuanCart;

    grids.forEach((grid) => {
      const category = grid.dataset.shopGridCategory;
      const limit = parseInt(grid.dataset.shopGridLimit, 10) || Infinity;
      const keys = Object.keys(cart.PRODUCTS)
        .filter((key) => !cart.PRODUCTS[key].hidden && cart.PRODUCTS[key].category === category)
        .slice(0, limit);
      const maxSizeCm = keys.reduce((max, key) => {
        const sizeCm = cart.PRODUCTS[key].sizeCm;
        return sizeCm && sizeCm > max ? sizeCm : max;
      }, 0);
      grid.innerHTML = keys.map((key) => cardHTML(key, cart.PRODUCTS[key], cart, maxSizeCm)).join("");
    });

    cart.initAddToCart();
    if (window.HeroColorwayCarousel) {
      grids.forEach((grid) => window.HeroColorwayCarousel.initAll(grid));
    }
  }

  // 2026-10-24 新增：卡片色號縮圖的點擊行為，用事件代理掛在 document
  // 上（不是個別卡片各自綁一次），因為卡片是動態建出來的，而且商品總覽
  // 頁／首頁分類區塊可能同時存在、各自重複呼叫 render，掛一次代理就能
  // 涵蓋所有現在跟之後建出來的卡片，不用每次重新渲染後再重新綁定。
  function initSwatchSwitching() {
    document.addEventListener("click", (e) => {
      const chip = e.target.closest(".shop-card__swatch");
      if (!chip) return;
      const card = chip.closest(".shop-card");
      if (!card) return;
      const scheme = chip.dataset.swatchScheme;

      card.querySelectorAll(".shop-card__swatch").forEach((c) => c.classList.toggle("is-active", c === chip));

      // 主縮圖只有一張 <img class="shop-card__thumb">（有配色輪播／hover
      // 換圖的商品不會同時有色號選擇器，見 cardHTML() 說明，不會選到
      // 錯的那張）。背景圖網址直接從縮圖按鈕自己的 background-image
      // 讀出來，不用再查一次 cart.SCHEME_IMAGES，瀏覽器已經幫忙解析好
      // 完整網址，兩邊資料來源保證一致。
      const mainImg = card.querySelector(".shop-card__media .shop-card__thumb");
      const bg = getComputedStyle(chip).backgroundImage;
      const match = bg.match(/url\(["']?(.*?)["']?\)/);
      if (mainImg && match) mainImg.src = match[1];

      const select = card.querySelector(".variant-select");
      if (select) select.value = scheme;
    });
  }

  function init() {
    initShopGrid();
    initCategoryGrids();
    initSwatchSwitching();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
