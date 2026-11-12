# TROUBLESHOOTING.md — risuanart.github.io

真實發生過的錯誤，依「症狀／原因／解法」整理，遇到類似狀況先查這裡，
不用每次重新從頭排查。修一個真實 bug 之後，請依 `AGENTS.md` 的規則
順手補一條進來（三行講完就好，不用長篇大論）。

---

### GitHub Pages 查起來建置成功，但 risuanart.com 看到的還是舊內容／沒變成維護頁
- **原因**：`risuanart.com`（無 www）的 DNS 實際指到 **Cloudflare
  Pages**（專案 `risuanart-github-io`，`main` 分支自動部署），不是
  GitHub Pages——2026-11-11 前後因為 GitHub Pages 素材容量快爆了，
  切過去擴大容量，但沒有同步更新文件，才會在 2026-11-13 這次「切
  GitHub Pages 的 maintenance 分支卻沒有效果」上踩了一次。GitHub
  Pages 的建置狀態跟 Cloudflare Pages 完全是兩個獨立系統，查
  `gh api .../pages/builds/latest` 顯示成功，只代表 GitHub Pages 那
  份建置成功，不代表 `risuanart.com` 真的更新。
- **解法**：驗證/切換都要去 Cloudflare 後台的 `risuanart-github-io`
  Pages 專案（設定 → 建置與部署 → 正式分支）操作，不是 GitHub repo
  的 Settings → Pages；驗證內容是否生效用
  `curl -s https://risuanart.com/`，不要只信 GitHub Pages 的 API
  回報。詳見 `AGENTS.md`「專案簡介」開頭的更正說明、`HANDOFF.md`
  2026-11-13 條目。

### 新建頁面的桌面版主導覽缺少「課程」選單
- **原因**：桌面導覽 HTML 是各頁各自維護；手機選單雖由 `js/site-menu.js` 共用產生，桌面選單不會自動同步。
- **解法**：新頁需沿用既有頁面的桌面課程下拉選單；新增頁面後掃描所有 `.site-header__nav`，確認均有 `nav-courses-toggle`。

### 購物說明頁配送清單比段落大，手機項目符號貼邊
- **原因**：一般章節清單沒有共用排版基準，且重設樣式清掉 `ul` 內距後，原生外側 marker 會伸出清單文字邊界。
- **解法**：`.chapter > ul:not([class])` 統一沿用內文字級/行高，使用清單內的項目符號並以文字縮排控制換行；有專屬 class 的功能清單仍用元件樣式。

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


## 手機切換作品主題後暫留上一主題照片
- 症狀：標題已換成新主題，大圖載入完成前仍看到舊照片。
- 原因：直接替換同一 img 的 src，缺少等待狀態與過期請求保護。
- 解法：換圖時立即換新 img 並隱藏，載入／解碼完成後確認仍為目前選取再顯示；加入載入與失敗提示、版本化資源網址。

### 手機滑動課程輪播後卡片仍半透明
- 症狀：手指滑到的課程維持淡化，按箭頭才恢復。
- 原因：觸控捲動只停止播放，未更新選中索引。
- 解法：捲動結束後依卡片與容器中心距離同步選中項目。

### 課程步驟預約連結遮住說明
- 症狀：新增預約連結疊在說明文字上。
- 原因：套用共用text-link，受到既有定位樣式影響。
- 解法：獨立course-step__booking-link，正常文字流與上方間距。

### 首頁羊Diss藍影片仍搭配紅照片
- 原因：同步程式已修改但HTML腳本網址仍沿用舊版本，瀏覽器可能使用快取。
- 解法：更新HTML中帶既有參數的腳本版本，檢查實際載入網址並等待紅藍完整切換，確認照片計算透明度同步。
