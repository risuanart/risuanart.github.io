#!/usr/bin/env node
/**
 * 自動產生各平台的商品購物目錄，輸出到 feeds/，部署後是這幾個固定網址：
 *   https://risuanart.com/feeds/instagram-shop.csv   → Meta（IG／Facebook 商店共用同一個目錄）
 *   https://risuanart.com/feeds/google-shopping.csv  → Google Merchant Center 免費商品資訊
 *                                                        （Pinterest Catalogs 也吃同一種格式，可以直接共用這份）
 *
 * 這不是網站本身的建置工具（網站本身還是純手寫 HTML/CSS/JS，不經過任何
 * 轉譯/打包），這支只是額外「從商品資料衍生出幾份給各購物平台用的資料
 * 表」的維運腳本，透過 GitHub Actions（.github/workflows/update-ig-catalog.yml）
 * 在每次商品資料變動時自動重新跑一次、自動 commit 回 repo，不需要使用者
 * 手動操作。
 *
 * 資料來源是 js/cart.js 裡 PRODUCTS／PRODUCT_URLS／PRODUCT_IMAGES／
 * EARLY_BIRD_CUTOFF 這幾個現有常數（網站本身顯示價格/連結也是讀這幾個
 * 常數），不是另外維護一份商品清單——這樣之後加新商品只要照平常流程改
 * cart.js，這幾份給各平台用的目錄就會跟著自動對起來，不會有兩邊各自
 * 維護、改一邊忘記改另一邊而對不起來的風險。
 *
 * cart.js 是寫給瀏覽器執行的（會用到 document.currentScript 等 DOM API），
 * 沒辦法直接 require() 進 Node 執行——這裡用「文字擷取＋獨立求值」的
 * 方式，只取出需要的幾個物件/字串常數本身，不執行整份檔案，所以不會
 * 碰到 cart.js 其他地方依賴瀏覽器環境的程式碼。
 */

const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.join(__dirname, "..");
const CART_JS_PATH = path.join(REPO_ROOT, "js", "cart.js");
const SITE_ORIGIN = "https://risuanart.com";
const BRAND = "日宣繪畫室";
// 手作材料包/課程周邊沒有國際條碼（GTIN）也沒有型號（MPN），Google／
// Pinterest 的資料表格式都支援用 identifier_exists:no 明確告知「這個
// 商品本來就沒有這些識別碼」，不是忘記填，才不會被系統判定成資料缺漏。
// 分類先用 Google 官方分類表裡現成的「手作材料包」這個節點，之後 Google
// 審核如果建議更精確的分類，再回來改這裡一個常數就好。
const GOOGLE_CATEGORY = "Arts & Entertainment > Hobbies & Creative Arts > Craft Kits";
// 預購商品的到貨時間——沿用 cart.js PREORDER_NOTE 裡人類看得懂的說法
// （「2027 年 1 月初陸續出貨」），這裡換算成 Google 要求的 ISO 日期格式。
const PREORDER_AVAILABILITY_DATE = "2027-01-01";

