/* sand-art-gallery.js —— 砂畫材料包子頁：8款圖案資料庫＋圖案選擇卡片網格（輕巧版）／
   固定精選組合展示（自由創作組）。跟 product-gallery.js（流動畫專用）分開維護，因為兩邊
   資料模型完全不同（色系 vs 圖案，2 選項 vs 8 選項），沒有共用的必要，合併只會讓兩邊都
   多繞一層條件判斷。目前沒有任何一張正式素材，全部用 .placeholder-box 文字佔位框，
   等設計稿到位後把 pattern-card__photo 裡的 placeholder-box 換成真的 <img> 即可。 */

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

  // 輕巧版：8 款圖案由客人自選其中一款。卡片本身帶 data-scheme，跟色系選擇器共用
  // 同一個屬性名稱，讓 cart.js 的 activeScheme() 不用另外分辨「這是色系還是圖案」，
  // 統一當作「目前選中的規格變體」處理。
  function initPatternGrid() {
    const grid = document.querySelector(".pattern-grid[data-selectable]");
    if (!grid) return;

    grid.innerHTML = "";
    const cards = PATTERN_ORDER.map((key, i) => {
      const p = PATTERNS[key];
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pattern-card";
      btn.dataset.scheme = key;
      btn.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      btn.innerHTML = patternCardHTML(p);
      grid.appendChild(btn);
      return btn;
    });

    // 套組內容章節的「成品尺寸」隨選中圖案即時更新（15cm／20cm 差很多，
    // 讓客人選完馬上看到會做出多大的成品，不用自己回頭查表格）。
    const sizeHint = document.querySelector(".kit-section__size-hint");

    function applyPattern(key) {
      const p = PATTERNS[key];
      if (!p) return;
      cards.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.scheme === key)));
      if (sizeHint) sizeHint.textContent = `成品尺寸：${p.size}cm（${p.name}）`;
    }

    cards.forEach((card) => {
      card.addEventListener("click", () => applyPattern(card.dataset.scheme));
    });

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
    initPatternGrid();
    renderFixedCombo();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
