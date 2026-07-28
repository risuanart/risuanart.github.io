/* products-overview.js —— 材料包總覽購物頁（/products/index.html）專用。

   2026-07-28 改版：參考 by-manifesto 案例頁的編輯式節奏（大留白、置中大標題、
   滿版照片與敘事文字交替、捲動進場淡入），拿掉原本可滑動的分類大圖與手風琴
   商品磚，改成由上往下的單一閱讀動線——每款商品是一個「小案例」區塊，內容
   全部展開顯示（滿版照片→內含清單＋敘事文字→規格選擇→價格→加入購物車→
   查看完整介紹連結），不用點開才看得到——跟四個敘事子頁並存，不取代，深入
   閱讀的訪客還是點得進完整介紹頁。

   商品資料完全不在這裡另外定義，全部讀 window.RisuanCart（js/cart.js，
   PRODUCTS／VARIANT_OPTIONS／SCHEME_NAMES）、window.RisuanFluidArt
   （js/product-gallery.js，COLOR_SCHEMES／IMG_BASE）、window.RisuanPatterns
   （js/sand-art-gallery.js，PATTERNS）——改價格／規格／色系故事只要改那三份
   原始資料，這裡自動跟著變。 */

(function () {
  // 展開內容不是敘事子頁全部內容的複製，是精簡摘要（代表照一張、故事文案
  // 取第一段、套組亮點只列幾項），完整版本永遠連回敘事子頁，兩處不會有
  // 兩份要各自維護的完整內容。
  const KIT_HIGHLIGHTS = {
    "fluid-art-light": ["空白畫布・15×15cm＋流動畫顏料＋字貼", "防污桌布、手套、圍裙、調色杯、架高杯", "包裝內附簡易中英圖解"],
    "fluid-art-gift": ["空白畫布・15×15cm、5×5cm 各一＋流動畫顏料＋字貼", "無痕上牆黏土、保護漆等完整配件", "完整說明書＋教學影片 QR Code"],
    "sand-art-light": ["砂畫底板＋分裝沙（依所選圖案既定色）", "排刷、夾子、一次性桌布", "包裝內附簡易圖示"],
    "sand-art-collection": ["5 款精選底板＋分裝沙＋26 色額外顏料組", "集沙盤、空白小罐、碎金箔", "空白黏貼紙試色練習"],
  };

  const PRODUCT_URLS = {
    "fluid-art-light": "fluid-art-light.html",
    "fluid-art-gift": "fluid-art-gift.html",
    "sand-art-light": "sand-art-light.html",
    "sand-art-collection": "sand-art-collection.html",
  };

  function photoHTML(src, alt) {
    return `<img src="${src}" alt="${alt}" loading="lazy">`;
  }

  const PLACEHOLDER_PHOTO_ICON = `<svg class="placeholder-box__icon" viewBox="0 0 24 24" width="1.8em" height="1.8em" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="1.5"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 16l-5.5-5.5a1 1 0 0 0-1.4 0L6 19"/></svg>`;

  function placeholderHTML(text) {
    return `<div class="placeholder-box placeholder-box--photo" aria-hidden="true">${PLACEHOLDER_PHOTO_ICON}<span class="placeholder-box__text">${text}</span></div>`;
  }

  // 依商品類型取得「目前規格的代表照＋一句話描述」，三種商品各自的資料來源
  // 不同（色系 vs 圖案 vs 固定組合），統一包成同一個介面讓 buildSpread() 不用
  // 分岔判斷太多次。
  function getVariantPreview(key, schemeKey) {
    const fluidArt = window.RisuanFluidArt;
    const patterns = window.RisuanPatterns;

    if (key === "fluid-art-light" || key === "fluid-art-gift") {
      const scheme = fluidArt.COLOR_SCHEMES[schemeKey];
      if (!scheme) return { photoHTML: "", desc: "" };
      const kitPhoto = scheme.kitPhoto;
      return {
        photoHTML: photoHTML(fluidArt.IMG_BASE + kitPhoto.file, kitPhoto.alt),
        desc: scheme.story.split(/\n\s*\n/)[0].replace(/\n/g, ""),
      };
    }
    if (key === "sand-art-light") {
      const p = patterns.PATTERNS[schemeKey];
      if (!p) return { photoHTML: "", desc: "" };
      return {
        photoHTML: placeholderHTML(`建議拍攝：${p.name}・${p.style}`),
        desc: `${p.style}・${p.colorDesc}，成品尺寸 ${p.size}cm（${p.material}）`,
      };
    }
    // sand-art-collection：固定 5 款組合，沒有可切換的規格。
    const names = patterns.COLLECTION_PATTERNS.map((k) => patterns.PATTERNS[k].shortLabel).join("、");
    return {
      photoHTML: placeholderHTML("建議拍攝：五款精選圖案成品合照"),
      desc: `固定精選：${names}`,
    };
  }

  // 每款商品一個「小案例」區塊：滿版照片→內含清單＋敘事文字→規格選擇／
  // 價格／加入購物車→查看完整介紹連結。內容一律展開顯示，不做手風琴收合。
  function buildSpread(cart, key) {
    const { PRODUCTS, VARIANT_OPTIONS, SCHEME_NAMES } = cart;
    const product = PRODUCTS[key];
    const variantKeys = product.hasVariant === false ? [] : VARIANT_OPTIONS[key] || [];
    const defaultScheme = variantKeys[0];
    const priceText = product.price > 0 ? `$${product.price.toLocaleString()}` : "$__";
    const productUrl = PRODUCT_URLS[key];
    const preview = getVariantPreview(key, defaultScheme);

    const article = document.createElement("article");
    article.className = "product-spread reveal";
    article.dataset.productCard = ""; // activeScheme() 掃描範圍用（跟原本手風琴磚一樣的機制）

    const selectHTML = variantKeys.length
      ? `<select class="variant-select product-spread__select" aria-label="選擇${product.name}的規格">${variantKeys
          .map((k) => `<option value="${k}">${SCHEME_NAMES[k] || k}</option>`)
          .join("")}</select>`
      : "";

    const kitHTML = (KIT_HIGHLIGHTS[key] || [])
      .map((line) => `<li><span aria-hidden="true">✦</span><span>${line}</span></li>`)
      .join("");

    article.innerHTML = `
      <div class="product-spread__photo">${preview.photoHTML}</div>
      <div class="product-spread__info">
        <div>
          <p class="product-spread__label">內含</p>
          <ul class="kit-list product-spread__kit">${kitHTML}</ul>
        </div>
        <div>
          <h2 class="product-spread__name">${product.name}</h2>
          <p class="product-spread__desc"></p>
          <p class="product-spread__tagline">${product.tagline || ""}</p>
        </div>
      </div>
      <div class="product-spread__buy">
        ${selectHTML}
        <p class="product-spread__price">${priceText}</p>
        <button type="button" class="work__cta work__cta--primary product-spread__add" data-add-to-cart data-product="${key}">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>
          <span class="work__cta-label">加入購物車</span>
        </button>
      </div>
      <a class="text-link product-spread__more" href="${productUrl}">查看完整介紹 →</a>
    `;

    const descEl = article.querySelector(".product-spread__desc");
    descEl.textContent = preview.desc;

    // 規格切換時，照片／描述跟著換（跟主商品敘事子頁的色系切換是同一套概念）。
    const select = article.querySelector(".product-spread__select");
    if (select) {
      const photoEl = article.querySelector(".product-spread__photo");
      select.addEventListener("change", () => {
        const p = getVariantPreview(key, select.value);
        descEl.textContent = p.desc;
        photoEl.innerHTML = p.photoHTML;
      });
    }

    return article;
  }

  // 捲動進場淡入：跟首頁 .content-list 同一套「IntersectionObserver 加
  // is-visible class」邏輯（見 css/home.css），套用在這頁所有 .reveal 元素
  // 上（含靜態的標題／引言，以及這裡動態建出來的商品區塊）。一旦淡入就不用
  // 再觀察，不會因為使用者上下滑動而反覆淡入淡出。
  function initRevealAnimations() {
    const targets = document.querySelectorAll(".reveal");
    if (!targets.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    targets.forEach((el) => observer.observe(el));
  }

  function init() {
    const cart = window.RisuanCart;
    const grid = document.querySelector(".overview-grid");
    if (!cart || !grid || !window.RisuanFluidArt || !window.RisuanPatterns) return;

    const { PRODUCTS, CATEGORY_ORDER, CATEGORY_LABELS } = cart;

    // hidden: true 的品項（主商品頁「延伸創作」的加購項目，例如額外顏色沙）
    // 不是訪客會在這頁單獨瀏覽選購的商品，跳過不建區塊（見 js/cart.js
    // PRODUCTS 註解）。
    const byCategory = new Map();
    Object.keys(PRODUCTS).forEach((key) => {
      if (PRODUCTS[key].hidden) return;
      const cat = PRODUCTS[key].category || "other";
      if (!byCategory.has(cat)) byCategory.set(cat, []);
      byCategory.get(cat).push(key);
    });

    grid.innerHTML = "";
    CATEGORY_ORDER.forEach((cat) => {
      const keys = byCategory.get(cat);
      if (!keys || !keys.length) return;

      const section = document.createElement("section");
      section.className = "overview-group";
      section.id = `group-${cat}`;

      const label = document.createElement("p");
      label.className = "overview-group__label reveal";
      label.textContent = CATEGORY_LABELS[cat] || cat;
      section.appendChild(label);

      keys.forEach((key) => {
        section.appendChild(buildSpread(cart, key));
      });

      grid.appendChild(section);
    });

    // 區塊是剛剛才動態建出來的，cart.js 自己 init() 時掃過一次「加入購物車」
    // 按鈕，那時候這些區塊還不存在、掃不到——這裡重新呼叫一次同一支函式，
    // 讓新按鈕也掛上「加入購物車」的行為，不是另外寫一套判斷邏輯。
    cart.initAddToCart();
    initRevealAnimations();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
