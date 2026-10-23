/* sand-24color-picker.js —— 砂畫・24色任選組（products/sand-art-24color/）
   專用，只有這一頁會載入。兩組各自獨立的選擇器：
   - 購買方式（.sand24-tier-picker__chip）：單組（$560，A／B／C 任選一組）
     ／全組（$1,480，A+B+C 固定買齊），兩個價錢不同的獨立商品鍵（見
     cart.js PRODUCTS 的 sand-art-24color／sand-art-24color-bundle），
     跟 sand-art-frame 兩個尺寸同一個理由——initAddToCart() 在頁面載入
     當下就把 data-product 讀進閉包變數，之後改 data-product 屬性不會
     生效，所以用兩顆各自固定 data-product 的按鈕、以 hidden 切換顯示
     哪一顆，不是動態改同一顆按鈕的屬性。
   - 色組選擇器（[data-sand24-scheme-picker] 底下的 .color-picker__chip）：
     只有「單組」購買方式才需要選，決定主圖顯示 A／B／C 哪一組的照片、
     以及購物車帶的 scheme 是哪一個（見 cart.js activeScheme()，讀的是
     .color-picker__chip[aria-pressed="true"] 的 data-scheme）。切到
     「全組」時這組選色器整個隱藏（不影響購買，全組本來就是三組都買），
     主圖改顯示三組拼在一起的組圖。 */
(function () {
  const root = document.querySelector("[data-sand24-picker]");
  if (!root) return;

  const mainImg = root.querySelector("[data-sand24-main-img]");
  const priceEl = root.querySelector("[data-sand24-price]");
  const hintNameEl = root.querySelector("[data-sand24-hint-name]");
  const addBtns = Array.from(root.querySelectorAll("[data-sand24-add-btn]"));
  const tierChips = Array.from(root.querySelectorAll(".sand24-tier-picker__chip"));
  const schemeField = root.querySelector(".sand24-field--scheme");
  const schemePicker = root.querySelector("[data-sand24-scheme-picker]");
  const schemeChips = schemePicker ? Array.from(schemePicker.querySelectorAll(".color-picker__chip")) : [];
  if (!mainImg || !tierChips.length) return;

  const BUNDLE_IMAGE = mainImg.dataset.sand24BundleImg || "";

  let currentTier = (tierChips.find((c) => c.getAttribute("aria-pressed") === "true") || tierChips[0]).dataset.tier;

  function currentSchemeChip() {
    return schemeChips.find((c) => c.getAttribute("aria-pressed") === "true") || schemeChips[0];
  }

  function updateMainImage() {
    if (currentTier === "bundle") {
      mainImg.src = BUNDLE_IMAGE;
      mainImg.alt = "A＋B＋C 72 色全組參考圖";
      return;
    }
    const chip = currentSchemeChip();
    if (!chip) return;
    const img = chip.querySelector("img");
    mainImg.src = img.src;
    mainImg.alt = img.alt;
  }

  tierChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      tierChips.forEach((c) => c.setAttribute("aria-pressed", c === chip ? "true" : "false"));
      currentTier = chip.dataset.tier;
      if (priceEl) priceEl.textContent = `$${Number(chip.dataset.price).toLocaleString()}`;
      addBtns.forEach((btn) => {
        btn.hidden = btn.dataset.sand24AddBtn !== currentTier;
      });
      if (schemeField) schemeField.hidden = currentTier === "bundle";
      if (hintNameEl) {
        hintNameEl.textContent = currentTier === "bundle" ? "72 色全組（A＋B＋C）" : currentSchemeChip().querySelector(".color-picker__chip-name").textContent;
      }
      updateMainImage();
    });
  });

  schemeChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      schemeChips.forEach((c) => c.setAttribute("aria-pressed", c === chip ? "true" : "false"));
      if (hintNameEl) hintNameEl.textContent = chip.querySelector(".color-picker__chip-name").textContent;
      updateMainImage();
    });
  });
})();
