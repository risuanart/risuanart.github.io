/* baseboard-picker.js —— 沙畫底板單買（products/sand-art-baseboard／
   sand-art-baseboard-artist）專用的款式選擇器，只有這兩頁會載入。跟
   js/gradient-sand-picker.js 幾乎同一套邏輯（主圖＋可左右切換的縮圖
   選擇器），但這裡選的是「圖案設計」不是「色號漸層」，語意不同所以
   另開一支檔案，不是硬套名字不符的那支。

   點擊的 .color-picker__chip 本身帶 aria-pressed 屬性，js/cart.js 的
   activeScheme() 會自動讀取頁面上 aria-pressed="true" 的那顆、取它的
   data-scheme 當作加入購物車時的規格，這裡不用額外處理「加入購物車」
   按鈕本身，只負責畫面上的選圖案互動（主圖、文字提示）。 */
(function () {
  const root = document.querySelector("[data-baseboard-picker]");
  if (!root) return;

  const chips = Array.from(root.querySelectorAll(".color-picker__chip"));
  const mainImg = root.querySelector("[data-baseboard-main-img]");
  const mainWrap = root.querySelector("[data-baseboard-main]");
  const hintName = root.querySelector("[data-baseboard-hint-name]");
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
  }

  chips.forEach((chip, i) => {
    chip.addEventListener("click", () => select(i));
  });

  root.querySelectorAll("[data-baseboard-nav]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dir = parseInt(btn.getAttribute("data-baseboard-nav"), 10);
      select(index + dir);
    });
  });

  // 觸控滑動（手機）：只在主圖容器內判斷，且水平位移要明顯大於垂直
  // 位移才當作換圖手勢，避免跟頁面正常垂直捲動互相干擾；listener 用
  // passive，不呼叫 preventDefault()，捲動本身不會被卡住。跟
  // gradient-sand-picker.js 同一套判斷邏輯。
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