// 從原始碼文字裡擷取「const NAME = { ... };」這段物件字面值本身的文字
// （正確跳過字串、// 與 /* */ 註解裡的大括號，不會被裡面剛好出現的
// { } 字元誤判成物件邊界），交給 new Function() 求值成真正的 JS 物件。
// BASE_PREFIX 在瀏覽器裡是依頁面路徑動態算出來的相對路徑前綴，這裡不
// 需要那個相對路徑語意（我們本來就要組完整的 https://risuanart.com/
// 絕對網址），直接給空字串，串接出來就是乾淨的 repo 相對路徑。
function extractConst(src, varName) {
  const marker = new RegExp(`const\\s+${varName}\\s*=\\s*\\{`);
  const m = marker.exec(src);
  if (!m) throw new Error(`js/cart.js 裡找不到 const ${varName}，商品資料結構可能改了，這支腳本要跟著更新`);
  let i = m.index + m[0].length - 1; // 指到開頭的 {
  const start = i;
  let depth = 0;
  while (i < src.length) {
    const two = src.slice(i, i + 2);
    if (two === "//") {
      const nl = src.indexOf("\n", i);
      i = nl === -1 ? src.length : nl + 1;
      continue;
    }
    if (two === "/*") {
      const end = src.indexOf("*/", i + 2);
      i = end === -1 ? src.length : end + 2;
      continue;
    }
    const ch = src[i];
    if (ch === '"' || ch === "'" || ch === "`") {
      const quote = ch;
      i++;
      while (i < src.length && src[i] !== quote) {
        if (src[i] === "\\") i++;
        i++;
      }
      i++;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        i++;
        break;
      }
    }
    i++;
  }
  const literal = src.slice(start, i);
  // eslint-disable-next-line no-new-func
  return new Function("BASE_PREFIX", "return (" + literal + ")")("");
}

function extractStringConst(src, varName) {
  const m = new RegExp(`const\\s+${varName}\\s*=\\s*"([^"]+)"`).exec(src);
  if (!m) throw new Error(`js/cart.js 裡找不到 const ${varName}`);
  return m[1];
}

function decodeHtmlEntities(str) {
  return String(str)
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

// 補登的商品沒有在 PRODUCT_IMAGES 裡（款式太多、沒有固定「預設圖」，
// 例如沙畫底板 7 款圖案任選），改讀那個商品頁自己的 og:description／
// og:image（頁面作者本來就會填這兩個給社群分享用，直接借用，不用
// 另外維護第三份文案）。
function readPageMeta(relLinkPath) {
  const file = path.join(REPO_ROOT, relLinkPath, "index.html");
  if (!fs.existsSync(file)) return { description: "", image: "" };
  const html = fs.readFileSync(file, "utf8");
  const descM = /name="description"\s+content="([^"]*)"/.exec(html);
  const imgM = /property="og:image"\s+content="([^"]*)"/.exec(html);
  return {
    description: descM ? decodeHtmlEntities(descM[1]) : "",
    image: imgM ? imgM[1] : "",
  };
}

function csvField(v) {
  return '"' + String(v ?? "").replace(/"/g, '""') + '"';
}

function writeCsv(outPath, header, dataRows) {
  const rows = [header.map(csvField).join(",")];
  for (const row of dataRows) rows.push(header.map((col) => csvField(row[col])).join(","));
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, rows.join("\n") + "\n", "utf8");
  return dataRows.length;
}

// 讀 cart.js、過濾出真的要上架的商品（排除 hidden／price<=0 的佔位鍵
// 值），組成一份跟平台無關的中性資料，兩份輸出（Meta／Google）各自從
// 這份中性資料挑自己要的欄位，不用各自重寫一次「怎麼決定連結/圖片/
// 早鳥價」這些邏輯。
function collectItems() {
  const src = fs.readFileSync(CART_JS_PATH, "utf8");
  const PRODUCTS = extractConst(src, "PRODUCTS");
  const PRODUCT_URLS = extractConst(src, "PRODUCT_URLS");
  const PRODUCT_IMAGES = extractConst(src, "PRODUCT_IMAGES");
  const EARLY_BIRD_CUTOFF = extractStringConst(src, "EARLY_BIRD_CUTOFF");

  // 早鳥優惠期間：起點用「現在」（這份資料表每次重新產生的當下），
  // 終點是 cart.js 本來就有的早鳥截止日——不是另外猜一個活動開始日，
  // 這樣截止日改了（改 cart.js 那個常數）這裡也會自動跟著變，不用
  // 回來改這支腳本。
  const saleStart = new Date().toISOString().replace(/\.\d+Z$/, "+0000");
  const saleEnd = `${EARLY_BIRD_CUTOFF}T23:59+0800`;
  const saleWindow = `${saleStart}/${saleEnd}`;

  const items = [];
  for (const [key, product] of Object.entries(PRODUCTS)) {
    // hidden：商品本身被下架/暫停單獨銷售，不給任何平台標記；
    // price<=0：佔位用的假商品（例如還沒定案的加購品鍵值），兩種都排除。
    if (product.hidden || !product.price) continue;
    const relLink = PRODUCT_URLS[key];
    if (!relLink) continue; // 理論上不會發生，商品一定要有對應頁面才能被標記
    const link = `${SITE_ORIGIN}/${relLink.replace(/^\/+/, "")}`;
    const meta = readPageMeta(relLink);
    const imagePath = PRODUCT_IMAGES[key];
    const image = imagePath ? `${SITE_ORIGIN}/${imagePath.replace(/^\/+/, "")}` : meta.image;
    items.push({
      id: key,
      title: product.name,
      description: meta.description,
      price: product.price,
      salePrice: product.earlyBirdPrice || null,
      saleWindow: product.earlyBirdPrice ? saleWindow : null,
      preorder: Boolean(product.preorder),
      link,
      image,
    });
  }
  return items;
}

