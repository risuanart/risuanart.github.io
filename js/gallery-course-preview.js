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

    const matched = items
      .filter((item) => item.course === course)
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
      moreLink.href = base + "gallery.html?course=" + encodeURIComponent(course);
    }

    if (!grid) return;
    grid.hidden = false;
    grid.innerHTML = matched
      .map(
        (item) => `
      <figure class="gallery-grid__item">
        <img src="${base}${item.src}" alt="${item.alt || ""}" loading="lazy">
      </figure>`
      )
      .join("");
  });
})();
