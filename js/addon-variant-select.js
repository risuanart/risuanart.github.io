/* addon-variant-select.js —— 「一起加購」清單裡需要先選款式才能送出的
   checkbox 列（漸層沙選色組、像框選尺寸），2026-10-24 從原本的「跳頁／
   跳彈窗連結列」改成跟其他加購項目一樣的 checkbox 型，選單變動時要
   同步畫面上的縮圖／價格文字。只有 products/sand-art-fu/index.html
   會用到，純粹是畫面同步，不影響其他頁面。

   兩種選單共用同一套同步邏輯，差別只在：
   - [data-addon-variant]（像框尺寸，15／20cm 是不同商品鍵、不同價格）
     選到哪個 option，連 checkbox 的 data-product 都要跟著換——cart.js
     getSelectedAddons() 讀的就是這個屬性，換商品鍵不用改那支函式。
   - [data-addon-scheme]（漸層沙色組，固定同一個商品鍵、固定同一個
     價格）只需要同步縮圖，不用換 data-product；色組本身會在
     cart.js getSelectedAddons() 裡被讀出來一起送進購物車，見該檔案
     說明。 */
(function () {
  document.querySelectorAll("[data-addon-variant], [data-addon-scheme]").forEach((select) => {
    const row = select.closest("[data-addon-row]");
    if (!row) return;
    const thumb = row.querySelector("[data-addon-variant-thumb]");
    const priceEl = row.querySelector(".addon-row__price");
    const checkbox = row.querySelector("[data-addon-select]");
    const isProductSelect = select.hasAttribute("data-addon-variant");

    function sync() {
      const opt = select.options[select.selectedIndex];
      if (!opt) return;
      if (thumb && opt.dataset.thumb) thumb.src = opt.dataset.thumb;
      if (priceEl && opt.dataset.price) priceEl.textContent = `$${opt.dataset.price}`;
      if (checkbox && isProductSelect && opt.value) checkbox.dataset.product = opt.value;
    }

    select.addEventListener("change", sync);
    sync();
  });
})();
