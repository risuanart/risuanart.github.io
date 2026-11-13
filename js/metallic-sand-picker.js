/* metallic-sand-picker.js —— 沙畫加購色沙．金屬色（products/sand-art-metallic/）
   專用設定檔，只有這一頁會載入。核心的點縮圖換圖／手機滑動邏輯都在
   共用引擎 js/variant-picker.js 裡，這支檔案只負責告訴引擎「這頁的
   屬性名稱叫什麼」，不重複寫一份邏輯。

   鉑金／香檳銀單色（同一個商品鍵 sand-art-metallic，用 data-scheme
   區分色票，價錢一樣）跟鉑金＋香檳銀雙色組（獨立商品鍵
   sand-art-metallic-duo，價錢不同）合併在同一個頁面裡選，所以除了
   換主圖，還要跟著換價錢、換成對應那個商品鍵的加入購物車／直接購買
   按鈕（addBtnAttr／buyBtnAttr，引擎會依 chip.dataset.product 比對
   哪一顆按鈕該顯示）。 */
window.RisuanVariantPicker.init({
  root: "[data-metallic-sand-picker]",
  mainImgAttr: "data-metallic-sand-main-img",
  mainWrapAttr: "data-metallic-sand-main",
  priceAttr: "data-metallic-sand-price",
  addBtnAttr: "data-metallic-sand-add-btn",
  buyBtnAttr: "data-metallic-sand-buy-btn",
});
