/* home-shop.js —— 正式首頁（選物店風格）專屬邏輯：輪播（自動播放＋圓點
   手動切換＋滑鼠移入暫停）＋頂部漢堡選單開合。只服務 index.html 這一頁，
   不是全站共用元件。輪播播放秒數讀 .preview-hero 的 data-autoplay
   （毫秒），沒有的話預設 5000ms。 */
(function () {
  const hero = document.querySelector(".preview-hero");
  if (!hero) return;

  const slides = Array.from(hero.querySelectorAll(".preview-hero__slide"));
  const dots = Array.from(hero.querySelectorAll(".preview-hero__dots button"));
  const AUTOPLAY_MS = parseInt(hero.dataset.autoplay, 10) || 5000;
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

  // 滑鼠移到輪播上暫停，離開後繼續（桌機體驗），觸控裝置沒有 hover，
  // 自動播放不受影響。
  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);

  if (slides.length > 1) start();
})();

/* Follow Us / Instagram：打 risuan-checkout 後端新增的 /api/instagram-posts，
   把 8 個「貼文待補」佔位框換成真的貼文縮圖。後端還沒設定 Instagram 相關
   環境變數、或這次 fetch 失敗（網路問題／API 額度等）時，回傳的 posts 會是
   空陣列或整個 fetch 失敗——兩種情況都直接維持原本的佔位框，不拿掉、不報錯
   給訪客看，首頁其他部分完全不受影響。 */
(function () {
  const grid = document.querySelector(".preview-follow__grid");
  if (!grid) return;

  const API_BASE = "https://risuan-checkout.vercel.app";

  fetch(`${API_BASE}/api/instagram-posts?limit=8`)
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
    .then((data) => {
      const posts = Array.isArray(data.posts) ? data.posts : [];
      if (!posts.length) return; // 沒設定 API 或目前沒有貼文，維持佔位框

      const items = Array.from(grid.querySelectorAll(".preview-follow__item"));
      posts.slice(0, items.length).forEach((post, i) => {
        const placeholder = items[i];
        const link = document.createElement("a");
        link.className = "preview-follow__item preview-follow__item--photo";
        link.href = post.permalink;
        link.target = "_blank";
        link.rel = "noopener";
        link.setAttribute("aria-label", post.caption ? post.caption.slice(0, 60) : "查看這則 Instagram 貼文");
        const img = document.createElement("img");
        img.src = post.imageUrl;
        img.alt = "";
        img.loading = "lazy";
        link.appendChild(img);
        placeholder.replaceWith(link);
      });
    })
    .catch(() => {
      // 靜默失敗：維持佔位框，不影響頁面其他部分。
    });
})();

/* 頂部漢堡選單開合：點漢堡鈕切換選單面板／背景遮罩；點遮罩也能關閉
   （點選單本身的連結不用特別處理，點下去就直接離開頁面了）。 */
(function () {
  const toggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("site-menu");
  const backdrop = document.getElementById("site-menu-backdrop");
  if (!toggle || !menu) return;

  function openMenu() {
    menu.classList.add("is-open");
    if (backdrop) backdrop.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    menu.classList.remove("is-open");
    if (backdrop) backdrop.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.contains("is-open");
    if (isOpen) closeMenu();
    else openMenu();
  });

  if (backdrop) backdrop.addEventListener("click", closeMenu);
})();
