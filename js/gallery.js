// 學員作品集：讀 js/gallery-data.js 的 GALLERY_ITEMS，依篩選狀態重新算出
// 要顯示哪些格子。課程是單選（跟 .pill-nav 那種分類列同一個邏輯，一次只
// 能選一個），主題是複選（可以同時勾好幾個標籤，符合「同一個主題底下
// 想同時看好幾種材料的版本」這個需求）。
(function () {
  const grid = document.getElementById("gallery-grid");
  const emptyState = document.getElementById("gallery-empty");
  const courseButtons = document.querySelectorAll("[data-gallery-course]");
  const themeButtons = document.querySelectorAll("[data-gallery-theme]");
  if (!grid) return;

  const items = window.GALLERY_ITEMS || [];

  // 課程頁「查看更多這堂課的作品」連結會帶 ?course=課程名稱 過來（見
  // js/gallery-course-preview.js），這裡讀網址參數決定進頁面時要先選
  // 哪個課程篩選鈕，沒有帶參數（或參數對不到任何按鈕）就維持預設的
  // 「全部」，不影響原本直接打開 gallery.html 的行為。
  const urlCourse = new URLSearchParams(window.location.search).get("course");

  let activeCourse = "all";
  const activeThemes = new Set();

  function matches(item) {
    if (activeCourse !== "all" && item.course !== activeCourse) return false;
    if (activeThemes.size > 0) {
      const itemThemes = item.themes || [];
      const hasAny = itemThemes.some((t) => activeThemes.has(t));
      if (!hasAny) return false;
    }
    return true;
  }

  function render() {
    const visible = items.filter(matches);

    if (items.length === 0) {
      grid.hidden = true;
      if (emptyState) {
        emptyState.hidden = false;
        emptyState.textContent = "學員作品陸續整理中，敬請期待。";
      }
      return;
    }

    if (visible.length === 0) {
      grid.hidden = true;
      if (emptyState) {
        emptyState.hidden = false;
        emptyState.textContent = "這個篩選條件目前還沒有符合的作品，換個標籤看看。";
      }
      return;
    }

    grid.hidden = false;
    if (emptyState) emptyState.hidden = true;

    grid.innerHTML = visible
      .map(
        (item) => `
      <figure class="gallery-grid__item">
        <img src="${item.src}" alt="${item.alt || ""}" loading="lazy">
        <figcaption class="gallery-grid__caption">${item.course}${
          item.themes && item.themes.length ? "・" + item.themes.join("、") : ""
        }</figcaption>
      </figure>`
      )
      .join("");
  }

  courseButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCourse = btn.getAttribute("data-gallery-course");
      courseButtons.forEach((b) => b.classList.toggle("is-active", b === btn));
      render();
    });
  });

  themeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const theme = btn.getAttribute("data-gallery-theme");
      if (activeThemes.has(theme)) {
        activeThemes.delete(theme);
        btn.classList.remove("is-active");
      } else {
        activeThemes.add(theme);
        btn.classList.add("is-active");
      }
      render();
    });
  });

  if (urlCourse && Array.from(courseButtons).some((b) => b.getAttribute("data-gallery-course") === urlCourse)) {
    activeCourse = urlCourse;
    courseButtons.forEach((b) => {
      b.classList.toggle("is-active", b.getAttribute("data-gallery-course") === urlCourse);
    });
  }

  render();
})();
