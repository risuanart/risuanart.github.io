/* addon-frame-preview-toggle.js —— 像框加購項目的「預覽放進像框的
   效果」，2026-10-25 使用者反饋這頁（福星，15×15cm 商品）的像框加購
   已經鎖定單一尺寸，不需要再跳頁／開新分頁才看得到合成示意圖，點一下
   按鈕直接把縮圖換成「放進像框」的示意圖，再點一下換回空框實拍照
   （預設縮圖用空框照，理由見 products/sand-art-fu/index.html 同一處
   註解：避免讓客人誤會加購「含砂畫作品」）。

   只有 [data-addon-preview-toggle] 存在時才作用，其他頁面沒有這個
   data 屬性，這支腳本對它們是 no-op。 */
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
