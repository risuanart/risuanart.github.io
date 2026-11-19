













(function () {
  document.querySelectorAll("[data-addon-variant], [data-addon-scheme]").forEach((select) => {
    const row = select.closest("[data-addon-row]");
    if (!row) return;
    const thumb = row.querySelector("[data-addon-variant-thumb]");
    const priceEl = row.querySelector(".addon-row__price");
    const checkbox = row.querySelector("[data-addon-select]");
    const previewLink = row.querySelector("[data-addon-preview-link]");
    const isProductSelect = select.hasAttribute("data-addon-variant");

    function sync() {
      const opt = select.options[select.selectedIndex];
      if (!opt) return;
      if (thumb && opt.dataset.thumb) thumb.src = opt.dataset.thumb;
      if (priceEl && opt.dataset.price) priceEl.textContent = `$${opt.dataset.price}`;
      if (checkbox && isProductSelect && opt.value) checkbox.dataset.product = opt.value;


      if (previewLink && opt.dataset.mockup) previewLink.href = opt.dataset.mockup;
    }

    select.addEventListener("change", sync);
    sync();
  });
})();
