/* hero-colorway-carousel.js —— 配色動態展示（商品頁首圖／商品總覽格狀卡／
   相關商品卡片縮圖共用）。套在 [data-hero-carousel] 容器上：進頁面自動播
   （主圖→配色二→配色三），不可點擊切換——這些商品只會出貨圖一那個固定
   配色，其餘兩張純粹是搭配參考，故意不做縮圖點擊選單，避免讓客人誤會成
   出貨也能挑配色。

   預設播完一輪就停在主圖不循環（首圖／商品總覽格狀卡）；如果容器上有
   data-carousel-loop 屬性，播完一輪會接著重頭再播，不停（相關商品卡片
   在用——使用者反饋那個區塊在頁面偏下方，訪客通常滑到那裡時「播一輪
   就停」早就播完了，看到的時候已經定格在主圖，等於看不到配色動態展示
   的效果，所以改成一直循環）。

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
    const loop = root.hasAttribute("data-carousel-loop");

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
          if (!loop) pause();
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
