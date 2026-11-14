/* 輪播已移至共用hero-slideshow.js，首頁及材料包預覽共用。 */


/* Follow Us / Instagram：打 risuan-checkout 後端新增的 /api/instagram-posts，
   把 8 個「貼文待補」佔位框換成真的貼文縮圖。後端還沒設定 Instagram 相關
   環境變數、或這次 fetch 失敗（網路問題／API 額度等）時，回傳的 posts 會是
   空陣列或整個 fetch 失敗——兩種情況都直接維持原本的佔位框，不拿掉、不報錯
   給訪客看，首頁其他部分完全不受影響。

   2026-10-22 使用者反映全站載入偏慢，實測發現 post.imageUrl 是 Instagram
   CDN 的全解析度原圖（單張 900KB～3.5MB，8 張疊起來佔首頁重量快 11MB），
   但這裡的格子只有約 270px 見方（見 css/home-shop.css .preview-follow__
   grid 的欄寬換算）。改用 images.weserv.nl 這個公開、免費、不用申請
   金鑰的圖片代理服務，在圖片抓到我們這裡之前先在它的伺服器上縮小＋轉
   webp 再送過來，瀏覽器只下載縮小後的版本，不用動 risuan-checkout 後端
   （Instagram Graph API 的 media_url 本來就沒有內建縮圖尺寸參數可以選）。
   w=600 是抓「電腦 4 欄、retina 2x」情境下的實際需要寬度（270px × 2），
   比這個更小的螢幕/欄數一樣夠用。 */
(function () {
  const grid = document.querySelector(".preview-follow__grid");
  if (!grid) return;

  const API_BASE = "https://risuan-checkout.vercel.app";

  function resizedThumbUrl(originalUrl) {
    return `https://images.weserv.nl/?url=${encodeURIComponent(originalUrl.replace(/^https?:\/\//, ""))}&w=600&q=75&output=webp`;
  }

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
        img.src = resizedThumbUrl(post.imageUrl);
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

  // 2026-10-30 上架前待修清單任務 6：「課程」accordion 開合，邏輯跟
  // js/site-menu.js 子頁那份同名區塊一致（index.html 維持獨立一份，
  // 理由見 index.html #site-menu 區塊的註解）。
  const courseToggle = menu.querySelector(".site-menu__group-toggle");
  const courseGroup = menu.querySelector(".site-menu__group");
  if (courseToggle && courseGroup) {
    courseToggle.addEventListener("click", () => {
      const isOpen = courseGroup.classList.toggle("is-open");
      courseToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }
})();

/* 桌面文字導覽列的「課程」下拉，邏輯跟上面漢堡選單抽屜同一套模式，只是
   換成單一下拉區塊。
   2026-09-19 改成滑鼠移過去就展開（hover），理由跟 js/site-menu.js 那份
   同名 IIFE 完全一致（見該處說明——比對 panacea-q.com 的 SHOP 下拉選單
   後要求跟進；保留 click 給鍵盤 Enter 用；mouseleave 延遲 150ms 才關閉，
   給滑鼠從按鈕移到下拉選單本身的移動時間），兩邊要同步改才不會全站
   行為不一致。 */
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

  // 理由同 js/site-menu.js 那份同名 IIFE：click 一定被 mouseenter 搶先
  // 觸發過 open()，寫成 toggle 會讓滑鼠使用者每次點擊都立刻關掉剛打開的
  // 選單，改成單純呼叫 open()，click 只是給鍵盤 Enter 用。
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
