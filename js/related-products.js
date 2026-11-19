

(function () {



  const CATEGORY_LABELS = {
    "fluid-art": "流動畫材料包",
    "sand-art": "砂畫材料包",
    "colors": "色沙與裝飾",
    "surfaces": "底板與字貼",
    "tools": "工具與展示",
  };





  function priceText(product) {
    if (!product.price) return "$__";
    return window.RisuanCart ? window.RisuanCart.priceDiscountHTMLPlain(product, 1) : `$${product.price.toLocaleString()}`;
  }




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









    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!prefersReducedMotion) {
      const SPEED_PX_PER_SEC = 28;
      let rafId = null;
      let lastTs = null;
      let stoppedByUser = false;





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


  if (!window.RisuanCart && document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
