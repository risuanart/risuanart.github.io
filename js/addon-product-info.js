/* 加購入口的短介紹：商品頁與預覽視窗共用。完整說明仍留在下方。 */
(() => {
  const info = {
    'fluid-art-mini-canvas': '用主材料包剩下的顏料，再做一幅迷你春聯，也能先練習倒色。內含5×5cm畫布、金色字貼與晾乾繩，不含顏料。',
    'fluid-art-blank-canvas': '顏料還有剩，就用空白畫布再倒一幅不同配色的作品。不含顏料與字貼，字貼可另外選購。',
    'fluid-art-word-sticker': '搭配空白畫布或已完成的流動畫，貼上文字就能為作品添上新年祝福。字型已裁切好，選喜歡的款式即可；不含畫布與顏料。',
    'fluid-art-wall-clay': '將完成的砂畫或流動畫貼上牆展示，不用另外釘洞。一包4小塊，建議一幅作品使用一包。',
    'sand-art-craft-knife': '掀開貼紙、處理精細邊角時更順手；沒有自備美工刀時可一起加購。刀刃銳利，請由大人操作並妥善收納。',
    'sand-art-frame-15': '把完成的15×15cm砂畫裝框，方便擺放展示或送禮。販售空像框，照片中的砂畫為搭配示意，不包含在內。',
    'sand-art-frame-20': '把完成的20×20cm羊Diss砂畫裝框，方便擺放展示或送禮。販售空像框，照片中的砂畫為搭配示意，不包含在內。',
    'sand-art-frame': '替完成的砂畫加上像框，方便擺放展示或送禮。請依作品尺寸選購；不包含照片中的砂畫。',
    'sand-art-extra-color': '在基礎配色上追加漸層層次。每組搭配好5色色沙，可做出兩種不同深度的漸層；不含春聯底板與工具。',
    'sand-art-24color': '一次備齊24種色沙，讓同一張圖案有更多配色選擇。A／B／C三組任選，也能一次選購72色全組。',
    'sand-art-24color-bundle': 'A、B、C三組一次備齊，共72色色沙，適合想自由搭配更多色系的創作者。不含底板與工具。',
    'sand-art-metallic': '用鉑金或香檳銀點綴字框、邊線與小細節，讓砂畫多一點金屬光澤。選擇單色即可局部搭配。',
    'sand-art-metallic-trio': '金、銀、玫瑰金箔三色一組，為砂畫或流動畫表面添上不規則的閃亮層次。與均勻顆粒的金屬色沙質感不同。',
    'sand-art-baseboard': '想換個配色再做一次，可以單買底板與貼紙，搭配手邊的色沙繼續創作。不含色沙與工具。',
    'sand-art-baseboard-artist': '羊Diss系列底板與貼紙，可搭配手邊材料重新配色、再做一幅作品。不含色沙與工具。'
  };
  window.AddonProductInfo = info;
  const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = '../../css/addon-product-info.css?v=20261116-modal-width'; document.head.append(css);
  const key = location.pathname.split('/').filter(Boolean).pop();
  if (!info[key]) return;
  const titleBlock = document.querySelector('.work__intro .work__title-block');
  if (!titleBlock || titleBlock.querySelector('.addon-product-intro')) return;
  const p = document.createElement('p'); p.className = 'addon-product-intro'; p.textContent = info[key]; titleBlock.append(p);
})();
