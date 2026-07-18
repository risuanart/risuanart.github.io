/* product-gallery.js —— 材料包商品內頁：圖片輪播（原生 scroll-snap）＋色系切換。
   不引入任何輪播套件。色系切換時，重建輪播圖片組、指示器、套組內容清單、色系故事文案，
   對應規格書②「選中色系時輪播切換至對應色系圖組」。 */

(function () {
  const IMG_BASE = "../assets/images/products/fluid-art/";

  const COLOR_SCHEMES = {
    "classic-red": {
      name: "經典紅",
      dot: "var(--swatch-classic-red)",
      gallery: [
        { file: "RS+_04.1_產品主圖_800x800拷貝.jpg", alt: "春聯流動畫材料包，包裝盒與福字菱形成品合照" },
        { file: "RS_05.7_產品圖片_800x800拷貝.jpg", alt: "成品模擬圖，四款福字菱形排列" },
        { file: "RS_05.1_產品圖片_800x800拷貝.jpg", alt: "經典紅內容物全展開" },
        { file: "RS_05.3_產品圖片_800x800拷貝.jpg", alt: "材料完整，開盒即用" },
        { file: "RS_05.5_產品圖片_800x800拷貝.jpg", alt: "倒顏料操作，獨一無二的變化性" },
        { file: "RS_05.6R_產品圖片_800x800拷貝.jpg", alt: "春字貼特寫，日光下微微閃耀" },
        { file: "RS_05.10_產品圖片_800x800拷貝.jpg", alt: "福字貼近拍，15cm 規格" },
        { file: "RS_05.4_產品圖片_800x800拷貝.jpg", alt: "上牆材料，已幫你準備好" },
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
        { file: "RS+_04.2_產品主圖_800x800拷貝.jpg", alt: "春聯流動畫材料包，包裝盒與春字菱形成品合照" },
        { file: "RS_05.8_產品圖片_800x800拷貝.jpg", alt: "成品模擬圖，四款春字菱形排列" },
        { file: "RS_05.2_產品圖片_800x800拷貝.jpg", alt: "迎春粉內容物全展開" },
        { file: "RS_05.5P_產品圖片_800x800拷貝.jpg", alt: "倒顏料操作，獨一無二的變化性" },
        { file: "RS_05.6_產品圖片_800x800拷貝.jpg", alt: "福字貼特寫，日光下微微閃耀" },
        { file: "RS_05.12_產品圖片_800x800拷貝.jpg", alt: "春字貼應用中，15cm 規格" },
        { file: "RS_05.11_產品圖片_800x800拷貝.jpg", alt: "福字貼近拍，5cm 規格" },
        { file: "RS_05.4_產品圖片_800x800拷貝.jpg", alt: "上牆材料，已幫你準備好" },
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

  function buildGallery(track, dotsWrap, scheme) {
    track.innerHTML = "";
    dotsWrap.innerHTML = "";

    scheme.gallery.forEach((img, i) => {
      const slide = document.createElement("div");
      slide.className = "gallery__slide";
      const el = document.createElement("img");
      el.src = IMG_BASE + img.file;
      el.alt = img.alt;
      el.width = 800;
      el.height = 800;
      if (i > 0) el.loading = "lazy";
      slide.appendChild(el);
      track.appendChild(slide);

      const dot = document.createElement("span");
      dot.className = "gallery__dot" + (i === 0 ? " gallery__dot--active" : "");
      dotsWrap.appendChild(dot);
    });

    track.scrollTo({ left: 0, behavior: "auto" });
  }

  function wireDotSync(track, dotsWrap) {
    let ticking = false;
    track.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const index = Math.round(track.scrollLeft / track.clientWidth);
        dotsWrap.querySelectorAll(".gallery__dot").forEach((dot, i) => {
          dot.classList.toggle("gallery__dot--active", i === index);
        });
        ticking = false;
      });
    });
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
    const track = document.querySelector(".gallery__track");
    const dotsWrap = document.querySelector(".gallery__dots");
    const kitPhoto = document.querySelector(".kit-section__photo");
    const kitList = document.querySelector(".kit-list");
    const storySection = document.querySelector(".chapter--story");
    const chips = document.querySelectorAll(".color-picker__chip");
    if (!track || !dotsWrap) return;

    wireDotSync(track, dotsWrap);

    function applyScheme(key) {
      const scheme = COLOR_SCHEMES[key];
      if (!scheme) return;
      buildGallery(track, dotsWrap, scheme);
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
