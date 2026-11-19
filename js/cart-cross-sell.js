



















(function () {
  const PLUS_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';





  function priceText(product) {
    if (!product.price) return "$__";
    return window.RisuanCart ? window.RisuanCart.priceDiscountHTMLPlain(product, 1) : `$${product.price.toLocaleString()}`;
  }

  function cardHTML(key, product, cart) {
    const variants = cart.VARIANT_OPTIONS[key];
    const defaultScheme = variants && variants[0];
    const url = (cart.PRODUCT_URLS && cart.PRODUCT_URLS[key]) || "#";
    const frames = ["fluid-art-light-pearl", "fluid-art-light-pink", "fluid-art-light-frost", "fluid-art-light-red"].includes(key) && cart.PRODUCT_COLORWAY_FRAMES[key];
    const thumb = frames ? frames.map((src, i) => `<img class="shop-card__thumb${i === 0 ? " is-active" : ""}" src="${src}" alt="${i === 0 ? product.name : ""}" loading="lazy" data-carousel-frame>`).join("")
      : cart.thumbHTML({ productKey: key, scheme: defaultScheme || "" }, "shop-card__thumb");
    const variantInput = defaultScheme
      ? `<select class="variant-select" hidden aria-hidden="true"><option value="${defaultScheme}" selected></option></select>`
      : "";
    const discountActive = product.price && !product.noEarlyBird && cart.earlyBirdActive && cart.earlyBirdActive();
    const cornerBadge = discountActive ? `<span class="discount-badge-corner discount-badge-corner--standalone">SALE</span>` : "";
    const discountTagline = discountActive ? `<p class="shop-card__discount-tagline">${product.earlyBirdTagline || cart.EARLY_BIRD_TAGLINE}</p>` : "";
    return `
      <div class="shop-card" data-product-card>
        <a class="shop-card__media" href="${url}"${frames ? " data-hero-carousel data-carousel-loop" : ""}>${thumb}${cornerBadge}</a>
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


  function shuffle(arr) {
    const result = arr.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }




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
    if (window.HeroColorwayCarousel) window.HeroColorwayCarousel.initAll(grid);
    cart.initAddToCart();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
