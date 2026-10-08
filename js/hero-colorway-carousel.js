/* hero-colorway-carousel.js —— 標題區成品主圖的配色動態展示。
   套在 [data-hero-carousel] 容器上：進頁面自動播一輪（主圖→配色二→
   配色三→淡回主圖後停止），不循環、不可點擊切換——這些商品只會出貨
   圖一那個固定配色，其餘兩張純粹是搭配參考，故意不做縮圖點擊選單，
   避免讓客人誤會成出貨也能挑配色。右下角暫停鍵給想定格看、或
   prefers-reduced-motion 的人用。 */

(function () {
  const INTERVAL_MS = 2200;

  function initCarousel(root) {
    const frames = Array.prototype.slice.call(
      root.querySelectorAll("[data-carousel-frame]")
    );
    if (frames.length < 2) return;

    const dots = Array.prototype.slice.call(
      root.querySelectorAll(".hero-carousel__dots span")
    );
    const toggle = root.querySelector(".hero-carousel__toggle");

    let index = 0;
    let timer = null;

    function show(i) {
      frames.forEach((frame, n) => frame.classList.toggle("is-active", n === i));
      dots.forEach((dot, n) => dot.classList.toggle("is-active", n === i));
    }

    function pause() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      root.classList.add("is-paused");
      if (toggle) toggle.setAttribute("aria-label", "播放配色展示");
    }

    function play() {
      if (index >= frames.length - 1) {
        index = 0;
        show(0);
      }
      pause();
      timer = setInterval(() => {
        index += 1;
        if (index >= frames.length) {
          index = 0;
          show(0);
          pause();
          return;
        }
        show(index);
      }, INTERVAL_MS);
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

    if (prefersReducedMotion) {
      pause();
    } else {
      play();
    }
  }

  document.querySelectorAll("[data-hero-carousel]").forEach(initCarousel);
})();
