/* sand-art-gallery.js —— 砂畫材料包子頁：8款圖案資料庫＋圖案選擇（輕巧版）／
   固定精選組合展示（自由創作組）。跟 product-gallery.js（流動畫專用）分開維護，因為兩邊
   資料模型完全不同（色系 vs 圖案，2 選項 vs 8 選項），沒有共用的必要，合併只會讓兩邊都
   多繞一層條件判斷。目前沒有任何一張正式素材，全部用 .placeholder-box 文字佔位框，
   等設計稿到位後把 pattern-card__photo 裡的 placeholder-box 換成真的 <img> 即可。

   輕巧版的圖案選擇有兩種呈現，服務不同頁面／情境：
   - 敘事型子頁（本檔案 initPatternCarousel()）：scroll-snap 橫向滑動，一次只看
     一張，手機窄螢幕下圖案本身佔螢幕寬度七成以上，方便仔細比較 8 款構圖差異。
   - 材料包總覽購物頁（js/products-overview.js）：<select> 下拉，因為那頁要同時
     緊湊呈現 4 張商品卡，服務的是「已經知道要選哪款、快速下單」的訪客，不需要
     再重複一次滑動比較的體驗。
   兩處共用同一份 PATTERNS／PATTERN_ORDER 資料（見檔案最後 window.RisuanPatterns），
   不重複維護第二份圖案清單。 */

(function () {
  const PATTERNS = {
    "nafu-wave": { name: "納福", shortLabel: "納福（波浪紋）", style: "波浪幾何紋", colorDesc: "深綠＋酒紅＋金字", size: 15, material: "純沙" },
    "yingchun-wave": { name: "迎春", shortLabel: "迎春（波浪紋）", style: "波浪幾何紋", colorDesc: "朱紅＋深藍＋金字", size: 15, material: "純沙＋特殊材質（待試色）" },
    "yingchun-grid": { name: "迎春", shortLabel: "迎春（格紋版）", style: "格紋邊框＋植物（梅花／松枝）", colorDesc: "粉膚色底＋黑字", size: 20, material: "純沙" },
    "nafu-grid": { name: "納福", shortLabel: "納福（格紋版）", style: "格紋邊框＋植物（龜背芋葉／梅花）", colorDesc: "酒紅底＋金字", size: 20, material: "純沙" },
    "chun": { name: "春", shortLabel: "春", style: "素色底＋星星＋蝴蝶結", colorDesc: "藍灰／淺紫底＋黑字（雙配色示範）", size: 15, material: "純沙" },
    "fu": { name: "福", shortLabel: "福", style: "素色底＋星星點綴", colorDesc: "酒紅底＋金字", size: 15, material: "純沙" },
    "cai": { name: "財", shortLabel: "財", style: "條紋＋梅花", colorDesc: "淺藍底＋黑字", size: 15, material: "純沙" },
    "fu-sheep": { name: "福（羊群報福）", shortLabel: "福（羊群報福）", style: "動物插畫（多角色構圖）", colorDesc: "酒紅／寶藍底（雙配色示範）", size: 20, material: "植絨粉＋金箔或亮粉（待試色）" },
  };

  // 順序照規格書表格 1-8 號。
  const PATTERN_ORDER = ["nafu-wave", "yingchun-wave", "yingchun-grid", "nafu-grid", "chun", "fu", "cai", "fu-sheep"];

  // 自由創作組固定精選 5 款（不開放自選），順序照規格書第八章列出的順序。
  const COLLECTION_PATTERNS = ["nafu-grid", "yingchun-grid", "cai", "chun", "fu-sheep"];

  function patternCardHTML(p) {
    return `
      <div class="placeholder-box pattern-card__photo" aria-hidden="true">建議拍攝：${p.name}・${p.style}</div>
      <p class="pattern-card__name">${p.shortLabel}</p>
      <p class="pattern-card__tags">${p.style}・${p.colorDesc}</p>
      <p class="pattern-card__meta">${p.size}cm・${p.material}</p>
    `;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 輕巧版敘事子頁：8 款圖案由客人自選其中一款，scroll-snap 橫向滑動一次呈現一張。
  // 卡片本身沿用跟色系選擇器一樣的 .pattern-card／data-scheme／aria-pressed 屬性，
  // 讓 cart.js 的 activeScheme() 完全不用改就認得出「目前選中的圖案」——
  // 這頁整頁只有一組圖案選擇器，跟色系選擇器原本的「全域找唯一被選中的卡片」
  // 假設完全相符，不需要額外指定範圍。
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

    // 索引點：不只是被動顯示目前位置，點下去要能直接跳到對應圖案（見任務指令
    // 「非僅被動顯示位置」），用 scrollIntoView 讓瀏覽器自己處理捲動＋置中。
    const dots = PATTERN_ORDER.map((key, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "pattern-carousel__dot";
      dot.setAttribute("aria-label", `跳到第 ${i + 1} 款：${PATTERNS[key].shortLabel}`);
      dot.setAttribute("aria-current", i === 0 ? "true" : "false");
      dotsWrap.appendChild(dot);
      return dot;
    });

    // 套組內容章節的「成品尺寸」隨選中圖案即時更新（15cm／20cm 差很多，
    // 讓客人選完馬上看到會做出多大的成品，不用自己回頭查表格）。
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

    // 客人手指滑動時，用 IntersectionObserver 偵測目前捲到「置中可見」的是哪一張，
    // 當作選中的圖案——不用自己手算 scrollLeft／卡片寬度去猜，交給瀏覽器原生的
    // scroll-snap＋IntersectionObserver 判斷最準，滑動手感也最自然。
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

  // 自由創作組：固定 5 款組合展示，不能點選（不是選擇器，純粹列出內含哪些圖案）。
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

  // 給材料包總覽購物頁（js/products-overview.js）用的唯讀資料存取，讓總覽頁的
  // <select> 圖案選項直接讀這裡的 PATTERNS／PATTERN_ORDER，不用另外複製一份
  // 圖案清單（兩處共用同一份資料來源）。
  window.RisuanPatterns = { PATTERNS, PATTERN_ORDER, COLLECTION_PATTERNS };
})();
