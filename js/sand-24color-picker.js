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
  // 2026-11-11：加入購物車／直接購買按鈕改成 document 範圍找，不是只在
  // root（買列本身）底下找——手機固定購買列（.mobile-sticky-buy）是
  // <main> 結尾另外一份獨立 HTML，不在 root 裡面，但一樣要跟著購買方式
  // 切換顯示哪一顆，見下面 tierChips click handler 裡 addBtns／buyBtns
  // 一起切換的邏輯。
  const addBtns = Array.from(document.querySelectorAll("[data-sand24-add-btn]"));
  const buyBtns = Array.from(document.querySelectorAll("[data-sand24-buy-btn]"));
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
      buyBtns.forEach((btn) => {
        btn.hidden = btn.dataset.sand24BuyBtn !== currentTier;
      });
      if (schemeField) schemeField.hidden = currentTier === "bundle";
      if (hintNameEl) {
        hintNameEl.textContent = currentTier === "bundle" ? "72 色全組（A＋B＋C）" : currentSchemeChip().querySelector(".color-picker__chip-name").textContent;
      }
      updateMainImage();
    });
  });

  function selectScheme(chip) {
    schemeChips.forEach((c) => c.setAttribute("aria-pressed", c === chip ? "true" : "false"));
    if (hintNameEl) hintNameEl.textContent = chip.querySelector(".color-picker__chip-name").textContent;
    updateMainImage();
  }

  schemeChips.forEach((chip) => {
    chip.addEventListener("click", () => selectScheme(chip));
  });

  // 2026-11-14：使用者反映其他加購選色頁（漸層沙・自選色等）主圖都能
  // 手機滑動切換，這頁原本只能點下面的 A／B／C 縮圖，不一致——補上跟
  // 那幾頁同一套觸控滑動判斷邏輯（水平位移要明顯大於垂直位移才當作
  // 換色手勢）。切到「72色全組」時只有一張組圖可看，沒有可以切換的
  // 對象，滑動手勢直接略過（schemeChips 在 bundle tier 時本來就不會
  // 顯示，但仍檢查 currentTier 避免滑動時誤觸發）。這頁沒有加桌機版的
  // 左右箭頭按鈕——跟沙畫加購像框、沙畫24色任選組一樣，直接點縮圖切換
  // 已經很清楚，不需要額外的箭頭。
  const mainWrap = root.querySelector("[data-sand24-main]");
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
        if (currentTier === "bundle" || schemeChips.length < 2) return;
        const touch = e.changedTouches[0];
        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;
        if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
        const curIdx = schemeChips.indexOf(currentSchemeChip());
        const nextIdx = (curIdx + (dx < 0 ? 1 : -1) + schemeChips.length) % schemeChips.length;
        selectScheme(schemeChips[nextIdx]);
      },
      { passive: true }
    );
  }
})();
