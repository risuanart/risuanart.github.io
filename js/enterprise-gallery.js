

















(function () {
  const galleries = document.querySelectorAll(".ent-gallery");

  galleries.forEach((gallery) => {
    const viewport = gallery.querySelector(".ent-gallery__viewport");
    const slides = Array.from(gallery.querySelectorAll(".ent-gallery__slide"));
    const dots = Array.from(gallery.querySelectorAll(".ent-gallery__dots button"));
    const dotsEl = gallery.querySelector(".ent-gallery__dots");
    const courseControls = gallery.dataset.courseControls === "true";
    let counterEl = null;
    let prevControl = null;
    let nextControl = null;
    const AUTOPLAY_MS = parseInt(gallery.dataset.autoplay, 10) || 4000;

    if (slides.length > 1 && courseControls && dotsEl) {
      const controls = document.createElement("div");
      controls.className = "ent-gallery__controls";
      controls.innerHTML = `
        <button type="button" class="ent-gallery__step" data-direction="prev" aria-label="上一張圖片">←</button>
        <span class="ent-gallery__counter" aria-live="polite"></span>
        <button type="button" class="ent-gallery__step" data-direction="next" aria-label="下一張圖片">→</button>`;
      dotsEl.insertAdjacentElement("afterend", controls);
      dotsEl.hidden = true;
      counterEl = controls.querySelector(".ent-gallery__counter");
      prevControl = controls.querySelector('[data-direction="prev"]');
      nextControl = controls.querySelector('[data-direction="next"]');
    } else if (slides.length > 1 && dotsEl && !gallery.querySelector(".ent-gallery__swipe-hint")) {
      const hint = document.createElement("p");
      hint.className = "ent-gallery__swipe-hint";
      hint.setAttribute("aria-hidden", "true");
      hint.innerHTML =
        '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 7 3 12l5 5M16 7l5 5-5 5"/></svg>左右滑動看更多';
      dotsEl.insertAdjacentElement("afterend", hint);
    }
    let current = 0;
    let timer = null;

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle("is-active", i === current));
      dots.forEach((dot, i) => {
        const isActive = i === current;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-selected", String(isActive));
      });
      if (counterEl) {
        const pad = (value) => String(value).padStart(2, "0");
        counterEl.textContent = `${pad(current + 1)} / ${pad(slides.length)}`;
      }
    }

    function next() {
      goTo(current + 1);
    }

    function prev() {
      goTo(current - 1);
    }

    function start() {
      stop();
      timer = setInterval(next, AUTOPLAY_MS);
    }

    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        goTo(Number(dot.dataset.index));
        start();
      });
    });
    if (prevControl) prevControl.addEventListener("click", () => { prev(); start(); });
    if (nextControl) nextControl.addEventListener("click", () => { next(); start(); });

    gallery.addEventListener("mouseenter", stop);
    gallery.addEventListener("mouseleave", start);

    if (viewport) {
      let touchStartX = 0;
      let touchStartY = 0;
      let touchDeltaX = 0;

      viewport.addEventListener(
        "touchstart",
        (e) => {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          touchDeltaX = 0;
          stop();
        },
        { passive: true }
      );

      viewport.addEventListener(
        "touchmove",
        (e) => {
          touchDeltaX = e.touches[0].clientX - touchStartX;
        },
        { passive: true }
      );

      viewport.addEventListener("touchend", (e) => {
        const touchEndY = e.changedTouches[0].clientY;
        const touchDeltaY = touchEndY - touchStartY;
        if (Math.abs(touchDeltaX) > 40 && Math.abs(touchDeltaX) > Math.abs(touchDeltaY)) {
          if (touchDeltaX < 0) next();
          else prev();
        }
        start();
      });
    }

    if (slides.length > 1) {
      goTo(0);
      start();
    }
  });
})();
