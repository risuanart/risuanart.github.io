/* frame-mockup-picker.js —— 沙畫加購像框（products/sand-art-frame/）專用，
   只有這一頁會載入。兩組各自獨立的選擇器共用同一張主圖：
   - 尺寸選擇器（.frame-size-picker__chip）：決定買的是哪個商品（
     data-product 對應 cart.js PRODUCTS 的 sand-art-frame-15／-20，兩個
     尺寸價錢不同，是兩個獨立商品鍵，不是同一個商品的規格選項，見
     cart.js 該處說明），同時也更新主圖要顯示哪個尺寸的合成圖。
   - 款式選擇器（[data-frame-design-picker] 底下的 .color-picker__chip）：
     純粹換主圖看預覽，不影響實際購買的是哪個商品——像框本身不分砂畫
     款式，這組是給客人「想像自己選的那款裝進去長怎樣」用的。
   主圖檔名規則：mockup-{design}-{size}.jpg（見
   assets/images/products/sand-art-frame/ 下的生成腳本），兩組狀態都要
   讀出來才能拼出正確檔名。 */
(function () {
  const root = document.querySelector("[data-frame-mockup-picker]");
  if (!root) return;

  const mainImg = root.querySelector("[data-frame-mockup-main-img]");
  const priceEl = root.querySelector("[data-frame-mockup-price]");
  const sizeNameEl = root.querySelector("[data-frame-mockup-size-name]");
  const addBtns = Array.from(root.querySelectorAll("[data-frame-mockup-add-btn]"));
  const sizeChips = Array.from(root.querySelectorAll(".frame-size-picker__chip"));
  const designPicker = root.querySelector("[data-frame-design-picker]");
  const designChips = designPicker ? Array.from(designPicker.querySelectorAll(".color-picker__chip")) : [];
  if (!mainImg || !sizeChips.length) return;

  let currentSize = (sizeChips.find((c) => c.getAttribute("aria-pressed") === "true") || sizeChips[0]).dataset.size;
  let currentDesign = (designChips.find((c) => c.getAttribute("aria-pressed") === "true") || designChips[0] || {}).dataset
    ? (designChips.find((c) => c.getAttribute("aria-pressed") === "true") || designChips[0]).dataset.design
    : "fu";

  function updateMainImage() {
    const designLabel = designChips.find((c) => c.dataset.design === currentDesign);
    const name = designLabel ? designLabel.querySelector(".color-picker__chip-name").textContent : "";
    mainImg.src = `../../assets/images/products/sand-art-frame/mockup-${currentDesign}-${currentSize}.jpg`;
    mainImg.alt = `${name} 裝進 ${currentSize}×${currentSize}cm 像框的模擬效果`;
  }

  sizeChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      sizeChips.forEach((c) => c.setAttribute("aria-pressed", c === chip ? "true" : "false"));
      currentSize = chip.dataset.size;
      if (priceEl) priceEl.textContent = `$${chip.dataset.price}`;
      if (sizeNameEl) sizeNameEl.textContent = `${currentSize}×${currentSize}cm`;
      addBtns.forEach((btn) => {
        btn.hidden = btn.dataset.frameMockupAddBtn !== currentSize;
      });
      updateMainImage();
    });
  });

  designChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      designChips.forEach((c) => c.setAttribute("aria-pressed", c === chip ? "true" : "false"));
      currentDesign = chip.dataset.design;
      updateMainImage();
    });
  });
})();
