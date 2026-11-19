
























const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.join(__dirname, "..");
const CART_JS_PATH = path.join(REPO_ROOT, "js", "cart.js");
const SITE_ORIGIN = "https://risuanart.com";
const BRAND = "日宣繪畫室";





const GOOGLE_CATEGORY = "Arts & Entertainment > Hobbies & Creative Arts > Craft Kits";


const PREORDER_AVAILABILITY_DATE = "2027-01-01";







function extractConst(src, varName) {
  const marker = new RegExp(`const\\s+${varName}\\s*=\\s*\\{`);
  const m = marker.exec(src);
  if (!m) throw new Error(`js/cart.js 裡找不到 const ${varName}，商品資料結構可能改了，這支腳本要跟著更新`);
  let i = m.index + m[0].length - 1;
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





function collectItems() {
  const src = fs.readFileSync(CART_JS_PATH, "utf8");
  const PRODUCTS = extractConst(src, "PRODUCTS");
  const PRODUCT_URLS = extractConst(src, "PRODUCT_URLS");
  const PRODUCT_IMAGES = extractConst(src, "PRODUCT_IMAGES");
  const EARLY_BIRD_CUTOFF = extractStringConst(src, "EARLY_BIRD_CUTOFF");





  const saleStart = new Date().toISOString().replace(/\.\d+Z$/, "+0000");
  const saleEnd = `${EARLY_BIRD_CUTOFF}T23:59+0800`;
  const saleWindow = `${saleStart}/${saleEnd}`;

  const items = [];
  for (const [key, product] of Object.entries(PRODUCTS)) {


    if (product.hidden || !product.price) continue;
    const relLink = PRODUCT_URLS[key];
    if (!relLink) continue;
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
