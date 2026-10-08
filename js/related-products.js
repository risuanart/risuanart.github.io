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

  function cardHTML(key, product, cart) {
    const variants = cart.VARIANT_OPTIONS[key];
    const defaultScheme = variants && variants[0];
    const url = (cart.PRODUCT_URLS && cart.PRODUCT_URLS[key]) || "#";
    const thumb = cart.thumbHTML(
      { productKey: key, scheme: defaultScheme || "" },
      "related-card__thumb"
    );
    const eyebrow = CATEGORY_LABELS[product.category] || "";
    return `
      <a class="related-card" href="${url}">
        <div class="related-card__media">${thumb}</div>
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
