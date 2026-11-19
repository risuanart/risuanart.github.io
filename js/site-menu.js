













(function () {
  const toggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("site-menu");
  const backdrop = document.getElementById("site-menu-backdrop");
  if (!toggle || !menu) return;

  const base = menu.getAttribute("data-menu-base") || "";

















  menu.innerHTML = `
      <a href="${base}booking/">線上預約課程</a>
      <div class="site-menu__group">
      <button type="button" class="site-menu__group-toggle" aria-expanded="false" aria-controls="site-menu-course-panel">
        <span>課程</span>
        <svg class="site-menu__group-chevron" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div class="site-menu__group-panel" id="site-menu-course-panel">
        <div class="site-menu__group-panel-inner">
          <ul class="site-menu__sublist">
            <li><a class="site-menu__sublink" href="${base}courses/">全部課程</a></li>
            <li><a class="site-menu__sublink" href="${base}courses/custom-photo-oil/">自選主題油畫</a></li>
            <li><a class="site-menu__sublink" href="${base}courses/palette-knife-oil/">刮刀油畫</a></li>
            <li><a class="site-menu__sublink" href="${base}courses/sand-texture/">石英砂肌理畫</a></li>
            <li><a class="site-menu__sublink" href="${base}courses/pet-portrait/">寵物油畫</a></li>
            <li><a class="site-menu__sublink" href="${base}courses/gold-leaf-abstract/">金箔抽象畫</a></li>
            <li><a class="site-menu__sublink" href="${base}courses/fluid-art/">流動畫</a></li>
            <li><a class="site-menu__sublink" href="${base}courses/large-canvas/">大幅畫布訂製</a></li>
            <li><a class="site-menu__sublink" href="${base}courses/custom-material/">特殊材質客製</a></li>
            <li><a class="site-menu__sublink" href="${base}courses/beading/">串珠</a></li>
          </ul>
        </div>
      </div>
    </div>
      <a href="${base}products/">材料包</a>
      <a href="${base}faq/">預約須知</a>
      <a href="${base}enterprise/">團體／企業課程</a>
      <a href="${base}gallery/">學員作品</a>
      <a href="${base}guides/">材料指南</a>
      <a href="${base}products/shop/">SHOP</a>
      `;

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

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });




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







  // 2026-11-20 使用者反映桌機版點「課程」只會開合選單、沒辦法直接點
  // 進繪畫課程總覽頁——滑鼠移過去（mouseenter）本來就會先展開選單，
  // 所以滑鼠使用者點下「課程」文字時，選單通常已經是展開狀態，直接
  // 導去 courses/ 總覽頁，符合「點選單標籤本身＝去這個分類的總覽頁」
  // 的常見慣例；觸控／鍵盤等不會觸發 hover 的使用者，第一次點只會
  // 展開選單（跟原本行為一致），選單已經展開時再點第二次才會導航，
  // 不會一碰到就跳頁、看不到選單內容。href 用 data-menu-base（跟
  // site-menu.js 其他地方組 mobile 選單連結同一個屬性）組出正確的
  // 相對路徑，不同深度的頁面（首頁／courses/／products/xxx/）都適用。 */
  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    if (item.classList.contains("is-open")) {
      const siteMenu = document.getElementById("site-menu");
      const menuBase = siteMenu ? siteMenu.getAttribute("data-menu-base") || "" : "";
      window.location.href = menuBase + "courses/";
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
