/* product-gallery.js —— 材料包商品內頁：自動輪播疊圖淡入淡出＋文字步驟清單＋色系切換。
   不引入任何輪播套件。色系切換時，重建輪播圖片組、文字清單、套組內容清單、色系故事文案，
   對應規格書②「選中色系時輪播切換至對應色系圖組」。 */

(function () {
  // 2026-09-20：全站改乾淨網址後，載入這支腳本的三個商品頁（fluid-art-gift／
  // fluid-art-light／fluid-art-intro）都多搬深一層，原本寫死的 "../" 要
  // 變成 "../../"。
  const IMG_BASE = "../../assets/images/products/fluid-art/";

  const COLOR_SCHEMES = {
    "classic-red": {
      name: "經典紅",
      dot: "var(--swatch-classic-red)",
      // BUY 按鈕跟著色系換底色時，文字/圖示也要跟著換成看得清楚的顏色——
      // 經典紅底色深，用原本的淺色文字；迎春粉底色淺，淺色文字對比不夠
      // （實測只有 1.66:1，遠低於 WCAG 最低 3:1），要換成深色文字。
      ctaText: "var(--color-surface-light)",
      // 這 8 張現有實拍照片其實是照著「禮盒版」（雙尺寸畫布＋完整配件）拍的，有幾張連照片本身
      // 都燒進了「材料包內含15cm、5cm春聯各一幅」或無痕黏土上牆配件的文字／畫面，輕巧版
      // （單一15cm、無上牆黏土）套用會變成錯誤宣稱。lightPlaceholder：輕巧版此格改顯示文字
      // 說明應該拍什麼，取代照片。notInLight：輕巧版根本沒有這個配件／概念，直接跳過這格，
      // 不佔輪播格數。沒有這兩個欄位的維持原樣，兩版共用同一張。lightFile：輕巧版已經有
      // 實拍的平鋪材料照（2026-10 補拍），優先於 lightPlaceholder 使用，見 buildGallery()。
      // 2026-10：輕巧版的「作品成色」改成只留真實照片（成品模擬圖＋內容物全展開），
      // 拿掉動圖跟其餘佔位說明格，讓頁面感覺更接近沙畫介紹頁的精簡度——這幾格
      // 禮盒版仍然是真實內容，只是不想在輕巧版出現，所以用 notInLight 排除，
      // 不是刪掉（刪掉會連禮盒版也一起不見）。
      gallery: [
        { file: "RS+_04.1_產品主圖_800x800拷貝.jpg", alt: "春聯流動畫材料包，包裝盒與福字菱形成品合照", caption: "包裝與成品", lightPlaceholder: "建議拍攝：輕巧版包裝與福字菱形成品合照", notInLight: true },
        { file: "RS_05.7_產品圖片_800x800拷貝.jpg", alt: "成品模擬圖，四款福字菱形排列", caption: "成品模擬圖", lightFile: "fluid-art-light-main-red.jpg", lightAlt: "經典紅成品模擬圖，金色「福」字菱形畫布" },
        { file: "RS_05.1_產品圖片_800x800拷貝.jpg", alt: "經典紅內容物全展開", caption: "內容物全展開", lightFile: "fluid-art-light-kit-red.jpg" },
        { file: "RS_05.3_產品圖片_800x800拷貝.jpg", alt: "材料完整，開盒即用", caption: "開盒即用", lightPlaceholder: "建議拍攝：輕巧版包裝開盒即用", notInLight: true },
        { file: "RS_05.5_產品圖片_800x800拷貝.jpg", alt: "倒顏料操作，獨一無二的變化性", caption: "倒顏料", notInLight: true },
        { video: "RS_video-gold-sticker.mp4", alt: "金色字貼近拍，實際手貼上畫布的過程，日光下微微閃耀", caption: "春字貼特寫", notInLight: true },
        { file: "RS_05.10_產品圖片_800x800拷貝.jpg", alt: "福字貼近拍，15cm 規格", caption: "福字貼近拍", lightPlaceholder: "建議拍攝：福字貼近拍，15cm 規格（需重新拍攝，現有圖片印有「內含15cm、5cm各一幅」字樣，不適用輕巧版）", notInLight: true },
        { file: "RS_05.4_產品圖片_800x800拷貝.jpg", alt: "上牆材料，已幫你準備好", caption: "上牆材料", notInLight: true },
      ],
      kitPhoto: { file: "RS_05.1_產品圖片_800x800拷貝.jpg", alt: "經典紅內容物全展開" },
      kitPhotoLight: { file: "fluid-art-light-kit-red.jpg", alt: "經典紅輕巧版材料包內容物平鋪" },
      paints: ["絳紅", "過年紅", "金", "鉑金"],
      paintsPlaceholder: false,
      swatches: ["var(--swatch-jiang-red)", "var(--swatch-newyear-red)", "var(--swatch-gold)", "var(--swatch-platinum)"],
      stickers: {
        light: "亮面水晶貼，15×15cm 主畫布字貼（金色「福」，固定款式）",
        gift: "磨砂質地手工字貼，15×15cm 與 5×5cm 各一（金色大福＋金色小春）",
      },
      // 色系故事結尾呼應「自由掌控深淺變化」那句，用三格小圖示意同一組顏料在
      // 不同比例下的成果差異，深／淺兩端取這個色系裡最深跟最淺的顏料。
      variationCaption: "同色系、不同比例，深淺自由掌控",
      variationLabels: ["多絳紅", "均衡比例", "多鉑金"],
      story: `正統的春聯色配上帶墨色的絳紅，讓傳統更增添一點跳脫。

金，是新春最耀眼的點綴；但我們特別選用了摻入銀色質感的鉑金，
與經典交織出細緻的雙色高光，打破了傳統配色單一的平面感，
讓色彩在流動中更顯立體。

這份具有色階落差的設計，讓您可以自由掌控深淺變化，
即使是經典色彩，也能流動出與眾不同的質感。`,
      storyPlaceholder: false,
    },
    "welcome-pink": {
      name: "迎春粉",
      dot: "var(--swatch-welcome-pink)",
      ctaText: "var(--color-text-primary)",
      // 2026-10：理由同經典紅那組同名註解，輕巧版「作品成色」只留成品模擬圖＋
      // 內容物全展開兩張真實照片，其餘格子用 notInLight 排除（禮盒版不受影響）。
      gallery: [
        { file: "RS+_04.2_產品主圖_800x800拷貝.jpg", alt: "春聯流動畫材料包，包裝盒與春字菱形成品合照", caption: "包裝與成品", lightPlaceholder: "建議拍攝：輕巧版包裝與春字菱形成品合照", notInLight: true },
        { file: "RS_05.8_產品圖片_800x800拷貝.jpg", alt: "成品模擬圖，四款春字菱形排列", caption: "成品模擬圖", lightFile: "fluid-art-light-main-pink.jpg", lightAlt: "迎春粉成品模擬圖，黑色「春」字菱形畫布" },
        { file: "RS_05.2_產品圖片_800x800拷貝.jpg", alt: "迎春粉內容物全展開", caption: "內容物全展開", lightFile: "fluid-art-light-kit-pink.jpg" },
        { file: "RS_05.5P_產品圖片_800x800拷貝.jpg", alt: "倒顏料操作，獨一無二的變化性", caption: "倒顏料", notInLight: true },
        { file: "RS_05.6_產品圖片_800x800拷貝.jpg", alt: "福字貼特寫，日光下微微閃耀", caption: "福字貼特寫", notInLight: true },
        { file: "RS_05.12_產品圖片_800x800拷貝.jpg", alt: "春字貼應用中，15cm 規格", caption: "春字貼應用", lightPlaceholder: "建議拍攝：春字貼應用，15cm 規格（需重新拍攝，現有圖片印有「內含15cm、5cm各一幅」字樣，不適用輕巧版）", notInLight: true },
        { file: "RS_05.11_產品圖片_800x800拷貝.jpg", alt: "福字貼近拍，5cm 規格", caption: "福字貼近拍", notInLight: true },
        { file: "RS_05.4_產品圖片_800x800拷貝.jpg", alt: "上牆材料，已幫你準備好", caption: "上牆材料", notInLight: true },
      ],
      kitPhoto: { file: "RS_05.2_產品圖片_800x800拷貝.jpg", alt: "迎春粉內容物全展開" },
      kitPhotoLight: { file: "fluid-art-light-kit-pink.jpg", alt: "迎春粉輕巧版材料包內容物平鋪" },
      paints: ["櫻粉", "朱紅", "鉑金", "銀"],
      paintsPlaceholder: false,
      swatches: ["var(--swatch-cherry-pink)", "var(--swatch-vermillion)", "var(--swatch-pink-platinum)", "var(--swatch-silver)"],
      stickers: {
        light: "亮面水晶貼，15×15cm 主畫布字貼（黑色「春」，固定款式）",
        gift: "磨砂質地手工字貼，15×15cm 與 5×5cm 各一（黑色大春＋黑色小福）",
      },
      // 迎春粉故事文案裡，朱紅是「點綴少量」帶入節慶的角色，櫻粉才是主視覺基底，
      // 深／淺兩端對應這個關係，不是單純取色票數值上最深最淺。
      variationCaption: "同色系、不同比例，濃淡自由掌控",
      variationLabels: ["多櫻粉", "均衡比例", "多朱紅"],
      story: `以低飽和度的帶灰嫩粉作為視覺重心，
加入襯托光澤的鉑金與銀，最後點綴少量朱砂紅帶入節慶，
在柔和之中保留新年的喜氣，提前迎春。

有別於傳統年節春聯以大面積紅色呈現，
將時間向後延伸至春天。若家中已有張貼紅色春聯的習慣，
這份清新而內斂的色彩，更適合作為現代空間中的點綴。

讓年味不再張揚，而是靜靜留在日常中。`,
      storyPlaceholder: false,
    },
    // 2026-11-13 新增兩款配色（珠光／冰焰紅）。一開始只有「棚拍」成品
    // 空拍照，內容物全展開那格先用 lightPlaceholder／
    // kitPhotoLightPlaceholder 標注待補；使用者後來補上了平鋪材料照
    // （fluid-art-light-kit-pearl.jpg／fluid-art-light-kit-frost.jpg，
    // 裁切配置比照經典紅／迎春粉既有的 kitPhotoLight 寫法），已經換成
    // 真的 file／alt，不再是 placeholder。倒顏料過程、字貼特寫這類其他
    // 實拍素材還沒有，暫時沒有格子可以補（跟經典紅／迎春粉當初逐步
    // 補拍齊的順序一樣，不急著一次補完）。顏料正式色名／比例仍未確認
    // （paintsPlaceholder:true），swatches 色點是直接從使用者提供的
    // 成品照取樣，不是憑空挑色。
    "pearl-shimmer": {
      name: "珠光",
      dot: "var(--swatch-pearl-shimmer)",
      ctaText: "var(--color-text-primary)",
      gallery: [
        { file: "fluid-art-light-main-pearl.jpg", alt: "珠光成品模擬圖，黑色「福」字菱形畫布", caption: "成品模擬圖" },
        { file: "fluid-art-light-kit-pearl.jpg", alt: "珠光材料包內容物平鋪，畫布、顏料、字貼與工具", caption: "內容物全展開" },
      ],
      kitPhotoLight: { file: "fluid-art-light-kit-pearl.jpg", alt: "珠光材料包內容物平鋪，畫布、顏料、字貼與工具" },
      paints: ["珠光藍", "珠光粉", "珠光金", "珠光米"],
      paintsPlaceholder: true,
      swatches: ["var(--swatch-pearl-mist)", "var(--swatch-pearl-blush)", "var(--swatch-pearl-gold)", "var(--swatch-pearl-cream)"],
      stickers: {
        light: "霧面黑色字貼，15×15cm 主畫布字貼（黑色「福」，固定款式）",
      },
      variationCaption: "同色系、不同比例，光澤濃淡自由掌控",
      variationLabels: ["多珠光藍", "均衡比例", "多珠光金"],
      story: `珠光質地的顏料隨著光線角度流轉，在粉、黃、藍之間輕輕交疊，
像新年清晨第一道天光，不是單一的顏色，而是一層會呼吸的光澤。

我們特意選用霧面的黑，寫下這一年的「福」字，讓閃動的底色安靜下來，
留出一塊可以專注凝視的焦點，不被珠光的流轉搶走主角。

這是一款適合喜歡低調質感、不追求大紅大紫的配色，初看素雅，細看卻處處是光。`,
      storyPlaceholder: false,
    },
    "frost-red": {
      name: "冰焰紅",
      dot: "var(--swatch-frost-red)",
      ctaText: "var(--color-surface-light)",
      gallery: [
        { file: "fluid-art-light-main-frost.jpg", alt: "冰焰紅成品模擬圖，幻彩鐳射「福」字菱形畫布", caption: "成品模擬圖" },
        { file: "fluid-art-light-kit-frost.jpg", alt: "冰焰紅材料包內容物平鋪，畫布、顏料、字貼與工具", caption: "內容物全展開" },
      ],
      kitPhotoLight: { file: "fluid-art-light-kit-frost.jpg", alt: "冰焰紅材料包內容物平鋪，畫布、顏料、字貼與工具" },
      paints: ["絳紅", "爐火紅", "霜灰藍"],
      paintsPlaceholder: true,
      swatches: ["var(--swatch-frost-ember)", "var(--swatch-frost-red)", "var(--swatch-frost-ice-blue)", "var(--swatch-frost-mauve)"],
      stickers: {
        light: "幻彩鐳射字貼，15×15cm 主畫布字貼（鐳射「福」，固定款式）",
      },
      variationCaption: "同色系、不同比例，冷暖對比自由掌控",
      variationLabels: ["多絳紅", "均衡比例", "多霜灰藍"],
      story: `濃重的絳紅打底，像除夕夜裡爐火燒得最旺的那個瞬間；
一道霜灰藍悄悄滑過畫面，像窗外忽然落下的初雪，
提醒著再暖的火光，窗外依然是冬天。

「福」字選用幻彩鐳射材質，隨著觀看角度折射出粉、藍、銀交錯的光，
在深紅色底上格外醒目，像雪地裡第一道被照亮的反光。

一半是爐火的熱烈，一半是初雪的清冷，這份衝突感，正是冰焰紅最耐人尋味的地方。`,
      storyPlaceholder: false,
    },
  };

  // 套組清單裡「跟色系無關、只跟版本有關」的固定內容（輕巧版／禮盒版）。
  // 顏料與字貼款式是色系決定的（見 COLOR_SCHEMES），版本只決定尺寸、配件跟說明形式。
  const KIT_VERSIONS = {
    light: {
      canvasLine: "空白畫布：15×15cm",
      paintSuffix: "",
      afterItems: [
        "防污桌布、手套、圍裙、調色杯*1、架高杯*2",
        "包裝內附簡易中英圖解",
      ],
    },
    gift: {
      canvasLine: "空白畫布：15×15cm、5×5cm 各一",
      paintSuffix: "（禮盒版顏料份量較輕巧版加量，供兩幅畫布使用）",
      afterItems: [
        "防污桌布、手套、圍裙、調色杯*1、紙杯*2、黏貼紙條*1、無痕白色藝術黏土、保護漆、上漆用棉布",
        "完整說明書＋精簡英文對照卡＋教學影片 QR Code",
      ],
    },
  };

  const AUTOPLAY_MS = 4000;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 自動輪播疊圖：所有圖片疊在同一個容器（position:absolute; inset:0），靠 opacity 切換，
  // 計時器每 4 秒自動換下一張；點文字清單直接跳＋重設計時器。
  // 色系切換時整組（圖片＋文字清單＋計時器）都要重建，回傳的 stop() 用來在重建/離開前
  // 清掉舊的 setInterval，避免舊計時器繼續跑、疊加出好幾個同時運作的輪播。
  function buildGallery(frame, captionsList, scheme, version) {
    frame.innerHTML = "";
    captionsList.innerHTML = "";

    // 輕巧版沒有 notInLight 的格子直接跳過（那個配件／概念輕巧版根本沒有，不佔輪播格數）；
    // 有 lightPlaceholder 的格子在輕巧版改顯示文字說明，不是放實拍照片——因為那些照片是照著
    // 禮盒版（雙尺寸、無痕黏土等）拍的，直接沿用會變成對輕巧版的錯誤宣稱。
    const items = scheme.gallery.filter((img) => !(version === "light" && img.notInLight));
    // lightFile 存在代表這格輕巧版已經有實拍照（取代原本的文字說明佔位），
    // 優先於 lightPlaceholder；兩者都沒有的格子兩版共用同一張 file。
    const showPlaceholder = (img) => version === "light" && img.lightPlaceholder && !img.lightFile;
    const fileFor = (img) => (version === "light" && img.lightFile ? img.lightFile : img.file);
    const altFor = (img) => (version === "light" && img.lightFile && img.lightAlt ? img.lightAlt : img.alt);

    const images = items.map((img, i) => {
      let el;
      if (showPlaceholder(img)) {
        el = document.createElement("div");
        el.className = "placeholder-box";
        el.textContent = img.lightPlaceholder;
      } else if (img.video) {
        // 靜音自動播放循環短片，取代 GIF 的常見手法；跟照片共用同一套 opacity 切換邏輯。
        el = document.createElement("video");
        el.src = IMG_BASE + img.video;
        el.autoplay = true;
        el.muted = true;
        el.loop = true;
        el.playsInline = true;
        el.setAttribute("aria-label", img.alt);
      } else {
        el = document.createElement("img");
        el.src = IMG_BASE + fileFor(img);
        el.alt = altFor(img);
        el.width = 800;
        el.height = 800;
        if (i > 0) el.loading = "lazy";
      }
      if (i === 0) el.classList.add("is-active");
      frame.appendChild(el);
      return el;
    });

    const captions = items.map((img, i) => {
      const li = document.createElement("li");
      li.className = "gallery__caption" + (i === 0 ? " is-active" : "");
      li.tabIndex = 0;
      const num = String(i + 1).padStart(2, "0");
      // 說明句預設複用 alt 描述句；輕巧版顯示佔位圖的格子，改顯示佔位說明文字，
      // 讓收合的清單項目點開後也看得到「這裡缺什麼照片」。
      const desc = showPlaceholder(img) ? img.lightPlaceholder : altFor(img);
      li.innerHTML = `<div class="gallery__caption-row"><span class="gallery__caption-dot" aria-hidden="true"></span><span class="gallery__caption-num" aria-hidden="true">${num}</span><span>${img.caption}</span></div><p class="gallery__caption-desc">${desc}</p>`;
      captionsList.appendChild(li);
      return li;
    });

    let current = 0;
    let timer = null;

    function setActive(i) {
      images.forEach((img, idx) => img.classList.toggle("is-active", idx === i));
      captions.forEach((cap, idx) => cap.classList.toggle("is-active", idx === i));
      current = i;
    }

    function next() {
      setActive((current + 1) % images.length);
    }

    function restartTimer() {
      if (timer) clearInterval(timer);
      // 尊重「減少動態」偏好：不是只讓淡入淡出變瞬間，而是直接不啟動自動輪播，
      // 避免畫面在使用者沒操作的情況下持續自己變化（點文字清單手動切換還是可以）。
      timer = prefersReducedMotion ? null : setInterval(next, AUTOPLAY_MS);
    }

    captions.forEach((cap, idx) => {
      function jump() {
        setActive(idx);
        restartTimer();
      }
      cap.addEventListener("click", jump);
      cap.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          jump();
        }
      });
    });

    restartTimer();

    return function stop() {
      if (timer) clearInterval(timer);
    };
  }

  function renderKitList(listEl, scheme, version) {
    listEl.innerHTML = "";
    const v = KIT_VERSIONS[version] || KIT_VERSIONS.light;

    // 顏料色名同時也在色系故事區塊（renderStory()）顯示一次，讓選完色系馬上看得到；
    // 這裡是套組清單，當作完整內容物清點，所以色名還是列出來，兩處各有各的用途。
    const paintText = scheme.paintsPlaceholder
      ? "〔顏料色名待補，請提供正確名稱替換〕"
      : `${scheme.paints.join("｜")}${v.paintSuffix}`;
    const stickerText = scheme.stickers[version] || scheme.stickers.light;

    const lines = [v.canvasLine, `流動畫顏料：${paintText}`, `字貼：${stickerText}`, ...v.afterItems];

    lines.forEach((text) => {
      const li = document.createElement("li");
      li.innerHTML = `<span aria-hidden="true">✦</span><span>${text}</span>`;
      listEl.appendChild(li);
    });
  }

  function renderStory(storySection, scheme) {
    const title = storySection.querySelector(".story-section__name");
    const swatchWrap = storySection.querySelector(".story-section__swatches");
    const paintsLine = storySection.querySelector(".story-section__paints");
    const body = storySection.querySelector(".story-section__body");

    title.textContent = scheme.name;
    swatchWrap.innerHTML = "";
    scheme.swatches.forEach((color) => {
      const dot = document.createElement("span");
      dot.style.background = color;
      swatchWrap.appendChild(dot);
    });

    // 顏料色名放在色系故事這裡（選色系後馬上看得到），套組內容那邊不重複列，
    // 避免使用者為了確認顏色，要從套組內容往上滑回作品成色重選色系。
    if (paintsLine) {
      paintsLine.textContent = scheme.paintsPlaceholder
        ? "流動畫顏料：〔顏料色名待補，請提供正確名稱替換〕"
        : `流動畫顏料：${scheme.paints.join("｜")}`;
    }

    body.innerHTML = "";
    if (scheme.storyPlaceholder) {
      body.dataset.placeholder = "true";
      const p = document.createElement("p");
      p.textContent = "〔迎春粉色系故事文案待補，請提供文案內容替換此段〕";
      body.appendChild(p);
    } else {
      delete body.dataset.placeholder;
      // 文案原始碼用空行分段，每段結尾都是句號；段落內的單一換行只是原始碼裡
      // 方便閱讀用的斷行，不是真的分段，這裡接回同一段再輸出，一段一個 <p>，
      // 讓句號後真的換行分段，不是全部擠成一整塊。
      scheme.story.split(/\n\s*\n/).forEach((para) => {
        const p = document.createElement("p");
        p.textContent = para.replace(/\n/g, "");
        body.appendChild(p);
      });
    }

    // 三格佔位圖示意「同一組顏料、不同比例」的成果差異，呼應故事文案裡
    // 「自由掌控深淺變化」那句，兩端取這個色系裡最深／最淺（或點綴色最少／最多）的顏料。
    const variationCaption = storySection.querySelector(".story-section__variation-caption");
    const variationGrid = storySection.querySelector(".story-section__variations");
    if (variationCaption) variationCaption.textContent = scheme.variationCaption;
    if (variationGrid) {
      variationGrid.innerHTML = "";
      scheme.variationLabels.forEach((label) => {
        const cell = document.createElement("div");
        cell.className = "story-section__variation";
        cell.innerHTML = `<div class="placeholder-box">${label}</div>`;
        variationGrid.appendChild(cell);
      });
    }
  }

  function initProductGallery() {
    const frame = document.querySelector(".gallery__frame");
    const captionsList = document.querySelector(".gallery__captions");
    const kitPhoto = document.querySelector(".kit-section__photo");
    const kitList = document.querySelector(".kit-list");
    const storySection = document.querySelector(".chapter--story");
    const chips = document.querySelectorAll(".color-picker__chip");
    if (!frame || !captionsList) return;

    // 輕巧版／禮盒版共用這份 JS，用 <body data-kit-version="light|gift"> 分辨目前是哪一頁，
    // 決定套組清單要套哪一組固定內容（見 KIT_VERSIONS），色系資料本身兩版共用不重複。
    const version = document.body.dataset.kitVersion === "gift" ? "gift" : "light";

    let stopGallery = null;

    function applyScheme(key) {
      const scheme = COLOR_SCHEMES[key];
      if (!scheme) return;
      if (stopGallery) stopGallery(); // 換色系前先關掉舊的自動輪播計時器，避免疊加
      stopGallery = buildGallery(frame, captionsList, scheme, version);
      if (kitPhoto) {
        // 現有的內容物全展開照片是照禮盒版（雙尺寸＋完整配件）拍的，輕巧版套用會誤導。
        // kitPhotoLight 是輕巧版自己的實拍平鋪照（2026-10 補拍），優先使用；還沒補拍的
        // 版本（理論上現在兩色都有了，保留這個分支給之後萬一新增配色時的過渡期）
        // 改顯示文字說明應該拍什麼。
        if (version === "light" && scheme.kitPhotoLight) {
          kitPhoto.innerHTML = `<img src="${IMG_BASE + scheme.kitPhotoLight.file}" alt="${scheme.kitPhotoLight.alt}" width="800" height="800">`;
        } else if (version === "light" && scheme.kitPhotoLightPlaceholder) {
          kitPhoto.innerHTML = `<div class="placeholder-box">${scheme.kitPhotoLightPlaceholder}</div>`;
        } else {
          kitPhoto.innerHTML = `<img src="${IMG_BASE + scheme.kitPhoto.file}" alt="${scheme.kitPhoto.alt}" width="800" height="800">`;
        }
      }
      if (kitList) renderKitList(kitList, scheme, version);
      if (storySection) renderStory(storySection, scheme);
      chips.forEach((chip) => {
        chip.setAttribute("aria-pressed", String(chip.dataset.scheme === key));
      });

      // BUY 按鈕（標題買列／收尾購買列，主商品的兩個進入點）跟著目前選中的
      // 色系換底色，加購卡（.addon-card__cta，賣的是別的商品——畫布加購組）
      // 不在這個選取器範圍內，不會被連動換色。
      document
        .querySelectorAll(
          ".work-heading__buy-row [data-add-to-cart], .work__close [data-add-to-cart]"
        )
        .forEach((btn) => {
          btn.style.background = scheme.dot;
          btn.style.color = scheme.ctaText;
        });
    }

    chips.forEach((chip) => {
      chip.addEventListener("click", () => applyScheme(chip.dataset.scheme));
    });

    // 輕巧版紅／粉拆成獨立商品頁後，各自頁面沒有色系選擇器（chips 是空的
    // NodeList），用 <body data-fixed-scheme="..."> 鎖定這頁唯一的色系；
    // 沒有這個屬性的頁面（禮盒版）維持原本預設經典紅、靠 chips 點擊切換。
    applyScheme(document.body.dataset.fixedScheme || "classic-red");
  }

  // 九宮格動畫：點擊/Enter/空白鍵可以重播一次。有 data-autoplay 的（目前只有
  // fluid-art-intro.html 的頁首開場）額外在頁面載入後自動播放一次，不用等使用者先點。
  function initMoodboard() {
    const board = document.querySelector(".moodboard");
    if (!board) return;

    function reveal() {
      board.classList.remove("is-revealed");
      void board.offsetWidth; // 強制重排，讓連續點擊也能重播一次動畫
      board.classList.add("is-revealed");
    }

    board.addEventListener("click", reveal);
    board.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        reveal();
      }
    });

    if ("autoplay" in board.dataset) {
      // 雙 rAF：先讓「未播放」狀態真的畫出來一次，下一輪才加 class 觸發轉場，
      // 跟首頁 main.js 的 showMoodboard() 用同一招，避免兩個狀態疊在同一畫面直接跳過去。
      requestAnimationFrame(() => {
        requestAnimationFrame(reveal);
      });
    }
  }

  function init() {
    initProductGallery();
    initMoodboard();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // 給總覽購物頁的手風琴磚（js/products-overview.js）用的唯讀資料存取，展開
  // 內容（代表照／色系故事摘要／套組內容）直接讀這裡，不重複維護第二份色系
  // 資料。IMG_BASE 是這支檔案內部用的相對路徑字首，總覽頁在 /products/ 底下，
  // 跟這裡假設的深度一致，可以直接共用。
  window.RisuanFluidArt = { COLOR_SCHEMES, KIT_VERSIONS, IMG_BASE };
})();
