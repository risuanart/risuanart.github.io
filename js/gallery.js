// 學員作品集：讀 js/gallery-data.js 的 GALLERY_ITEMS，依篩選狀態重新算出
// 要顯示哪些格子。課程是單選（跟 .pill-nav 那種分類列同一個邏輯，一次只
// 能選一個），主題是複選（可以同時勾好幾個標籤，符合「同一個主題底下
// 想同時看好幾種材料的版本」這個需求）。
//
// 2026-09-18 改版：主題按鈕改成「跟著選中的課程動態變化」，不再是固定
// 顯示全部主題——使用者指出像串珠完全用不到任何主題，主題清單只會越
// 加越長、大多數對目前選的課程根本不相關，點了保證是空的。改成切課程
// 時只列出「這堂課的作品裡實際出現過的主題」（選「全部」時才顯示完整
// 清單），同時把已勾選的主題全部清空重新開始——原本考慮「只清掉新課程
// 底下不存在的主題、保留還適用的」，但使用者提出客人不會特別注意到
// 「切課程後有些主題被留著」這種局部保留的狀態，全部清空最單純、最不
// 會讓人困惑，介面上永遠只看得到「跟現在這堂課有關、而且乾淨重新開始」
// 的主題列。因為主題按鈕現在會被整批重新產生，改用事件代理（監聽整個
// 容器的 click，不是幫每顆按鈕各自掛監聽器），不用在每次重新產生按鈕
// 後重新綁定。
(function () {
  const grid = document.getElementById("gallery-grid");
  const emptyState = document.getElementById("gallery-empty");
  const courseFilterGroup = document.getElementById("gallery-course-filters");
  const themeFilterGroup = document.getElementById("gallery-theme-filters");
  if (!grid) return;

  const items = window.GALLERY_ITEMS || [];

  // 課程按鈕從 GALLERY_COURSES（見 js/gallery-data.js）動態產生，不是
  // 寫死在 HTML 裡——這樣以後加新課程，這裡的篩選鈕會自動跟著出現。
  // 「全部」按鈕是特殊項目（不對應任何課程），維持寫在 gallery.html 裡，
  // 這裡只補課程清單後面的按鈕。主題按鈕改成 renderThemeButtons() 依
  // 目前選的課程動態產生，不在這裡一次生成全部。
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

  const courseButtons = document.querySelectorAll("[data-gallery-course]");

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

  // 選「全部」時顯示完整主題清單（跨課程瀏覽本來就需要看到所有主題）；
  // 選特定課程時，只列出這堂課的作品裡實際用過的主題，順序仍照
  // GALLERY_THEMES 原本的順序排（不是照資料出現順序），同一個主題不管
  // 在哪堂課底下出現，排列位置都一致，不會切課程時順序跳來跳去。
  function themesForCourse(course) {
    const all = window.GALLERY_THEMES || [];
    if (course === "all") return all;
    const used = new Set();
    items.forEach((item) => {
      if (item.course === course) (item.themes || []).forEach((t) => used.add(t));
    });
    return all.filter((t) => used.has(t));
  }

  function renderThemeButtons() {
    if (!themeFilterGroup) return;
    themeFilterGroup.innerHTML = "";
    themesForCourse(activeCourse).forEach((theme) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gallery-filters__chip" + (activeThemes.has(theme) ? " is-active" : "");
      btn.setAttribute("data-gallery-theme", theme);
      btn.textContent = theme;
      themeFilterGroup.appendChild(btn);
    });
  }

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
      // 換課程等於換了一組完全不同的主題可能性，已勾選的主題整批清空
      // 重新開始——不局部保留「新課程底下也還適用」的主題，理由見檔頭
      // 說明：局部保留客人不會注意到，全部清空最單純不會讓人困惑。
      activeThemes.clear();
      renderThemeButtons();
      render();
    });
  });

  if (themeFilterGroup) {
    themeFilterGroup.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-gallery-theme]");
      if (!btn) return;
      const theme = btn.getAttribute("data-gallery-theme");
      if (activeThemes.has(theme)) {
        activeThemes.delete(theme);
        btn.classList.remove("is-active");
      } else {
        if (EXCLUSIVE_THEME_GROUP.includes(theme)) {
          EXCLUSIVE_THEME_GROUP.forEach((t) => activeThemes.delete(t));
          themeFilterGroup.querySelectorAll("[data-gallery-theme]").forEach((b) => {
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
  }

  if (urlCourse && Array.from(courseButtons).some((b) => b.getAttribute("data-gallery-course") === urlCourse)) {
    activeCourse = urlCourse;
    courseButtons.forEach((b) => {
      b.classList.toggle("is-active", b.getAttribute("data-gallery-course") === urlCourse);
    });
  }

  renderThemeButtons();
  render();
})();
