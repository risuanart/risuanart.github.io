/* courses-carousel.js —— courses/index.html 課程展示輪播（.course-carousel）。
   自動輪播＋hover 暫停＋手動介入（點箭頭／點 dots／拖曳捲動）後永久停止，
   跟 js/hero-colorway-carousel.js 同一套互動邏輯（setTimeout 遞迴＋
   prefers-reduced-motion 尊重），不是另外發明一套新規則，只是這裡是
   「可以手動控制、停了就不會自己恢復」的版本，跟那支「暫停鍵可以恢復
   播放」的節奏不同——道理同 js/hero-thumb-gallery.js 開頭的說明：使用者
   自己選了要看哪張，就不該再被自動跳走。

   同一支檔案也處理「複製訊息，私訊討論圖片」那顆按鈕（.course-ig-cta__btn）
   ——邏輯很單純，不值得為它另外切一支檔案。 */

(function () {
  const FIRST_FRAME_MS = 4000;
  const INTERVAL_MS = 4000;

  function initCarousel(root) {
    const track = root.querySelector(".course-carousel__track");
    const tiles = Array.prototype.slice.call(
      root.querySelectorAll(".course-carousel__tile")
    );
    if (!track || tiles.length < 2) return;

    const dotsWrap = root.querySelector(".course-carousel__dots");
    let index = 0;
    let timer = null;
    let stoppedByUser = false;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const dots = tiles.map((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "course-carousel__dot";
      dot.setAttribute("aria-label", "切換到第 " + (i + 1) + " 堂課");
      dot.addEventListener("click", () => {
        stoppedByUser = true;
        pause();
        setActive(i, true);
      });
      if (dotsWrap) dotsWrap.appendChild(dot);
      return dot;
    });

    function setActive(i, scroll) {
      index = (i + tiles.length) % tiles.length;
      tiles.forEach((t, j) => t.classList.toggle("is-active", j === index));
      dots.forEach((d, j) => d.classList.toggle("is-active", j === index));
      if (scroll) {
        const tile = tiles[index];
        const trackRect = track.getBoundingClientRect();
        const tileRect = tile.getBoundingClientRect();
        const delta =
          tileRect.left + tileRect.width / 2 - (trackRect.left + trackRect.width / 2);
        track.scrollBy({ left: delta, behavior: "smooth" });
      }
    }

    function pause() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    }

    function resume() {
      if (stoppedByUser || prefersReducedMotion) return;
      pause();
      const duration = index === 0 ? FIRST_FRAME_MS : INTERVAL_MS;
      timer = setTimeout(() => {
        setActive(index + 1, true);
        resume();
      }, duration);
    }

    root.querySelectorAll("[data-nav]").forEach((btn) => {
      btn.addEventListener("click", () => {
        stoppedByUser = true;
        pause();
        setActive(index + (btn.dataset.nav === "1" ? 1 : -1), true);
      });
    });
    track.addEventListener("pointerdown", () => {
      stoppedByUser = true;
      pause();
    });
    root.addEventListener("mouseenter", pause);
    root.addEventListener("mouseleave", resume);

    setActive(0, false);
    resume();
  }

  function initIgCta(root) {
    const btn = root.querySelector(".course-ig-cta__btn");
    if (!btn) return;
    const label = btn.querySelector(".course-ig-cta__label");
    const template = "您好！我想預約日宣繪畫室的課程，想麻煩討論一下我想畫的圖 🎨";
    btn.addEventListener("click", () => {
      const done = () => {
        const original = label.textContent;
        label.textContent = "已複製，前往 Instagram";
        label.classList.add("course-ig-cta__copied");
        window.open("https://instagram.com/ri.suan_art", "_blank", "noopener");
        setTimeout(() => {
          label.textContent = original;
          label.classList.remove("course-ig-cta__copied");
        }, 2200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(template).then(done).catch(done);
      } else {
        done();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".course-carousel").forEach(initCarousel);
    document.querySelectorAll(".course-ig-cta").forEach(initIgCta);
  });
})();
