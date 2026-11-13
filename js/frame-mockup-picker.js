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
  // 2026-11-11：加入購物車／直接購買按鈕改成 document 範圍找——手機固定
  // 購買列（.mobile-sticky-buy）是 <main> 結尾另外一份獨立 HTML，不在
  // root（這頁的 .work__intro）底下，但一樣要跟著尺寸切換顯示哪一顆。
  const addBtns = Array.from(document.querySelectorAll("[data-frame-mockup-add-btn]"));
  const buyBtns = Array.from(document.querySelectorAll("[data-frame-mockup-buy-btn]"));
  const sizeChips = Array.from(root.querySelectorAll(".frame-size-picker__chip"));
  const designPicker = root.querySelector("[data-frame-design-picker]");
  const designChips = designPicker ? Array.from(designPicker.querySelectorAll(".color-picker__chip")) : [];
  if (!mainImg || !sizeChips.length) return;

  let currentSize = (sizeChips.find((c) => c.getAttribute("aria-pressed") === "true") || sizeChips[0]).dataset.size;
  let currentDesign = (designChips.find((c) => c.getAttribute("aria-pressed") === "true") || designChips[0] || {}).dataset
    ? (designChips.find((c) => c.getAttribute("aria-pressed") === "true") || designChips[0]).dataset.design
    : "fu";

  function updateAvailableDesigns() {
    designChips.forEach((chip) => {
      const available = !chip.dataset.sizes || chip.dataset.sizes.split(',').includes(currentSize);
      chip.hidden = !available;
      chip.style.display = available ? '' : 'none';
    });
    if (!designChips.some((chip) => !chip.hidden && chip.dataset.design === currentDesign)) {
      currentDesign = designChips.find((chip) => !chip.hidden).dataset.design;
    }
    designChips.forEach((chip) => chip.setAttribute('aria-pressed', String(chip.dataset.design === currentDesign)));
  }

  function updateMainImage() {
    const designLabel = designChips.find((c) => c.dataset.design === currentDesign);
    const name = designLabel ? designLabel.querySelector(".color-picker__chip-name").textContent : "";
    if (currentDesign === "plain") {
      mainImg.src = `../../assets/images/products/sand-art-frame/sand-art-frame-plain-${currentSize}.jpg`;
      mainImg.alt = `${currentSize}×${currentSize}cm 木質空畫框`;
      return;
    }
    mainImg.src = `../../assets/images/products/sand-art-frame/mockup-${currentDesign}-${currentSize}.jpg`;
    mainImg.alt = `${name} 裝進 ${currentSize}×${currentSize}cm 像框的模擬效果`;
  }

  sizeChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      sizeChips.forEach((c) => c.setAttribute("aria-pressed", c === chip ? "true" : "false"));
      currentSize = chip.dataset.size;
      if (priceEl) priceEl.textContent = `$${chip.dataset.price}`;
      addBtns.forEach((btn) => {
        btn.hidden = btn.dataset.frameMockupAddBtn !== currentSize;
      });
      buyBtns.forEach((btn) => {
        btn.hidden = btn.dataset.frameMockupBuyBtn !== currentSize;
      });
      updateAvailableDesigns();
      updateMainImage();
    });
  });

  function selectDesign(chip) {
    if (!chip || chip.hidden) return;
    designChips.forEach((c) => c.setAttribute("aria-pressed", c === chip ? "true" : "false"));
    currentDesign = chip.dataset.design;
    updateMainImage();
  }

  designChips.forEach((chip) => {
    chip.addEventListener("click", () => selectDesign(chip));
  });
  updateAvailableDesigns();

  // 2026-11-14：使用者反映其他加購選色頁主圖都能手機滑動切換，這頁
  // 原本只能點下面的「預覽款式」縮圖，不一致——補上同一套觸控滑動
  // 判斷邏輯，在目前尺寸底下「看得到」的款式縮圖（chip.hidden 篩選過）
  // 之間切換，不會滑到被隱藏的尺寸限定款式。這頁沒有加桌機版的左右
  // 箭頭按鈕，跟沙畫24色任選組一樣，直接點縮圖切換已經很清楚。
  const mainWrap = root.querySelector("[data-frame-mockup-main]");
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
        const visible = designChips.filter((c) => !c.hidden);
        if (visible.length < 2) return;
        const touch = e.changedTouches[0];
        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;
        if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
        const curIdx = visible.findIndex((c) => c.dataset.design === currentDesign);
        const nextIdx = (curIdx + (dx < 0 ? 1 : -1) + visible.length) % visible.length;
        selectDesign(visible[nextIdx]);
      },
      { passive: true }
    );
  }
})();
