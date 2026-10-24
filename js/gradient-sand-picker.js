/* gradient-sand-picker.js —— 漸層沙・自選色（products/sand-art-extra-color/）
   專用的色號選擇器，只有這一頁會載入這支檔案。跟流動畫禮盒版那套
   js/product-gallery.js 不是同一套邏輯——那套是為了多張輪播照片＋色系
   故事文案設計的，這頁只需要「點色票→換主圖、换選中狀態」，沒有故事
   內容，硬套那套引擎反而要生出一堆用不到的資料結構。

   點擊的 .color-picker__chip 本身帶 aria-pressed 屬性，js/cart.js 的
   activeScheme() 會自動讀取頁面上 aria-pressed="true" 的那顆、取它的
   data-scheme 當作加入購物車時的規格，這裡不用額外處理「加入購物車」
   按鈕本身，只需要負責畫面上的選色互動（主圖、文字提示）。 */
(function () {
  const root = document.querySelector("[data-gradient-sand-picker]");
  if (!root) return;

  const chips = Array.from(root.querySelectorAll(".color-picker__chip"));
  const mainImg = root.querySelector("[data-gradient-sand-main-img]");
  const hintName = root.querySelector("[data-gradient-sand-hint-name]");
  // 2026-10-24：使用者要求每組實際包含哪 5 色要清楚標示出來，不是只能
  // 從縮圖的 alt 文字（滑鼠移過去或螢幕閱讀器才讀得到）才看得到，方便
  // 要比較 5 色組跟 24 色組的人，或材料包用完想知道還缺哪色的人。色號
  // 清單直接讀每顆色票按鈕自己的 data-colors（跟 alt 文字同一份資料，
  // 不用另外維護一份），畫面上「目前選擇」那行會跟著即時更新。
  const hintColors = root.querySelector("[data-gradient-sand-hint-colors]");
  if (!chips.length) return;

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.setAttribute("aria-pressed", c === chip ? "true" : "false"));
      const name = chip.querySelector(".color-picker__chip-name");
      const thumbImg = chip.querySelector("img");
      if (mainImg && thumbImg) {
        mainImg.src = thumbImg.src;
        mainImg.alt = thumbImg.alt;
      }
      if (hintName && name) hintName.textContent = name.textContent;
      if (hintColors && chip.dataset.colors) hintColors.textContent = chip.dataset.colors;
    });
  });
})();
