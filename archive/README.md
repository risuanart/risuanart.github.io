# 首頁封存區

這裡放的是曾經正式上線過、後來被取代的首頁版本，不是廢棄檔案，是刻意留著
之後有需要可以拿回來用或參考的備份。

## index-paint-canvas.html + main-paint-canvas.js

2026-09 之前的正式首頁：進站是空白互動畫布（「Just paint.」），左邊緣有
直式翻牌動畫的分類標籤（材料包／團體課／課程／商品總覽），點下去畫布會
換成對應分類的文字清單（課程清單、團體課說明），有回訪問候語、「這次畫的
東西是不是清不掉」的敘事機制等等——是花了不少功夫做的一套原創互動設計，
被首頁改版（選物店風格，見 index.html）取代掉，但邏輯與素材完整保留在這
兩個檔案裡。

### 怎麼拿回來用

1. 把 `archive/index-paint-canvas.html` 複製回專案根目錄，蓋掉當時的
   `index.html`
2. 把 `archive/main-paint-canvas.js` 複製回 `js/main.js`
3. 這兩個檔案依賴的 CSS（`.side-tabs`／`.paint-canvas`／`.content-panel`／
   `.content-list` 等等）都還留在 `css/home.css` 裡沒有被刪掉（因為
   `home.css` 同時也是其他頁面共用的頂部列／捲動效果來源，沒有特地把
   畫布專屬的規則切開），所以不用另外找 CSS，直接放回去就能動

### CATEGORIES 資料（課程／團體課清單內容）

`main-paint-canvas.js` 最上面的 `CATEGORIES` 物件，就是課程／團體課
在畫布上顯示的文字清單原始資料，之後如果要幫課程／團體課做成獨立頁面，
內容可以直接從這裡複製，不用重新問使用者一次。
