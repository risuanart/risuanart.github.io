




















(function () {
  function initVariantPicker(config) {
    const root = document.querySelector(config.root);
    if (!root) return;

    const chips = Array.from(root.querySelectorAll(config.chipSelector || ".color-picker__chip"));
    const mainImg = root.querySelector(`[${config.mainImgAttr}]`);
    const mainWrap = config.mainWrapAttr ? root.querySelector(`[${config.mainWrapAttr}]`) : null;
    const hintName = config.hintNameAttr ? root.querySelector(`[${config.hintNameAttr}]`) : null;
    const hintColors = config.hintColorsAttr ? root.querySelector(`[${config.hintColorsAttr}]`) : null;
    const priceEl = config.priceAttr ? root.querySelector(`[${config.priceAttr}]`) : null;




    const addBtns = config.addBtnAttr ? Array.from(document.querySelectorAll(`[${config.addBtnAttr}]`)) : [];
    const buyBtns = config.buyBtnAttr ? Array.from(document.querySelectorAll(`[${config.buyBtnAttr}]`)) : [];
    if (!mainImg || !chips.length) return;

    let index = chips.findIndex((c) => c.getAttribute("aria-pressed") === "true");
    if (index < 0) index = 0;

    function select(idx) {
      index = (idx + chips.length) % chips.length;
      const chip = chips[index];
      chips.forEach((c, i) => c.setAttribute("aria-pressed", i === index ? "true" : "false"));

      const thumbImg = chip.querySelector("img");
      if (thumbImg) {
        mainImg.src = thumbImg.src;
        mainImg.alt = thumbImg.alt;
      }

      const name = chip.querySelector(".color-picker__chip-name");
      if (hintName && name) hintName.textContent = name.textContent;
      if (hintColors && chip.dataset.colors) hintColors.textContent = chip.dataset.colors;
      if (priceEl && chip.dataset.price) priceEl.textContent = `$${Number(chip.dataset.price).toLocaleString()}`;

      if (addBtns.length) {
        addBtns.forEach((btn) => {
          btn.hidden = btn.getAttribute(config.addBtnAttr) !== chip.dataset.product;
        });
      }
      if (buyBtns.length) {
        buyBtns.forEach((btn) => {
          btn.hidden = btn.getAttribute(config.buyBtnAttr) !== chip.dataset.product;
        });
      }

      if (config.onSelect) config.onSelect(chip);
    }

    chips.forEach((chip, i) => {
      chip.addEventListener("click", () => select(i));
    });






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
  }

  window.RisuanVariantPicker = { init: initVariantPicker };
})();
