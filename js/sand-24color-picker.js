














(function () {
  const root = document.querySelector("[data-sand24-picker]");
  if (!root) return;

  const mainImg = root.querySelector("[data-sand24-main-img]");
  const priceEl = root.querySelector("[data-sand24-price]");
  const hintNameEl = root.querySelector("[data-sand24-hint-name]");





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
