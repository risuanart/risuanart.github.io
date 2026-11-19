












(function () {
  const PLUS_ICON =
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';



  const CATEGORY_LABELS = {
    "fluid-art": "流動畫材料包",
    "sand-art": "砂畫材料包",
  };

  function priceText(product) {
    if (!product.price) return "$__";





    return window.RisuanCart ? window.RisuanCart.priceDiscountHTMLPlain(product, 1) : `$${product.price.toLocaleString()}`;
  }






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














  const MAX_FILL_RATIO = 0.82;

  function sizeScalePadding(sizeCm, maxSizeCm) {
    if (!sizeCm || !maxSizeCm) return null;
    const ratio = (sizeCm / maxSizeCm) * MAX_FILL_RATIO;
    const paddingPercent = ((1 - ratio) / 2) * 100;
    return paddingPercent > 0.05 ? paddingPercent : 0;
  }







  function swatchesHTML(key, variants, cart) {






    const extraKeys = (cart.CARD_EXTRA_VARIANTS && cart.CARD_EXTRA_VARIANTS[key]) || [];
    if ((!variants || variants.length < 2) && !extraKeys.length) return "";
    const schemeChips = (variants || [])
      .map((scheme, i) => {
        const src = cart.schemeImageSrc(scheme);
        const name = cart.SCHEME_NAMES[scheme] || scheme;
        const activeClass = i === 0 ? " is-active" : "";
        const bg = src ? ` style="background-image:url('${src}')"` : "";
        return `<button type="button" class="shop-card__swatch${activeClass}" data-swatch-scheme="${scheme}" aria-label="${name}"${bg}></button>`;
      })
      .join("");
    const extraChips = extraKeys
      .map((extraKey) => {
        const product = cart.PRODUCTS[extraKey];
        if (!product) return "";
        const src = cart.PRODUCT_IMAGES && cart.PRODUCT_IMAGES[extraKey];
        const name = product.shortName || product.name;
        const bg = src ? ` style="background-image:url('${src}')"` : "";
        return `<button type="button" class="shop-card__swatch" data-swatch-product="${extraKey}" aria-label="${name}"${bg}></button>`;
      })
      .join("");
    return `<div class="shop-card__swatches" role="group" aria-label="選擇款式">${schemeChips}${extraChips}</div>`;
  }

  function cardHTML(key, product, cart, maxSizeCm) {
    const variants = cart.VARIANT_OPTIONS[key];
    const defaultScheme = variants && variants[0];
    let url = (cart.PRODUCT_URLS && cart.PRODUCT_URLS[key]) || "#";
    const colorwayFrames = cart.PRODUCT_COLORWAY_FRAMES && cart.PRODUCT_COLORWAY_FRAMES[key];
    const thumb = colorwayFrames
      ? carouselThumbHTML(key, product, colorwayFrames, "shop-card__thumb")
      : cart.thumbHTML({ productKey: key, scheme: defaultScheme || "" }, "shop-card__thumb");




    const carouselAttr = colorwayFrames ? " data-hero-carousel data-carousel-loop" : "";




    const detailSrc = !colorwayFrames && defaultScheme && cart.detailImageSrc ? cart.detailImageSrc(defaultScheme) : null;
    const hoverThumb = detailSrc
      ? `<img class="shop-card__thumb shop-card__thumb--hover" src="${detailSrc}" alt="" aria-hidden="true" loading="lazy">`
      : "";









    const variantInput = defaultScheme
      ? `<select class="variant-select" hidden aria-hidden="true">${variants.map((v, i) => `<option value="${v}"${i === 0 ? " selected" : ""}></option>`).join("")}</select>`
      : "";
    const swatches = swatchesHTML(key, variants, cart);
    const categoryLabel = CATEGORY_LABELS[product.category];
    const eyebrow = categoryLabel ? `<p class="shop-card__category">${categoryLabel}</p>` : "";





    const discountActive = product.price && !product.noEarlyBird && cart.earlyBirdActive && cart.earlyBirdActive();
    const discountBadge = discountActive
      ? `<span class="discount-badge-corner">SALE</span>`
      : "";
    const badgesWrap = discountBadge
      ? `<div class="shop-card__badges">${discountBadge}</div>`
      : "";



    const preorderNote = product.preorder && cart.PREORDER_NOTE
      ? `<p class="shop-card__preorder">${cart.PREORDER_NOTE_SHORT || cart.PREORDER_NOTE}</p>`
      : "";


    const discountTagline = discountActive
      ? `<p class="shop-card__discount-tagline">${product.earlyBirdTagline || cart.EARLY_BIRD_TAGLINE}</p>`
      : "";




    const insetPadding = sizeScalePadding(product.sizeCm, maxSizeCm);
    const thumbInsetStyle = insetPadding ? ` style="padding:${insetPadding.toFixed(2)}%"` : "";
    const thumbBlock = insetPadding
      ? `<div class="shop-card__thumb-inset"${thumbInsetStyle}>${thumb}${hoverThumb}</div>`
      : `${thumb}${hoverThumb}`;
    return `
      <div class="shop-card" data-product-card data-base-product="${key}">
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



    const categoryParam = new URLSearchParams(window.location.search).get("category");
    const categoryTitle = CATEGORY_LABELS[categoryParam];
    const title = document.querySelector('[data-shop-title]');
    if (title && categoryTitle) {
      title.textContent = categoryTitle;
      const english = document.querySelector('[data-shop-title-en]');
      if (english) english.textContent = categoryParam === 'fluid-art' ? 'FLUID ART KITS' : 'SAND ART KITS';
      document.title = `${categoryTitle}｜日宣繪畫室`;
    }
    if (window.ShopNavigation) {
      const nav = window.ShopNavigation;
      if (nav.selected.key) visibleKeys = visibleKeys.filter(key => nav.categoryFor(key) === nav.selected.key);
    } else if (categoryParam) {
      visibleKeys = visibleKeys.filter((key) => cart.PRODUCTS[key].category === categoryParam);
    }



    const maxSizeCm = visibleKeys.reduce((max, key) => {
      const sizeCm = cart.PRODUCTS[key].sizeCm;
      return sizeCm && sizeCm > max ? sizeCm : max;
    }, 0);
    const html = visibleKeys
      .map((key) => cardHTML(key, cart.PRODUCTS[key], cart, maxSizeCm))
      .join("");
    grid.innerHTML = html;



    cart.initAddToCart();



    if (window.HeroColorwayCarousel) {
      window.HeroColorwayCarousel.initAll(grid);
    }

    initQuickNavSearch(cart);
  }






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





  function initSwatchSwitching(cart) {
    document.addEventListener("click", (e) => {
      const chip = e.target.closest(".shop-card__swatch");
      if (!chip) return;
      const card = chip.closest(".shop-card");
      if (!card) return;
      const scheme = chip.dataset.swatchScheme;
      const swatchProduct = chip.dataset.swatchProduct;

      card.querySelectorAll(".shop-card__swatch").forEach((c) => c.classList.toggle("is-active", c === chip));






      const mainImg = card.querySelector(".shop-card__media .shop-card__thumb");
      const bg = getComputedStyle(chip).backgroundImage;
      const match = bg.match(/url\(["']?(.*?)["']?\)/);
      if (mainImg && match) mainImg.src = match[1];

      const select = card.querySelector(".variant-select");






      const addBtn = card.querySelector("[data-add-to-cart]");
      const priceEl = card.querySelector(".shop-card__price");
      const baseProduct = card.dataset.baseProduct;
      const targetKey = swatchProduct || baseProduct;
      const targetProduct = cart.PRODUCTS[targetKey];
      if (addBtn && targetKey) addBtn.dataset.product = targetKey;
      if (priceEl && targetProduct) priceEl.innerHTML = priceText(targetProduct);
      if (select) select.value = swatchProduct ? "" : scheme;
    });
  }

  function init() {
    initShopGrid();
    initCategoryGrids();
    if (window.RisuanCart) initSwatchSwitching(window.RisuanCart);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
