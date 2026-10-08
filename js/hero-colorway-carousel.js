/* hero-colorway-carousel.js —— 配色動態展示（商品頁首圖／商品總覽格狀卡
   縮圖共用）。套在 [data-hero-carousel] 容器上：進頁面自動播一輪（主圖→
   配色二→配色三→淡回主圖後停止），不循環、不可點擊切換——這些商品只會
   出貨圖一那個固定配色，其餘兩張純粹是搭配參考，故意不做縮圖點擊選單，
   避免讓客人誤會成出貨也能挑配色。

   商品頁的版本有暫停鍵／進度點點（.hero-carousel__toggle／
   .hero-carousel__dots），給想定格看、或 prefers-reduced-motion 的人用；
   商品總覽格狀卡縮圖太小塞不下這兩個控制元件，直接省略——initCarousel()
   本來就用 querySelector 找這兩個元素，找不到時用 if(toggle) 包起來，
   沒有這兩個元素一樣能正常自動播放／停止，不會因為缺元素而壞掉。

   商品頁的 [data-hero-carousel] 在 HTML 解析完就存在，靠檔案最下面
   DOMContentLoaded 時的自動掃描初始化即可；商品總覽格狀卡是
   js/products-overview.js 動態插入 DOM 的，時間點在這支腳本執行之後，
   所以額外把 initAll 掛到 window.HeroColorwayCarousel，讓
   products-overview.js 插入卡片後能自己呼叫一次。 */

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
