








(function () {
  document.querySelectorAll("[data-addon-preview-toggle]").forEach((btn) => {
    const row = btn.closest("[data-addon-row]");
    const thumb = row && row.querySelector("[data-addon-variant-thumb]");
    if (!thumb) return;

    const plainSrc = btn.dataset.plainSrc || thumb.getAttribute("src");
    const plainAlt = btn.dataset.plainAlt || thumb.alt;
    const mockupSrc = btn.dataset.mockupSrc;
    const mockupAlt = btn.dataset.mockupAlt || thumb.alt;
    const originalLabel = btn.textContent;
    let showingMockup = false;

    btn.addEventListener("click", () => {
      showingMockup = !showingMockup;
      thumb.src = showingMockup ? mockupSrc : plainSrc;
      thumb.alt = showingMockup ? mockupAlt : plainAlt;
      btn.textContent = showingMockup ? "收起預覽 ←" : originalLabel;
    });
  });
})();
