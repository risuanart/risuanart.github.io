/* related-products.js —— 商品頁底部「相關商品」橫向捲動列：跨商品導流用，
   跟同頁的 .addon-carousel（本商品的加購配件）不是同一回事——那是「你可能
   還需要」，這裡是「你可能也會喜歡別款材料包」。資料直接讀 window.RisuanCart
   暴露的 PRODUCTS（跟 js/products-overview.js 同一份來源），不在這裡另外
   寫死一份商品清單。

   套在 [data-related-products] 容器上，用 data-exclude="商品鍵" 排除目前
   頁面自己這一款，隱藏的加購項目（PRODUCTS 裡標 hidden:true）一律不列入。 */

(function () {
  // 卡片眉標文字，跟 js/products-overview.js 的 CATEGORY_LABELS 同一份對應，
  // 兩邊分開維護是因為一個是商品卡眉標、一個是購物車分組標題，用途不同、
  // 本來就各自獨立一份（cart.js 裡 CATEGORY_LABELS 也是分開兩份的先例）。
  const CATEGORY_LABELS = {
    "fluid-art": "流動畫材料包",
    "sand-art": "砂畫材料包",
  };

  function priceText(product) {
    return product.price ? `$${product.price.toLocaleString()}` : "$__";
  }

  // 跟 js/products-overview.js 的 carouselThumbHTML() 同一套邏輯：有配色
  // 動態展示素材的商品（cart.PRODUCT_COLORWAY_FRAMES 查得到）輸出多張疊圖
  // 讓 js/hero-colorway-carousel.js 接手播放，沒有的商品退回單張靜態圖。
  function carouselFramesHTML(product, frames, className) {
    return frames
      .map((src, i) => {
        const alt = i === 0 ? `${product.name} 成品參考圖（出貨配色）` : "";
        const activeClass = i === 0 ? " is-active" : "";
        const hiddenAttr = i === 0 ? "" : ` aria-hidden="true"`;
        return `<img class="${className}${activeClass}" src="${src}" alt="${alt}"${hiddenAttr} loading="lazy" data-carousel-frame>`;
      })
      .join("");
  }

  function cardHTML(key, product, cart) {
    const variants = cart.VARIANT_OPTIONS[key];
    const defaultScheme = variants && variants[0];
    const url = (cart.PRODUCT_URLS && cart.PRODUCT_URLS[key]) || "#";
    const colorwayFrames = cart.PRODUCT_COLORWAY_FRAMES && cart.PRODUCT_COLORWAY_FRAMES[key];
    const thumb = colorwayFrames
      ? carouselFramesHTML(product, colorwayFrames, "related-card__thumb")
      : cart.thumbHTML({ productKey: key, scheme: defaultScheme || "" }, "related-card__thumb");
    // 跟首圖／商品總覽格狀卡不同，這裡用 data-carousel-loop 讓它播完一輪
    // 不停、重頭再播——「相關商品」在頁面偏下方，訪客通常滑到這裡時，
    // 「播一輪就停」早就播完停在主圖了，等於看不到配色動態展示的效果。
    const carouselAttr = colorwayFrames ? " data-hero-carousel data-carousel-loop" : "";
    const eyebrow = CATEGORY_LABELS[product.category] || "";
    return `
      <a class="related-card" href="${url}">
        <div class="related-card__media"${carouselAttr}>${thumb}</div>
        <div class="related-card__body">
          <p class="related-card__eyebrow">${eyebrow}</p>
          <p class="related-card__name">${product.shortName || product.name}</p>
          <p class="related-card__price price-text">${priceText(product)}</p>
        </div>
      </a>`;
  }

  function initSection(section, cart) {
    const track = section.querySelector(".related-products__track");
    if (!track) return;

    const exclude = section.dataset.exclude;
    const html = Object.keys(cart.PRODUCTS)
      .filter((key) => key !== exclude && !cart.PRODUCTS[key].hidden)
      .map((key) => cardHTML(key, cart.PRODUCTS[key], cart))
      .join("");
    track.innerHTML = html;

    // 卡片是剛剛才動態建出來的，js/hero-colorway-carousel.js 載入時掃不到，
    // 這裡建好後手動呼叫一次（跟 js/products-overview.js 同一個理由）。
    if (window.HeroColorwayCarousel) {
      window.HeroColorwayCarousel.initAll(track);
    }

    const prevBtn = section.querySelector(".related-products__nav--prev");
    const nextBtn = section.querySelector(".related-products__nav--next");
    if (!prevBtn || !nextBtn) return;

    function scrollStep() {
      const card = track.querySelector(".related-card");
      if (!card) return track.clientWidth;
      const style = window.getComputedStyle(track);
      const gap = parseFloat(style.columnGap || style.gap || "0");
      return card.getBoundingClientRect().width + gap;
    }

    prevBtn.addEventListener("click", () => {
      track.scrollBy({ left: -scrollStep(), behavior: "smooth" });
    });
    nextBtn.addEventListener("click", () => {
      track.scrollBy({ left: scrollStep(), behavior: "smooth" });
    });
  }

  function init() {
    if (!window.RisuanCart) return;
    const cart = window.RisuanCart;
    document
      .querySelectorAll("[data-related-products]")
      .forEach((section) => initSection(section, cart));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
