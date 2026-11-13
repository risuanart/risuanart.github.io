# IG／Facebook／Google／Pinterest 商品上架設定 — 交接摘要

> 這份文件是給「接手這件事的人／另一個聊天室」看的，把目前做到哪裡、
> 接下來要做什麼、相關技術細節整理在一起，不用重新問一次前因後果。
> 2026-11-13 整理。

## 這件事的目標

使用者想要：在 Instagram（以及同步延伸到 Facebook、Google 購物、
Pinterest）發文/限動時可以「標記商品」，點了商品標籤會直接連到
`risuanart.com` 對應的商品頁，不用擠在「個人檔案只能放一個連結」
的限制裡；而且商品之後增減、改價，不用每次手動重新上傳資料。

## 已經做好的事（程式面，不用再重做）

1. **產生腳本**：`scripts/generate-ig-catalog.js`
   - 直接從網站現有的 `js/cart.js`（`PRODUCTS`／`PRODUCT_URLS`／
     `PRODUCT_IMAGES`／`EARLY_BIRD_CUTOFF` 這幾個常數，網站本身顯示
     價格/連結也是讀這幾個常數）衍生出商品資料表，不是另外維護一份
     商品清單。
   - 自動排除 `hidden:true`（已下架/暫停單獨銷售）跟 `price<=0`
     （佔位用假商品）的品項。
   - 早鳥價商品（`earlyBirdPrice`）自動帶上優惠價跟到期日（讀
     `EARLY_BIRD_CUTOFF`，目前是 2026-12-15）。
   - 預購商品（`preorder:true`）在 Google/Pinterest 那份會標成
     `availability: preorder`，到貨日期用 2027-01-01（對應網站上
     「2027 年 1 月初陸續出貨」的說法）。
   - 輸出兩份檔案：
     - `feeds/instagram-shop.csv` —— Meta 格式，**IG 跟 Facebook 商店
       共用同一份**（都是連到同一個 Meta Commerce Manager 目錄）。
     - `feeds/google-shopping.csv` —— Google Merchant Center 格式，
       **Google 購物跟 Pinterest Catalogs 共用這一份**（Pinterest 官方
       文件說明可以直接沿用 Google 購物的資料表格式）。
   - 目前產出 **23 筆商品**（可自選款式的商品，例如沙畫底板 7 款圖案、
     流動畫字貼 5 款設計，都是「一個商品鍵一筆」，不會因為裡面有多款
     式而拆成好幾筆）。

2. **全自動更新**：`.github/workflows/update-ig-catalog.yml`
   - 觸發條件：push 到 `main` 分支，且改到 `js/cart.js`、任何
     `products/**/index.html`，或這支產生腳本本身。
   - 自動重新跑產生腳本、自動 commit 回 repo——**使用者之後只要照
     平常流程加商品/改價格，這兩份資料表會自動更新，不用手動做任何
     事**。已經實測跑過兩次，確認正常運作。

3. **部署後的固定網址**（給各平台「排程抓取」用）：
   - `https://risuanart.com/feeds/instagram-shop.csv`
   - `https://risuanart.com/feeds/google-shopping.csv`

## ⚠️ 目前卡住的地方：網站還在維護模式

`risuanart.com` 現在顯示「網站架設中」（使用者之前開啟的維護模式），
**這兩個 feeds 網址要等網站恢復對外開放後才看得到內容**。開始去各
平台做審核申請之前，務必先確認：

```
curl -s https://risuanart.com/feeds/instagram-shop.csv | head -3
```
能正常抓到 CSV 內容（不是「網站架設中」那頁），才代表可以開始申請。

**重要背景知識**：`risuanart.com`（無 www）實際是由 **Cloudflare
Pages**（專案 `risuanart-github-io`）服務，不是 GitHub Pages——
2026-11-11 前後因為 GitHub Pages 容量快爆了刻意切換過去的。要恢復
正式網站，去 Cloudflare 後台的 `risuanart-github-io` 這個 Pages 專案
→ 設定 → 建置與部署 → 把「正式分支」從 `maintenance` 改回 `main`。
詳細經過見這個 repo 的 `HANDOFF.md` 2026-11-13 條目、`AGENTS.md`
開頭的更正說明。

## 接下來要做的事（使用者要自己在各平台操作，無法由程式代勞）

### 1. Instagram Shopping（優先順序最高，使用者原始需求）
1. 確認 IG 帳號是「商業帳號」，且綁定一個 Facebook 粉絲專頁。
2. 到 [Meta Commerce Manager](https://business.facebook.com/commerce/)
   建立商務帳戶／商品目錄，選「上傳資料摘要 Data feed」。
3. 資料來源網址填 `https://risuanart.com/feeds/instagram-shop.csv`，
   設定排程抓取頻率（例如每天一次）。
4. 把目錄跟 IG 商業帳號連結，送出帳戶/商品審核（通常需要幾個工作天）。
5. 審核通過後，發文/限動/Reels 時選「標註商品」即可。

### 2. Facebook 商店
- 跟 IG 用**同一個** Meta 目錄，審核通過後直接在粉絲專頁設定裡開啟
  「商店」分頁、選同一個目錄即可，不需要額外步驟。

### 3. Google Merchant Center（免費商品資訊）
1. 建立 Google Merchant Center 帳號，驗證 `risuanart.com` 網站所有權。
2. 新增資料來源 → 選「排程抓取」→ 網址填
   `https://risuanart.com/feeds/google-shopping.csv`。
3. 商品審核通過後，會開始出現在 Google 搜尋/Google 購物的「免費商品
   資訊」裡。

### 4. Pinterest Catalogs
1. 確認是 Pinterest 商業帳號。
2. Catalogs 功能裡新增目錄，來源網址一樣填
   `https://risuanart.com/feeds/google-shopping.csv`（跟 Google 共用）。
3. 審核通過後可以建立 Product Pins。

### 5. LINE——已明確排除
使用者確認過：LINE 商城不是開放式自助上架機制（需要已是合作電商平台，
或走商業合作申請），要在 LINE 內直接下單也需要經營 LINE 官方帳號，
跟「不用手動維護」的前提衝突。使用者目前沒有打算經營官方帳號，**這次
不處理**，之後如果真的要經營 LINE 官方帳號可以回頭重新評估。

## 這份目錄涵蓋的商品（23 筆，自動產生，不用手動核對）

2026 春聯流動畫材料包（經典紅／迎春粉）、藝術家系列羊Diss舞蹈（紅／藍）、
7 款春聯砂畫材料包、漸層沙自選色、像框（15／20cm）、24色任選組
（單組／72色全組）、金屬色沙、金箔碎片三色組、沙畫筆刀、沙畫底板
（一般／羊Diss舞蹈）、流動畫空白畫布、流動畫字貼——完整清單跟即時
價格請直接看 `feeds/instagram-shop.csv`，不要在這份文件裡維護第二份
清單（會跟程式產生的實際內容脫鉤）。
