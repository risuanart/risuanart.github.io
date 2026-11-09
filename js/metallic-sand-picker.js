/* metallic-sand-picker.js —— 沙畫加購色沙・金屬色（products/sand-art-metallic/）
   專用，只有這一頁會載入。鉑金／香檳銀單色（同一個商品鍵 sand-art-metallic，
   用 data-scheme 區分色票，價錢一樣）跟鉑金＋香檳銀雙色組（獨立商品鍵
   sand-art-metallic-duo，價錢不同）合併在同一個頁面裡選，比照沙畫加購像框
   （js/frame-mockup-picker.js）「多顆加入購物車按鈕、依選擇顯示/隱藏對應
   那顆」的做法——cart.js 的 initAddToCart() 在頁面載入時就把每顆按鈕的
   data-product 讀進閉包變數，之後再用 JS 改 data-product 不會生效，所以
   不能共用一顆按鈕動態換商品鍵，只能切換顯示哪一顆。 */
(function () {
  const root = document.querySelector("[data-metallic-sand-picker]");
  if (!root) return;

  const mainImg = root.querySelector("[data-metallic-sand-main-img]");
  const priceEl = root.querySelector("[data-metallic-sand-price]");
  const chips = Array.from(root.querySelectorAll(".color-picker__chip"));
  const addBtns = Array.from(root.querySelectorAll("[data-metallic-sand-add-btn]"));
  if (!mainImg || !chips.length) return;

  function select(chip) {
    chips.forEach((c) => c.setAttribute("aria-pressed", c === chip ? "true" : "false"));
    const img = chip.querySelector("img");
    if (img) {
      mainImg.src = img.src;
      mainImg.alt = img.alt;
    }
    if (priceEl && chip.dataset.price) priceEl.textContent = `$${chip.dataset.price}`;
    addBtns.forEach((btn) => {
      btn.hidden = btn.dataset.metallicSandAddBtn !== chip.dataset.product;
    });
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => select(chip));
  });

  select(chips.find((c) => c.getAttribute("aria-pressed") === "true") || chips[0]);
})();
