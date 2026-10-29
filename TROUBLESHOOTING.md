# TROUBLESHOOTING.md — risuanart.github.io

真實發生過的錯誤，依「症狀／原因／解法」整理，遇到類似狀況先查這裡，
不用每次重新從頭排查。修一個真實 bug 之後，請依 `AGENTS.md` 的規則
順手補一條進來（三行講完就好，不用長篇大論）。

---

### 結帳時出現「未知的商品」錯誤
- **原因**：新商品只在這個 repo（前端）登記了 `data-product` 鍵值，
  忘記同步在 `risuan-checkout` 的 `lib/products.js` 加上同一個鍵值。
  前後端的商品資料是兩份各自維護的，不是自動同步的。
- **解法**：確認兩邊的鍵值完全一致。新增/修改商品一律照
  `PROJECT_MAP.md`「商品/課程鍵值對照表」的流程，兩邊一起改。

### 某個區塊在寬螢幕下貼齊螢幕邊緣，跟其他內容的留白對不起來
- **原因**：這個區塊是 `<main>` 的直接子層，沒有包在 `.chapter` 裡，
  也沒有套用全站的 `.content-container` 寬度標準（840px）。已經踩過
  至少 5 次：`.page-wide`（courses 頁自創的 1100px 容器）、
  `.work__close`、`.cart-cross-sell`、`.account-page__layout`、
  `.account-page__banner`。
- **解法**：把這個區塊的 class 加進 `css/products.css` 裡
  `.content-container, .work__close, ...` 那份共用選擇器清單（基礎
  padding 規則 + `@media (min-width: 841px)` 的 max-width 規則兩處都
  要加），或者直接在 HTML 上套用 `.content-container` class。

### 區塊左右留白消失、或比其他地方窄一點
- **原因**：這個區塊自己的 CSS class，跟共用的寬度/間距 class（如
  `.content-container`、`.chapter`）掛在同一個元素上，自己的 class 用
  了 `padding:`/`margin:` 多值簡寫（例如 `padding: 24px 0 40px`），
  簡寫裡的 `0` 把共用 class 設定的左右留白蓋掉了。已經踩過至少 5 次
  （courses-page.css 多處、`.chapter--cta`、`.account-page__banner`
  的 margin）。
- **解法**：改成只用 `padding-top`/`padding-bottom`/`margin-top`/
  `margin-bottom` 這種單邊屬性，不要用多值簡寫動到左右。

### 手機版某個區塊沒有置中，整個貼齊左邊
- **原因**：跟上面同一種簡寫問題，但這次是 `margin:` 簡寫蓋掉了共用
  class 給的 `margin-left: auto; margin-right: auto`（置中用）。
- **解法**：同上，改成只設 `margin-top`/`margin-bottom`。

### 改了一個共用 class，結果某幾個頁面沒有變、或跑版
- **原因**：沒有先確認全站哪些頁面在用這個 class，其中某幾頁其實有
  自己覆蓋一份外觀相似但不完全一樣的樣式，直接改共用規則時沒考慮到。
- **解法**：改動任何共用 class 前，先 `grep -rn` 全站確認實際使用範圍，
  列出所有會被影響的頁面，逐一確認改動後沒問題，不要只改一頁測試就
  當作改完。

### 確認表單欄位之間的間距跑掉（太擠或不對齊）
- **原因**：純粹用一個 `<div>` 包住多個 `.confirm-field`，沒有補上
  `display: flex` 跟 `gap`，瀏覽器預設不會自動排版/留間距。
- **解法**：容器一律補 `display: flex; flex-direction: column` (或視
  排列方向調整) 加上 `gap`，不要依賴子元素自己的 margin 累加。

### 中文內容裡出現「—」符號，讀起來像多了一槓
- **原因**：不小心用了 em-dash（`—`/`——`）。
- **解法**：全站慣例改用逗號或分句，不使用 em-dash。

### 預約付款完成頁顯示的訂金少於客人實際支付金額
- **原因**：畫面誤用了後端扣除估算刷卡費後的入帳金額，當成客人支付的訂金。
- **解法**：顯示後端回傳的 `depositAmount`，這才是綠界向客人收取的金額。
