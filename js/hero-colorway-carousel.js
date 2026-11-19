


























(function () {
  const INTERVAL_MS = 1800;




  const FIRST_FRAME_MS = 1800;

  function initCarousel(root) {
    const frames = Array.prototype.slice.call(
      root.querySelectorAll("[data-carousel-frame]")
    );
    if (frames.length < 2) return;

    const dots = Array.prototype.slice.call(
      root.querySelectorAll(".hero-carousel__dots span")
    );
    const toggle = root.querySelector(".hero-carousel__toggle");
    const loop = root.hasAttribute("data-carousel-loop");

    let index = 0;
    let timer = null;

    function show(i) {
      frames.forEach((frame, n) => frame.classList.toggle("is-active", n === i));
      dots.forEach((dot, n) => dot.classList.toggle("is-active", n === i));
    }

    function durationFor(i) {
      return i === 0 ? FIRST_FRAME_MS : INTERVAL_MS;
    }

    function pause() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      root.classList.add("is-paused");
      if (toggle) toggle.setAttribute("aria-label", "播放配色展示");
    }

    function scheduleNext() {
      timer = setTimeout(() => {
        index += 1;
        if (index >= frames.length) {
          index = 0;
          show(0);
          if (!loop) {
            pause();
            return;
          }
          scheduleNext();
          return;
        }
        show(index);
        scheduleNext();
      }, durationFor(index));
    }

    function play() {
      if (index >= frames.length - 1) {
        index = 0;
        show(0);
      }
      pause();
      scheduleNext();
      root.classList.remove("is-paused");
      if (toggle) toggle.setAttribute("aria-label", "暫停配色展示");
    }

    if (toggle) {
      toggle.addEventListener("click", () => {
        if (timer) {
          pause();
        } else {
          play();
        }
      });
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;


    let swipeStart = null;
    let suppressClickUntil = 0;
    root.addEventListener("click", e => { if (Date.now() < suppressClickUntil) { e.preventDefault(); e.stopPropagation(); } }, true);
    root.addEventListener("touchstart", (e) => {
      swipeStart = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
    }, { passive: true });
    root.addEventListener("touchcancel", () => { swipeStart = null; }, { passive: true });
    root.addEventListener("touchend", (e) => {
      if (!swipeStart || !e.changedTouches.length) return;
      const dx = e.changedTouches[0].clientX - swipeStart.x;
      const dy = e.changedTouches[0].clientY - swipeStart.y;
      swipeStart = null;
      if (Math.abs(dx) < 40 || Math.abs(dx) <= Math.abs(dy)) return;
      suppressClickUntil = Date.now() + 400;
      pause(); index = (index + (dx < 0 ? 1 : -1) + frames.length) % frames.length; show(index); if (!prefersReducedMotion) { scheduleNext(); root.classList.remove("is-paused"); if (toggle) toggle.setAttribute("aria-label", "暫停配色展示"); }
    }, { passive: true });
    if (prefersReducedMotion) {
      pause();
    } else {
      play();
    }
  }

  function initAll(root) {
    (root || document).querySelectorAll("[data-hero-carousel]").forEach((el) => {
      if (el.dataset.carouselInitialized) return;
      el.dataset.carouselInitialized = "true";
      initCarousel(el);
    });
  }

  window.HeroColorwayCarousel = { initAll };

  initAll(document);
})();
