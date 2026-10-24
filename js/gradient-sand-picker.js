/* gradient-sand-picker.js —— 漸層沙・自選色（products/sand-art-extra-color/）
   專用的色號選擇器，只有這一頁會載入這支檔案。跟流動畫禮盒版那套
   js/product-gallery.js 不是同一套邏輯——那套是為了多張輪播照片＋色系
   故事文案設計的，這頁只需要「點色票→換主圖、换選中狀態」，沒有故事
   內容，硬套那套引擎反而要生出一堆用不到的資料結構。

   點擊的 .color-picker__chip 本身帶 aria-pressed 屬性，js/cart.js 的
   activeScheme() 會自動讀取頁面上 aria-pressed="true" 的那顆、取它的
   data-scheme 當作加入購物車時的規格，這裡不用額外處理「加入購物車」
   按鈕本身，只需要負責畫面上的選色互動（主圖、文字提示）。

   2026-10-25：使用者要求主圖能左右切換 12 張色票照——手機滑動、桌機
   點箭頭——不是只能從下面縮圖點選。改成 index-based：select(idx) 統一
   處理「換圖＋換選中狀態＋換提示文字」，點縮圖、點箭頭、滑動手勢都呼叫
   同一個函式，不是三套各自獨立的邏輯。 */
(function () {
  const root = document.querySelector("[data-gradient-sand-picker]");
  if (!root) return;

  const chips = Array.from(root.querySelectorAll(".color-picker__chip"));
  const mainImg = root.querySelector("[data-gradient-sand-main-img]");
  const mainWrap = root.querySelector("[data-gradient-sand-main]");
  const hintName = root.querySelector("[data-gradient-sand-hint-name]");
  // 2026-10-24：使用者要求每組實際包含哪 5 色要清楚標示出來，不是只能
  // 從縮圖的 alt 文字（滑鼠移過去或螢幕閱讀器才讀得到）才看得到，方便
  // 要比較 5 色組跟 24 色組的人，或材料包用完想知道還缺哪色的人。色號
  // 清單直接讀每顆色票按鈕自己的 data-colors（跟 alt 文字同一份資料，
  // 不用另外維護一份），畫面上「目前選擇」那行會跟著即時更新。
  const hintColors = root.querySelector("[data-gradient-sand-hint-colors]");
  if (!chips.length) return;

  let index = chips.findIndex((c) => c.getAttribute("aria-pressed") === "true");
  if (index < 0) index = 0;

  function select(idx) {
    index = (idx + chips.length) % chips.length;
    const chip = chips[index];
    chips.forEach((c, i) => c.setAttribute("aria-pressed", i === index ? "true" : "false"));
    const name = chip.querySelector(".color-picker__chip-name");
    const thumbImg = chip.querySelector("img");
    if (mainImg && thumbImg) {
      mainImg.src = thumbImg.src;
      mainImg.alt = thumbImg.alt;
    }
    if (hintName && name) hintName.textContent = name.textContent;
    if (hintColors && chip.dataset.colors) hintColors.textContent = chip.dataset.colors;
  }

  chips.forEach((chip, i) => {
    chip.addEventListener("click", () => select(i));
  });

  root.querySelectorAll("[data-gradient-sand-nav]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dir = parseInt(btn.getAttribute("data-gradient-sand-nav"), 10);
      select(index + dir);
    });
  });

  // 觸控滑動（手機）：只在主圖容器內判斷，且水平位移要明顯大於垂直
  // 位移才當作換色手勢，避免跟頁面正常垂直捲動互相干擾；listener 用
  // passive，不呼叫 preventDefault()，捲動本身不會被卡住。
  if (mainWrap) {
    let startX = 0;
    let startY = 0;
    let tracking = false;

    mainWrap.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length !== 1) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        tracking = true;
      },
      { passive: true }
    );

    mainWrap.addEventListener(
      "touchend",
      (e) => {
        if (!tracking) return;
        tracking = false;
        const touch = e.changedTouches[0];
        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;
        if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
        select(index + (dx < 0 ? 1 : -1));
      },
      { passive: true }
    );
  }

  select(index);
})();
