/* products-overview.js —— 材料包總覽購物頁（/products/index.html）專用：依
   CATEGORY_ORDER 分組，把 window.RisuanCart 的商品資料動態畫成卡片網格。這是
   「快速決策路徑」，跟敘事型頁首＋子頁那條路徑並存、不取代（見工程任務指令二）。

   商品資料完全不在這裡另外定義，全部讀 window.RisuanCart（js/cart.js）——改
   價格／規格只要改 cart.js 那一份，這裡自動跟著變，不會有兩份資料兜不起來的
   問題。規格選擇一律用 <select>（不用小卡片網格）：這頁要同時緊湊呈現 4 張
   商品卡，服務的是「已經知道要選哪款、快速下單」的訪客，仔細比較的體驗留給
   敘事子頁（例如砂畫輕巧版的滑動選圖案）。 */

(function () {
  function buildCard(cart, key) {
    const { PRODUCTS, VARIANT_OPTIONS, SCHEME_NAMES, thumbHTML } = cart;
    const product = PRODUCTS[key];
    const variantKeys = product.hasVariant === false ? [] : VARIANT_OPTIONS[key] || [];
    const defaultScheme = variantKeys[0];
    const productUrl = `${key}.html`;
    const priceText = product.price > 0 ? `$${product.price.toLocaleString()}` : "$__";

    const selectHTML = variantKeys.length
      ? `<select class="variant-select" aria-label="選擇${product.name}的規格">${variantKeys
          .map((k) => `<option value="${k}">${SCHEME_NAMES[k] || k}</option>`)
          .join("")}</select>`
      : "";

    const article = document.createElement("article");
    article.className = "overview-card";
    article.dataset.productCard = "";
    article.innerHTML = `
      <a class="overview-card__thumb-link" href="${productUrl}">
        ${thumbHTML({ productKey: key, scheme: defaultScheme }, "overview-card__thumb")}
      </a>
      <div class="overview-card__body">
        <a class="overview-card__name" href="${productUrl}">${product.name}</a>
        ${selectHTML}
        <p class="overview-card__price">${priceText}</p>
        <button type="button" class="work__cta work__cta--primary overview-card__add" data-add-to-cart data-product="${key}">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>
          <span class="work__cta-label">加入購物車</span>
        </button>
      </div>
    `;
    return article;
  }

  // 頁面最上面的「分類大圖」：兩個分類各一張大圖，scroll-snap 橫向滑動，
  // 跟砂畫圖案選擇器（sand-art-gallery.js initPatternCarousel()）同一套手勢／
  // IntersectionObserver 判斷「目前滑到哪一張」的做法，維持全站滑動元件手感
  // 一致。點下去／滑到底會直接跳到下面對應分類的商品卡（見 init() 裡
  // section.id = `group-${cat}`）。
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
    if (!cart || !grid) return;

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
      // id 給頁面最上面的分類大圖（.category-hero__panel）當跳轉錨點用。
      section.id = `group-${cat}`;
      // 分類名稱已經由上面的分類大圖（.category-hero__name）呈現過一次，
      // 這裡不再重複一個文字標題，但保留 aria-label 讓螢幕報讀器仍然知道
      // 這個區塊是哪個分類（不是完全拿掉語意，只是不重複顯示文字）。
      section.setAttribute("aria-label", CATEGORY_LABELS[cat] || cat);

      const cardsWrap = document.createElement("div");
      cardsWrap.className = "overview-group__cards";
      keys.forEach((key) => cardsWrap.appendChild(buildCard(cart, key)));
      section.appendChild(cardsWrap);

      grid.appendChild(section);
    });

    // 卡片是剛剛才動態建出來的，cart.js 自己 init() 時掃過一次「加入購物車」
    // 按鈕，那時候這些卡片還不存在、掃不到——這裡重新呼叫一次同一支函式，
    // 讓新按鈕也掛上「加入購物車」的行為，不是另外寫一套判斷邏輯。
    cart.initAddToCart();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
