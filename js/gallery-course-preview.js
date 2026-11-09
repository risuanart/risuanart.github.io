// 課程頁「學員作品」預覽區：跟 gallery.html 共用同一份資料（見
// js/gallery-data.js 的 GALLERY_ITEMS），不用每個課程頁另外維護一份
// 作品清單。抓該課程底下 date 最新的幾筆（預設 4 筆），照片到位、加進
// GALLERY_ITEMS 就會自動出現在對應課程頁，不用回來改課程頁的 HTML。
//
// 用法（見 courses/beading.html／courses/sand-texture.html）：
// <div data-gallery-course-preview="石英砂肌理畫" data-gallery-preview-base="../">
//   <div class="gallery-grid" data-gallery-preview-grid></div>
//   <p class="gallery-empty" data-gallery-preview-empty hidden>學員作品陸續整理中，敬請期待。</p>
//   <a data-gallery-preview-more hidden>查看更多這堂課的作品 →</a>
// </div>
// data-gallery-preview-base 是連回站根目錄的相對路徑前綴（課程頁在
// courses/ 底下，要補 "../" 才能連到根目錄的 gallery.html／assets/），
// 沒有填就當作頁面本身在根目錄，不補前綴。
(function () {
  const containers = document.querySelectorAll("[data-gallery-course-preview]");
  if (!containers.length) return;

  const items = window.GALLERY_ITEMS || [];

  containers.forEach((container) => {
    const course = container.getAttribute("data-gallery-course-preview");
    const limit = parseInt(container.getAttribute("data-gallery-preview-limit"), 10) || 4;
    const base = container.getAttribute("data-gallery-preview-base") || "";
    const grid = container.querySelector("[data-gallery-preview-grid]");
    const emptyState = container.querySelector("[data-gallery-preview-empty]");
    const moreLink = container.querySelector("[data-gallery-preview-more]");

    // 2026-11-08：「大幅畫布訂製」等課程不再另外複製一筆重複圖片資料，
    // 改成在原本課程那筆疊加 extraCourses，這裡篩選時要一併檢查。
    const matched = items
      .filter((item) => item.course === course || (item.extraCourses || []).includes(course))
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .slice(0, limit);

    if (matched.length === 0) {
      if (grid) grid.hidden = true;
      if (emptyState) emptyState.hidden = false;
      if (moreLink) moreLink.hidden = true;
      return;
    }

    if (emptyState) emptyState.hidden = true;

    if (moreLink) {
      moreLink.hidden = false;
      // 2026-09-20：全站改乾淨網址，gallery.html 變成 gallery/。
      moreLink.href = base + "gallery/?course=" + encodeURIComponent(course);
    }

    if (!grid) return;
    grid.hidden = false;
    // 2026-11-08 使用者反映這裡放大看作品時沒有主題／完成堂數資訊，
    // gallery.html 那邊點放大卻有——跟 js/gallery.js 補 figcaption
    // 用同一套格式（課程・主題・堂數），這裡本來就是同一堂課底下的
    // 預覽，不用再加「查看課程」連結（連回自己沒有意義）。
    grid.innerHTML = matched
      .map(
        (item) => `
      <figure class="gallery-grid__item" tabindex="0" role="button" aria-label="放大看：${item.alt || course}">
        <img src="${base}${item.src}" alt="${item.alt || ""}" loading="lazy">
        <figcaption class="gallery-grid__caption">${course}${
          item.themes && item.themes.length ? "・" + item.themes.join("、") : ""
        }${item.sessions && course !== "大幅畫布訂製" ? "・" + (item.sessions === 1 ? "一堂完成" : item.sessions + "堂完成") : ""}</figcaption>
      </figure>`
      )
      .join("");
  });
})();