function buildMetaFeed(items) {
  const header = ["id", "title", "description", "availability", "condition", "price", "sale_price", "sale_price_effective_date", "link", "image_link", "brand"];
  const rows = items.map((it) => ({
    id: it.id,
    title: it.title,
    description: it.description,
    // Meta 的 Commerce Policies 對 preorder 狀態的規則比較嚴格（需要額外
    // 審核欄位），這份目錄暫時維持全部 in stock，跟原本就有的做法一致；
    // 要上線預購標記再回來調整，不在這次「先把三個平台都接上」的範圍內。
    availability: "in stock",
    condition: "new",
    price: `${it.price} TWD`,
    sale_price: it.salePrice ? `${it.salePrice} TWD` : "",
    sale_price_effective_date: it.saleWindow || "",
    link: it.link,
    image_link: it.image,
    brand: BRAND,
  }));
  return writeCsv(path.join(REPO_ROOT, "feeds", "instagram-shop.csv"), header, rows);
}

function buildGoogleFeed(items) {
  // 欄位名稱、identifier_exists、google_product_category 都是 Google
  // Merchant Center 官方規格要的名稱，Pinterest Catalogs 也接受同一種
  // 格式（官方文件本身就說可以直接沿用 Google 購物的資料表），所以這
  // 一份檔案同時給 Google／Pinterest 兩邊用，不用各自分開一份。
  const header = [
    "id",
    "title",
    "description",
    "availability",
    "availability_date",
    "condition",
    "price",
    "sale_price",
    "sale_price_effective_date",
    "link",
    "image_link",
    "brand",
    "google_product_category",
    "identifier_exists",
  ];
  const rows = items.map((it) => ({
    id: it.id,
    title: it.title,
    description: it.description,
    availability: it.preorder ? "preorder" : "in stock",
    availability_date: it.preorder ? PREORDER_AVAILABILITY_DATE : "",
    condition: "new",
    price: `${it.price} TWD`,
    sale_price: it.salePrice ? `${it.salePrice} TWD` : "",
    sale_price_effective_date: it.saleWindow || "",
    link: it.link,
    image_link: it.image,
    brand: BRAND,
    google_product_category: GOOGLE_CATEGORY,
    identifier_exists: "no",
  }));
  return writeCsv(path.join(REPO_ROOT, "feeds", "google-shopping.csv"), header, rows);
}

function main() {
  const items = collectItems();
  const metaCount = buildMetaFeed(items);
  const googleCount = buildGoogleFeed(items);
  console.log(`已產生 ${metaCount} 筆商品到 feeds/instagram-shop.csv（Meta／IG／Facebook 共用）`);
  console.log(`已產生 ${googleCount} 筆商品到 feeds/google-shopping.csv（Google／Pinterest 共用）`);
}

main();
