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
//
// 2026-09-18 再改版：曾經讓「狗狗／貓咪／兩隻以上」三個標籤彼此排他
// （選一個自動取消另外兩個），但使用者後來明確要求相反的行為——瀏覽
// 「貓咪」時，有貓的兩隻合照也要一起出現；瀏覽「狗狗」也一樣；有貓有狗
// 的合照兩邊都要出現。所以拿掉了排他邏輯，資料面在 js/gallery-data.js
// 把「兩隻以上」的每一筆同時疊上對應的「狗狗」／「貓咪」標籤。
//
// 2026-09-18 又再改版：如果這三個標籤跟其他主題一樣走單純複選 OR，會
// 出現使用者實測到的怪狀況——同時勾「貓咪」＋「兩隻以上」，OR 邏輯下
// 只要符合其中一個標籤就顯示，結果只有兩隻狗、沒有貓的作品也會跑出來
// （因為它符合「兩隻以上」）。但「狗狗／貓咪」是「哪個物種」，
// 「兩隻以上」是「幾隻」，這兩者其實是不同維度，使用者同時勾選時期待
// 的是「兩隻以上的貓」這種交集縮小範圍，不是「貓的作品 OR 兩隻以上的
// 作品」這種聯集擴大範圍。所以把這三個標籤獨立出一組，組內用 AND（勾了
// 幾個就要同時符合幾個），其餘主題標籤（山、海邊等）維持原本的 OR，兩組
// 之間再用 AND 合併——大多數情境下不會同時跨兩組選，但邏輯上這樣合併
// 最合理。
(function () {
  const grid = document.getElementById("gallery-grid");
  const emptyState = document.getElementById("gallery-empty");
  const courseFilterGroup = document.getElementById("gallery-course-filters");
  const themeFilterGroup = document.getElementById("gallery-theme-filters");
  if (!grid) return;

  const items = window.GALLERY_ITEMS || [];

  const SPECIES_COUNT_THEMES = ["狗狗", "貓咪", "兩隻以上"];

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
    if (activeThemes.size === 0) return true;

    const itemThemes = item.themes || [];

    // 「狗狗／貓咪／兩隻以上」這組是 AND：勾了幾個這組裡的標籤，作品就
    // 要同時具備幾個，例如勾「貓咪」＋「兩隻以上」要顯示「兩隻以上的
    // 貓」，不是「貓的作品」跟「兩隻以上的作品」的聯集（見檔頭說明）。
    const activeSpeciesCount = SPECIES_COUNT_THEMES.filter((t) => activeThemes.has(t));
    if (activeSpeciesCount.length > 0) {
      const matchesAll = activeSpeciesCount.every((t) => itemThemes.includes(t));
      if (!matchesAll) return false;
    }

    // 其餘主題（山、海邊等）維持原本的複選 OR：勾了任一個就算符合。
    const activeOther = Array.from(activeThemes).filter((t) => !SPECIES_COUNT_THEMES.includes(t));
    if (activeOther.length > 0) {
      const hasAny = itemThemes.some((t) => activeOther.includes(t));
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
