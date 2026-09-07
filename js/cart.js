/* cart.js —— 購物車：用 localStorage 存，跨頁共用（商品頁／購物車頁），純前端，
   不依賴任何後端。結帳／金流串接尚未開放，這裡只做「加入購物車、查看、調整數量、
   移除」，購物車頁的結帳按鈕維持 disabled，等綠界串接做好才會開放。 */

(function () {
  const STORAGE_KEY = "risuan-cart";

  // 絕對路徑（/ 開頭）在本機用 python -m http.server 測試時沒問題，但在某些
  // 本機預覽工具（例如 VS Code 的預覽/Live Preview）裡，"/" 不一定等於專案
  // 根目錄，會被那些工具的安全機制擋掉（「File does not reside within a
  // trusted folder」）。改回用「相對於目前這一層」的字首，這份 JS 會在不同
  // 深度的頁面執行（首頁、cart.html 在根目錄，商品頁在 /products/ 底下），
  // 用網址路徑判斷現在是哪一層，自動決定要不要多加一層 ../，不用依賴絕對路徑
  // 也能在任何伺服器環境下正確運作。
  const BASE_PREFIX = /\/products\//.test(window.location.pathname) ? "../" : "";

  // 商品資料集中在這裡：cart.js 是唯一需要知道「品項＋價格」的地方，
  // 商品頁本身不需要知道價格邏輯，只需要在按鈕上標明 data-product 是哪一個品項。
  // category 用來在購物車頁分組顯示（見 renderCartPage）——之後砂畫商品頁做好，
  // 只要在這裡多加幾筆 category: "sand-art" 的商品，購物車頁會自動多一組分類
  // 區塊出來，不用重構分組邏輯。
  // hasVariant: false 表示這個商品沒有色系／圖案可選（自由創作組是固定 5 款組合，
  // 不開放自選），商品頁不會有 .color-picker__chip 或 .pattern-card，購物車頁
  // 也不用畫換規格的下拉選單。
  // TODO：sand-art-light／sand-art-collection 的 price 是還沒定案的佔位數字
  // （規格書「$__」），價格確定後這裡跟商品頁上的「$__」都要改。
  // tagline：總覽購物頁手風琴磚（js/products-overview.js）收合狀態顯示的
  // 一句話標語，跟各商品敘事子頁 <p class="intro"> 的完整文案是各自獨立的
  // 兩段文字——這裡故意簡短（收合磚只有一行空間），不是那段文案的複製，
  // 兩處各自維護沒關係，改其中一處不影響另一處。
  // hidden: true——加購項目本質上是「另一件商品」，用跟主商品完全相同的
  // data-add-to-cart／initAddToCart() 機制獨立加入購物車（見各商品頁的
  // .addon-card__cta），但不是訪客會在材料包總覽購物頁單獨瀏覽、選購的品項，
  // 所以在 products-overview.js 組總覽卡片時要排除掉（見那支檔案 init()
  // 開頭的 hidden 過濾），只在各自主商品頁的「延伸創作」區塊才看得到。
  const PRODUCTS = {
    "fluid-art-light": { name: "春聯流動畫材料包・輕巧版", price: 800, category: "fluid-art", tagline: "單幅 15cm，最快抵達的新年儀式" },
    "fluid-art-gift": { name: "春聯流動畫材料包・禮盒版", price: 1100, category: "fluid-art", tagline: "雙幅成品，完整的流動畫體驗" },
    "sand-art-light": { name: "春聯砂畫材料包・輕巧版", price: 0, category: "sand-art", tagline: "8 款圖案任選，撕貼倒沙鋪出你的春聯" },
    "sand-art-collection": { name: "春聯砂畫材料包・自由創作組", price: 0, category: "sand-art", hasVariant: false, tagline: "5 款精選圖案＋26色顏料，自由創作一整套" },
    "sand-art-artist-sheep": { name: "春聯砂畫材料包・羊群報福（進階款）", price: 0, category: "sand-art", tagline: "致敬馬諦斯《舞蹈》，羊群報福紅藍兩色任選" },
    "sand-art-chun": { name: "春聯砂畫材料包・春（基礎款）", price: 0, category: "sand-art", hasVariant: false, tagline: "（待補）" },
    "sand-art-fu": { name: "春聯砂畫材料包・福（基礎款）", price: 0, category: "sand-art", hasVariant: false, tagline: "（待補）" },
    "fluid-art-canvas-kit": { name: "空白畫布＋字貼＋架高杯", price: 0, category: "fluid-art", hasVariant: false, hidden: true },
    "sand-art-extra-color": { name: "額外顏色沙・固定套組", price: 0, category: "sand-art", hasVariant: false, hidden: true },
    "sand-art-sticker-only": { name: "純貼紙加購・單款", price: 0, category: "sand-art", hasVariant: false, hidden: true },
  };
  const CATEGORY_LABELS = { "fluid-art": "春聯流動畫", "sand-art": "春聯砂畫" };
  // 購物車頁分組顯示的固定順序，不跟著「使用者先加哪一類商品」變動——不然同一個
  // 購物車，加入順序不同就會看到兩種不同的分組排列，體驗不一致。
  const CATEGORY_ORDER = ["fluid-art", "sand-art"];

  // 每個商品實際可選的規格清單，購物車頁換規格的下拉選單只列出「這個商品真的有
  // 的選項」，不是把全站所有色系／圖案混在同一份清單裡（不然砂畫商品的下拉會
  // 出現流動畫的「經典紅」，或流動畫商品出現砂畫的圖案，兩邊互不相干）。
  const VARIANT_OPTIONS = {
    "fluid-art-light": ["classic-red", "welcome-pink"],
    "fluid-art-gift": ["classic-red", "welcome-pink"],
    "sand-art-light": ["nafu-wave", "yingchun-wave", "yingchun-grid", "nafu-grid", "chun", "fu", "cai", "fu-sheep"],
    "sand-art-artist-sheep": ["artist-sheep-red", "artist-sheep-blue"],
  };

  // artist-sheep-red／artist-sheep-blue 特地加了 artist-sheep 前綴，不是
  // 直接叫 red／blue——SCHEME_NAMES 是全站共用的一個扁平命名空間，「藝術家
  // 系列」以後如果推出其他畫作／生肖再製，各自的色款鍵值才不會互撞。
  const SCHEME_NAMES = {
    "classic-red": "經典紅",
    "welcome-pink": "迎春粉",
    "nafu-wave": "納福（波浪紋）",
    "yingchun-wave": "迎春（波浪紋）",
    "yingchun-grid": "迎春（格紋版）",
    "nafu-grid": "納福（格紋版）",
    "chun": "春",
    "fu": "福",
    "cai": "財",
    "fu-sheep": "福（羊群報福）",
    "artist-sheep-red": "紅",
    "artist-sheep-blue": "藍",
  };

  // 單件商品的單價／整行小計，購物車頁與迷你購物車預覽共用同一套計算，
  // 避免兩處各自算一次、之後改價格漏改其中一處。
  function itemUnitPrice(item) {
    const product = PRODUCTS[item.productKey];
    return product ? product.price : 0;
  }

  function itemLineTotal(item) {
    return itemUnitPrice(item) * item.qty;
  }

  // 購物車縮圖用「成品模擬圖」（跟套組內容照片不同張）：這張不管輕巧版或禮盒版都
  // 一樣準確（純粹展示成品長相，不涉及套組內容數量差異），兩版共用同一組縮圖，
  // 不需要另外分版本。
  const SCHEME_IMAGES = {
    "classic-red": BASE_PREFIX + "assets/images/products/fluid-art/RS_05.7_產品圖片_800x800拷貝.jpg",
    "welcome-pink": BASE_PREFIX + "assets/images/products/fluid-art/RS_05.8_產品圖片_800x800拷貝.jpg",
    "artist-sheep-red": BASE_PREFIX + "assets/images/products/sand-art-artist/sand-art-artist-red-main.jpg",
  };

  // 總覽格狀購物頁（products/shop.html）電腦版 hover 換圖用的「第二張圖」：
  // 內容物全展開，跟主圖（成品模擬圖）是不同角度／不同用途的真實照片，
  // 不是隨便複製一張湊數。查不到對應圖的商品（目前砂畫兩款都還沒有實拍
  // 素材）就不會有 hover 換圖，見 js/products-overview.js 的條件判斷。
  const SCHEME_DETAIL_IMAGES = {
    "classic-red": BASE_PREFIX + "assets/images/products/fluid-art/RS_05.1_產品圖片_800x800拷貝.jpg",
    "welcome-pink": BASE_PREFIX + "assets/images/products/fluid-art/RS_05.2_產品圖片_800x800拷貝.jpg",
  };

  function detailImageSrc(scheme) {
    return SCHEME_DETAIL_IMAGES[scheme] || null;
  }

  // 沒有款式可選的商品（hasVariant:false，例如「春」單一配色、自由創作組
  // 固定組合）沒有「scheme」概念可以查 SCHEME_IMAGES，縮圖改直接用商品鍵
  // 查這張表，thumbHTML() 在 SCHEME_IMAGES 查無結果時會退回來查這裡。
  const PRODUCT_IMAGES = {
    "sand-art-chun": BASE_PREFIX + "assets/images/products/sand-art-chun/sand-art-chun-main.jpg",
    "sand-art-fu": BASE_PREFIX + "assets/images/products/sand-art-fu/sand-art-fu-main.jpg",
  };

  // 砂畫目前還沒有任何實拍素材，SCHEME_IMAGES 查不到對應圖時，縮圖改畫一個
  // 文字佔位框（跟商品頁 .placeholder-box 同一套視覺語言），不要留一個空的
  // src 讓瀏覽器顯示破圖圖示。className 決定實際尺寸／圓角（見 cart.css
  // .cart-preview__item-thumb／.cart-item__thumb），img 與 placeholder-box
  // 共用同一個 class 就會是同樣的尺寸，呼叫端不用另外判斷。
  // 相片圖示：讓還沒有實拍素材的縮圖看起來是「預留給照片的位置」，不是一格
  // 空白裡飄著兩個字，跟 sand-art-gallery.js 的圖案卡片共用同一個圖示、同一套
  // placeholder-box--photo 排版邏輯（圖示在上、文字在下）。
  const PLACEHOLDER_PHOTO_ICON = `<svg class="placeholder-box__icon" viewBox="0 0 24 24" width="1.8em" height="1.8em" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="1.5"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 16l-5.5-5.5a1 1 0 0 0-1.4 0L6 19"/></svg>`;

  function thumbHTML(item, className) {
    const src = SCHEME_IMAGES[item.scheme] || PRODUCT_IMAGES[item.productKey];
    if (src) {
      const product = PRODUCTS[item.productKey];
      const schemeName = SCHEME_NAMES[item.scheme] || "";
      return `<img class="${className}" src="${src}" alt="${product ? product.name : ""}・${schemeName}成品參考圖" loading="lazy">`;
    }
    return `<div class="${className} placeholder-box placeholder-box--photo" aria-hidden="true">${PLACEHOLDER_PHOTO_ICON}<span class="placeholder-box__text">圖片待補</span></div>`;
  }

  // 縮圖／品名點下去要連去哪個商品頁。
  const PRODUCT_URLS = {
    "fluid-art-light": BASE_PREFIX + "products/fluid-art-light.html",
    "fluid-art-gift": BASE_PREFIX + "products/fluid-art-gift.html",
    "sand-art-light": BASE_PREFIX + "products/sand-art-light.html",
    "sand-art-collection": BASE_PREFIX + "products/sand-art-collection.html",
    "sand-art-artist-sheep": BASE_PREFIX + "products/sand-art-artist-sheep.html",
    "sand-art-chun": BASE_PREFIX + "products/sand-art-chun.html",
    "sand-art-fu": BASE_PREFIX + "products/sand-art-fu.html",
  };

  const CART_PAGE_URL = BASE_PREFIX + "cart.html";

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
  }

  function addItem(productKey, scheme, qty) {
    qty = qty || 1;
    if (!PRODUCTS[productKey]) return;
    const items = readCart();
    const id = [productKey, scheme].join("__");
    const existing = items.find((i) => i.id === id);
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({ id, productKey, scheme, qty });
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

  // 購物車頁直接換色，不用跳回商品頁重選。換色後 id 會變（id 是 productKey__scheme
  // 組出來的），如果購物車裡剛好已經有「同商品＋新顏色」那一筆，數量併過去，
  // 不要變成兩筆重複的品項。
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
    return readCart().reduce((sum, i) => sum + itemLineTotal(i), 0);
  }

  // 全站每一頁都有一個購物車徽章（常駐右上角，圖示＋數字，0 件也照樣顯示，
  // 不會因為購物車是空的就整個消失），用同一個 class 選取全部一起更新。
  function updateBadges() {
    const count = cartCount();
    document.querySelectorAll(".cart-badge__count").forEach((el) => {
      el.textContent = String(count);
    });
    document.querySelectorAll(".cart-badge").forEach((el) => {
      el.setAttribute("aria-label", `購物車，目前 ${count} 件`);
    });
  }

  // 讀取「目前選中的規格變體」：流動畫是色系 chip（.color-picker__chip），
  // 砂畫輕巧版敘事子頁是圖案卡片（.pattern-card），兩種元素共用同一個
  // data-scheme 屬性名稱，這裡不用分開處理。材料包總覽購物頁改用 <select>
  // 緊湊呈現（同時有 4 張商品卡，不能像單一商品頁那樣整頁只有一組選擇器），
  // 找不到 chip 的話退而找 .variant-select 的 value。
  //
  // scope 預設是整個頁面（document）——單一商品頁本來就只有一組選擇器，
  // 全域找剛好符合需求，不用改。總覽頁每張卡片會傳自己的卡片容器當 scope，
  // 這樣才能分辨「現在讀的是哪一張卡片選的規格」，不會读到別張卡片的值。
  function activeScheme(scope) {
    const root = scope || document;
    const chip = root.querySelector('.color-picker__chip[aria-pressed="true"], .pattern-card[aria-pressed="true"]');
    if (chip) return chip.dataset.scheme;
    const select = root.querySelector(".variant-select");
    return select ? select.value : null;
  }

  // 加入購物車的音效：優先播放真的音檔（硬幣/收銀機那種音效素材），檔案還沒放
  // 上去或載入失敗時，自動退回合成音效，不會整個沒聲音。
  //
  // 音檔放這裡：assets/audio/cart-chime.mp3（相對於網站根目錄，實際路徑字首
  // 由 BASE_PREFIX 決定）。之後把下載好的音效檔案改名成 cart-chime.mp3 丟進
  // assets/audio/ 資料夾，重新整理就會自動換成真的音效，不用再改這支程式。
  const CART_SOUND_SRC = BASE_PREFIX + "assets/audio/cart-chime.mp3";

  // new Audio(...) 每次呼叫都建一個新的實例，不重用同一個物件——這樣連續快速
  // 點好幾次「加入購物車」，音效可以疊在一起播放，不會卡在前一次還沒播完
  // 就播不出下一次的聲音。
  function playRealCartSound() {
    try {
      const audio = new Audio(CART_SOUND_SRC);
      audio.volume = 0.55;
      // 音檔還沒放上去時，play() 的 promise 被拒絕跟 <audio> 的 error 事件
      // 常常兩個都會觸發，用這個旗標確保退回合成音效只播一次，不會疊成
      // 聽起來像連按了兩下的雙重音效。
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

  // 合成音效備案：兩個三角波音符快速上揚（C6→G6，中間疊一點點），三角波音色
  // 偏明亮清脆，接近硬幣/收銀機那種「叮！鐺」的感覺，在真的音檔到位之前
  // （或萬一載入失敗）先頂著用，不需要另外的音檔資源。
  let cartAudioCtx = null;
  function playSynthChime() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!cartAudioCtx) cartAudioCtx = new AudioContextClass();
      if (cartAudioCtx.state === "suspended") cartAudioCtx.resume();

      const now = cartAudioCtx.currentTime;
      const notes = [
        { freq: 1046.5, start: 0, dur: 0.1 }, // C6
        { freq: 1568.0, start: 0.055, dur: 0.18 }, // G6，跟第一個音疊一點點
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
      // 合成音效萬一在少數瀏覽器出錯，不該擋住「加入購物車」這個主要動作。
    }
  }

  function playCartChime() {
    playRealCartSound();
  }

  // 購物車圖示短暫放大回彈一次，把按鈕跟右上角的購物車視覺連起來，
  // 讓使用者一眼確認「東西真的加進去了」。用 --ease-overshoot（帶回彈感的
  // 全站既有 token），不用自己另外調曲線。
  function pulseCartBadge() {
    document.querySelectorAll(".cart-badge").forEach((el) => {
      el.classList.remove("is-pulsing");
      void el.offsetWidth; // 強制重排，連續加入購物車也能重播一次動畫
      el.classList.add("is-pulsing");
    });
  }

  // 加入購物車瞬間，複製按鈕上的購物袋圖示，用一段拋物線軌跡飛到右上角的
  // 購物車圖示，抵達的同時才觸發 pulseCartBadge()（圖示回彈），把「東西被丟進
  // 購物車」的動作具象化，不只是文字提示跳出來。用 Element.animate()（Web
  // Animations API）而不是 CSS transition/@keyframes，因為起訖點座標是每次
  // 點擊當下才量出來的（按鈕位置、購物車圖示位置都可能不同），沒辦法預先寫死
  // 在 CSS 裡。base.css 全域的 prefers-reduced-motion 規則只涵蓋 CSS
  // animation/transition，管不到這裡用 JS 產生的動畫，所以這裡自己另外判斷
  // 一次，開啟「減少動態」時直接跳過飛行動畫，只保留圖示回彈當作有加入的回饋。
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
    // 中途往上拉一段高度，飛行軌跡才有拋物線弧度，不是筆直橫移過去。
    const arcLift = -Math.max(60, Math.abs(deltaY) * 0.5);

    const clone = sourceIcon.cloneNode(true);
    clone.style.position = "fixed";
    clone.style.left = startRect.left + "px";
    clone.style.top = startRect.top + "px";
    clone.style.width = startRect.width + "px";
    clone.style.height = startRect.height + "px";
    clone.style.margin = "0";
    // 用購物車圖示本身的顏色（深色），不是按鈕上的圖示顏色——按鈕是實色底
    // （.work__cta--primary 用淺色圖示，襯著深色按鈕底），圖示飛出按鈕、
    // 落在淺色頁面背景上之後，淺色圖示幾乎看不見，等於整段動畫都是空的。
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

  // 加入購物車的提示泡泡：從購物車圖示旁邊滑入，顯示「已加入：商品名 (色系)」，
  // 停留幾秒後自動滑出消失。用 CSS class 觸發 transition（不是 @keyframes），
  // 進場／離場是兩種不同的曲線與位移量，寫在 cart.css 的 .cart-toast／
  // .cart-toast.is-leaving。多筆疊加時新的插在最上面，靠 flex-direction:
  // column-reverse 處理，不用自己算每一則的座標。
  const TOAST_ENTER_DELAY_MS = 20; // 讓瀏覽器先畫出「未進場」的初始狀態，class 才會觸發轉場
  const TOAST_VISIBLE_MS = 2600;
  const TOAST_LEAVE_MS = 1000; // 要跟 cart.css 的 leave transition duration 一致

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

  // 「已選色系：X」提示，跟頁面最上面的色系選擇器連動——色系選擇器離加入購物車
  // 按鈕隔了整個頁面的內容，使用者容易忘記剛剛選的是哪個顏色，這裡在按鈕正上方
  // 即時顯示一次，不用滑回最上面確認。
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

  // 標題買列／收尾購買列的數量選擇器：同一頁的兩處代表同一件主商品，
  // 數字互相同步（改其中一個，另一個跟著變），跟 initColorHint() 的雙處
  // 同步做法一致。只套用在主商品這兩個進入點，延伸創作加購卡
  // （[data-product-card] 範圍內）沒有這組選擇器，一律維持一次加購 1 件。
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

  // 「已加入」暫時提示用的勾勾圖示（跟全站圖示同一套線條風格：
  // stroke-width 2、圓端），純圖示鈕（沒有 .work__cta-label 文字，例如
  // 加購卡、總覽格狀商品卡的圓形「+」）點下去換成這個，不是換文字。
  const CHECK_ICON_HTML = '<path d="M5 13l4 4L19 7"/>';

  // 商品頁「加入購物車」按鈕：讀取當下選中的色系 chip（跟 product-gallery.js
  // 共用同一批 .color-picker__chip，不用另外維護一份選色狀態）。按鈕內有圖示＋
  // 文字兩個子元素的（.work__cta-label 存在），「已加入」的暫時提示只換文字
  // 那個 span，圖示不會被蓋掉；純圖示鈕（沒有文字 label）換成上面的勾勾圖示，
  // 不能沿用「退回整顆按鈕的文字」這條路——那樣會把按鈕原本的 <svg> 整個
  // 清空換成純文字，「已加入」的提示結束後 textContent 復原成空字串
  // （因為一開始就沒有文字節點），圖示就永久消失了，是個真的會炸掉的 bug。
  function initAddToCart(buyQty) {
    document.querySelectorAll("[data-add-to-cart]").forEach((btn) => {
      const productKey = btn.dataset.product;
      const label = btn.querySelector(".work__cta-label");
      const svg = btn.querySelector("svg");
      const originalLabel = label ? label.textContent : null;
      const originalIconHTML = !label && svg ? svg.innerHTML : null;
      // 總覽購物頁的每張卡片是 [data-product-card]，只在那張卡片範圍內找選中的
      // 規格；其他頁面沒有這層包裝，closest() 找不到就退回 null，activeScheme()
      // 收到 undefined 會自己 fallback 成 document，行為跟改之前完全一樣。
      const scope = btn.closest("[data-product-card]") || undefined;
      btn.addEventListener("click", () => {
        // 沒有規格可選的商品（例如自由創作組，固定組合）用固定的 "default" 當
        // 內部 id 用的 scheme key，畫面上不顯示這個字，SCHEME_NAMES 也不會有
        // 對應項目，下面組文字時全部用「有沒有拿到色系名稱」判斷要不要顯示。
        const scheme = activeScheme(scope) || "default";
        // 延伸創作加購卡（scope 有值）沒有數量選擇器，固定一次加購 1 件；
        // 主商品的兩個進入點（scope 是 undefined）才讀取數量選擇器目前的數字。
        const qty = !scope && buyQty ? buyQty.getQty() : 1;
        addItem(productKey, scheme, qty);
        playCartChime();
        // 飛入購物車的動畫要用原本的圖示（複製一份去飛），一定要在下面換成
        // 勾勾之前呼叫，不然飛出去的會是勾勾而不是原本按下去那顆圖示。
        flyToCart(svg);
        const product = PRODUCTS[productKey];
        const schemeName = SCHEME_NAMES[scheme] || "";
        const detail = schemeName ? `（${schemeName}）` : "";
        const qtyDetail = qty > 1 ? `　×${qty}` : "";
        showCartToast(`已加入：${product ? product.name : ""}${detail}${qtyDetail}`);
        if (!scope && buyQty) buyQty.setQty(1);

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

  // 點右上角購物車圖示，跳出一般電商常見的「迷你購物車」下拉：先讓使用者看一眼
  // 裡面有什麼，再自己決定要「查看購物車」（離開這頁去結帳）還是「繼續選購」
  // （關掉面板留在原頁面），不是點了圖示就直接被導離目前正在看的商品頁。
  // 全站每一頁都有一組（.cart-badge-wrap 底下的 .cart-badge + .cart-preview），
  // 用同一套邏輯個別掛上開關行為。
  function initCartPreview() {
    const wraps = document.querySelectorAll(".cart-badge-wrap");
    if (!wraps.length) return;

    // 每個頁面的 HTML 裡「查看購物車」連結本來就寫好對應這一層的相對路徑，
    // 這裡用 CART_PAGE_URL 再蓋一次，保險起見避免哪個頁面的 href 手動寫錯
    // 或之後改版漏改。
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
          <p class="cart-preview__item-price price-text">$${itemLineTotal(item).toLocaleString()}</p>
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
    // 換規格下拉只列這個商品實際有的選項（見 VARIANT_OPTIONS），沒有規格可選的
    // 商品（hasVariant: false，例如自由創作組固定組合）完全不畫這個下拉。
    const variantKeys = product.hasVariant === false ? [] : VARIANT_OPTIONS[item.productKey] || [];
    const schemeSelectHTML = variantKeys.length
      ? `<select class="cart-item__scheme-select" aria-label="更改規格">${variantKeys
          .map((key) => `<option value="${key}"${key === item.scheme ? " selected" : ""}>${SCHEME_NAMES[key] || key}</option>`)
          .join("")}</select>`
      : "";
    li.innerHTML = `
      <a class="cart-item__thumb-link" href="${productUrl}">
        ${thumbHTML(item, "cart-item__thumb")}
      </a>
      <div class="cart-item__body">
        <div class="cart-item__info">
          <a class="cart-item__name" href="${productUrl}">${product.name}</a>
          ${schemeSelectHTML}
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
          <p class="cart-item__price price-text">$${(product.price * item.qty).toLocaleString()}</p>
        </div>
      </div>
    `;
    const qtyInput = li.querySelector("[data-qty-input]");
    li.querySelector("[data-qty-decrease]").addEventListener("click", () => setQty(item.id, item.qty - 1));
    li.querySelector("[data-qty-increase]").addEventListener("click", () => setQty(item.id, item.qty + 1));
    // 直接輸入數字也能改數量，不是只能點 +/-。輸入不是數字或小於等於0時交給
    // setQty 自己的規則處理（見上面 setQty 定義：qty<=0 直接移除這件商品，
    // 跟按到「−」減到0是同一套邏輯，不用另外寫一次）；blur 才觸發，不是每打
    //一個字就送出一次。
    qtyInput.addEventListener("change", () => {
      const parsed = parseInt(qtyInput.value, 10);
      setQty(item.id, Number.isNaN(parsed) ? item.qty : parsed);
    });
    li.querySelector(".cart-item__remove").addEventListener("click", () => removeItem(item.id));
    const schemeSelect = li.querySelector(".cart-item__scheme-select");
    if (schemeSelect) schemeSelect.addEventListener("change", (e) => changeScheme(item.id, e.target.value));
    return li;
  }

  // 購物車頁：依大分類（春聯流動畫／之後的春聯砂畫……）分組顯示，不是扁平的
  // 單一清單，避免橫跨分類的多件商品混在一起難以辨識（見規格書第五章）。
  // 分類順序照 PRODUCTS 裡各商品出現的順序決定，不用另外維護一份順序清單。
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

      if (totalEl) totalEl.textContent = `小計 $${cartTotal().toLocaleString()}`;
    }

    render();
    document.addEventListener("cart:updated", render);
    // 使用者可能同時開兩個分頁，另一頁改了購物車，這一頁也要跟著重畫。
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY) render();
    });
  }

  function init() {
    updateBadges();
    initColorHint();
    const buyQty = initBuyQty();
    initAddToCart(buyQty);
    initCartPreview();
    renderCartPage();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // 給 js/checkout.js 用的最小公開介面：結帳流程需要把購物車內容送去後端
  // 重新計價，但商品名稱／色系名稱這些資料只存在這支檔案的 PRODUCTS／
  // SCHEME_NAMES 裡（cart.js 開頭說過這是唯一該知道商品資料的地方），
  // 與其讓 checkout.js 自己再存一份，不如在這裡開一個小窗口讓它讀。
  // 後端（risuan-checkout/lib/products.js）不信任這裡送過去的任何金額，
  // 一律用自己的價格表重算，這裡只是拿來組出「品項＋數量」的清單。
  window.RisuanCart = {
    readCart,
    cartTotal,
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
    // 以下是唯讀商品資料，給材料包總覽購物頁（js/products-overview.js）用——
    // 那頁沒有另建一份商品資料，直接讀這裡，改價格／規格只要改這一份就好。
    PRODUCTS,
    VARIANT_OPTIONS,
    SCHEME_NAMES,
    CATEGORY_ORDER,
    CATEGORY_LABELS,
    PRODUCT_URLS,
    thumbHTML,
    detailImageSrc,
    // initAddToCart 在這支檔案自己的 init() 時已經跑過一次，但那時候總覽頁的
    // 商品卡片還沒被 products-overview.js 動態建立出來，掃描不到任何按鈕。
    // 開放這個函式讓總覽頁卡片建好之後可以重新呼叫一次，掛上「加入購物車」
    // 的行為——呼叫的還是同一支函式，不是另外寫一套。
    initAddToCart,
  };
})();
