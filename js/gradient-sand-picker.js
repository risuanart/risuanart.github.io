/* gradient-sand-picker.js —— 漸層沙．自選色（products/sand-art-extra-color/）
   專用設定檔，只有這一頁會載入。核心的點縮圖換圖／手機滑動邏輯都在
   共用引擎 js/variant-picker.js 裡，這支檔案只負責告訴引擎「這頁的
   屬性名稱叫什麼」，不重複寫一份邏輯。

   hintColorsAttr：使用者要求每組實際包含哪幾色要清楚標示出來，不是
   只能從縮圖的 alt 文字才看得到——色號清單直接讀每顆色票按鈕自己的
   data-colors（跟 alt 文字同一份資料，不用另外維護一份），畫面上
   「目前選擇」那行會跟著即時更新。 */
window.RisuanVariantPicker.init({
  root: "[data-gradient-sand-picker]",
  mainImgAttr: "data-gradient-sand-main-img",
  mainWrapAttr: "data-gradient-sand-main",
  hintNameAttr: "data-gradient-sand-hint-name",
  hintColorsAttr: "data-gradient-sand-hint-colors",
});
