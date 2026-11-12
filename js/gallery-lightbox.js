// 學員作品格狀相簿（.gallery-grid__item）點擊放大燈箱：不管圖片是
// js/gallery.js（gallery.html 篩選格）還是 js/gallery-course-preview.js
// （各課程頁「學員作品」預覽區）動態產生的，這支都能用，因為是用
// document 層級的事件代理（監聽點擊/鍵盤事件，判斷 e.target 有沒有落在
// .gallery-grid__item 裡），不用等特定格子存在才綁定，也不受 gallery.html
// 篩選後重新產生 innerHTML 影響。
// 2026-11-12：沙畫材料包商品頁「搭配自己的顏色」的 .howto-compare__cell
// 也用這套燈箱放大（見下面事件代理跟分組邏輯一併認得
// .howto-compare__cell／.howto-compare）。這幾張是 AI 模擬示意圖，使用者
// 原本擔心放大看了之後客人會下載，所以放大的這張圖（.gallery-lightbox__img）
// 也補上跟縮圖同一套 draggable="false"／oncontextmenu 阻擋右鍵另存，不是
// 只有縮圖擋、放大後反而沒擋。
(function () {
  let overlay = null;
  let imgEl = null;
  let captionEl = null;
  let courseLinkWrap = null;
  let courseLinkEl = null;
  let prevBtn = null;
  let nextBtn = null;
  let currentItems = [];
  let currentIndex = 0;
  let lastFocused = null;

  function buildOverlay() {
    overlay = document.createElement("div");
    overlay.className = "gallery-lightbox";
    overlay.hidden = true;
    overlay.innerHTML = `
      <button type="button" class="gallery-lightbox__close" aria-label="關閉">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
      <button type="button" class="gallery-lightbox__nav gallery-lightbox__nav--prev" aria-label="上一張">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>
      </button>
      <button type="button" class="gallery-lightbox__nav gallery-lightbox__nav--next" aria-label="下一張">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>
      </button>
      <figure class="gallery-lightbox__figure">
        <img class="gallery-lightbox__img" src="" alt="" draggable="false" oncontextmenu="return false">
        <figcaption class="gallery-lightbox__caption"></figcaption>
        <p class="gallery-lightbox__course-link"><a class="text-link" href="#"></a></p>
      </figure>
    `;
    document.body.appendChild(overlay);

    imgEl = overlay.querySelector(".gallery-lightbox__img");
    captionEl = overlay.querySelector(".gallery-lightbox__caption");
    courseLinkWrap = overlay.querySelector(".gallery-lightbox__course-link");
    courseLinkEl = courseLinkWrap.querySelector("a");
    prevBtn = overlay.querySelector(".gallery-lightbox__nav--prev");
    nextBtn = overlay.querySelector(".gallery-lightbox__nav--next");

    overlay.querySelector(".gallery-lightbox__close").addEventListener("click", close);
    prevBtn.addEventListener("click", showPrev);
    nextBtn.addEventListener("click", showNext);

    // 點背景（不是點圖片本身）也可以關閉，跟大部分燈箱的操作習慣一致。
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });

    document.addEventListener("keydown", (e) => {
      if (overlay.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    });
  }

  function render() {
    const figure = currentItems[currentIndex];
    const img = figure.querySelector("img");
    const caption = figure.querySelector(".gallery-grid__caption");
    // 高解析照片沿用檔名，版本參數避免放大時讀到瀏覽器舊的低解析快取。
    const fullSrc = new URL(img.dataset.fullSrc || img.src, document.baseURI);
    fullSrc.searchParams.set("v", "20261110-high-resolution");
    imgEl.src = fullSrc.href;
    imgEl.alt = img.alt || "";
    captionEl.textContent = caption ? caption.textContent : "";
    captionEl.hidden = !caption;

    // 「查看課程」連結：只有 js/gallery.js 產生格子時才會補
    // data-course-link（見該檔案），課程頁自己的「學員作品」預覽區
    // （js/gallery-course-preview.js）不會補，所以這裡讀不到屬性時
    // 直接把整段連結藏起來，不會顯示壞掉的連結。
    const courseLink = figure.getAttribute("data-course-link");
    const courseName = figure.getAttribute("data-course-name");
    if (courseLink) {
      courseLinkEl.href = courseLink;
      courseLinkEl.textContent = "查看「" + courseName + "」課程 →";
      courseLinkWrap.hidden = false;
    } else {
      courseLinkWrap.hidden = true;
    }

    const multiple = currentItems.length > 1;
    prevBtn.hidden = !multiple;
    nextBtn.hidden = !multiple;
  }

  function open(items, index) {
    if (!overlay) buildOverlay();
    currentItems = items;
    currentIndex = index;
    lastFocused = document.activeElement;
    render();
    overlay.hidden = false;
    overlay.querySelector(".gallery-lightbox__close").focus();
  }

  function close() {
    if (!overlay || overlay.hidden) return;
    overlay.hidden = true;
    imgEl.src = "";
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  function showPrev() {
    if (currentItems.length < 2) return;
    currentIndex = (currentIndex - 1 + currentItems.length) % currentItems.length;
    render();
  }

  function showNext() {
    if (currentItems.length < 2) return;
    currentIndex = (currentIndex + 1) % currentItems.length;
    render();
  }

  function findGridItems(fromFigure) {
    const grid = fromFigure.closest(".gallery-grid, .howto-compare");
    if (!grid) return [fromFigure];
    return Array.from(grid.querySelectorAll(".gallery-grid__item, .howto-compare__cell"));
  }

  function handleOpenFrom(figure) {
    const items = findGridItems(figure);
    open(items, items.indexOf(figure));
  }

  document.addEventListener("click", (e) => {
    const figure = e.target.closest(".gallery-grid__item, .howto-compare__cell");
    if (!figure) return;
    handleOpenFrom(figure);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const figure = e.target.closest(".gallery-grid__item, .howto-compare__cell");
    if (!figure) return;
    e.preventDefault();
    handleOpenFrom(figure);
  });
})();
