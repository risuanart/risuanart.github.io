// 全站左上角漢堡選單（目錄）：點開跳出全站導覽抽屜。
// 2026-09-13 使用者要求「全站左上角統一改成目錄點擊」：原本這組行為
// 只有 index.html 有（見 js/home-shop.js），其餘子頁左上角是「回首頁」
// 的 logo 連結。這支腳本給子頁引用（index.html 維持用自己原本
// home-shop.js 那份，不套用這支，避免影響已經調好的首頁版面／桌面版
// 文字導覽列）。
//
// 選單內容集中寫在這支檔案裡（跟 js/gallery-data.js 把 GALLERY_COURSES
// 集中一份是同樣的理由）：這份清單要嘛只存在 index.html 一份、子頁完全
// 沒有，要嘛得複製貼上到 28 個檔案，以後加新課程頁得記得同步 28 份，
// 非常容易漏掉（跟先前 gallery.html 篩選鈕忘記同步新主題／新課程是
// 同一種問題，見 js/gallery.js 的說明）。子頁的 <nav id="site-menu"> 留空、
// 用 data-menu-base 屬性表示連回根目錄要補幾層 "../"（根目錄頁面不用寫
// 這個屬性），實際選單內容由這支腳本注入。
(function () {
  const toggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("site-menu");
  const backdrop = document.getElementById("site-menu-backdrop");
  if (!toggle || !menu) return;

  const base = menu.getAttribute("data-menu-base") || "";

  // 內容跟 index.html 的 #site-menu 完全一致（課程子清單、排序、哪些
  // 已經有獨立頁面），只是路徑加上 base 前綴。之後 index.html 也要跟著
  // 手動同步一次是目前唯一還沒解決的重複——首頁的漢堡選單維持獨立一份
  // 是刻意的（避免牽動已經調好的首頁邏輯），但這代表往後新增/調整課程
  // 清單時，記得 index.html 的 #site-menu 跟這裡兩處都要改。
  menu.innerHTML = `
    <a href="${base}index.html">首頁</a>
    <a href="${base}products/shop.html">商品總覽</a>
    <a href="${base}products/index.html">材料包</a>
    <div class="site-menu__group">
      <p class="site-menu__group-title">課程</p>
      <ul class="site-menu__sublist">
        <li><a class="site-menu__sublink" href="${base}courses/sand-texture.html">石英砂肌理畫</a></li>
        <li><a class="site-menu__sublink" href="${base}courses/palette-knife-oil.html">刮刀油畫</a></li>
        <li><a class="site-menu__sublink" href="${base}courses/fluid-art.html">流動畫</a></li>
        <li>抽象畫</li>
        <li><a class="site-menu__sublink" href="${base}courses/custom-photo-oil.html">自己帶圖創作</a></li>
        <li><a class="site-menu__sublink" href="${base}courses/pet-portrait.html">寵物油畫</a></li>
        <li>鏡子拼貼</li>
        <li><a class="site-menu__sublink" href="${base}courses/beading.html">串珠</a></li>
        <li><a class="site-menu__sublink" href="${base}courses/large-canvas.html">大幅畫布訂製</a></li>
        <li><a class="site-menu__sublink" href="${base}courses/custom-material.html">特殊材質客製</a></li>
      </ul>
      <a class="site-menu__sublink" href="${base}faq.html">預約須知</a>
    </div>
    <a href="${base}guides/index.html">材料指南</a>
    <a href="${base}gallery.html">學員作品</a>
    <a href="${base}enterprise.html">團體／企業課程</a>
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
})();
