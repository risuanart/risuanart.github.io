/* metallic-sand-picker.js —— 沙畫加購色沙・金屬色（products/sand-art-metallic/）
   專用，只有這一頁會載入。鉑金／香檳銀單色（同一個商品鍵 sand-art-metallic，
   用 data-scheme 區分色票，價錢一樣）跟鉑金＋香檳銀雙色組（獨立商品鍵
   sand-art-metallic-duo，價錢不同）合併在同一個頁面裡選，比照沙畫加購像框
   （js/frame-mockup-picker.js）「多顆加入購物車／直接購買按鈕、依選擇顯示/
   隱藏對應那顆」的做法——cart.js 的 initAddToCart() 讀 data-product 的
   寫法雖然後來改成每次點擊當下才讀（見該處 2026-11-09 說明），但這裡
   仍然沿用既有的多按鈕模式，不重構，風險較低。

   2026-11-11：使用者反映主圖只能從下面縮圖點選切換，捲到縮圖時又看不到
   主圖，不方便——加上跟漸層沙・自選色（js/gradient-sand-picker.js）
   同一套「主圖左右箭頭＋手機滑動」手勢，index-based 統一處理「換圖＋
   換選中狀態＋換價錢＋換對應按鈕」，點縮圖、點箭頭、滑動手勢都呼叫
   同一個函式。 */
(function () {
  const root = document.querySelector("[data-metallic-sand-picker]");
  if (!root) return;

  const mainImg = root.querySelector("[data-metallic-sand-main-img]");
  const mainWrap = root.querySelector("[data-metallic-sand-main]");
  const priceEl = root.querySelector("[data-metallic-sand-price]");
  const chips = Array.from(root.querySelectorAll(".color-picker__chip"));
  // 2026-11-11：加入購物車／直接購買按鈕改成 document 範圍找——手機固定
  // 購買列（.mobile-sticky-buy）是 <main> 結尾另外一份獨立 HTML，不在
  // root 底下，但一樣要跟著選擇切換顯示哪一顆。
  const addBtns = Array.from(document.querySelectorAll("[data-metallic-sand-add-btn]"));
  const buyBtns = Array.from(document.querySelectorAll("[data-metallic-sand-buy-btn]"));
  if (!mainImg || !chips.length) return;

  let index = chips.findIndex((c) => c.getAttribute("aria-pressed") === "true");
  if (index < 0) index = 0;

  function select(idx) {
    index = (idx + chips.length) % chips.length;
    const chip = chips[index];
    chips.forEach((c, i) => c.setAttribute("aria-pressed", i === index ? "true" : "false"));
    const img = chip.querySelector("img");
    if (img) {
      mainImg.src = img.src;
      mainImg.alt = img.alt;
    }
    if (priceEl && chip.dataset.price) priceEl.textContent = `$${chip.dataset.price}`;
    addBtns.forEach((btn) => {
      btn.hidden = btn.dataset.metallicSandAddBtn !== chip.dataset.product;
    });
    buyBtns.forEach((btn) => {
      btn.hidden = btn.dataset.metallicSandBuyBtn !== chip.dataset.product;
    });
  }

  chips.forEach((chip, i) => {
    chip.addEventListener("click", () => select(i));
  });

  root.querySelectorAll("[data-metallic-sand-nav]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dir = parseInt(btn.getAttribute("data-metallic-sand-nav"), 10);
      select(index + dir);
    });
  });

  // 觸控滑動（手機）：跟 gradient-sand-picker.js 同一套判斷邏輯，只在
  // 主圖容器內、水平位移明顯大於垂直位移才當作換款手勢，不影響正常
  // 垂直捲動。
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
