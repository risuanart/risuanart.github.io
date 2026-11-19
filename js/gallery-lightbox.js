











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


    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });


    let swipeStart = null;
    overlay.addEventListener("touchstart", (e) => {
      swipeStart = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
    }, { passive: true });
    overlay.addEventListener("touchcancel", () => { swipeStart = null; }, { passive: true });
    overlay.addEventListener("touchend", (e) => {
      if (!swipeStart || !e.changedTouches.length) return;
      const dx = e.changedTouches[0].clientX - swipeStart.x;
      const dy = e.changedTouches[0].clientY - swipeStart.y;
      swipeStart = null;
      if (Math.abs(dx) < 40 || Math.abs(dx) <= Math.abs(dy)) return;
      if (!overlay.hidden) { if (dx < 0) showNext(); else showPrev(); }
    }, { passive: true });
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

    const fullSrc = new URL(img.dataset.fullSrc || img.src, document.baseURI);
    fullSrc.searchParams.set("v", "20261110-high-resolution");
    imgEl.src = fullSrc.href;
    imgEl.alt = img.alt || "";
    captionEl.textContent = caption ? caption.textContent : "";
    captionEl.hidden = !caption;





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
    const card = !!items[index].closest(".howto-compare");
    overlay.classList.toggle("gallery-lightbox--card", card);
    const closeButton = overlay.querySelector(".gallery-lightbox__close");
    if (card) overlay.querySelector(".gallery-lightbox__figure").appendChild(closeButton);
    else overlay.prepend(closeButton);
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
