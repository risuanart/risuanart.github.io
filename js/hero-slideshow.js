/* home-shop.js —— 正式首頁（選物店風格）專屬邏輯：輪播（自動播放＋圓點
   手動切換＋滑鼠移入暫停＋手機手指左右滑動切換）＋頂部漢堡選單開合。
   只服務 index.html 這一頁，不是全站共用元件。輪播播放秒數讀
   .preview-hero 的 data-autoplay（毫秒），沒有的話預設 5000ms。

   2026-11-07 使用者要求羊Diss舞蹈紅／藍兩款在同一格（同一個輪播圓點）
   裡接續播放，而且紅、藍各自要播滿跟其他格一樣的秒數（都是
   data-sheep-interval，目前跟 AUTOPLAY_MS 分開設定方便微調），播完
   紅、藍兩段才換到下一個圓點——不是主輪播自己固定 9 秒跳一次、跟內部
   紅藍切換各自倒數互不同步。改成主輪播的計時器（scheduleNext）知道
   「現在是不是停在羊Diss這格」：是的話，這一輪的等待時間用
   「紅藍各自秒數 × 2」，不是一般的 AUTOPLAY_MS；紅／藍切換跟主輪播的
   下一步都是同一份計時器邏輯推出來的，保證兩邊同步、不會互搶。 */
