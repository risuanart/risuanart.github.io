/* word-sticker-picker.js —— 流動畫加購字貼（products/fluid-art-word-sticker/）
   專用設定檔，只有這一頁會載入。核心的點縮圖換圖／手機滑動邏輯都在
   共用引擎 js/variant-picker.js 裡，這支檔案只負責告訴引擎「這頁的
   屬性名稱叫什麼」，不重複寫一份邏輯。 */
window.RisuanVariantPicker.init({
  root: "[data-sticker-picker]",
  mainImgAttr: "data-sticker-main-img",
  mainWrapAttr: "data-sticker-main",
  hintNameAttr: "data-sticker-hint-name",
});
