/* 商品頁底部推薦：材料包與搭配配件分列，沿用商品資料與既有橫滑卡片。 */

(function () {
  // 卡片眉標文字，跟 js/products-overview.js 的 CATEGORY_LABELS 同一份對應，
  // 兩邊分開維護是因為一個是商品卡眉標、一個是購物車分組標題，用途不同、
  // 本來就各自獨立一份（cart.js 裡 CATEGORY_LABELS 也是分開兩份的先例）。
  const CATEGORY_LABELS = {
    "fluid-art": "流動畫材料包",
    "sand-art": "砂畫材料包",
    "colors": "色沙與裝飾",
    "surfaces": "底板與字貼",
    "tools": "工具與展示",
  };

  // 2026-10-23：跟商品總覽卡片（js/products-overview.js）同一套早鳥折扣
  // 呈現方式——角標＋橘字 tagline＋priceDiscountHTMLPlain（價格本身不帶
  // 徽章），原本這裡用的是購物車頁那套圓角藍底徽章（priceDiscountHTML），
  // 跟商品頁／商品總覽不一致，使用者要求全站統一。
  function priceText(product) {
    if (!product.price) return "$__";
    return window.RisuanCart ? window.RisuanCart.priceDiscountHTMLPlain(product, 1) : `$${product.price.toLocaleString()}`;
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
    const eyebrow = CATEGORY_LABELS[window.ShopNavigation.categoryFor(key)] || "";
    const discountActive = product.price && !product.noEarlyBird && cart.earlyBirdActive && cart.earlyBirdActive();
    const cornerBadge = discountActive ? `<span class="discount-badge-corner discount-badge-corner--standalone">SALE</span>` : "";
    const discountTagline = discountActive ? `<p class="related-card__discount-tagline">${product.earlyBirdTagline || cart.EARLY_BIRD_TAGLINE}</p>` : "";
    return `
      <a class="related-card" href="${url}">
        <div class="related-card__media"${carouselAttr}>${thumb}${cornerBadge}</div>
        <div class="related-card__body">
          <p class="related-card__eyebrow">${eyebrow}</p>
          <p class="related-card__name">${product.shortName || product.name}</p>
          ${discountTagline}
          <p class="related-card__price price-text">${priceText(product)}</p>
        </div>
      </a>`;
  }

  function initSection(section, cart, keys) {
    const track = section.querySelector(".related-products__track");
    if (!track) return;

    const html = keys.map((key) => cardHTML(key, cart.PRODUCTS[key], cart)).join("");
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

    // 自動往右持續捲動：卡片列只是橫向捲動、沒有左右箭頭常駐可見
    // （箭頭平常透明，要 hover 才浮現），使用者滑到這個區塊很容易不知道
    // 右邊還有更多商品，光探頭一下使用者可能沒注意到，改成持續慢慢往右
    // 捲，捲到底就跳回開頭繼續捲，一直循環——這個區塊在頁面偏下方，跟
    // hero-colorway-carousel.js 給相關商品卡片縮圖用 data-carousel-loop
    // 的理由一樣：訪客通常滑到這裡時間點不固定，「捲一輪就停」容易停在
    // 使用者根本沒看到的狀態。滑鼠移進去暫停（手離開繼續），使用者一旦
    // 手動滑動／點箭頭，永久停止自動捲動、把控制權交還給使用者。
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!prefersReducedMotion) {
      const SPEED_PX_PER_SEC = 28;
      let rafId = null;
      let lastTs = null;
      let stoppedByUser = false;
      // track.scrollLeft 讀回來一定是整數（瀏覽器會把小數部分捨去），
      // 每禎只移動不到 1px 的話，讀回來再疊加等於每次都從同一個整數
      // 重新出發、小數部分永遠被捨掉，畫面看起來完全沒在動。改成自己
      // 用浮點數變數記錄「真正的」位置，只有寫入 scrollLeft 時才取整數，
      // 不要用讀回來的值當下一禎計算的基準。
      let pos = track.scrollLeft;

      function tick(ts) {
        if (lastTs === null) lastTs = ts;
        const dt = ts - lastTs;
        lastTs = ts;

        const max = track.scrollWidth - track.clientWidth;
        if (max > 0) {
          pos += (SPEED_PX_PER_SEC * dt) / 1000;
          if (pos >= max) pos = 0;
          track.scrollLeft = pos;
        }
        rafId = requestAnimationFrame(tick);
      }

      function pauseAutoScroll() {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        lastTs = null;
        pos = track.scrollLeft;
        // 卡片列本身用 scroll-snap-type:x mandatory 讓手動滑動／點箭頭時
        // 停在卡片邊界，自動捲動期間關掉它——不然瀏覽器會一直想把連續
        // 捲動的中間值吸附回最近的卡片邊界，跟 rAF 逐格微調互相打架，
        // 畫面會頓頓卡卡的。暫停／停止時恢復，交還給使用者手動操作用。
        track.style.scrollSnapType = "";
      }

      function resumeAutoScroll() {
        if (stoppedByUser || rafId) return;
        track.style.scrollSnapType = "none";
        rafId = requestAnimationFrame(tick);
      }

      function stopAutoScrollForGood() {
        stoppedByUser = true;
        pauseAutoScroll();
      }

      track.addEventListener("pointerdown", stopAutoScrollForGood);
      prevBtn.addEventListener("click", stopAutoScrollForGood);
      nextBtn.addEventListener("click", stopAutoScrollForGood);
      section.addEventListener("mouseenter", pauseAutoScroll);
      section.addEventListener("mouseleave", resumeAutoScroll);

      const startObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              resumeAutoScroll();
            } else {
              pauseAutoScroll();
            }
          });
        },
        { threshold: 0 }
      );
      startObserver.observe(track);
    }
  }

  function init() {
    if (!window.RisuanCart) return;
    const cart = window.RisuanCart;
    document.querySelectorAll("[data-related-products]").forEach((section) => {
      const chapter = section.closest(".chapter");
      if (!chapter) return;
      const current = cart.PRODUCTS[section.dataset.exclude];
      // 由商品分類路徑的正式分類區分材料包與配件，
      // 不以價格或是否參加早鳥判定，避免日後促銷調整改變分組。
      const isKit = (key) => ["sand-art", "fluid-art"].includes(window.ShopNavigation.categoryFor(key));
      const explicit = section.dataset.relatedKeys;
      const keys = (explicit ? explicit.split(",").map(key => key.trim()) : Object.keys(cart.PRODUCTS))
        .filter(key => cart.PRODUCTS[key] && key !== section.dataset.exclude && !cart.PRODUCTS[key].hidden);
      const kits = keys.filter(isKit);
      const compatible = key => {
        if (explicit || !current?.sizeCm) return true;
        if (key.startsWith("sand-art-frame-")) return key === `sand-art-frame-${current.sizeCm}`;
        if (key.startsWith("sand-art-baseboard")) return key === (current.sizeCm === 20 ? "sand-art-baseboard-artist" : "sand-art-baseboard");
        return true;
      };
      const accessories = keys.filter(key => !isKit(key) && compatible(key) && (explicit || !current ||
        cart.PRODUCTS[key].category === current.category || key === "fluid-art-wall-clay" ||
        key === "sand-art-metallic-trio"));
      const groups = [
        { title: "你可能也喜歡", keys: kits, kind: "kits" },
        { title: "搭配這款一起做", keys: accessories, kind: "accessories" }
      ].filter(group => group.keys.length);
      if (!groups.length) { chapter.hidden = true; return; }
      groups.forEach((group, index) => {
        const target = index === 0 ? chapter : chapter.cloneNode(true);
        target.querySelector(".chapter__title").textContent = group.title;
        const carousel = target.querySelector("[data-related-products]");
        carousel.dataset.relatedKind = group.kind;
        if (index) chapter.after(target);
        initSection(carousel, cart, group.keys);
      });
    });
  }

  // 頁尾載入時先建好兩區，讓後載入的 scroll-reveal 一併登記淡入。
  if (!window.RisuanCart && document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
