



(function () {



  const IMG_BASE = "../../assets/images/products/fluid-art/";

  const COLOR_SCHEMES = {
    "classic-red": {
      name: "經典紅",
      dot: "var(--swatch-classic-red)",



      ctaText: "var(--color-surface-light)",










      gallery: [
        { file: "RS+_04.1_產品主圖_800x800拷貝.jpg", alt: "春聯流動畫材料包，包裝盒與福字菱形成品合照", caption: "包裝與成品", lightPlaceholder: "建議拍攝：輕巧版包裝與福字菱形成品合照", notInLight: true },
        { file: "RS_05.7_產品圖片_800x800拷貝.jpg", alt: "實際成品，四款福字菱形排列", caption: "實際成品", lightFile: "fluid-art-light-main-red.jpg", lightAlt: "經典紅實際成品，金色「福」字菱形畫布" },
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


      variationCaption: "同色系、不同比例，深淺自由掌控",
      variationLabels: ["平均紅金", "過年紅偏多", "絳紅多"],
      variationImages: ["fluid-art-red-fu-03.webp?v=clear1", "fluid-art-red-fu-06.webp?v=clear1", "fluid-art-light-cutout-red.webp"],
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


      gallery: [
        { file: "RS+_04.2_產品主圖_800x800拷貝.jpg", alt: "春聯流動畫材料包，包裝盒與春字菱形成品合照", caption: "包裝與成品", lightPlaceholder: "建議拍攝：輕巧版包裝與春字菱形成品合照", notInLight: true },
        { file: "RS_05.8_產品圖片_800x800拷貝.jpg", alt: "實際成品，四款春字菱形排列", caption: "實際成品", lightFile: "fluid-art-light-main-pink.jpg", lightAlt: "迎春粉實際成品，黑色「春」字菱形畫布" },
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


      variationCaption: "同色系、不同比例，濃淡自由掌控",
      variationLabels: ["金銀柔光", "朱紅流線", "櫻粉主調"],
      variationImages: ["fluid-art-pink-chun-01.webp", "fluid-art-pink-chun-09.webp", "fluid-art-pink-chun-04.webp"],
      sentenceBreaks: true,
      story: `以柔和的櫻粉搭配金銀光澤，少量朱紅就能帶出暖意與流動的線條。
喜歡鮮明一點，可以增加朱紅；喜歡柔和一點，就讓粉色或金銀多一些。
依照喜好調整比例，搭配黑色「春」字，都有不同的新年表情。`,
      storyPlaceholder: false,
    },










    "pearl-shimmer": {
      name: "珍珠光",
      dot: "var(--swatch-pearl-shimmer)",
      ctaText: "var(--color-text-primary)",
      gallery: [
        { file: "fluid-art-light-main-pearl.jpg", alt: "珍珠光實際成品，黑色「福」字菱形畫布", caption: "實際成品" },
      ],
      kitPhotoLight: { file: "fluid-art-light-kit-pearl.jpg", alt: "珍珠光材料包內容物平鋪，畫布、顏料、字貼與工具" },




      paints: ["珠光藍", "珠光粉", "珠光黃", "珠光白"],
      paintsPlaceholder: false,
      swatches: ["var(--swatch-pearl-mist)", "var(--swatch-pearl-blush)", "var(--swatch-pearl-gold)", "var(--swatch-pearl-cream)"],
      stickers: {
        light: "霧面黑色字貼，15×15cm 主畫布字貼（黑色「福」，固定款式）",
      },
      variationCaption: "同色系、不同比例，光澤濃淡自由掌控",
      variationLabels: ["偏藍", "偏粉", "偏黃", "偏綠"],
      variationImages: ["fluid-art-pearl-fu-02.webp?v=aligned-v2", "fluid-art-pearl-fu-04.webp?v=aligned-v2", "fluid-art-pearl-fu-03.webp?v=aligned-v2", "fluid-art-pearl-fu-05.webp?v=aligned-v2"],
      sentenceBreaks: true,
      story: `粉、藍、黃各有鮮明個性，每一色都能當主色，搭配霧面黑色「福」字，讓不同底色都襯得出清楚俐落的字樣。

顏料流動時也會自然混色：粉＋黃偏粉橘，粉＋藍偏紫，藍＋黃偏綠。同一組顏料，改變比例就能玩出不同的色彩表情。

所有顏色都已調成柔和的珍珠光，混在一起也不會太過強烈。保留各色的流動紋理，或讓顏色自然交融，都容易搭配，第一次嘗試也能放心玩色。`,
      storyPlaceholder: false,
    },
    "frost-red": {
      name: "極光紅",
      dot: "var(--swatch-frost-red)",
      ctaText: "var(--color-surface-light)",
      gallery: [
        { file: "fluid-art-light-main-frost.jpg", alt: "極光紅實際成品，幻彩鐳射「福」字菱形畫布", caption: "實際成品" },
        { file: "fluid-art-light-kit-frost.jpg", alt: "極光紅材料包內容物平鋪，畫布、顏料、字貼與工具", caption: "內容物全展開" },
      ],
      kitPhotoLight: { file: "fluid-art-light-kit-frost.jpg", alt: "極光紅材料包內容物平鋪，畫布、顏料、字貼與工具" },



      paints: ["絳紅", "鉑金", "深銀", "冰藍"],
      paintsPlaceholder: false,
      swatches: ["var(--swatch-jiang-red)", "var(--swatch-platinum)", "var(--swatch-frost-silver)", "var(--swatch-frost-ice-blue)"],
      stickers: {
        light: "幻彩鐳射字貼，隨光線角度轉出粉、藍、銀交錯的流光色彩，15×15cm 主畫布字貼（鐳射「福」，固定款式）",
      },
      variationCaption: "以紅色為主，玩出不同的冷暖層次",
      variationLabels: ["柔和交融", "冰藍流線", "銀色交織"],
      variationImages: ["fluid-art-frost-fu-01.webp?v=clear1", "fluid-art-frost-fu-04.webp?v=clear1", "fluid-art-frost-silver-original.webp"],
      sentenceBreaks: true,
      story: `以絳紅作為主要底色，搭配鉑金、深銀與冰藍，讓熱烈的紅與清冷的光澤自然交織。

幻彩鐳射「福」字會隨光線與觀看角度轉出不同色彩，在紅色佔比較多的底色上，字樣更醒目。

建議保留紅色作為主色，再依喜好稍微增加冰藍、深銀或鉑金的比例，變化流線與冷暖層次。
也可以自由搭配，讓同一組顏料流動出自己的樣子。`,
      storyPlaceholder: false,
    },
  };



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

  const AUTOPLAY_MS = 5000;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;





  function buildGallery(frame, captionsList, scheme, version) {
    frame.innerHTML = "";
    captionsList.innerHTML = "";





    const items = scheme.gallery.filter((img) => img.caption !== "內容物全展開" && !(version === "light" && img.notInLight));


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

        el = document.createElement("video");
        el.src = IMG_BASE + img.video;
        el.preload = "none";
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


      const desc = showPlaceholder(img) ? img.lightPlaceholder : altFor(img);
      li.innerHTML = `<div class="gallery__caption-row"><span>${img.caption}</span></div><p class="gallery__caption-desc">${desc}</p>`;
      captionsList.appendChild(li);
      return li;
    });

    let current = 0;
    let timer = null;
    let inView = false;
    function syncGalleryVideos() {
      images.forEach((el, i) => {
        if (el.tagName !== "VIDEO") return;
        if (i === current && inView && !document.hidden) el.play().catch(() => {});
        else el.pause();
      });
    }
    const videoObserver = new IntersectionObserver(entries => { inView = entries[0].isIntersecting; syncGalleryVideos(); }, { threshold: .1 });
    videoObserver.observe(frame);
    document.addEventListener("visibilitychange", syncGalleryVideos);
    window.addEventListener("pageshow", syncGalleryVideos);


    function setActive(i) {
      images.forEach((img, idx) => img.classList.toggle("is-active", idx === i));
      captions.forEach((cap, idx) => cap.classList.toggle("is-active", idx === i));
      current = i;
      syncGalleryVideos();
    }

    function next() {
      setActive((current + 1) % images.length);
    }

    function restartTimer() {
      if (timer) clearInterval(timer);


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


    const swipeController = new AbortController();
    let swipeStart = null;
    frame.addEventListener("touchstart", (e) => {
      swipeStart = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
    }, { passive: true, signal: swipeController.signal });
    frame.addEventListener("touchcancel", () => { swipeStart = null; }, { passive: true, signal: swipeController.signal });
    frame.addEventListener("touchend", (e) => {
      if (!swipeStart || !e.changedTouches.length) return;
      const dx = e.changedTouches[0].clientX - swipeStart.x;
      const dy = e.changedTouches[0].clientY - swipeStart.y;
      swipeStart = null;
      if (Math.abs(dx) < 40 || Math.abs(dx) <= Math.abs(dy)) return;
      setActive((current + (dx < 0 ? 1 : -1) + images.length) % images.length); restartTimer();
    }, { passive: true, signal: swipeController.signal });
    restartTimer();

    return function stop() {
      swipeController.abort();
      videoObserver.disconnect();
      document.removeEventListener("visibilitychange", syncGalleryVideos);
      window.removeEventListener("pageshow", syncGalleryVideos);
      images.forEach(el => { if (el.tagName === "VIDEO") el.pause(); });
      if (timer) clearInterval(timer);
    };
  }

  function renderKitList(listEl, scheme, version) {
    listEl.innerHTML = "";
    const v = KIT_VERSIONS[version] || KIT_VERSIONS.light;



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



      scheme.story.split(/\n\s*\n/).forEach((para) => {
        const p = document.createElement("p");
        const text = para.replace(/\n/g, "");
        if (scheme.sentenceBreaks) {
          const sentences = text.match(/[^。]+。?|。/g) || [];
          sentences.forEach((sentence, index) => {
            if (index > 0) p.appendChild(document.createElement("br"));
            p.appendChild(document.createTextNode(sentence));
          });
        } else {
          p.textContent = text;
        }
        body.appendChild(p);
      });
    }



    const variationCaption = storySection.querySelector(".story-section__variation-caption");
    const variationGrid = storySection.querySelector(".story-section__variations");
    if (variationCaption) variationCaption.textContent = scheme.variationCaption;
    if (variationGrid) {
      variationGrid.innerHTML = "";
      variationGrid.classList.toggle("story-section__variations--photos", Boolean(scheme.variationImages));
      variationGrid.classList.toggle("story-section__variations--four", Boolean(scheme.variationImages && scheme.variationImages.length === 4));
      scheme.variationLabels.forEach((label, i) => {
        const cell = document.createElement("div");
        cell.className = "story-section__variation";
        cell.innerHTML = scheme.variationImages
          ? `<img src="${IMG_BASE}${scheme.variationImages[i]}" alt="${scheme.name}成品，${label}" width="1200" height="1200" loading="lazy"><p>${label}</p>`
          : `<div class="placeholder-box">${label}</div>`;
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
    if (!frame && !captionsList && !kitPhoto && !kitList && !storySection) return;



    const version = document.body.dataset.kitVersion === "gift" ? "gift" : "light";

    let stopGallery = null;

    function applyScheme(key) {
      const scheme = COLOR_SCHEMES[key];
      if (!scheme) return;
      if (frame && captionsList) {
        if (stopGallery) stopGallery();
        stopGallery = buildGallery(frame, captionsList, scheme, version);
      }
      if (kitPhoto) {




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




    applyScheme(document.body.dataset.fixedScheme || "classic-red");
  }



  function initMoodboard() {
    const board = document.querySelector(".moodboard");
    if (!board) return;

    function reveal() {
      board.classList.remove("is-revealed");
      void board.offsetWidth;
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





  window.RisuanFluidArt = { COLOR_SCHEMES, KIT_VERSIONS, IMG_BASE };
})();
