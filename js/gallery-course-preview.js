













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

      moreLink.href = base + "gallery/?course=" + encodeURIComponent(course);
    }

    if (!grid) return;
    grid.hidden = false;




    grid.innerHTML = matched
      .map(
        (item) => `
      <figure class="gallery-grid__item" tabindex="0" role="button" aria-label="放大看：${item.alt || course}">
        <img src="${base}${item.thumb || item.src}" data-full-src="${base}${item.src}" alt="${item.alt || ""}" loading="lazy" decoding="async">
        <figcaption class="gallery-grid__caption">${course}${
          item.themes && item.themes.length ? "・" + item.themes.join("、") : ""
        }${item.sessions && course !== "大幅畫布訂製" ? "・" + (item.sessions === 1 ? "一堂完成" : item.sessions + "堂完成") : ""}</figcaption>
      </figure>`
      )
      .join("");
  });
})();
