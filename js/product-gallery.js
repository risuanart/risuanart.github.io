/* product-gallery.js —— 材料包商品內頁：自動輪播疊圖淡入淡出＋文字步驟清單＋色系切換。
   不引入任何輪播套件。色系切換時，重建輪播圖片組、文字清單、套組內容清單、色系故事文案，
   對應規格書②「選中色系時輪播切換至對應色系圖組」。 */

(function () {
  const IMG_BASE = "../assets/images/products/fluid-art/";

  const COLOR_SCHEMES = {
    "classic-red": {
      name: "經典紅",
      dot: "var(--swatch-classic-red)",
      gallery: [
        { file: "RS+_04.1_產品主圖_800x800拷貝.jpg", alt: "春聯流動畫材料包，包裝盒與福字菱形成品合照", caption: "包裝與成品" },
        { file: "RS_05.7_產品圖片_800x800拷貝.jpg", alt: "成品模擬圖，四款福字菱形排列", caption: "成品模擬圖" },
        { file: "RS_05.1_產品圖片_800x800拷貝.jpg", alt: "經典紅內容物全展開", caption: "內容物全展開" },
        { file: "RS_05.3_產品圖片_800x800拷貝.jpg", alt: "材料完整，開盒即用", caption: "開盒即用" },
        { file: "RS_05.5_產品圖片_800x800拷貝.jpg", alt: "倒顏料操作，獨一無二的變化性", caption: "倒顏料" },
        { video: "RS_video-gold-sticker.mp4", alt: "金色字貼近拍，實際手貼上畫布的過程，日光下微微閃耀", caption: "春字貼特寫" },
        { file: "RS_05.10_產品圖片_800x800拷貝.jpg", alt: "福字貼近拍，15cm 規格", caption: "福字貼近拍" },
        { file: "RS_05.4_產品圖片_800x800拷貝.jpg", alt: "上牆材料，已幫你準備好", caption: "上牆材料" },
      ],
      kitPhoto: { file: "RS_05.1_產品圖片_800x800拷貝.jpg", alt: "經典紅內容物全展開" },
      paints: ["絳紅", "過年紅", "金", "鉑金"],
      paintsPlaceholder: false,
      swatches: ["var(--swatch-jiang-red)", "var(--swatch-newyear-red)", "var(--swatch-gold)", "var(--swatch-platinum)"],
      stickers: "15×15cm 主畫布字貼：金色「福」（固定款式）／5×5cm 小畫布字貼：金色「春」（固定款式）",
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
        { file: "RS+_04.2_產品主圖_800x800拷貝.jpg", alt: "春聯流動畫材料包，包裝盒與春字菱形成品合照", caption: "包裝與成品" },
        { file: "RS_05.8_產品圖片_800x800拷貝.jpg", alt: "成品模擬圖，四款春字菱形排列", caption: "成品模擬圖" },
        { file: "RS_05.2_產品圖片_800x800拷貝.jpg", alt: "迎春粉內容物全展開", caption: "內容物全展開" },
        { file: "RS_05.5P_產品圖片_800x800拷貝.jpg", alt: "倒顏料操作，獨一無二的變化性", caption: "倒顏料" },
        { file: "RS_05.6_產品圖片_800x800拷貝.jpg", alt: "福字貼特寫，日光下微微閃耀", caption: "福字貼特寫" },
        { file: "RS_05.12_產品圖片_800x800拷貝.jpg", alt: "春字貼應用中，15cm 規格", caption: "春字貼應用" },
        { file: "RS_05.11_產品圖片_800x800拷貝.jpg", alt: "福字貼近拍，5cm 規格", caption: "福字貼近拍" },
        { file: "RS_05.4_產品圖片_800x800拷貝.jpg", alt: "上牆材料，已幫你準備好", caption: "上牆材料" },
      ],
      kitPhoto: { file: "RS_05.2_產品圖片_800x800拷貝.jpg", alt: "迎春粉內容物全展開" },
      paints: ["櫻粉", "朱紅", "鉑金", "銀"],
      paintsPlaceholder: false,
      swatches: ["var(--swatch-cherry-pink)", "var(--swatch-vermillion)", "var(--swatch-pink-platinum)", "var(--swatch-silver)"],
      stickers: "15×15cm 主畫布字貼：黑色「春」（固定款式）／5×5cm 小畫布字貼：黑色「福」（固定款式）",
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

  const AUTOPLAY_MS = 4000;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 自動輪播疊圖：所有圖片疊在同一個容器（position:absolute; inset:0），靠 opacity 切換，
  // 計時器每 4 秒自動換下一張；點文字清單直接跳＋重設計時器。
  // 色系切換時整組（圖片＋文字清單＋計時器）都要重建，回傳的 stop() 用來在重建/離開前
  // 清掉舊的 setInterval，避免舊計時器繼續跑、疊加出好幾個同時運作的輪播。
  function buildGallery(frame, captionsList, scheme) {
    frame.innerHTML = "";
    captionsList.innerHTML = "";

    const images = scheme.gallery.map((img, i) => {
      let el;
      if (img.video) {
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

    const captions = scheme.gallery.map((img, i) => {
      const li = document.createElement("li");
      li.className = "gallery__caption" + (i === 0 ? " is-active" : "");
      li.tabIndex = 0;
      const num = String(i + 1).padStart(2, "0");
      // 說明句直接複用已經寫好、對應實際照片內容的 alt 描述句，不是另外新增文案，
      // 只在作用中那一項展開顯示（CSS 控制），非作用中收合看不到。
      li.innerHTML = `<div class="gallery__caption-row"><span class="gallery__caption-dot" aria-hidden="true"></span><span class="gallery__caption-num" aria-hidden="true">${num}</span><span>${img.caption}</span></div><p class="gallery__caption-desc">${img.alt}</p>`;
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

  function renderKitList(listEl, scheme) {
    listEl.innerHTML = "";
    const fixedItems = [
      "禮盒尺寸：22×17×5cm",
      "成品尺寸：15×15cm、5×5cm 春聯各一幅",
    ];
    fixedItems.forEach((text) => {
      const li = document.createElement("li");
      li.innerHTML = `<span aria-hidden="true">✦</span><span>${text}</span>`;
      listEl.appendChild(li);
    });

    const paintLi = document.createElement("li");
    if (scheme.paintsPlaceholder) {
      paintLi.dataset.placeholder = "true";
      paintLi.innerHTML = `<span aria-hidden="true">✦</span><span>流動畫顏料：〔迎春粉顏料色名待補，請提供正確名稱替換〕</span>`;
    } else {
      paintLi.innerHTML = `<span aria-hidden="true">✦</span><span>流動畫顏料：${scheme.paints.join("｜")}</span>`;
    }
    listEl.appendChild(paintLi);

    const stickerLi = document.createElement("li");
    stickerLi.innerHTML = `<span aria-hidden="true">✦</span><span>${scheme.stickers}</span>`;
    listEl.appendChild(stickerLi);

    const lastLi = document.createElement("li");
    lastLi.innerHTML = `<span aria-hidden="true">✦</span><span>附上所需材料、教學影片，在家就能輕鬆完成</span>`;
    listEl.appendChild(lastLi);
  }

  function renderStory(storySection, scheme) {
    const title = storySection.querySelector(".story-section__name");
    const swatchWrap = storySection.querySelector(".story-section__swatches");
    const body = storySection.querySelector(".story-section__body");

    title.textContent = scheme.name;
    swatchWrap.innerHTML = "";
    scheme.swatches.forEach((color) => {
      const dot = document.createElement("span");
      dot.style.background = color;
      swatchWrap.appendChild(dot);
    });

    if (scheme.storyPlaceholder) {
      body.dataset.placeholder = "true";
      body.textContent = "〔迎春粉色系故事文案待補，請提供文案內容替換此段〕";
    } else {
      delete body.dataset.placeholder;
      body.textContent = scheme.story;
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

    let stopGallery = null;

    function applyScheme(key) {
      const scheme = COLOR_SCHEMES[key];
      if (!scheme) return;
      if (stopGallery) stopGallery(); // 換色系前先關掉舊的自動輪播計時器，避免疊加
      stopGallery = buildGallery(frame, captionsList, scheme);
      if (kitPhoto) {
        kitPhoto.src = IMG_BASE + scheme.kitPhoto.file;
        kitPhoto.alt = scheme.kitPhoto.alt;
      }
      if (kitList) renderKitList(kitList, scheme);
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

  // 九宮格動畫：觸發方式先用點擊/Enter/空白鍵頂著，之後確定要換成別的觸發方式
  // （例如捲動進場自動觸發）時，只需要改這裡呼叫 reveal() 的時機，動畫本身不用動。
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
