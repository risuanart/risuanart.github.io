











(function () {
  const root = document.querySelector("[data-frame-mockup-picker]");
  if (!root) return;

  const mainImg = root.querySelector("[data-frame-mockup-main-img]");
  const priceEl = root.querySelector("[data-frame-mockup-price]");



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
    mainImg.alt = `${name} 裝進 ${currentSize}×${currentSize}cm 相框的模擬效果`;
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
