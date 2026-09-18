// 學員作品集：讀 js/gallery-data.js 的 GALLERY_ITEMS，依篩選狀態重新算出
// 要顯示哪些格子。課程是單選（跟 .pill-nav 那種分類列同一個邏輯，一次只
// 能選一個），主題是複選（可以同時勾好幾個標籤，符合「同一個主題底下
// 想同時看好幾種材料的版本」這個需求）。
(function () {
  const grid = document.getElementById("gallery-grid");
  const emptyState = document.getElementById("gallery-empty");
  const courseFilterGroup = document.getElementById("gallery-course-filters");
  const themeFilterGroup = document.getElementById("gallery-theme-filters");
  if (!grid) return;

  const items = window.GALLERY_ITEMS || [];

  // 課程／主題按鈕從 GALLERY_COURSES／GALLERY_THEMES（見 js/gallery-data.js）
  // 動態產生，不是寫死在 HTML 裡——這樣以後在 gallery-data.js 加新課程
  // 或新主題，這裡的篩選鈕會自動跟著出現，不用回來改兩個地方、也不會
  // 再發生「加了新主題，篩選鈕卻忘記同步」的問題。「全部」按鈕是特殊
  // 項目（不對應任何課程），維持寫在 gallery.html 裡，這裡只補課程清單
  // 後面的按鈕。
  if (courseFilterGroup) {
    (window.GALLERY_COURSES || []).forEach((course) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gallery-filters__chip";
      btn.setAttribute("data-gallery-course", course);
      btn.textContent = course;
      courseFilterGroup.appendChild(btn);
    });
  }

  if (themeFilterGroup) {
    (window.GALLERY_THEMES || []).forEach((theme) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gallery-filters__chip";
      btn.setAttribute("data-gallery-theme", theme);
      btn.textContent = theme;
      themeFilterGroup.appendChild(btn);
    });
  }

  const courseButtons = document.querySelectorAll("[data-gallery-course]");
  const themeButtons = document.querySelectorAll("[data-gallery-theme]");

  // 課程頁「查看更多這堂課的作品」連結會帶 ?course=課程名稱 過來（見
  // js/gallery-course-preview.js），這裡讀網址參數決定進頁面時要先選
  // 哪個課程篩選鈕，沒有帶參數（或參數對不到任何按鈕）就維持預設的
  // 「全部」，不影響原本直接打開 gallery.html 的行為。
  const urlCourse = new URLSearchParams(window.location.search).get("course");

  let activeCourse = "all";
  const activeThemes = new Set();

  // 「狗狗／貓咪／兩隻以上」這三個標籤語意上互斥——一件作品不可能同時
  // 是「只有一隻狗」又是「兩隻以上」，跟山／海邊那種本來就可以同時成立
  // 的跨主題標籤不一樣（複選 OR 邏輯是為那種情境設計的）。如果直接沿用
  // 一般複選邏輯，會讓人誤以為「只點兩隻以上」結果卻看到單隻狗的作品
  // （其實是因為狗狗那個標籤也還勾著）——2026-09-18 使用者實際點過遇到
  // 這個狀況。這裡讓這三者彼此排他：選了其中一個會自動取消另外兩個，
  // 其餘標籤（山、海邊等）不受影響，還是正常的多選。
  const EXCLUSIVE_THEME_GROUP = ["狗狗", "貓咪", "兩隻以上"];

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
      grid.innerHTML = ""; // 清掉舊的格子，不留著隱藏的過期內容
      if (emptyState) {
        emptyState.hidden = false;
        emptyState.textContent = "這個篩選條件目前還沒有符合的作品，換個標籤看看。";
      }
      return;
    }

    grid.hidden = false;
    if (emptyState) emptyState.hidden = true;

    const courseLinks = window.GALLERY_COURSE_LINKS || {};

    grid.innerHTML = visible
      .map((item) => {
        const courseLink = courseLinks[item.course];
        const linkAttr = courseLink ? ` data-course-link="${courseLink}" data-course-name="${item.course}"` : "";
        return `
      <figure class="gallery-grid__item" tabindex="0" role="button" aria-label="放大看：${item.alt || item.course}"${linkAttr}>
        <img src="${item.src}" alt="${item.alt || ""}" loading="lazy">
        <figcaption class="gallery-grid__caption">${item.course}${
          item.themes && item.themes.length ? "・" + item.themes.join("、") : ""
        }${item.sessions ? "・" + (item.sessions === 1 ? "一堂完成" : item.sessions + "堂完成") : ""}</figcaption>
      </figure>`;
      })
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
        if (EXCLUSIVE_THEME_GROUP.includes(theme)) {
          EXCLUSIVE_THEME_GROUP.forEach((t) => activeThemes.delete(t));
          themeButtons.forEach((b) => {
            if (EXCLUSIVE_THEME_GROUP.includes(b.getAttribute("data-gallery-theme"))) {
              b.classList.remove("is-active");
            }
          });
        }
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
