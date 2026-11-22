// 依 js/cart.js 的商品資料，改寫每個商品頁 <script type="application/ld+json"> 裡的 offers，
// 讓網站結構化資料（Google 會拿來跟 Merchant Center 的商品資料表比對）跟商品資料表一致：
//   - 預購商品標 PreOrder，並帶開始供貨日（跟 feeds/google-shopping.csv 的 availability_date 同一個）
//   - 早鳥期間用早鳥價，並帶 priceValidUntil；過了 EARLY_BIRD_CUTOFF 就變回原價
//     （價格依「執行當下的台北日期」判斷，所以這支腳本要定期重跑，見
//     .github/workflows/update-ig-catalog.yml 的 schedule）
// 只改 offers，name／image／description 等其他欄位原封不動；重複執行結果相同。
// 沒有對應到商品資料表的頁面（例如已下架或 hidden 的商品）完全不動。

const fs = require("fs");
const path = require("path");
const { collectItems, extractStringConst, CART_JS_PATH, REPO_ROOT, SITE_ORIGIN } = require("./generate-ig-catalog.js");

const PREORDER_AVAILABILITY_DATE = "2027-01-01";

function todayInTaipei() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Taipei" }).format(new Date());
}

function offerFor(pageItems, earlyBirdCutoff, today) {
  const earlyBirdActive = today <= earlyBirdCutoff;
  const priced = pageItems.map((it) => ({
    it,
    current: earlyBirdActive && it.salePrice ? it.salePrice : it.price,
    onSale: earlyBirdActive && Boolean(it.salePrice),
  }));
  // 同一頁有多個商品鍵（例如相框 15／20cm）時，用最低價那一筆，跟原本的寫法一致。
  priced.sort((a, b) => a.current - b.current);
  const lowest = priced[0];
  const allPreorder = pageItems.every((it) => it.preorder);

  const offer = {
    "@type": "Offer",
    url: lowest.it.link,
    priceCurrency: "TWD",
    price: String(lowest.current),
  };
  if (lowest.onSale) offer.priceValidUntil = earlyBirdCutoff;
  offer.availability = allPreorder ? "https://schema.org/PreOrder" : "https://schema.org/InStock";
  if (allPreorder) offer.availabilityStarts = PREORDER_AVAILABILITY_DATE;
  offer.itemCondition = "https://schema.org/NewCondition";
  return offer;
}

function main() {
  const src = fs.readFileSync(CART_JS_PATH, "utf8");
  const earlyBirdCutoff = extractStringConst(src, "EARLY_BIRD_CUTOFF");
  // JSONLD_TODAY 只給測試用（例如模擬早鳥截止後），正常執行不要設。
  const today = process.env.JSONLD_TODAY || todayInTaipei();
  const items = collectItems();

  const byPage = new Map();
  for (const it of items) {
    const rel = it.link.replace(SITE_ORIGIN + "/", "");
    if (!byPage.has(rel)) byPage.set(rel, []);
    byPage.get(rel).push(it);
  }

  let changed = 0;
  let unchanged = 0;
  const skipped = [];
  for (const [rel, pageItems] of byPage) {
    const file = path.join(REPO_ROOT, rel, "index.html");
    if (!fs.existsSync(file)) {
      skipped.push(`${rel}（找不到頁面）`);
      continue;
    }
    const html = fs.readFileSync(file, "utf8");
    const re = /([ \t]*)<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/;
    const m = re.exec(html);
    if (!m) {
      skipped.push(`${rel}（沒有 JSON-LD）`);
      continue;
    }
    let data;
    try {
      data = JSON.parse(m[2]);
    } catch (e) {
      skipped.push(`${rel}（JSON-LD 解析失敗：${e.message}）`);
      continue;
    }
    if (data["@type"] !== "Product") {
      skipped.push(`${rel}（不是 Product）`);
      continue;
    }
    data.offers = offerFor(pageItems, earlyBirdCutoff, today);
    const indent = m[1];
    const body = JSON.stringify(data, null, 2)
      .split("\n")
      .map((line) => indent + line)
      .join("\n");
    const next = html.replace(re, `${indent}<script type="application/ld+json">\n${body}\n${indent}</script>`);
    if (next === html) {
      unchanged++;
    } else {
      fs.writeFileSync(file, next, "utf8");
      changed++;
    }
  }
  console.log(`結構化資料：更新 ${changed} 頁、無變動 ${unchanged} 頁（今天台北 ${today}，早鳥截止 ${earlyBirdCutoff}）`);
  if (skipped.length) console.log("略過：\n  " + skipped.join("\n  "));
}

main();
