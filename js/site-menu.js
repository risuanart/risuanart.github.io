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
  // 2026-09-20：全站改成乾淨網址（不帶 .html），連結目標從「檔案」
  // 改成「資料夾」，所以這裡的 .html 全部拿掉、後面補上 /。${base} 本身
  // 不用改，還是同一組「往回幾層到根目錄」的相對路徑前綴。
  menu.innerHTML = `
    <a href="${base}">首頁</a>
    <a href="${base}products/shop/">商品總覽</a>
    <a href="${base}products/">材料包</a>
    <div class="site-menu__group">
      <p class="site-menu__group-title">課程</p>
      <ul class="site-menu__sublist">
        <li><a class="site-menu__sublink" href="${base}courses/sand-texture/">石英砂肌理畫</a></li>
        <li><a class="site-menu__sublink" href="${base}courses/palette-knife-oil/">刮刀油畫</a></li>
        <li><a class="site-menu__sublink" href="${base}courses/fluid-art/">流動畫</a></li>
        <li>抽象畫</li>
        <li><a class="site-menu__sublink" href="${base}courses/custom-photo-oil/">自己帶圖創作</a></li>
        <li><a class="site-menu__sublink" href="${base}courses/pet-portrait/">寵物油畫</a></li>
        <li>鏡子拼貼</li>
        <li><a class="site-menu__sublink" href="${base}courses/beading/">串珠</a></li>
        <li><a class="site-menu__sublink" href="${base}courses/large-canvas/">大幅畫布訂製</a></li>
        <li><a class="site-menu__sublink" href="${base}courses/custom-material/">特殊材質客製</a></li>
      </ul>
      <a class="site-menu__sublink" href="${base}faq/">預約須知</a>
    </div>
    <a href="${base}guides/">材料指南</a>
    <a href="${base}gallery/">學員作品</a>
    <a href="${base}enterprise/">團體／企業課程</a>
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

// 桌面文字導覽列（≥1024px）的「課程」下拉：2026-09-18 新增，邏輯照抄
// js/home-shop.js 首頁那份同名 IIFE。獨立成自己的 IIFE（不是塞進上面
// 漢堡選單那個），因為兩者是各自獨立的開關狀態，混在一起容易誤觸發。
//
// 2026-09-19 改成滑鼠移過去就展開（hover），不再只能點擊——使用者比對
// panacea-q.com 的 SHOP 下拉選單後要求跟進同一種互動方式。保留 click
// 邏輯不拿掉：鍵盤使用者 tab 到按鈕按 Enter 會觸發 click（他們的滑鼠
// 沒有真的「移過去」），拿掉 click 會讓鍵盤操作完全打不開這個選單。
// mouseleave 延遲 150ms 才真的關閉，不是滑鼠一離開按鈕就立刻收合——
// 滑鼠從「課程」文字移到下拉選單本身之間有一小段垂直距離，沒有延遲的話
// 移動過程中滑鼠會短暫離開兩者的 hit area，選單會在使用者還沒到達
// 下拉內容之前就先關掉，跟 js/home-shop.js 同一份邏輯保持一致。
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

  // 滑鼠點擊一定會先觸發 mouseenter（游標移到按鈕上才點得到），所以到這裡
  // is-open 幾乎都已經被上面的 open() 設成 true 了——如果還寫「反轉目前
  // 狀態」的 toggle 邏輯，滑鼠使用者每次點擊都會立刻把剛因為 hover 打開的
  // 選單關掉。這裡改成單純呼叫 open()（本來就開著也沒差），click 存在的
  // 意義只剩鍵盤使用者 tab 過來按 Enter（沒有滑鼠移入，不會被 hover 搶先
  // 打開），關閉一律交給 Esc／點外面／滑鼠移開。
  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    open();
  });

  document.addEventListener("click", (event) => {
    if (!item.contains(event.target)) close();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
})();
