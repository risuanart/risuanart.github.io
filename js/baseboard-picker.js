/* baseboard-picker.js —— 沙畫底板單買（products/sand-art-baseboard／
   sand-art-baseboard-artist）專用設定檔，只有這兩頁會載入。核心的點
   縮圖換圖／手機滑動邏輯都在共用引擎 js/variant-picker.js 裡，這支
   檔案只負責告訴引擎「這頁的屬性名稱叫什麼」，不重複寫一份邏輯。 */
window.RisuanVariantPicker.init({
  root: "[data-baseboard-picker]",
  mainImgAttr: "data-baseboard-main-img",
  mainWrapAttr: "data-baseboard-main",
  hintNameAttr: "data-baseboard-hint-name",
});
