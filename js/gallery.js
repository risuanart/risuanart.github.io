
































(function () {
  const grid = document.getElementById("gallery-grid");
  const emptyState = document.getElementById("gallery-empty");
  const courseFilterGroup = document.getElementById("gallery-course-filters");
  const themeFilterGroup = document.getElementById("gallery-theme-filters");
  const sessionFilter = document.getElementById("gallery-session-filter");
  const sessionFilterGroup = document.getElementById("gallery-session-filter-group");
  const themeLabel = document.getElementById("gallery-theme-label");
  const clearFilters = document.getElementById("gallery-clear-filters");
  const resultsCount = document.getElementById("gallery-results-count");
  const filterPreview = new URLSearchParams(window.location.search).get("preview") === "filter-groups-v1";

  if (filterPreview) {
    if (sessionFilterGroup) sessionFilterGroup.hidden = false;
    if (themeLabel) themeLabel.textContent = "作品主題・可複選";
  }
  if (!grid) return;

  const items = window.GALLERY_ITEMS || [];

  const SPECIES_COUNT_THEMES = ["狗狗", "貓咪", "兩隻以上"];








  if (courseFilterGroup) {
    (window.GALLERY_COURSES || []).forEach((course) => {
      if (course === "鏡子拼貼") return;
      const option = document.createElement("option");
      option.value = course;
      option.textContent = course;
      courseFilterGroup.appendChild(option);
    });
  }





  const urlCourse = new URLSearchParams(window.location.search).get("course");

  let activeCourse = "all";
  const activeThemes = new Set();
  let onlyOneSession = false;





  function themesForCourse(course) {
    const all = window.GALLERY_THEMES || [];
    if (course === "all") return all;
    const used = new Set();
    items.forEach((item) => {
      if (item.course === course || (item.extraCourses || []).includes(course)) {
        (item.themes || []).forEach((t) => used.add(t));
      }
    });
    return all.filter((t) => used.has(t));
  }



  function renderThemeButtons() {
    if (!themeFilterGroup) return;
    themeFilterGroup.innerHTML = "";
    const themes = themesForCourse(activeCourse);
    themes.forEach((theme) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gallery-filters__chip" + (activeThemes.has(theme) ? " is-active" : "");
      btn.setAttribute("data-gallery-theme", theme);
      btn.textContent = theme;
      themeFilterGroup.appendChild(btn);
    });
  }






  function itemMatchesCourse(item, course) {
    return item.course === course || (item.extraCourses || []).includes(course);
  }

  function matches(item) {
    if (activeCourse !== "all" && !itemMatchesCourse(item, activeCourse)) return false;
    if (onlyOneSession && item.sessions !== 1) return false;
    if (activeThemes.size === 0) return true;

    const itemThemes = item.themes || [];




    const activeSpeciesCount = SPECIES_COUNT_THEMES.filter((t) => activeThemes.has(t));
    if (activeSpeciesCount.length > 0) {
      const matchesAll = activeSpeciesCount.every((t) => itemThemes.includes(t));
      if (!matchesAll) return false;
    }


    const activeOther = Array.from(activeThemes).filter((t) => !SPECIES_COUNT_THEMES.includes(t));
    if (activeOther.length > 0) {
      const hasAny = itemThemes.some((t) => activeOther.includes(t));
      if (!hasAny) return false;
    }

    return true;
  }

  const batchSize = 48;
  let shown = batchSize;
  const more = document.createElement("button");
  more.type = "button";
  more.className = "gallery-filters__chip gallery-load-more";
  more.hidden = true;
  grid.after(more);
  more.addEventListener("click", () => {
    const firstNew = shown;
    shown += batchSize;
    render(false);
    const card = grid.children[firstNew];
    if (card) card.focus({ preventScroll: true });
  });

  function render(reset = true) {
    if (reset) shown = batchSize;
    const visible = items.filter(matches);
    more.hidden = visible.length <= shown;
    more.textContent = `載入更多作品（還有 ${Math.max(0, visible.length - shown)} 件）`;
    if (resultsCount) {
      resultsCount.textContent = onlyOneSession
        ? `找到 ${visible.length} 件一堂完成的作品`
        : `共 ${visible.length} 件作品`;
    }
    if (clearFilters) {
      const hasActiveFilters = activeCourse !== "all" || activeThemes.size > 0 || onlyOneSession;
      clearFilters.hidden = !filterPreview || !hasActiveFilters;
    }

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
      grid.innerHTML = "";
      if (emptyState) {
        emptyState.hidden = false;
        emptyState.textContent = "這個篩選條件目前還沒有符合的作品，換個標籤看看。";
      }
      return;
    }

    grid.hidden = false;
    if (emptyState) emptyState.hidden = true;

    const courseLinks = window.GALLERY_COURSE_LINKS || {};

    grid.innerHTML = visible.slice(0, shown)
      .map((item) => {




        const displayCourse = activeCourse !== "all" ? activeCourse : item.course;
        const courseLink = courseLinks[displayCourse];
        const linkAttr = courseLink ? ` data-course-link="${courseLink}" data-course-name="${displayCourse}"` : "";
        return `
      <figure class="gallery-grid__item" tabindex="0" role="button" aria-label="放大看：${item.alt || displayCourse}"${linkAttr}>
        <img src="${item.thumb || item.src}" data-full-src="${item.src}" alt="${item.alt || ""}" loading="lazy" decoding="async">
        <figcaption class="gallery-grid__caption">${displayCourse}${
          item.themes && item.themes.length ? "・" + item.themes.join("、") : ""
        }${item.sessions && displayCourse !== "大幅畫布訂製" ? "・" + (item.sessions === 1 ? "一堂完成" : item.sessions + "堂完成") : ""}</figcaption>
      </figure>`;
      })
      .join("");
  }

  if (courseFilterGroup) {
    courseFilterGroup.addEventListener("change", () => {
      activeCourse = courseFilterGroup.value;



      activeThemes.clear();
      renderThemeButtons();
      render();
    });
  }

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

  if (sessionFilter) {
    sessionFilter.addEventListener("click", () => {
      onlyOneSession = !onlyOneSession;
      sessionFilter.classList.toggle("is-active", onlyOneSession);
      sessionFilter.setAttribute("aria-pressed", String(onlyOneSession));
      render();
    });
  }

  if (clearFilters) {
    clearFilters.addEventListener("click", () => {
      activeCourse = "all";
      activeThemes.clear();
      onlyOneSession = false;
      if (courseFilterGroup) courseFilterGroup.value = "all";
      if (sessionFilter) {
        sessionFilter.classList.remove("is-active");
        sessionFilter.setAttribute("aria-pressed", "false");
      }
      renderThemeButtons();
      render();
    });
  }

  if (
    urlCourse &&
    courseFilterGroup &&
    Array.from(courseFilterGroup.options).some((o) => o.value === urlCourse)
  ) {
    activeCourse = urlCourse;
    courseFilterGroup.value = urlCourse;
  }

  renderThemeButtons();
  render();
})();
