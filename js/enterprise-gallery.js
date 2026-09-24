/* enterprise-gallery.js —— 企業課程案例細節頁的「活動花絮」輪播，邏輯跟
   首頁 .preview-hero 一樣（自動播放＋圓點手動切換／滑鼠移入暫停，見
   js/home-shop.js），只是換了一組 class 名稱（.ent-gallery），服務
   enterprise-porsche.html 這類案例細節頁。用 querySelectorAll 支援一頁
   放多組輪播，之後新案例頁直接複製整組 .ent-gallery 標記就能用，不用
   改這支檔案。
   手機滑動切換：大部分訪客用手機瀏覽，原本只能點下面的小圓點換圖，
   在手機上很難點準。加上左右滑動偵測（見下方 touchstart/touchmove/
   touchend），門檻抓 40px、且橫向位移要大於縱向位移才觸發，避免使用者
   只是想直向捲動頁面卻被誤判成滑動換圖。用 passive listener（沒有呼叫
   preventDefault），不會擋到原本的頁面捲動。
   滑動提示（2026-09-25 新增）：使用者反饋手機上只看得到下面的小圓點，
   不會知道其實可以左右滑動。與其一頁一頁手動加提示 HTML（全站有多個
   頁面用到 .ent-gallery），改成用 JS 統一在圓點後面插入一個提示元素
   （文字＋左右箭頭圖示），這樣新增案例頁只要沿用既有的 .ent-gallery
   標記就會自動帶有提示，不用每頁重複貼一樣的 HTML。提示本身用 CSS 控制
   只在手機寬度顯示（見 css/enterprise.css .ent-gallery__swipe-hint），
   桌面版滑鼠使用者用不到滑動手勢，不需要看到這個提示。 */
(function () {
  const galleries = document.querySelectorAll(".ent-gallery");

  galleries.forEach((gallery) => {
    const viewport = gallery.querySelector(".ent-gallery__viewport");
    const slides = Array.from(gallery.querySelectorAll(".ent-gallery__slide"));
    const dots = Array.from(gallery.querySelectorAll(".ent-gallery__dots button"));
    const dotsEl = gallery.querySelector(".ent-gallery__dots");
    const AUTOPLAY_MS = parseInt(gallery.dataset.autoplay, 10) || 4000;

    if (slides.length > 1 && dotsEl && !gallery.querySelector(".ent-gallery__swipe-hint")) {
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
        start(); // 手動切換後重新計時，不會切完馬上又被自動播放蓋過去
      });
    });

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
        start(); // 滑動後重新計時，跟點圓點的行為一致
      });
    }

    if (slides.length > 1) start();
  });
})();
