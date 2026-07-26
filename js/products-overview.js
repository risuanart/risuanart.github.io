/* products-overview.js —— 材料包總覽購物頁（/products/index.html）專用：手風琴式
   大圖磚，收合狀態只顯示代表照＋名稱＋一句話標語（參考 by-manifesto 那類大圖
   作品集頁面的視覺語彙），點下去在同一頁往下展開完整內容（代表照＋規格選擇＋
   套組亮點＋價格＋加入購物車＋連到完整介紹頁的連結），不用跳頁就能看到不同
   材料包的重點資訊——跟四個敘事子頁並存，不取代，深入閱讀的訪客還是點得進
   完整介紹頁。

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

  // 依商品類型取得「收合磚的代表照」與「展開後隨規格切換的代表照＋一句話
  // 描述」，三種商品各自的資料來源不同（色系 vs 圖案 vs 固定組合），統一
  // 包成同一個介面讓 buildTile() 不用分岔判斷太多次。
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

  function buildTile(cart, key) {
    const { PRODUCTS, VARIANT_OPTIONS, SCHEME_NAMES } = cart;
    const product = PRODUCTS[key];
    const variantKeys = product.hasVariant === false ? [] : VARIANT_OPTIONS[key] || [];
    const defaultScheme = variantKeys[0];
    const priceText = product.price > 0 ? `$${product.price.toLocaleString()}` : "$__";
    const productUrl = PRODUCT_URLS[key];
    const preview = getVariantPreview(key, defaultScheme);

    const article = document.createElement("article");
    article.className = "shop-tile";
    article.dataset.productCard = ""; // activeScheme() 掃描範圍用（跟總覽卡片一樣的機制）

    const panelId = `shop-tile-panel-${key}`;

    const selectHTML = variantKeys.length
      ? `<select class="variant-select shop-tile__select" aria-label="選擇${product.name}的規格">${variantKeys
          .map((k) => `<option value="${k}">${SCHEME_NAMES[k] || k}</option>`)
          .join("")}</select>`
      : "";

    const kitHTML = (KIT_HIGHLIGHTS[key] || [])
      .map((line) => `<li><span aria-hidden="true">✦</span><span>${line}</span></li>`)
      .join("");

    article.innerHTML = `
      <button type="button" class="shop-tile__toggle" aria-expanded="false" aria-controls="${panelId}">
        <span class="shop-tile__photo">${preview.photoHTML}</span>
        <span class="shop-tile__meta">
          <span class="shop-tile__name">${product.name}</span>
          <span class="shop-tile__tagline">${product.tagline || ""}</span>
        </span>
      </button>
      <div class="shop-tile__panel" id="${panelId}" hidden>
        <div class="shop-tile__panel-inner">
          <div class="shop-tile__panel-photo">${preview.photoHTML}</div>
          <p class="shop-tile__panel-desc"></p>
          <ul class="shop-tile__panel-kit">${kitHTML}</ul>
          <div class="shop-tile__panel-buy">
            ${selectHTML}
            <p class="shop-tile__panel-price">${priceText}</p>
            <button type="button" class="work__cta work__cta--primary shop-tile__panel-add" data-add-to-cart data-product="${key}">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>
              <span class="work__cta-label">加入購物車</span>
            </button>
          </div>
          <a class="text-link shop-tile__panel-more" href="${productUrl}">查看完整介紹 →</a>
        </div>
      </div>
    `;

    const descEl = article.querySelector(".shop-tile__panel-desc");
    descEl.textContent = preview.desc;

    // 規格切換時，展開內容的代表照／描述跟著換（跟收合磚的縮圖不同步——縮圖
    // 固定顯示第一個規格，只有展開後才需要即時反應客人正在看哪一款）。
    const select = article.querySelector(".shop-tile__select");
    if (select) {
      const panelPhoto = article.querySelector(".shop-tile__panel-photo");
      select.addEventListener("change", () => {
        const p = getVariantPreview(key, select.value);
        descEl.textContent = p.desc;
        panelPhoto.innerHTML = p.photoHTML;
      });
    }

    return article;
  }

  // 手風琴：整頁（跨兩個分類）同一時間只展開一張磚，展開另一張時先收合前一張
  // ——維持「收合狀態可以一次瀏覽很多產品」的初衷，不會因為好幾張都展開而
  // 變成一樣長的滑動頁。openTile 是模組層級變數（不是每個分類各自一份），
  // 這樣春聯流動畫展開一張時，切去春聯砂畫展開另一張，前一張才會正確收合。
  let openTile = null;

  function wireAccordionTile(tile) {
    const toggle = tile.querySelector(".shop-tile__toggle");
    const panel = tile.querySelector(".shop-tile__panel");

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";

      if (openTile && openTile !== tile) {
        openTile.querySelector(".shop-tile__toggle").setAttribute("aria-expanded", "false");
        openTile.querySelector(".shop-tile__panel").hidden = true;
      }

      toggle.setAttribute("aria-expanded", String(!isOpen));
      panel.hidden = isOpen;
      openTile = isOpen ? null : tile;

      if (!isOpen) {
        tile.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  function initCategoryHero() {
    const hero = document.querySelector(".category-hero[data-category-hero]");
    if (!hero) return;
    const track = hero.querySelector(".category-hero__track");
    const dotsWrap = hero.querySelector(".category-hero__dots");
    const panels = Array.from(track.querySelectorAll(".category-hero__panel"));
    if (!panels.length) return;

    const dots = panels.map((panel, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "category-hero__dot";
      dot.setAttribute("aria-label", `跳到${panel.querySelector(".category-hero__name").textContent}`);
      dot.setAttribute("aria-current", i === 0 ? "true" : "false");
      dotsWrap.appendChild(dot);
      return dot;
    });

    function markActive(i) {
      dots.forEach((d, idx) => d.setAttribute("aria-current", String(idx === i)));
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (mostVisible) markActive(panels.indexOf(mostVisible.target));
      },
      { root: track, threshold: [0.6] }
    );
    panels.forEach((panel) => observer.observe(panel));

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        panels[i].scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          inline: "center",
          block: "nearest",
        });
      });
    });
  }

  function init() {
    const cart = window.RisuanCart;
    const grid = document.querySelector(".overview-grid");
    if (!cart || !grid || !window.RisuanFluidArt || !window.RisuanPatterns) return;

    initCategoryHero();

    const { PRODUCTS, CATEGORY_ORDER, CATEGORY_LABELS } = cart;

    const byCategory = new Map();
    Object.keys(PRODUCTS).forEach((key) => {
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
      section.setAttribute("aria-label", CATEGORY_LABELS[cat] || cat);

      const tilesWrap = document.createElement("div");
      tilesWrap.className = "shop-tiles";
      keys.forEach((key) => {
        const tile = buildTile(cart, key);
        tilesWrap.appendChild(tile);
        wireAccordionTile(tile);
      });
      section.appendChild(tilesWrap);

      grid.appendChild(section);
    });

    // 磚是剛剛才動態建出來的，cart.js 自己 init() 時掃過一次「加入購物車」
    // 按鈕，那時候這些磚還不存在、掃不到——這裡重新呼叫一次同一支函式，
    // 讓新按鈕也掛上「加入購物車」的行為，不是另外寫一套判斷邏輯。
    cart.initAddToCart();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
