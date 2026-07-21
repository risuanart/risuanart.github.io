/* product-gallery.js —— 材料包商品內頁：自動輪播疊圖淡入淡出＋文字步驟清單＋色系切換。
   不引入任何輪播套件。色系切換時，重建輪播圖片組、文字清單、套組內容清單、色系故事文案，
   對應規格書②「選中色系時輪播切換至對應色系圖組」。 */

(function () {
  const IMG_BASE = "../assets/images/products/fluid-art/";

  const COLOR_SCHEMES = {
    "classic-red": {
      name: "經典紅",
      dot: "var(--swatch-classic-red)",
      // 這 8 張現有實拍照片其實是照著「禮盒版」（雙尺寸畫布＋完整配件）拍的，有幾張連照片本身
      // 都燒進了「材料包內含15cm、5cm春聯各一幅」或無痕黏土上牆配件的文字／畫面，輕巧版
      // （單一15cm、無上牆黏土）套用會變成錯誤宣稱。lightPlaceholder：輕巧版此格改顯示文字
      // 說明應該拍什麼，取代照片。notInLight：輕巧版根本沒有這個配件／概念，直接跳過這格，
      // 不佔輪播格數。沒有這兩個欄位的維持原樣，兩版共用同一張。
      gallery: [
        { file: "RS+_04.1_產品主圖_800x800拷貝.jpg", alt: "春聯流動畫材料包，包裝盒與福字菱形成品合照", caption: "包裝與成品", lightPlaceholder: "建議拍攝：輕巧版包裝與福字菱形成品合照" },
        { file: "RS_05.7_產品圖片_800x800拷貝.jpg", alt: "成品模擬圖，四款福字菱形排列", caption: "成品模擬圖" },
        { file: "RS_05.1_產品圖片_800x800拷貝.jpg", alt: "經典紅內容物全展開", caption: "內容物全展開", lightPlaceholder: "建議拍攝：輕巧版內容物全展開（單一 15cm 畫布＋基本工具）" },
        { file: "RS_05.3_產品圖片_800x800拷貝.jpg", alt: "材料完整，開盒即用", caption: "開盒即用", lightPlaceholder: "建議拍攝：輕巧版包裝開盒即用" },
        { file: "RS_05.5_產品圖片_800x800拷貝.jpg", alt: "倒顏料操作，獨一無二的變化性", caption: "倒顏料" },
        { video: "RS_video-gold-sticker.mp4", alt: "金色字貼近拍，實際手貼上畫布的過程，日光下微微閃耀", caption: "春字貼特寫" },
        { file: "RS_05.10_產品圖片_800x800拷貝.jpg", alt: "福字貼近拍，15cm 規格", caption: "福字貼近拍", lightPlaceholder: "建議拍攝：福字貼近拍，15cm 規格（需重新拍攝，現有圖片印有「內含15cm、5cm各一幅」字樣，不適用輕巧版）" },
        { file: "RS_05.4_產品圖片_800x800拷貝.jpg", alt: "上牆材料，已幫你準備好", caption: "上牆材料", notInLight: true },
      ],
      kitPhoto: { file: "RS_05.1_產品圖片_800x800拷貝.jpg", alt: "經典紅內容物全展開" },
      kitPhotoLightPlaceholder: "建議拍攝：輕巧版內容物全展開（單一 15cm 畫布＋基本工具）",
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
      gallery: [
        { file: "RS+_04.2_產品主圖_800x800拷貝.jpg", alt: "春聯流動畫材料包，包裝盒與春字菱形成品合照", caption: "包裝與成品", lightPlaceholder: "建議拍攝：輕巧版包裝與春字菱形成品合照" },
        { file: "RS_05.8_產品圖片_800x800拷貝.jpg", alt: "成品模擬圖，四款春字菱形排列", caption: "成品模擬圖" },
        { file: "RS_05.2_產品圖片_800x800拷貝.jpg", alt: "迎春粉內容物全展開", caption: "內容物全展開", lightPlaceholder: "建議拍攝：輕巧版內容物全展開（單一 15cm 畫布＋基本工具）" },
        { file: "RS_05.5P_產品圖片_800x800拷貝.jpg", alt: "倒顏料操作，獨一無二的變化性", caption: "倒顏料" },
        { file: "RS_05.6_產品圖片_800x800拷貝.jpg", alt: "福字貼特寫，日光下微微閃耀", caption: "福字貼特寫" },
        { file: "RS_05.12_產品圖片_800x800拷貝.jpg", alt: "春字貼應用中，15cm 規格", caption: "春字貼應用", lightPlaceholder: "建議拍攝：春字貼應用，15cm 規格（需重新拍攝，現有圖片印有「內含15cm、5cm各一幅」字樣，不適用輕巧版）" },
        { file: "RS_05.11_產品圖片_800x800拷貝.jpg", alt: "福字貼近拍，5cm 規格", caption: "福字貼近拍", notInLight: true },
        { file: "RS_05.4_產品圖片_800x800拷貝.jpg", alt: "上牆材料，已幫你準備好", caption: "上牆材料", notInLight: true },
      ],
      kitPhoto: { file: "RS_05.2_產品圖片_800x800拷貝.jpg", alt: "迎春粉內容物全展開" },
      kitPhotoLightPlaceholder: "建議拍攝：輕巧版內容物全展開（單一 15cm 畫布＋基本工具）",
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
    const showPlaceholder = (img) => version === "light" && img.lightPlaceholder;

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
        el.src = IMG_BASE + img.file;
        el.alt = img.alt;
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
      const desc = showPlaceholder(img) ? img.lightPlaceholder : img.alt;
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
        // 現有的內容物全展開照片是照禮盒版（雙尺寸＋完整配件）拍的，輕巧版套用會誤導，
        // 改顯示文字說明應該拍什麼，等輕巧版實拍照片到位後再換回真的 <img>。
        if (version === "light" && scheme.kitPhotoLightPlaceholder) {
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
    }

    chips.forEach((chip) => {
      chip.addEventListener("click", () => applyScheme(chip.dataset.scheme));
    });

    applyScheme("classic-red");
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
})();
