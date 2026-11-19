














(function () {
  const PATTERNS = {
    "nafu-wave": { name: "納福", shortLabel: "納福（波浪紋）", style: "波浪幾何紋", colorDesc: "深綠＋酒紅＋金字", size: 15, material: "純沙" },
    "yingchun-wave": { name: "迎春", shortLabel: "迎春（波浪紋）", style: "波浪幾何紋", colorDesc: "朱紅＋深藍＋金字", size: 15, material: "純沙＋特殊材質（待試色）" },
    "yingchun-grid": { name: "迎春", shortLabel: "格裡迎春 Checked in Chun", style: "格紋邊框＋植物（梅花／松枝）", colorDesc: "粉膚色底＋黑字", size: 20, material: "純沙" },
    "nafu-grid": { name: "納福", shortLabel: "格裡納福 Checked in Na Fu", style: "格紋邊框＋植物（龜背芋葉／梅花）", colorDesc: "酒紅底＋金字", size: 20, material: "純沙" },
    "chun": { name: "春", shortLabel: "春", style: "素色底＋星星＋蝴蝶結", colorDesc: "藍灰／淺紫底＋黑字（雙配色示範）", size: 15, material: "純沙" },
    "fu": { name: "福", shortLabel: "福", style: "素色底＋星星點綴", colorDesc: "酒紅底＋金字", size: 15, material: "純沙" },
    "cai": { name: "財", shortLabel: "財", style: "條紋＋梅花", colorDesc: "淺藍底＋黑字", size: 15, material: "純沙" },
    "fu-sheep": { name: "福（羊Diss舞蹈 Sheep La Danse）", shortLabel: "福（羊Diss舞蹈 Sheep La Danse）", style: "動物插畫（多角色構圖）", colorDesc: "酒紅／寶藍底（雙配色示範）", size: 20, material: "植絨粉＋金箔或亮粉（待試色）" },
  };


  const PATTERN_ORDER = ["nafu-wave", "yingchun-wave", "yingchun-grid", "nafu-grid", "chun", "fu", "cai", "fu-sheep"];


  const COLLECTION_PATTERNS = ["nafu-grid", "yingchun-grid", "cai", "chun", "fu-sheep"];



  const PLACEHOLDER_PHOTO_ICON = `<svg class="placeholder-box__icon" viewBox="0 0 24 24" width="1.8em" height="1.8em" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="1.5"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 16l-5.5-5.5a1 1 0 0 0-1.4 0L6 19"/></svg>`;

  function patternCardHTML(p) {
    return `
      <div class="placeholder-box placeholder-box--photo pattern-card__photo" aria-hidden="true">${PLACEHOLDER_PHOTO_ICON}<span class="placeholder-box__text">建議拍攝：${p.name}・${p.style}</span></div>
      <p class="pattern-card__name">${p.shortLabel}</p>
      <p class="pattern-card__tags">${p.style}・${p.colorDesc}</p>
      <p class="pattern-card__meta">${p.size}cm・${p.material}</p>
    `;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;






  function initPatternCarousel() {
    const carousel = document.querySelector(".pattern-carousel[data-pattern-carousel]");
    if (!carousel) return;
    const track = carousel.querySelector(".pattern-carousel__track");
    const dotsWrap = carousel.querySelector(".pattern-carousel__dots");

    track.innerHTML = "";
    dotsWrap.innerHTML = "";

    const cards = PATTERN_ORDER.map((key, i) => {
      const p = PATTERNS[key];
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pattern-card";
      btn.dataset.scheme = key;
      btn.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      btn.innerHTML = patternCardHTML(p);
      track.appendChild(btn);
      return btn;
    });



    const dots = PATTERN_ORDER.map((key, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "pattern-carousel__dot";
      dot.setAttribute("aria-label", `跳到第 ${i + 1} 款：${PATTERNS[key].shortLabel}`);
      dot.setAttribute("aria-current", i === 0 ? "true" : "false");
      dotsWrap.appendChild(dot);
      return dot;
    });



    const sizeHint = document.querySelector(".kit-section__size-hint");

    function applyPattern(key) {
      const p = PATTERNS[key];
      if (!p) return;
      cards.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.scheme === key)));
      dots.forEach((d, i) => d.setAttribute("aria-current", String(PATTERN_ORDER[i] === key)));
      if (sizeHint) sizeHint.textContent = `成品尺寸：${p.size}cm（${p.name}）`;
    }

    function scrollToIndex(i) {
      cards[i].scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        inline: "center",
        block: "nearest",
      });
    }




    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (mostVisible) applyPattern(mostVisible.target.dataset.scheme);
      },
      { root: track, threshold: [0.6] }
    );
    cards.forEach((card) => observer.observe(card));

    dots.forEach((dot, i) => dot.addEventListener("click", () => scrollToIndex(i)));

    applyPattern(PATTERN_ORDER[0]);
  }


  function renderFixedCombo() {
    const grid = document.querySelector(".pattern-grid[data-fixed]");
    if (!grid) return;

    grid.innerHTML = "";
    COLLECTION_PATTERNS.forEach((key) => {
      const p = PATTERNS[key];
      const cell = document.createElement("div");
      cell.className = "pattern-card pattern-card--static";
      cell.innerHTML = patternCardHTML(p);
      grid.appendChild(cell);
    });
  }

  function init() {
    initPatternCarousel();
    renderFixedCombo();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }




  window.RisuanPatterns = { PATTERNS, PATTERN_ORDER, COLLECTION_PATTERNS };
})();