(function () {
  const hero = document.querySelector(".preview-hero");
  if (!hero) return;

  const slides = Array.from(hero.querySelectorAll(".preview-hero__slide"));
  let heroVisible = true;
  function syncActiveVideos() {
    slides.forEach(slide => {
      const active = slide.classList.contains('is-active') && heroVisible && !document.hidden;
      slide.querySelectorAll('video').forEach(video => {
        const selected = !video.classList.contains('preview-hero__sheep-photo') || video.classList.contains('is-active');
        if (active && selected) { video.muted = true; video.play().catch(() => {}); }
        else video.pause();
      });
    });
  }
  new IntersectionObserver(entries => { heroVisible = entries[0].isIntersecting; syncActiveVideos(); }, { threshold: 0.15 }).observe(hero);
  document.addEventListener('visibilitychange', syncActiveVideos);
  // 圓點由實際影片產生，避免註解卡片或新增影片後索引錯位。
  const dotsWrap = hero.querySelector(".preview-hero__dots");
  if (dotsWrap) {
    dotsWrap.replaceChildren(...slides.map((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.dataset.index = String(index);
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "第 " + (index + 1) + " 張");
      dot.setAttribute("aria-selected", String(index === 0));
      dot.classList.toggle("is-active", index === 0);
      return dot;
    }));
  }
  const dots = Array.from(hero.querySelectorAll(".preview-hero__dots button"));
  const AUTOPLAY_MS = parseInt(hero.dataset.autoplay, 10) || 5000;
  let current = 0;
  let timer = null;

  // 羊Diss舞蹈紅／藍子輪播（如果這格存在的話）。
  const sheepSlide = slides.find((s) => s.hasAttribute("data-sheep-rotator"));
  const sheepSlideIndex = sheepSlide ? slides.indexOf(sheepSlide) : -1;
  const sheepVideos = sheepSlide ? Array.from(sheepSlide.querySelectorAll(".preview-hero__sheep-photo")) : [];
  const sheepLink = sheepSlide ? sheepSlide.querySelector("[data-sheep-link]") : null;
  const sheepTagline = sheepSlide ? sheepSlide.querySelector("[data-sheep-tagline]") : null;
  const sheepCtaText = sheepSlide ? sheepSlide.querySelector("[data-sheep-cta-text]") : null;
  const SHEEP_SEGMENT_MS = sheepSlide ? parseInt(sheepSlide.dataset.sheepInterval, 10) || AUTOPLAY_MS : 0;
  let sheepStep = 0;
  let sheepTimer = null;

  function applySheepScheme(scheme) {
    const capitalized = scheme[0].toUpperCase() + scheme.slice(1);
    const hrefKey = `href${capitalized}`;
    const taglineKey = `tagline${capitalized}`;
    const ctaTextKey = `ctaText${capitalized}`;
    if (sheepLink && sheepLink.dataset[hrefKey]) sheepLink.href = sheepLink.dataset[hrefKey];
    const photoLink = sheepSlide.querySelector(".preview-hero__photo-link");
    if (photoLink && sheepLink && sheepLink.dataset[hrefKey]) photoLink.href = sheepLink.dataset[hrefKey];
    if (sheepTagline && sheepTagline.dataset[taglineKey]) sheepTagline.textContent = sheepTagline.dataset[taglineKey];
    if (sheepCtaText && sheepCtaText.dataset[ctaTextKey]) sheepCtaText.textContent = sheepCtaText.dataset[ctaTextKey];
  }

  function playSheepStep(step) {
    sheepStep = step;
    sheepVideos.forEach((v, i) => v.classList.toggle("is-active", i === step));
    sheepSlide.querySelectorAll(".preview-hero__companion--sheep").forEach((photo) => {
      photo.classList.toggle("is-active", photo.dataset.scheme === sheepVideos[step].dataset.scheme);
    });
    sheepVideos.forEach((v, i) => {
      if (i !== step) v.pause();
    });
    sheepVideos[step].currentTime = 0;
    sheepVideos[step].play().catch(() => {});
    applySheepScheme(sheepVideos[step].dataset.scheme);
  }

  function startSheepCycle() {
    if (!sheepSlide) return;
    playSheepStep(0); // 紅，先播 SHEEP_SEGMENT_MS
    sheepTimer = setTimeout(() => playSheepStep(1), SHEEP_SEGMENT_MS); // 到時間換藍
  }

  function stopSheepCycle() {
    if (sheepTimer) clearTimeout(sheepTimer);
    sheepTimer = null;
    sheepVideos.forEach((v) => v.pause());
  }

  function goTo(index) {
    const prev = current;
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === current));
    dots.forEach((dot, i) => {
      const isActive = i === current;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-selected", String(isActive));
    });

    syncActiveVideos();
    if (prev === sheepSlideIndex && current !== sheepSlideIndex) stopSheepCycle();
    if (current === sheepSlideIndex) startSheepCycle();
  }

  function next() {
    goTo(current + 1);
  }

  function scheduleNext() {
    stop();
    // 停在羊Diss這格時，等「紅＋藍」各播一輪的總時間才跳下一格；其他格
    // 照舊用全站共用的 AUTOPLAY_MS，兩種格子播放的秒數感受起來才會一致
    // （每一段「畫面」不管是不是羊Diss紅／藍，都停留同樣長的時間）。
    const delay = current === sheepSlideIndex ? SHEEP_SEGMENT_MS * 2 : AUTOPLAY_MS;
    timer = setTimeout(() => {
      next();
      scheduleNext();
    }, delay);
  }

  function stop() {
    if (timer) clearTimeout(timer);
    timer = null;
  }

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      goTo(Number(dot.dataset.index));
      scheduleNext(); // 手動切換後重新計時，不會切完馬上又被自動播放蓋過去
    });
  });

  hero.querySelectorAll("[data-hero-direction]").forEach((button) => {
    button.addEventListener("click", () => {
      goTo(current + Number(button.dataset.heroDirection));
      scheduleNext();
    });
  });

  // 滑鼠移到輪播上暫停，離開後繼續（桌機體驗），觸控裝置沒有 hover，
  // 自動播放不受影響。停在羊Diss這格時一併暫停／恢復紅藍切換的計時器，
  // 不然滑鼠移開外層輪播卻繼續倒數會跟主輪播的計時對不起來。
  hero.addEventListener("mouseenter", () => {
    stop();
    if (current === sheepSlideIndex && sheepTimer) clearTimeout(sheepTimer);
  });
  hero.addEventListener("mouseleave", () => {
    scheduleNext();
    if (current === sheepSlideIndex) startSheepCycle();
  });

  // 手機手指左右滑動切換上一張／下一張。只量測水平位移，位移量比垂直
  // 位移小、或小於門檻值，當作是在滑頁面（直向捲動），不觸發切換——
  // 不然訪客想往下滑看其他內容，手指稍微斜一點點就會誤觸輪播切換。
  // touch-action: pan-y（見 css/home-shop.css）讓瀏覽器原生還是能處理
  // 垂直捲動，這裡只負責判斷「這次觸控算不算一次換頁滑動」。
  let touchStartX = null;
  let touchStartY = null;
  const SWIPE_THRESHOLD = 40;

  hero.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    },
    { passive: true }
  );

  hero.addEventListener(
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
      scheduleNext(); // 手動切換後重新計時，同一套理由同上面圓點點擊
    },
    { passive: true }
  );

  if (current === sheepSlideIndex) startSheepCycle();
  syncActiveVideos();
  if (slides.length > 1) scheduleNext();
})();
