// moments-carousel.js —— 通用的「一堆照片自動輪播＋手機可滑動切換」
// 元件。用法：容器加 data-moments-carousel（可選 data-interval，毫秒，
// 預設 4000），裡面直接放一串 <img>，第一張加 is-active。純淡入淡出，
// 給「展示很多張同主題照片」這種情境用，跟首頁大輪播（js/home-shop.js
// 的 .preview-hero）不是同一支，那支要處理羊Diss紅藍子輪播這類更複雜
// 的狀況，這支只負責單純的多圖輪播。
// 2026-11-08 新增：電腦寬度（CSS media query 控制顯示，見
// css/enterprise.css .moments-carousel__nav）追加左右鍵，手機維持原本
// 單純滑動切換，不額外擠進按鈕。
(function () {
  // 2026-11-08 使用者反映箭頭在較窄的輪播（例如搭配 __body 之後只佔
  // 半欄寬）會被吃掉，只看得到中間那條橫槓——原本跟
  // courses/custom-photo-oil/「可畫的主題」（.custom-topics__arrow）
  // 同一套圖案，那個圖案有一條貫穿全寬的橫線加兩短斜線，橫線在小尺寸
  // 下還是看得清楚，但兩條斜線縮太小後線段只剩幾個像素，反而因為
  // anti-alias 糊掉幾乎看不見。改用單純的「<」「>」雙折線（沒有多餘的
  // 橫線跟它搶視覺），在小尺寸下比較不會糊掉。
  function createNavButton(direction, label) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "moments-carousel__nav moments-carousel__nav--" + direction;
    btn.setAttribute("aria-label", label);
    const d = direction === "prev" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6";
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '"/></svg>';
    return btn;
  }

  const carousels = document.querySelectorAll("[data-moments-carousel]");

  carousels.forEach((root) => {
    const images = Array.from(root.querySelectorAll("img"));
    if (images.length < 2) return;

    const INTERVAL_MS = parseInt(root.dataset.interval, 10) || 4000;
    let current = Math.max(0, images.findIndex((img) => img.classList.contains("is-active")));
    let timer = null;
    // 2026-11-12 使用者反映一進頁面第一張停太久，容易讓人以為這只是
    // 一張靜態照片、沒發現這裡其實是輪播——只有「頁面剛載入後的第一次
    // 切換」要縮短，之後（手動滑動／點箭頭／滑鼠移開後恢復）都還是照
    // data-interval 設定的節奏，不是整組輪播速度變快。
    const FIRST_SWITCH_MS = Math.min(1800, INTERVAL_MS);
    let firstPlay = true;

    function goTo(index) {
      current = (index + images.length) % images.length;
      images.forEach((img, i) => img.classList.toggle("is-active", i === current));
    }

    function next() {
      goTo(current + 1);
    }

    function scheduleNext(delay) {
      stop();
      timer = setTimeout(() => {
        next();
        firstPlay = false;
        scheduleNext(INTERVAL_MS);
      }, delay);
    }

    function start() {
      scheduleNext(firstPlay ? FIRST_SWITCH_MS : INTERVAL_MS);
    }

    function stop() {
      if (timer) clearTimeout(timer);
      timer = null;
    }

    // 手機手指左右滑動切換上一張／下一張，邏輯跟首頁大輪播一致：只量測
    // 水平位移，位移量比垂直位移小或小於門檻值時當作是在滑頁面（直向
    // 捲動），不觸發切換；css 的 touch-action: pan-y 讓瀏覽器原生還是能
    // 處理垂直捲動。
    let touchStartX = null;
    let touchStartY = null;
    const SWIPE_THRESHOLD = 40;

    root.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length !== 1) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      },
      { passive: true }
    );

    root.addEventListener(
      "touchend",
      (e) => {
        if (touchStartX === null) return;
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        touchStartX = null;
        touchStartY = null;
        if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) < Math.abs(deltaY)) return;
        if (deltaX < 0) {
          next();
        } else {
          goTo(current - 1);
        }
        start(); // 手動滑動後重新計時，不會切完馬上又被自動播放蓋過去
      },
      { passive: true }
    );

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);

    const prevBtn = createNavButton("prev", "上一張");
    const nextBtn = createNavButton("next", "下一張");
    prevBtn.addEventListener("click", () => {
      goTo(current - 1);
      start(); // 手動點擊後重新計時，道理跟手機滑動一致
    });
    nextBtn.addEventListener("click", () => {
      next();
      start();
    });
    root.appendChild(prevBtn);
    root.appendChild(nextBtn);

    start();
  });
})();
