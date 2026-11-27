



(function () {
  const STORAGE_KEY = "risuan-cart";











  const BASE_PREFIX = (function () {
    const script =
      document.currentScript ||
      Array.from(document.getElementsByTagName("script")).find((s) => /(^|\/)cart\.js(\?|$)/.test(s.getAttribute("src") || ""));
    const src = script ? script.getAttribute("src") || "" : "";
    const match = src.match(/^(.*\/)?js\/cart\.js/);
    return match && match[1] ? match[1] : "";
  })();

























  const PRODUCTS = {












    "fluid-art-light-red": { name: "春聯流動畫材料包（經典紅）", shortName: "經典紅", price: 930, earlyBirdPrice: 790, category: "fluid-art", hasVariant: false, tagline: "單幅 15cm，最快抵達的新年儀式", preorder: true },
    "fluid-art-light-pink": { name: "春聯流動畫材料包（迎春粉）", shortName: "迎春粉", price: 930, earlyBirdPrice: 790, category: "fluid-art", hasVariant: false, tagline: "單幅 15cm，最快抵達的新年儀式", preorder: true },






    "fluid-art-light-pearl": { name: "春聯流動畫材料包（珍珠光）", shortName: "珍珠光", price: 930, earlyBirdPrice: 790, category: "fluid-art", hasVariant: false, tagline: "單幅 15cm，最快抵達的新年儀式", preorder: true },
    "fluid-art-light-frost": { name: "春聯流動畫材料包（極光紅）", shortName: "極光紅", price: 930, earlyBirdPrice: 790, category: "fluid-art", hasVariant: false, tagline: "單幅 15cm，最快抵達的新年儀式", preorder: true },





    "fluid-art-gift": { name: "春聯流動畫材料包・禮盒版", shortName: "禮盒版", price: 1100, earlyBirdPrice: 935, category: "fluid-art", tagline: "雙幅成品，完整的流動畫體驗", hidden: true },





    "sand-art-artist-sheep-red": { name: "藝術家系列・羊Diss舞蹈 Sheep La Danse / 紅", shortName: "羊Diss舞蹈 Sheep La Danse / 紅", price: 860, earlyBirdPrice: 730, category: "sand-art", hasVariant: false, tagline: "致敬馬諦斯《舞蹈》，喜氣酒紅款", preorder: true, sizeCm: 20 },
    "sand-art-artist-sheep-blue": { name: "藝術家系列・羊Diss舞蹈 Sheep La Danse / 藍", shortName: "羊Diss舞蹈 Sheep La Danse / 藍", price: 860, earlyBirdPrice: 730, category: "sand-art", hasVariant: false, tagline: "致敬馬諦斯《舞蹈》，原畫配色藍款", preorder: true, sizeCm: 20 },
    "sand-art-chun": { earlyBirdTagline: "EARLY BIRD · 早鳥優惠價", name: "春聯砂畫材料包・春結 Chun Tied", shortName: "春結 Chun Tied", price: 630, earlyBirdPrice: 530, category: "sand-art", hasVariant: false, tagline: "（待補）", isNew: true, preorder: true, sizeCm: 15 },
    "sand-art-fu": { earlyBirdTagline: "EARLY BIRD · 早鳥優惠價", name: "春聯砂畫材料包・福星 Starry Fu", shortName: "福星 Starry Fu", price: 630, earlyBirdPrice: 530, category: "sand-art", hasVariant: false, tagline: "（待補）", isNew: true, preorder: true, sizeCm: 15 },
    "sand-art-cai": { earlyBirdTagline: "EARLY BIRD · 早鳥優惠價", name: "春聯砂畫材料包・花財 Cai in Bloom", shortName: "花財 Cai in Bloom", price: 630, earlyBirdPrice: 530, category: "sand-art", hasVariant: false, tagline: "（待補）", isNew: true, preorder: true, sizeCm: 15 },
    "sand-art-ying-chun": { earlyBirdTagline: "EARLY BIRD · 早鳥優惠價", name: "春聯砂畫材料包・格裡迎春 Checked in Chun", shortName: "格裡迎春 Checked in Chun", price: 630, earlyBirdPrice: 530, category: "sand-art", hasVariant: false, tagline: "（待補）", isNew: true, preorder: true, sizeCm: 15 },
    "sand-art-na-fu": { earlyBirdTagline: "EARLY BIRD · 早鳥優惠價", name: "春聯砂畫材料包・格裡納福 Checked in Na Fu", shortName: "格裡納福 Checked in Na Fu", price: 630, earlyBirdPrice: 530, category: "sand-art", hasVariant: false, tagline: "（待補）", isNew: true, preorder: true, sizeCm: 15 },

    "sand-art-ying-chun-lantern": { earlyBirdTagline: "EARLY BIRD · 早鳥優惠價", name: "春聯砂畫材料包・燈上迎春 Lit in Chun", shortName: "燈上迎春 Lit in Chun", price: 630, earlyBirdPrice: 530, category: "sand-art", hasVariant: false, tagline: "（待補）", isNew: true, preorder: true, sizeCm: 15 },
    "sand-art-na-fu-lantern": { earlyBirdTagline: "EARLY BIRD · 早鳥優惠價", name: "春聯砂畫材料包・燈上納福 Lit in Na Fu", shortName: "燈上納福 Lit in Na Fu", price: 630, earlyBirdPrice: 530, category: "sand-art", hasVariant: false, tagline: "（待補）", isNew: true, preorder: true, sizeCm: 15 },
    "fluid-art-canvas-kit": { name: "空白畫布＋字貼＋架高杯", price: 0, category: "fluid-art", hasVariant: false, hidden: true, noEarlyBird: true },







    "sand-art-extra-color": { name: "漸層沙・自選色", price: 150, category: "sand-art", tagline: "12 組漸層色任選，材料更齊全", noEarlyBird: true },
    "sand-art-sticker-only": { name: "純貼紙加購・單款", price: 0, category: "sand-art", hasVariant: false, hidden: true, noEarlyBird: true },







    "sand-art-frame-15": { name: "沙畫加購相框・15×15cm", shortName: "相框 15×15cm", price: 150, category: "sand-art", hasVariant: false, tagline: "內徑 15×15cm，木質畫框，讓作品直接上牆", noEarlyBird: true },
    "sand-art-frame-20": { name: "沙畫加購相框・20×20cm", shortName: "相框 20×20cm", price: 199, category: "sand-art", hasVariant: false, tagline: "內徑 20×20cm，木質畫框，讓作品直接上牆", noEarlyBird: true },






    "sand-art-24color": { name: "砂畫・24色任選組", price: 400, category: "sand-art", tagline: "24 色單組，A／B／C 任選一組", noEarlyBird: true },
    "sand-art-24color-bundle": { name: "砂畫・24色任選組（72色全組）", shortName: "72色全組", price: 950, category: "sand-art", hasVariant: false, tagline: "A＋B＋C 一次買齊 72 色，比分開買三組更划算", noEarlyBird: true },








    "sand-art-metallic": { name: "沙畫加購色沙・金屬色（鉑金／香檳銀）", price: 45, category: "sand-art", tagline: "鉑金、香檳銀單色任選，或選雙色組一起買", noEarlyBird: true },





    "sand-art-metallic-duo": { name: "沙畫加購色沙・鉑金＋香檳銀雙色組", shortName: "鉑金＋香檳銀雙色組", price: 80, category: "sand-art", hasVariant: false, tagline: "兩色一起買，比分開買單色更划算", hidden: true, noEarlyBird: true },



    "sand-art-metallic-trio": { name: "金箔碎片・金／銀／玫瑰金箔三色組", shortName: "金箔碎片三色組", price: 85, category: "sand-art", hasVariant: false, tagline: "金、銀、玫瑰金箔，三色一組", noEarlyBird: true },


    "sand-art-craft-knife": { name: "沙畫加購筆刀", price: 60, category: "sand-art", hasVariant: false, tagline: "刻細節線條用，材料包附的夾子偏向輔助固定", noEarlyBird: true },





    "sand-art-baseboard": { name: "沙畫底板・單買", price: 200, category: "sand-art", hasVariant: true, tagline: "材料包的沙或亮粉用完，或想换個顏色重新鋪一次時，單獨補一張底板＋貼紙", noEarlyBird: true },
    "sand-art-baseboard-artist": { name: "沙畫底板・羊Diss舞蹈單買", shortName: "羊Diss舞蹈底板單買", price: 300, category: "sand-art", hasVariant: true, tagline: "羊Diss舞蹈系列專用底板，材料用完或想換色時單獨補一張", noEarlyBird: true },



    "fluid-art-blank-canvas": { name: "流動畫加購空白畫布", price: 35, category: "fluid-art", hasVariant: false, tagline: "顏料做完一幅還有剩時，加購一塊畫布再做一幅", noEarlyBird: true },



    "fluid-art-word-sticker": { name: "流動畫加購字貼", price: 70, category: "fluid-art", hasVariant: true, tagline: "5 款設計任選，搭配空白畫布再做一幅，也可以單買貼在作品上", noEarlyBird: true },






    "fluid-art-mini-canvas": { name: "流動畫加購迷你畫布組", shortName: "迷你畫布組", price: 80, category: "fluid-art", hasVariant: false, tagline: "5×5cm 迷你尺寸，正式倒主畫布前先試手感，也能做成一幅迷你春聯", noEarlyBird: true },




    "fluid-art-wall-clay": { name: "加購無痕藝術黏土", shortName: "無痕黏土", price: 30, category: "fluid-art", hasVariant: false, tagline: "一包 4 小塊，讓作品無痕上牆，沙畫、流動畫作品都適用，建議一幅加購一個", noEarlyBird: true },
  };








  const CATEGORY_LABELS = { "fluid-art": "春聯流動畫", "sand-art": "春聯砂畫" };


  const CATEGORY_ORDER = ["fluid-art", "sand-art"];




  const VARIANT_OPTIONS = {
    "fluid-art-gift": ["classic-red", "welcome-pink"],
    "sand-art-extra-color": [
      "warm-apricot",
      "mustard-brown",
      "forest-green",
      "ocean-blue",
      "moss-jade",
      "sunset-orange",
      "ink-grey",
      "lake-teal",
      "sakura-pink",
      "wisteria-purple",
      "rouge-red",
      "spring-sprout",
    ],
    "sand-art-24color": ["set-a", "set-b", "set-c"],
    "sand-art-metallic": ["platinum", "champagne-silver"],



    "sand-art-baseboard": [
      "baseboard-chun",
      "baseboard-cai",
      "baseboard-ying-chun",
      "baseboard-na-fu",
      "baseboard-ying-chun-lantern",
      "baseboard-na-fu-lantern",
      "baseboard-fu",
    ],
    "sand-art-baseboard-artist": ["baseboard-artist-red", "baseboard-artist-blue"],


    "fluid-art-word-sticker": [
      "word-sticker-huancai-fu",
      "word-sticker-gold-fu",
      "word-sticker-black-chun",
      "word-sticker-black-fu-square",
      "word-sticker-black-fu-vertical",
    ],
  };








  const CARD_EXTRA_VARIANTS = {
    "sand-art-metallic": ["sand-art-metallic-duo"],
  };







  const SCHEME_NAMES = {
    "classic-red": "經典紅",
    "welcome-pink": "迎春粉",
    "nafu-wave": "納福（波浪紋）",
    "yingchun-wave": "迎春（波浪紋）",
    "yingchun-grid": "格裡迎春 Checked in Chun",
    "nafu-grid": "格裡納福 Checked in Na Fu",
    "chun": "春",
    "fu": "福",
    "cai": "財",
    "fu-sheep": "福（羊Diss舞蹈 Sheep La Danse）",



    "warm-apricot": "暖杏",
    "mustard-brown": "芥褐",
    "forest-green": "森綠",
    "ocean-blue": "海藍",
    "moss-jade": "苔玉",
    "sunset-orange": "夕橙",
    "ink-grey": "墨灰",
    "lake-teal": "湖青",
    "sakura-pink": "櫻粉",
    "wisteria-purple": "藤紫",
    "rouge-red": "胭脂",
    "spring-sprout": "春芽",





    "set-a": "A｜暖色組",
    "set-b": "B｜藍紫組",
    "set-c": "C｜綠棕組",

    "platinum": "鉑金",
    "champagne-silver": "香檳銀",

    "baseboard-chun": "春結 Chun Tied",
    "baseboard-cai": "花財 Cai in Bloom",
    "baseboard-ying-chun": "格裡迎春 Checked in Chun",
    "baseboard-na-fu": "格裡納福 Checked in Na Fu",
    "baseboard-ying-chun-lantern": "燈上迎春 Lit in Chun",
    "baseboard-na-fu-lantern": "燈上納福 Lit in Na Fu",
    "baseboard-fu": "福星 Starry Fu",
    "baseboard-artist-red": "羊Diss舞蹈・紅",
    "baseboard-artist-blue": "羊Diss舞蹈・藍",

    "word-sticker-huancai-fu": "幻彩福",
    "word-sticker-gold-fu": "金色福",
    "word-sticker-black-chun": "黑色春",
    "word-sticker-black-fu-square": "黑色福（方）",
    "word-sticker-black-fu-vertical": "黑色福（直）",
  };



  function itemUnitPrice(item) {
    const product = PRODUCTS[item.productKey];
    return product ? product.price : 0;
  }

  function itemLineTotal(item) {
    return itemUnitPrice(item) * item.qty;
  }







  const EARLY_BIRD_CUTOFF = "2026-12-15";
  const EARLY_BIRD_RATE = 0.85;







  const PREORDER_NOTE = "預購・2027 年 1 月初陸續出貨";
  const PREORDER_NOTE_SHORT = "預購・1 月初出貨";
  function todayInTaipei() {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei" }).format(new Date());
  }
  function earlyBirdPrice(value) {
    const product = typeof value === "object" ? value : null;
    const price = product ? product.price : value;
    if (!price || (product && product.noEarlyBird) || todayInTaipei() > EARLY_BIRD_CUTOFF) return { discounted: price, amount: 0 };
    const discounted = product && product.earlyBirdPrice != null ? product.earlyBirdPrice : Math.round(price * EARLY_BIRD_RATE);
    return { discounted, amount: price - discounted };
  }

  function itemLineTotalDiscounted(item) {
    const unit = itemUnitPrice(item);
    return earlyBirdPrice(PRODUCTS[item.productKey] || unit).discounted * item.qty;
  }











  function priceDiscountHTMLPlain(value, qty) {
    const unitPrice = typeof value === "object" ? value.price : value;
    const { discounted, amount } = earlyBirdPrice(value);
    const originalTotal = unitPrice * qty;
    const discountedTotal = discounted * qty;
    if (amount <= 0) return `$${originalTotal.toLocaleString()}`;
    return `<s class="price-discount__original">$${originalTotal.toLocaleString()}</s> <span class="price-discount__final">$${discountedTotal.toLocaleString()}</span>`;
  }

  const EARLY_BIRD_TAGLINE = "EARLY BIRD · 早鳥優惠價";

  function earlyBirdActive() {
    return todayInTaipei() <= EARLY_BIRD_CUTOFF;
  }




  const SCHEME_IMAGES = {
    "classic-red": BASE_PREFIX + "assets/images/products/fluid-art/RS_05.7_產品圖片_800x800拷貝.jpg",
    "welcome-pink": BASE_PREFIX + "assets/images/products/fluid-art/RS_05.8_產品圖片_800x800拷貝.jpg",
    "warm-apricot": BASE_PREFIX + "assets/images/products/sand-art-extra-color/sand-art-extra-color-warm-apricot.jpg",
    "mustard-brown": BASE_PREFIX + "assets/images/products/sand-art-extra-color/sand-art-extra-color-mustard-brown.jpg",
    "forest-green": BASE_PREFIX + "assets/images/products/sand-art-extra-color/sand-art-extra-color-forest-green.jpg",
    "ocean-blue": BASE_PREFIX + "assets/images/products/sand-art-extra-color/sand-art-extra-color-ocean-blue.jpg",
    "moss-jade": BASE_PREFIX + "assets/images/products/sand-art-extra-color/sand-art-extra-color-moss-jade.jpg",
    "sunset-orange": BASE_PREFIX + "assets/images/products/sand-art-extra-color/sand-art-extra-color-sunset-orange.jpg",
    "ink-grey": BASE_PREFIX + "assets/images/products/sand-art-extra-color/sand-art-extra-color-ink-grey.jpg",
    "lake-teal": BASE_PREFIX + "assets/images/products/sand-art-extra-color/sand-art-extra-color-lake-teal.jpg",
    "sakura-pink": BASE_PREFIX + "assets/images/products/sand-art-extra-color/sand-art-extra-color-sakura-pink.jpg",
    "wisteria-purple": BASE_PREFIX + "assets/images/products/sand-art-extra-color/sand-art-extra-color-wisteria-purple.jpg",
    "rouge-red": BASE_PREFIX + "assets/images/products/sand-art-extra-color/sand-art-extra-color-rouge-red.jpg",
    "spring-sprout": BASE_PREFIX + "assets/images/products/sand-art-extra-color/sand-art-extra-color-spring-sprout.jpg",
    "set-a": BASE_PREFIX + "assets/images/products/sand-art-24color/sand-art-24color-set-a.jpg",
    "set-b": BASE_PREFIX + "assets/images/products/sand-art-24color/sand-art-24color-set-b.jpg",
    "set-c": BASE_PREFIX + "assets/images/products/sand-art-24color/sand-art-24color-set-c.jpg",
    "platinum": BASE_PREFIX + "assets/images/products/sand-art-metallic/sand-art-metallic-platinum.jpg",
    "champagne-silver": BASE_PREFIX + "assets/images/products/sand-art-metallic/sand-art-metallic-champagne-silver.jpg",

    "baseboard-chun": BASE_PREFIX + "assets/images/products/sand-art-baseboard/sand-art-baseboard-chun.jpg",
    "baseboard-cai": BASE_PREFIX + "assets/images/products/sand-art-baseboard/sand-art-baseboard-cai.jpg",
    "baseboard-ying-chun": BASE_PREFIX + "assets/images/products/sand-art-baseboard/sand-art-baseboard-ying-chun.jpg",
    "baseboard-na-fu": BASE_PREFIX + "assets/images/products/sand-art-baseboard/sand-art-baseboard-na-fu.jpg",
    "baseboard-ying-chun-lantern": BASE_PREFIX + "assets/images/products/sand-art-baseboard/sand-art-baseboard-ying-chun-lantern.jpg",
    "baseboard-na-fu-lantern": BASE_PREFIX + "assets/images/products/sand-art-baseboard/sand-art-baseboard-na-fu-lantern.jpg",
    "baseboard-fu": BASE_PREFIX + "assets/images/products/sand-art-baseboard/sand-art-baseboard-fu.jpg",
    "baseboard-artist-red": BASE_PREFIX + "assets/images/products/sand-art-baseboard/sand-art-baseboard-artist-red.jpg",
    "baseboard-artist-blue": BASE_PREFIX + "assets/images/products/sand-art-baseboard/sand-art-baseboard-artist-blue.jpg",

    "word-sticker-huancai-fu": BASE_PREFIX + "assets/images/products/fluid-art-word-sticker/fluid-art-word-sticker-huancai-fu.jpg",
    "word-sticker-gold-fu": BASE_PREFIX + "assets/images/products/fluid-art-word-sticker/fluid-art-word-sticker-gold-fu.jpg",
    "word-sticker-black-chun": BASE_PREFIX + "assets/images/products/fluid-art-word-sticker/fluid-art-word-sticker-black-chun.jpg",
    "word-sticker-black-fu-square": BASE_PREFIX + "assets/images/products/fluid-art-word-sticker/fluid-art-word-sticker-black-fu-square.jpg",
    "word-sticker-black-fu-vertical": BASE_PREFIX + "assets/images/products/fluid-art-word-sticker/fluid-art-word-sticker-black-fu-vertical.jpg",
  };





  const SCHEME_DETAIL_IMAGES = {
    "classic-red": BASE_PREFIX + "assets/images/products/fluid-art/RS_05.1_產品圖片_800x800拷貝.jpg",
    "welcome-pink": BASE_PREFIX + "assets/images/products/fluid-art/RS_05.2_產品圖片_800x800拷貝.jpg",
  };

  function detailImageSrc(scheme) {
    return SCHEME_DETAIL_IMAGES[scheme] || null;
  }




  const PRODUCT_IMAGES = {
    "fluid-art-light-red": BASE_PREFIX + "assets/images/products/fluid-art/fluid-art-light-main-red.jpg",
    "fluid-art-light-pink": BASE_PREFIX + "assets/images/products/fluid-art/fluid-art-light-main-pink.jpg",
    "fluid-art-light-pearl": BASE_PREFIX + "assets/images/products/fluid-art/fluid-art-light-main-pearl.jpg",
    "fluid-art-light-frost": BASE_PREFIX + "assets/images/products/fluid-art/fluid-art-light-main-frost.jpg",
    "sand-art-chun": BASE_PREFIX + "assets/images/products/sand-art-chun/sand-art-chun-main.jpg",
    "sand-art-fu": BASE_PREFIX + "assets/images/products/sand-art-fu/sand-art-fu-main.jpg",
    "sand-art-cai": BASE_PREFIX + "assets/images/products/sand-art-cai/sand-art-cai-main.jpg",
    "sand-art-ying-chun": BASE_PREFIX + "assets/images/products/sand-art-ying-chun/sand-art-ying-chun-main.jpg",
    "sand-art-na-fu": BASE_PREFIX + "assets/images/products/sand-art-na-fu/sand-art-na-fu-main.jpg",
    "sand-art-ying-chun-lantern": BASE_PREFIX + "assets/images/products/sand-art-ying-chun-lantern/sand-art-ying-chun-lantern-main.jpg",
    "sand-art-na-fu-lantern": BASE_PREFIX + "assets/images/products/sand-art-na-fu-lantern/sand-art-na-fu-lantern-main.jpg",
    "sand-art-artist-sheep-red": BASE_PREFIX + "assets/images/products/sand-art-artist/sand-art-artist-red-main.jpg",
    "sand-art-artist-sheep-blue": BASE_PREFIX + "assets/images/products/sand-art-artist/sand-art-artist-blue-main.jpg",




    "sand-art-frame-15": BASE_PREFIX + "assets/images/products/sand-art-frame/sand-art-frame-plain-15.jpg",
    "sand-art-frame-20": BASE_PREFIX + "assets/images/products/sand-art-frame/sand-art-frame-plain-20.jpg",
    "sand-art-24color-bundle": BASE_PREFIX + "assets/images/products/sand-art-24color/sand-art-24color-bundle.jpg",
    "sand-art-metallic-duo": BASE_PREFIX + "assets/images/products/sand-art-metallic-duo/sand-art-metallic-duo-main.jpg",
    "sand-art-metallic-trio": BASE_PREFIX + "assets/images/products/sand-art-metallic-trio/sand-art-metallic-trio-main.jpg",
    "sand-art-craft-knife": BASE_PREFIX + "assets/images/products/sand-art-craft-knife/sand-art-craft-knife-main.jpg",
    "fluid-art-blank-canvas": BASE_PREFIX + "assets/images/products/fluid-art-blank-canvas/fluid-art-blank-canvas-main.jpg",
    "fluid-art-mini-canvas": BASE_PREFIX + "assets/images/products/fluid-art-mini-canvas/fluid-art-mini-canvas-main.jpg",
    "fluid-art-wall-clay": BASE_PREFIX + "assets/images/products/fluid-art-wall-clay/fluid-art-wall-clay-main.jpg",
  };











  const PRODUCT_COLORWAY_FRAMES = {
    "fluid-art-light-red": Array.from({ length: 7 }, (_, i) =>
      BASE_PREFIX + `assets/images/products/fluid-art/fluid-art-red-fu-${String(i + 1).padStart(2, "0")}.webp?v=clear1`),
    "fluid-art-light-frost": Array.from({ length: 6 }, (_, i) =>
      BASE_PREFIX + `assets/images/products/fluid-art/fluid-art-frost-fu-${String(i + 1).padStart(2, "0")}.webp?v=clear1`),
    "fluid-art-light-pink": Array.from({ length: 9 }, (_, i) =>
      BASE_PREFIX + `assets/images/products/fluid-art/fluid-art-pink-chun-${String(i + 1).padStart(2, "0")}.webp`),
    "fluid-art-light-pearl": Array.from({ length: 7 }, (_, i) =>
      BASE_PREFIX + `assets/images/products/fluid-art/fluid-art-pearl-fu-${String(i).padStart(2, "0")}.webp?v=aligned-v2`),
    "sand-art-chun": [
      BASE_PREFIX + "assets/images/products/sand-art-chun/sand-art-chun-combo-1.png",
      BASE_PREFIX + "assets/images/products/sand-art-chun/sand-art-chun-combo-2.png",
      BASE_PREFIX + "assets/images/products/sand-art-chun/sand-art-chun-combo-3.png",
    ],
    "sand-art-fu": [
      BASE_PREFIX + "assets/images/products/sand-art-fu/sand-art-fu-combo-1.png",
      BASE_PREFIX + "assets/images/products/sand-art-fu/sand-art-fu-combo-2.png",
      BASE_PREFIX + "assets/images/products/sand-art-fu/sand-art-fu-combo-3.png",
    ],
    "sand-art-cai": [
      BASE_PREFIX + "assets/images/products/sand-art-cai/sand-art-cai-combo-1.png",
      BASE_PREFIX + "assets/images/products/sand-art-cai/sand-art-cai-combo-2.png",
      BASE_PREFIX + "assets/images/products/sand-art-cai/sand-art-cai-combo-3.png",
    ],
    "sand-art-ying-chun": [
      BASE_PREFIX + "assets/images/products/sand-art-ying-chun/sand-art-ying-chun-combo-1.png",
      BASE_PREFIX + "assets/images/products/sand-art-ying-chun/sand-art-ying-chun-combo-2.png",
      BASE_PREFIX + "assets/images/products/sand-art-ying-chun/sand-art-ying-chun-combo-3.png",
    ],
    "sand-art-na-fu": [
      BASE_PREFIX + "assets/images/products/sand-art-na-fu/sand-art-na-fu-combo-1.png",
      BASE_PREFIX + "assets/images/products/sand-art-na-fu/sand-art-na-fu-combo-2.png",
      BASE_PREFIX + "assets/images/products/sand-art-na-fu/sand-art-na-fu-combo-3.png",
    ],
    "sand-art-ying-chun-lantern": [
      BASE_PREFIX + "assets/images/products/sand-art-ying-chun-lantern/sand-art-ying-chun-lantern-combo-1.png",
      BASE_PREFIX + "assets/images/products/sand-art-ying-chun-lantern/sand-art-ying-chun-lantern-combo-2.png",
      BASE_PREFIX + "assets/images/products/sand-art-ying-chun-lantern/sand-art-ying-chun-lantern-combo-3.png",
    ],
    "sand-art-na-fu-lantern": [
      BASE_PREFIX + "assets/images/products/sand-art-na-fu-lantern/sand-art-na-fu-lantern-combo-1.png",
      BASE_PREFIX + "assets/images/products/sand-art-na-fu-lantern/sand-art-na-fu-lantern-combo-2.png",
      BASE_PREFIX + "assets/images/products/sand-art-na-fu-lantern/sand-art-na-fu-lantern-combo-3.png",
    ],
  };









  const PLACEHOLDER_PHOTO_ICON = `<svg class="placeholder-box__icon" viewBox="0 0 24 24" width="1.8em" height="1.8em" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="1.5"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 16l-5.5-5.5a1 1 0 0 0-1.4 0L6 19"/></svg>`;





  function schemeImageSrc(scheme) {
    return SCHEME_IMAGES[scheme] || null;
  }

  function thumbHTML(item, className) {
    const src = SCHEME_IMAGES[item.scheme] || PRODUCT_IMAGES[item.productKey];
    if (src) {
      const product = PRODUCTS[item.productKey];
      const schemeName = SCHEME_NAMES[item.scheme] || "";
      return `<img class="${className}" src="${src}" alt="${product ? product.name : ""}・${schemeName}成品參考圖" loading="lazy">`;
    }
    return `<div class="${className} placeholder-box placeholder-box--photo" aria-hidden="true">${PLACEHOLDER_PHOTO_ICON}<span class="placeholder-box__text">圖片待補</span></div>`;
  }



  const PRODUCT_URLS = {
    "fluid-art-light-red": BASE_PREFIX + "products/fluid-art-light-red/",
    "fluid-art-light-pink": BASE_PREFIX + "products/fluid-art-light-pink/",
    "fluid-art-light-pearl": BASE_PREFIX + "products/fluid-art-light-pearl/",
    "fluid-art-light-frost": BASE_PREFIX + "products/fluid-art-light-frost/",
    "fluid-art-gift": BASE_PREFIX + "products/fluid-art-gift/",
    "sand-art-artist-sheep-red": BASE_PREFIX + "products/sand-art-artist-sheep-red/",
    "sand-art-artist-sheep-blue": BASE_PREFIX + "products/sand-art-artist-sheep-blue/",
    "sand-art-chun": BASE_PREFIX + "products/sand-art-chun/",
    "sand-art-fu": BASE_PREFIX + "products/sand-art-fu/",
    "sand-art-cai": BASE_PREFIX + "products/sand-art-cai/",
    "sand-art-ying-chun": BASE_PREFIX + "products/sand-art-ying-chun/",
    "sand-art-na-fu": BASE_PREFIX + "products/sand-art-na-fu/",
    "sand-art-ying-chun-lantern": BASE_PREFIX + "products/sand-art-ying-chun-lantern/",
    "sand-art-na-fu-lantern": BASE_PREFIX + "products/sand-art-na-fu-lantern/",
    "sand-art-extra-color": BASE_PREFIX + "products/sand-art-extra-color/",
    "sand-art-frame-15": BASE_PREFIX + "products/sand-art-frame/",
    "sand-art-frame-20": BASE_PREFIX + "products/sand-art-frame/",
    "sand-art-24color": BASE_PREFIX + "products/sand-art-24color/",
    "sand-art-24color-bundle": BASE_PREFIX + "products/sand-art-24color/",


    "sand-art-metallic": BASE_PREFIX + "products/sand-art-metallic/",
    "sand-art-metallic-duo": BASE_PREFIX + "products/sand-art-metallic/",
    "sand-art-metallic-trio": BASE_PREFIX + "products/sand-art-metallic-trio/",
    "sand-art-craft-knife": BASE_PREFIX + "products/sand-art-craft-knife/",
    "fluid-art-blank-canvas": BASE_PREFIX + "products/fluid-art-blank-canvas/",
    "sand-art-baseboard": BASE_PREFIX + "products/sand-art-baseboard/",
    "sand-art-baseboard-artist": BASE_PREFIX + "products/sand-art-baseboard-artist/",
    "fluid-art-word-sticker": BASE_PREFIX + "products/fluid-art-word-sticker/",
    "fluid-art-mini-canvas": BASE_PREFIX + "products/fluid-art-mini-canvas/",
    "fluid-art-wall-clay": BASE_PREFIX + "products/fluid-art-wall-clay/",
  };

  const CART_PAGE_URL = BASE_PREFIX + "cart/";

  function readCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function writeCart(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    updateBadges();
    document.dispatchEvent(new CustomEvent("cart:updated"));
    scheduleCartSync();
  }

  function clearCart() {
    writeCart([]);
  }

  // 2026-11-26新增：購物車只存在localStorage，後端完全不知道登入會員
  // 購物車裡有什麼，沒辦法在客人離開後主動提醒「購物車還有商品」——
  // 這裡在每次購物車變動（writeCart()是所有增刪改的共用出口）時，
  // 如果客人是登入會員，debounce一下（2秒內連續操作只送最後一次）把
  // 目前購物車同步到後端（見risuan-checkout的api/account.js
  // action=sync-cart／lib/member-cart.js），讓後端的提醒信cron（見
  // lib/cart-reminders.js）能找到「有同步購物車、但一段時間沒動作」的
  // 會員主動寄信。訪客（沒登入）沒有email可以寄信，不同步。失敗了
  // （網路問題、API暫時掛掉）就算了，不影響客人結帳本身，不重試、
  // 不提示錯誤。
  const CART_SYNC_API_BASE = "https://risuan-checkout.vercel.app";
  let cartSyncTimer = null;
  function scheduleCartSync() {
    if (!window.RisuanAccount || typeof window.RisuanAccount.getToken !== "function") return;
    const token = window.RisuanAccount.getToken();
    if (!token) return;
    clearTimeout(cartSyncTimer);
    cartSyncTimer = setTimeout(() => {
      const latestToken = window.RisuanAccount.getToken();
      if (!latestToken) return;
      const items = readCart().map((item) => {
        const product = PRODUCTS[item.productKey];
        return {
          productKey: item.productKey,
          name: product ? product.name : item.productKey,
          schemeName: SCHEME_NAMES[item.scheme] || "",
          qty: item.qty,
        };
      });
      fetch(`${CART_SYNC_API_BASE}/api/account`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + latestToken },
        body: JSON.stringify({ action: "sync-cart", items }),
      }).catch(() => {});
    }, 2000);
  }

  function mergeItem(items, productKey, scheme, qty) {
    const id = [productKey, scheme].join("__");
    const existing = items.find((item) => item.id === id);
    if (existing) {
      existing.qty += qty;
      return existing;
    }
    const item = { id, productKey, scheme, qty };
    items.push(item);
    return item;
  }

  function addItem(productKey, scheme, qty) {
    if (!PRODUCTS[productKey]) return;
    const items = readCart();
    mergeItem(items, productKey, scheme, qty || 1);
    writeCart(items);
  }

  function importMetaItems(requested) {
    const quantities = new Map();
    for (const { key, qty } of requested) {
      quantities.set(key, (quantities.get(key) || 0) + qty);
    }
    const entries = [...quantities].sort(([left], [right]) => left.localeCompare(right));
    const importKey = JSON.stringify(entries);
    const items = readCart();
    if (items.some((item) => item.metaImports?.includes(importKey))) return;

    for (const [key, qty] of entries) {
      const item = mergeItem(items, key, "default", qty);
      item.metaImports = [...(item.metaImports || []), importKey];
    }
    writeCart(items);
  }

  function setQty(id, qty) {
    let items = readCart();
    if (qty <= 0) {
      items = items.filter((i) => i.id !== id);
    } else {
      const item = items.find((i) => i.id === id);
      if (item) item.qty = qty;
    }
    writeCart(items);
  }

  function removeItem(id) {
    writeCart(readCart().filter((i) => i.id !== id));
  }




  function changeScheme(id, newScheme) {
    const items = readCart();
    const item = items.find((i) => i.id === id);
    if (!item || item.scheme === newScheme) return;

    const newId = [item.productKey, newScheme].join("__");
    const existing = items.find((i) => i.id === newId);
    if (existing) {
      existing.qty += item.qty;
      writeCart(items.filter((i) => i.id !== id));
    } else {
      item.scheme = newScheme;
      item.id = newId;
      writeCart(items);
    }
  }

  function cartCount() {
    return readCart().reduce((sum, i) => sum + i.qty, 0);
  }

  function cartTotal() {
    const total = readCart().reduce((sum, i) => sum + itemLineTotalDiscounted(i), 0);
    return total;
  }

  function cartTotalOriginal() {
    return readCart().reduce((sum, i) => sum + itemLineTotal(i), 0);
  }



  function updateBadges() {
    const count = cartCount();
    document.querySelectorAll(".cart-badge__count").forEach((el) => {
      el.textContent = String(count);
    });
    document.querySelectorAll(".cart-badge").forEach((el) => {
      el.setAttribute("aria-label", `購物車，目前 ${count} 件`);
    });
  }










  function activeScheme(scope) {
    const root = scope || document;
    const chip = root.querySelector('.color-picker__chip[aria-pressed="true"], .pattern-card[aria-pressed="true"]');
    if (chip) return chip.dataset.scheme;
    const select = root.querySelector(".variant-select:not([data-addon-scheme]):not([data-addon-variant])");
    return select ? select.value : null;
  }







  const CART_SOUND_SRC = BASE_PREFIX + "assets/audio/cart-chime.mp3";




  function playRealCartSound() {
    try {
      const audio = new Audio(CART_SOUND_SRC);
      audio.volume = 0.55;



      let fellBack = false;
      const fallback = () => {
        if (fellBack) return;
        fellBack = true;
        playSynthChime();
      };
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(fallback);
      }
      audio.addEventListener("error", fallback, { once: true });
    } catch (e) {
      playSynthChime();
    }
  }




  let cartAudioCtx = null;
  function playSynthChime() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!cartAudioCtx) cartAudioCtx = new AudioContextClass();
      if (cartAudioCtx.state === "suspended") cartAudioCtx.resume();

      const now = cartAudioCtx.currentTime;
      const notes = [
        { freq: 1046.5, start: 0, dur: 0.1 },
        { freq: 1568.0, start: 0.055, dur: 0.18 },
      ];
      notes.forEach(({ freq, start, dur }) => {
        const osc = cartAudioCtx.createOscillator();
        const gain = cartAudioCtx.createGain();
        osc.type = "triangle";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now + start);
        gain.gain.linearRampToValueAtTime(0.14, now + start + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
        osc.connect(gain);
        gain.connect(cartAudioCtx.destination);
        osc.start(now + start);
        osc.stop(now + start + dur + 0.02);
      });
    } catch (e) {

    }
  }

  function playCartChime() {
    playRealCartSound();
  }




  function pulseCartBadge() {
    document.querySelectorAll(".cart-badge").forEach((el) => {
      el.classList.remove("is-pulsing");
      void el.offsetWidth;
      el.classList.add("is-pulsing");
    });
  }









  function flyToCart(sourceIcon) {
    const cartIcon = document.querySelector(".cart-badge-wrap .cart-badge svg");
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!sourceIcon || !cartIcon || prefersReducedMotion) {
      pulseCartBadge();
      return;
    }

    const startRect = sourceIcon.getBoundingClientRect();
    const endRect = cartIcon.getBoundingClientRect();
    const deltaX =
      endRect.left + endRect.width / 2 - (startRect.left + startRect.width / 2);
    const deltaY =
      endRect.top + endRect.height / 2 - (startRect.top + startRect.height / 2);

    const arcLift = -Math.max(60, Math.abs(deltaY) * 0.5);

    const clone = sourceIcon.cloneNode(true);
    clone.style.position = "fixed";
    clone.style.left = startRect.left + "px";
    clone.style.top = startRect.top + "px";
    clone.style.width = startRect.width + "px";
    clone.style.height = startRect.height + "px";
    clone.style.margin = "0";



    clone.style.color = getComputedStyle(cartIcon).color;
    clone.style.zIndex = "60";
    clone.style.pointerEvents = "none";
    document.body.appendChild(clone);

    const animation = clone.animate(
      [
        { transform: "translate(0, 0) scale(1) rotate(0deg)", opacity: 1, offset: 0 },
        {
          transform: `translate(${deltaX * 0.5}px, ${deltaY * 0.5 + arcLift}px) scale(1.15) rotate(-8deg)`,
          opacity: 1,
          offset: 0.55,
        },
        {
          transform: `translate(${deltaX}px, ${deltaY}px) scale(0.35) rotate(6deg)`,
          opacity: 0,
          offset: 1,
        },
      ],
      { duration: 650, easing: "cubic-bezier(0.3, 0, 0.55, 1)" }
    );

    animation.onfinish = () => {
      clone.remove();
      pulseCartBadge();
    };
  }






  const TOAST_ENTER_DELAY_MS = 20;
  const TOAST_VISIBLE_MS = 2600;
  const TOAST_LEAVE_MS = 1000;

  function showCartToast(message) {
    let container = document.querySelector(".cart-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "cart-toast-container";
      container.setAttribute("aria-live", "polite");
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "cart-toast";
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => {
      setTimeout(() => toast.classList.add("is-visible"), TOAST_ENTER_DELAY_MS);
    });

    setTimeout(() => {
      toast.classList.remove("is-visible");
      toast.classList.add("is-leaving");
      setTimeout(() => toast.remove(), TOAST_LEAVE_MS);
    }, TOAST_VISIBLE_MS);
  }




  function initColorHint() {
    const hints = document.querySelectorAll(".work__color-hint-name");
    if (!hints.length) return;

    function update() {
      const scheme = activeScheme();
      const name = scheme ? SCHEME_NAMES[scheme] || scheme : "";
      hints.forEach((el) => (el.textContent = name));
    }

    document.querySelectorAll(".color-picker__chip, .pattern-card").forEach((chip) => {
      chip.addEventListener("click", update);
    });
    update();
  }





  function initBuyQty() {
    const steppers = document.querySelectorAll("[data-buy-qty]");
    if (!steppers.length) return null;

    const MAX_QTY = 20;

    function getQty() {
      return parseInt(steppers[0].querySelector("[data-qty-value]").textContent, 10) || 1;
    }

    function setQty(qty) {
      qty = Math.max(1, Math.min(MAX_QTY, qty));
      steppers.forEach((stepper) => {
        stepper.querySelector("[data-qty-value]").textContent = qty;
        stepper.querySelector("[data-qty-minus]").disabled = qty <= 1;
        stepper.querySelector("[data-qty-plus]").disabled = qty >= MAX_QTY;
      });
    }

    steppers.forEach((stepper) => {
      stepper
        .querySelector("[data-qty-minus]")
        .addEventListener("click", () => setQty(getQty() - 1));
      stepper
        .querySelector("[data-qty-plus]")
        .addEventListener("click", () => setQty(getQty() + 1));
    });

    setQty(1);
    return { getQty, setQty };
  }








  function initAddonQty() {
    const MAX_QTY = 20;
    document.querySelectorAll("[data-addon-qty]").forEach((stepper) => {
      const valueEl = stepper.querySelector("[data-qty-value]");
      const minusBtn = stepper.querySelector("[data-qty-minus]");
      const plusBtn = stepper.querySelector("[data-qty-plus]");

      function setQty(qty) {
        qty = Math.max(1, Math.min(MAX_QTY, qty));
        valueEl.textContent = qty;
        minusBtn.disabled = qty <= 1;
        plusBtn.disabled = qty >= MAX_QTY;
      }

      minusBtn.addEventListener("click", () => setQty(parseInt(valueEl.textContent, 10) - 1));
      plusBtn.addEventListener("click", () => setQty(parseInt(valueEl.textContent, 10) + 1));
      setQty(1);
    });
  }




  const CHECK_ICON_HTML = '<path d="M5 13l4 4L19 7"/>';












  function getSelectedAddons() {
    const items = [];
    document.querySelectorAll("[data-addon-select]:checked").forEach((checkbox) => {
      const productKey = checkbox.dataset.product;
      const row = checkbox.closest("[data-addon-row]");
      const qtyEl = row && row.querySelector("[data-addon-qty] [data-qty-value]");
      const qty = qtyEl ? parseInt(qtyEl.textContent, 10) || 1 : 1;
      const schemeSelect = row && row.querySelector("[data-addon-scheme]");
      const scheme = schemeSelect ? schemeSelect.value : "default";
      items.push({ productKey, qty, scheme });
    });
    return items;
  }



  function resetSelectedAddons() {
    document.querySelectorAll("[data-addon-select]:checked").forEach((checkbox) => {
      checkbox.checked = false;
    });
  }








  function initAddToCart(buyQty) {
    document.querySelectorAll("[data-add-to-cart]").forEach((btn) => {
      const label = btn.querySelector(".work__cta-label");
      const svg = btn.querySelector("svg");
      const originalLabel = label ? label.textContent : null;
      const originalIconHTML = !label && svg ? svg.innerHTML : null;



      const scope = btn.closest("[data-product-card]") || undefined;
      btn.addEventListener("click", () => {





        const productKey = btn.dataset.product;



        const scheme = activeScheme(scope) || "default";





        const addonQtyEl = scope && scope.querySelector("[data-addon-qty] [data-qty-value]");
        const qty = !scope && buyQty ? buyQty.getQty() : addonQtyEl ? parseInt(addonQtyEl.textContent, 10) || 1 : 1;
        addItem(productKey, scheme, qty);



        let addonCount = 0;
        if (!scope) {
          getSelectedAddons().forEach((addon) => {
            if (!addon.productKey) return;
            addItem(addon.productKey, addon.scheme || "default", addon.qty);
            addonCount += 1;
          });
          resetSelectedAddons();
        }
        playCartChime();


        flyToCart(svg);
        const product = PRODUCTS[productKey];
        const schemeName = SCHEME_NAMES[scheme] || "";
        const detail = schemeName ? `（${schemeName}）` : "";
        const qtyDetail = qty > 1 ? `　×${qty}` : "";
        const addonDetail = addonCount > 0 ? `　＋加購 ${addonCount} 項` : "";
        showCartToast(`已加入：${product ? product.name : ""}${detail}${qtyDetail}${addonDetail}`);
        if (!scope && buyQty) buyQty.setQty(1);
        if (addonQtyEl) {
          addonQtyEl.textContent = "1";
          const stepper = addonQtyEl.closest("[data-addon-qty]");
          stepper.querySelector("[data-qty-minus]").disabled = true;
          stepper.querySelector("[data-qty-plus]").disabled = false;
        }

        btn.disabled = true;
        if (label) {
          label.textContent = "已加入 ✓";
        } else if (svg) {
          svg.innerHTML = CHECK_ICON_HTML;
        }
        setTimeout(() => {
          if (label) {
            label.textContent = originalLabel;
          } else if (svg && originalIconHTML !== null) {
            svg.innerHTML = originalIconHTML;
          }
          btn.disabled = false;
        }, 1200);
      });
    });
  }








  function initBuyNow(buyQty) {
    const CHECKOUT_API_BASE = "https://risuan-checkout.vercel.app";
    document.querySelectorAll("[data-buy-now]").forEach((btn) => {
      const originalLabel = btn.textContent;
      btn.addEventListener("click", async () => {







        const productKey = btn.dataset.product;
        const product = PRODUCTS[productKey];
        if (!product) return;
        const qty = buyQty ? buyQty.getQty() : 1;



        const scope = btn.closest("[data-product-card]") || undefined;
        const scheme = activeScheme(scope);
        const schemeName = scheme ? SCHEME_NAMES[scheme] || "" : "";


        const cartItems = [{ productKey, name: product.name, schemeName, qty }];
        getSelectedAddons().forEach((addon) => {
          const addonProduct = PRODUCTS[addon.productKey];
          if (!addonProduct) return;
          const schemeName = SCHEME_NAMES[addon.scheme] || "";
          cartItems.push({ productKey: addon.productKey, name: addonProduct.name, schemeName, qty: addon.qty });
        });
        btn.disabled = true;
        btn.textContent = "處理中…";
        try {
          const res = await fetch(`${CHECKOUT_API_BASE}/api/start-checkout`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cartItems }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "建立訂單失敗");
          resetSelectedAddons();
          if (data.orderAccessToken) {
            try { sessionStorage.setItem('risuan-order-access:'+data.orderId,data.orderAccessToken); }
            catch { throw new Error('瀏覽器無法保存結帳連線，請允許網站儲存空間後重試。'); }
          }
          window.location.href = `${BASE_PREFIX}cart/?orderId=${encodeURIComponent(data.orderId)}`;
        } catch (err) {
          alert(`無法直接購買：${err.message}，請改用「加入購物車」`);
          btn.disabled = false;
          btn.textContent = originalLabel;
        }
      });
    });
  }





  function initAddonToggle() {
    document.querySelectorAll("[data-addon-toggle]").forEach((btn) => {
      const list = document.getElementById(btn.getAttribute("aria-controls"));
      if (!list) return;
      btn.addEventListener("click", () => {
        const expanded = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!expanded));
        list.hidden = expanded;
      });
    });
  }






  function initCartPreview() {
    const wraps = document.querySelectorAll(".cart-badge-wrap");
    if (!wraps.length) return;




    document.querySelectorAll(".cart-preview__view").forEach((el) => {
      el.href = CART_PAGE_URL;
    });

    function closeAll() {
      wraps.forEach((wrap) => {
        const panel = wrap.querySelector(".cart-preview");
        const toggle = wrap.querySelector(".cart-badge");
        if (panel) panel.hidden = true;
        if (toggle) toggle.setAttribute("aria-expanded", "false");
      });
    }

    function renderPreview(panel) {
      const list = panel.querySelector(".cart-preview__list");
      const emptyMsg = panel.querySelector(".cart-preview__empty");
      const totalEl = panel.querySelector(".cart-preview__total");
      if (!list) return;

      const items = readCart();
      list.innerHTML = "";
      const hasItems = items.length > 0;
      list.hidden = !hasItems;
      if (emptyMsg) emptyMsg.hidden = hasItems;
      if (totalEl) totalEl.hidden = !hasItems;

      items.forEach((item) => {
        const product = PRODUCTS[item.productKey];
        if (!product) return;
        const schemeName = SCHEME_NAMES[item.scheme] || "";
        const metaParts = [];
        if (schemeName) metaParts.push(`${schemeName} × ${item.qty}`);
        else metaParts.push(`× ${item.qty}`);
        const li = document.createElement("li");
        li.className = "cart-preview__item";
        li.innerHTML = `
          ${thumbHTML(item, "cart-preview__item-thumb")}
          <div class="cart-preview__item-info">
            <p class="cart-preview__item-name">${product.name}</p>
            <p class="cart-preview__item-meta">${metaParts.join("　")}</p>
          </div>
          <p class="cart-preview__item-price price-text">$${itemLineTotalDiscounted(item).toLocaleString()}</p>
        `;
        list.appendChild(li);
      });

      if (totalEl) totalEl.textContent = `小計 $${cartTotal().toLocaleString()}`;
    }

    wraps.forEach((wrap) => {
      const toggle = wrap.querySelector(".cart-badge");
      const panel = wrap.querySelector(".cart-preview");
      const continueBtn = wrap.querySelector(".cart-preview__continue");
      if (!toggle || !panel) return;

      toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = !panel.hidden;
        closeAll();
        if (!isOpen) {
          renderPreview(panel);
          panel.hidden = false;
          toggle.setAttribute("aria-expanded", "true");
        }
      });

      if (continueBtn) {
        continueBtn.addEventListener("click", () => closeAll());
      }

      panel.addEventListener("click", (e) => e.stopPropagation());
    });

    document.addEventListener("click", closeAll);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAll();
    });
    document.addEventListener("cart:updated", () => {
      wraps.forEach((wrap) => {
        const panel = wrap.querySelector(".cart-preview");
        if (panel && !panel.hidden) renderPreview(panel);
      });
    });
  }

  function buildCartItemEl(item) {
    const product = PRODUCTS[item.productKey];
    const li = document.createElement("li");
    li.className = "cart-item";
    const productUrl = PRODUCT_URLS[item.productKey] || "#";


    const variantKeys = product.hasVariant === false ? [] : VARIANT_OPTIONS[item.productKey] || [];
    const schemeSelectHTML = variantKeys.length
      ? `<select class="cart-item__scheme-select" aria-label="更改規格">${variantKeys
          .map((key) => `<option value="${key}"${key === item.scheme ? " selected" : ""}>${SCHEME_NAMES[key] || key}</option>`)
          .join("")}</select>`
      : "";







    const discountActive = product.price && !product.noEarlyBird && earlyBirdActive();
    const cornerBadge = discountActive ? `<span class="discount-badge-corner discount-badge-corner--standalone">SALE</span>` : "";
    const discountTagline = discountActive ? `<p class="cart-item__discount-tagline">${product.earlyBirdTagline || EARLY_BIRD_TAGLINE}</p>` : "";
    li.innerHTML = `
      <a class="cart-item__thumb-link" href="${productUrl}">
        ${thumbHTML(item, "cart-item__thumb")}${cornerBadge}
      </a>
      <div class="cart-item__body">
        <div class="cart-item__info">
          <a class="cart-item__name" href="${productUrl}">${product.shortName || product.name}</a>
          ${schemeSelectHTML}
          ${discountTagline}
        </div>
        <div class="cart-item__meta">
          <div class="cart-item__qty-actions">
            <div class="cart-item__qty">
              <button type="button" data-qty-decrease aria-label="減少數量"><svg width="8" height="2" viewBox="0 0 8 2" aria-hidden="true"><path fill="currentColor" d="M0 0h8v2H0z"/></svg></button>
              <input type="text" class="cart-item__qty-input" data-qty-input inputmode="numeric" value="${item.qty}" aria-label="數量">
              <button type="button" data-qty-increase aria-label="增加數量"><svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true"><path fill="currentColor" d="M3 5v3h2V5h3V3H5V0H3v3H0v2h3z"/></svg></button>
            </div>
            <button type="button" class="cart-item__remove" aria-label="移除">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/></svg>
            </button>
          </div>
          <p class="cart-item__price price-text">${priceDiscountHTMLPlain(product, item.qty)}</p>
        </div>
      </div>
    `;
    const qtyInput = li.querySelector("[data-qty-input]");
    li.querySelector("[data-qty-decrease]").addEventListener("click", () => setQty(item.id, item.qty - 1));
    li.querySelector("[data-qty-increase]").addEventListener("click", () => setQty(item.id, item.qty + 1));




    qtyInput.addEventListener("change", () => {
      const parsed = parseInt(qtyInput.value, 10);
      setQty(item.id, Number.isNaN(parsed) ? item.qty : parsed);
    });
    li.querySelector(".cart-item__remove").addEventListener("click", () => removeItem(item.id));
    const schemeSelect = li.querySelector(".cart-item__scheme-select");
    if (schemeSelect) schemeSelect.addEventListener("change", (e) => changeScheme(item.id, e.target.value));
    return li;
  }




  function renderCartPage() {
    const groupsEl = document.querySelector(".cart-groups");
    if (!groupsEl) return;
    const columnsEl = document.querySelector(".cart-columns");
    const emptyMsg = document.querySelector(".cart-empty");
    const totalEl = document.querySelector(".cart-page .work__price");

    function render() {
      const items = readCart();
      groupsEl.innerHTML = "";
      const hasItems = items.length > 0;
      groupsEl.hidden = !hasItems;
      if (columnsEl) columnsEl.hidden = !hasItems;
      if (emptyMsg) emptyMsg.hidden = hasItems;

      const byCategory = new Map();
      items.forEach((item) => {
        const product = PRODUCTS[item.productKey];
        if (!product) return;
        const cat = product.category || "other";
        if (!byCategory.has(cat)) byCategory.set(cat, []);
        byCategory.get(cat).push(item);
      });

      const orderedCategories = [...byCategory.keys()].sort(
        (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b)
      );
      orderedCategories.forEach((cat) => {
        const groupItems = byCategory.get(cat);
        const section = document.createElement("section");
        section.className = "cart-group";
        const title = document.createElement("h2");
        title.className = "cart-group__title";
        title.textContent = CATEGORY_LABELS[cat] || cat;
        section.appendChild(title);
        const list = document.createElement("ul");
        list.className = "cart-list";
        groupItems.forEach((item) => list.appendChild(buildCartItemEl(item)));
        section.appendChild(list);
        groupsEl.appendChild(section);
      });

      if (totalEl) {
        const original = cartTotalOriginal();
        const discounted = cartTotal();



        totalEl.innerHTML =
          original > discounted
            ? `小計 <s class="price-discount__original">$${original.toLocaleString()}</s> <span class="price-discount__final">$${discounted.toLocaleString()}</span>`
            : `小計 $${discounted.toLocaleString()}`;
      }
    }

    render();
    document.addEventListener("cart:updated", render);

    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY) render();
    });
  }

  function init() {
    updateBadges();
    initColorHint();
    const buyQty = initBuyQty();
    initAddToCart(buyQty);
    initAddonQty();
    initAddonToggle();
    initBuyNow(buyQty);
    initCartPreview();
    renderCartPage();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }







  window.RisuanCart = {
    readCart,
    clearCart,
    cartTotal,






    addItem,
    importMetaItems,
    showCartToast,
    playCartChime,
    flyToCart,
    earlyBirdPrice,
    earlyBirdActive,
    priceDiscountHTMLPlain,
    EARLY_BIRD_TAGLINE,
    PREORDER_NOTE,
    PREORDER_NOTE_SHORT,
    getCheckoutPayload() {
      return readCart().map((item) => {
        const product = PRODUCTS[item.productKey];
        return {
          productKey: item.productKey,
          name: product ? product.name : item.productKey,
          schemeName: SCHEME_NAMES[item.scheme] || "",
          qty: item.qty,
        };
      });
    },


    PRODUCTS,
    VARIANT_OPTIONS,
    CARD_EXTRA_VARIANTS,
    SCHEME_NAMES,
    CATEGORY_ORDER,
    CATEGORY_LABELS,
    PRODUCT_URLS,
    PRODUCT_IMAGES,
    thumbHTML,
    schemeImageSrc,
    detailImageSrc,
    PRODUCT_COLORWAY_FRAMES,




    initAddToCart,
  };
})();
