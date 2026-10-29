# PROJECT_MAP.md — risuanart.github.io

## 頁面地圖
| 資料夾 | 負責什麼 |
|---|---|
| `/`（index.html） | 首頁，商品/課程精選輪播入口 |
| `courses/` | 課程總覽 + 10 支課程詳細頁 |
| `products/` | 商品總覽（shop/）+ 商品頁（見下方「商品/課程鍵值對照表」） |
| `cart/` | 購物車 + 結帳確認（同一頁，帶 `?orderId=` 參數時切換成確認畫面） |
| `booking/` | 線上預約課程 |
| `account/` | 會員中心（Google 登入、訂單/預約紀錄、點數） |
| `faq/` | 常見問題/預約須知 |
| `gallery/` | 學員作品集 |
| `guides/` | 材料教學文章 |
| `enterprise/` + `enterprise-{案例}/` | 企業/團體課程總覽 + 5 個案例頁 |
| `privacy/` | 隱私權政策 |

## 資料流
- 前端本身**不存放任何資料**，純展示 + 呼叫 `risuan-checkout` 的 API。
- 會員/訂單/預約/點數：存在 `risuan-checkout` 的 Upstash Redis，另外
  同步一份到 Google 表單 + 每日 Redis 全量備份信（細節見 risuan-checkout
  的 `PROJECT_MAP.md`）。
- 金流：結帳流程導向綠界付款頁，付款結果由後端處理，前端只負責
  `fetch POST /api/start-checkout` 送出購物車內容、拿 `orderId` 導向
  `cart/?orderId=xxx` 顯示確認畫面。

## 常見功能 → 連動檔案對照
| 要改的功能 | 通常要碰的檔案 |
|---|---|
| 全站色票 | `css/colors.css` |
| 全站間距/字級 | `css/tokens.css` |
| 商品頁版型/共用寬度容器規則 | `css/products.css` |
| 購物車/結帳邏輯 | `js/cart.js`、`js/checkout.js` |
| 會員登入 | `js/account-auth.js`、`js/account-widget.js` |
| 全站選單 | `js/site-menu.js`、`css/site-menu.css` |
| 頁尾 | `css/site-footer.css`（全站共用，改動影響所有頁面） |
| 新增商品頁 | 複製現有 `products/{slug}/index.html` 結構，價格/商品鍵值要
  同時更新 `risuan-checkout` 的 `lib/products.js`（兩邊不是同一份資料，
  忘記同步會導致「未知的商品」結帳錯誤，這個專案已經踩過，見下方
  「商品/課程鍵值對照表」跟 `TROUBLESHOOTING.md`） |
| 新增課程頁 | 複製現有 `courses/{slug}/index.html` 結構，並把輪播入口加進
  `courses/index.html` 的 `.course-carousel__track` |
| 新增任何 main 直接子層區塊（不包在 `.chapter` 裡） | 一定要套用
  `.content-container` 或登記進 `css/products.css` 的共用選擇器清單，
  見 `AGENTS.md` |

## 共用檔案（改動要特別小心，先 grep 全站用量）
- `css/tokens.css`、`css/colors.css`：變數源頭。
- `css/products.css`：商品頁樣板 + 全站寬度容器規則定義處。
- `css/hub-blocks.css`：首頁/商品總覽共用的 `.content-block`/`.product-row`。
- `js/cart.js`：購物車核心邏輯，多頁共用。
- `js/account-auth.js`：會員登入，首頁 + 會員中心共用。

## 商品/課程鍵值對照表
商品/課程在前端（這個 repo）跟後端（`risuan-checkout`）各自用同一組
「鍵值」（key）代表同一個商品，但這是**兩份各自獨立維護的資料**，不是
自動同步的。新增/修改商品前，務必確認兩邊都有登記同樣的鍵值，不然
客人結帳時會出現「未知的商品」錯誤。

**主要商品頁鍵值**（前端 `products/{key}/index.html` 的 `data-product`
屬性，對應後端 `risuan-checkout/lib/products.js` 同名欄位）：

| 鍵值 | 商品 |
|---|---|
| `sand-art-fu` | 春聯流動畫材料包・福星 |
| `sand-art-chun` | 春聯流動畫材料包・春 |
| `sand-art-cai` | 春聯流動畫材料包・財 |
| `sand-art-na-fu` | 春聯流動畫材料包・納福 |
| `sand-art-na-fu-lantern` | 納福燈籠款 |
| `sand-art-ying-chun` | 迎春款 |
| `sand-art-ying-chun-lantern` | 迎春燈籠款 |
| `sand-art-artist-sheep-blue` | 藝術家聯名・藍羊 |
| `sand-art-artist-sheep-red` | 藝術家聯名・紅羊 |
| `sand-art-24color` | 24 色石英砂材料包 |
| `sand-art-24color-bundle` | 24 色石英砂組合包 |
| `sand-art-extra-color` | 加購色沙 |
| `sand-art-frame-15` | 15 號畫框 |
| `sand-art-frame-20` | 20 號畫框 |
| `sand-art-sticker-only` | 貼紙單購 |
| `fluid-art-canvas-kit` | 流動畫畫布材料包 |
| `fluid-art-gift` | 流動畫禮盒 |
| `fluid-art-light-pink` | 流動畫輕量版・粉 |
| `fluid-art-light-red` | 流動畫輕量版・紅 |

**另外在 `lib/products.js` 裡還有 4 個鍵值**（`extra-sand`、
`sticker-only`、`sand-art-light`、`sand-art-collection`）**目前沒有
對應的獨立商品頁**，是加購卡（addon-card）或歷史商品用的鍵值，散落在
各商品頁的加購區塊裡（不是獨立頁面的 `data-product`）。改動這幾個鍵值
前，要先 grep 全站確認實際使用的地方，不要假設只有一處引用。

## 業務邏輯備忘
會變動的實際數字（折扣%、期限、售價）一律以程式碼目前內容為準，這裡
只記錄「規則/機制本身」，避免這份文件過期誤導人：

- **早鳥折扣**：有時間限制的折扣機制，實際折數/期限以
  `js/product-price-discount.js` 目前程式碼為準，不要假設是某個固定
  數字（這個值會隨營運調整）。
- **點數系統**：1 點＝NT$1，結帳時可折抵訂單金額（這個換算比例是
  固定邏輯，不是會變動的營運數字）。
- **企業/團體課程報價**：跟散客材料包不是同一套定價邏輯，走
  `enterprise/` 頁面另外聯繫議價，不要套用材料包頁面的價格邏輯。
- **材料包 vs. 單購材料的定價階梯關係**：商品線分兩種——整組材料包
  （套裝）、單購材料（零散單品，例如貼紙、色沙）。單購品項加總的
  價格，不能遠低於對應材料包的價格，不然客人會只買零散單品組合、
  不買整組材料包，材料包就失去存在意義（材料包本身還有包裝等額外
  成本，不是單純材料加總）。
  **改任何一個材料/單品的價格前，要先檢查這條關係**：調整後單購
  品項加總是否還維持在合理區間，是否需要連動調整其他相關材料或
  對應材料包的價格，不能只孤立改單一品項。實際價格數字以
  `risuan-checkout/lib/products.js`（也要跟這個 repo 的 `js/cart.js`
  同步）目前內容為準。
