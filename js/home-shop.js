

















(function () {
  const grid = document.getElementById("preview-follow-grid");
  const section = grid ? grid.closest(".preview-follow") : null;
  if (!grid) return;

  const API_BASE = "https://risuan-checkout.vercel.app";

  function resizedThumbUrl(originalUrl) {
    return `https://images.weserv.nl/?url=${encodeURIComponent(originalUrl.replace(/^https?:\/\//, ""))}&w=600&q=75&output=webp`;
  }

  function collapseToFollowButton() {
    if (section) section.classList.add("preview-follow--collapsed");
  }

  fetch(`${API_BASE}/api/instagram-posts?limit=8`)
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
    .then((data) => {
      const posts = Array.isArray(data.posts) ? data.posts : [];
      if (!posts.length) { collapseToFollowButton(); return; }

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
        img.src = resizedThumbUrl(post.imageUrl);
        img.alt = "";
        img.loading = "lazy";
        img.addEventListener("error", () => { img.src = post.imageUrl; }, { once: true });
        link.appendChild(img);
        placeholder.replaceWith(link);
      });
    })
    .catch(() => {
      collapseToFollowButton();
    });
})();



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




  const courseToggle = menu.querySelector(".site-menu__group-toggle");
  const courseGroup = menu.querySelector(".site-menu__group");
  if (courseToggle && courseGroup) {
    courseToggle.addEventListener("click", () => {
      const isOpen = courseGroup.classList.toggle("is-open");
      courseToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }
})();








(function () {
  const item = document.querySelector(".site-header__nav-item");
  const toggle = document.getElementById("nav-courses-toggle");
  if (!item || !toggle) return;

  let closeTimer = null;

  function open() {
    clearTimeout(closeTimer);
    item.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
  }

  function close() {
    item.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  function scheduleClose() {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(close, 150);
  }

  item.addEventListener("mouseenter", open);
  item.addEventListener("mouseleave", scheduleClose);




  // 2026-11-20：跟 js/site-menu.js 同一處修正（這裡是首頁專用的重複
  // 邏輯，首頁沒有載入 site-menu.js），理由同樣說明見該檔案——選單已
  // 展開時再點一次「課程」直接導去 courses/ 總覽頁。首頁本身就在網站
  // 根目錄，不需要 data-menu-base 那層相對路徑換算。
  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    if (item.classList.contains("is-open")) {
      window.location.href = "courses/";
      return;
    }
    open();
  });

  document.addEventListener("click", (event) => {
    if (!item.contains(event.target)) close();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
})();
