








(function () {







  function createNavButton(direction, label) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "moments-carousel__nav moments-carousel__nav--" + direction;
    btn.setAttribute("aria-label", label);
    const d = direction === "prev" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6";
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '"/></svg>';
    return btn;
  }

  const carousels = document.querySelectorAll("[data-moments-carousel]");

  carousels.forEach((root) => {
    const images = Array.from(root.querySelectorAll("img"));
    if (images.length < 2) return;








    const stepsRoot = root.parentElement ? root.parentElement.querySelector("[data-moments-steps]") : null;
    const stepButtons = stepsRoot ? Array.from(stepsRoot.querySelectorAll("[data-step]")) : [];

    const INTERVAL_MS = parseInt(root.dataset.interval, 10) || 4000;
    let current = Math.max(0, images.findIndex((img) => img.classList.contains("is-active")));
    let timer = null;




    const FIRST_SWITCH_MS = Math.min(1800, INTERVAL_MS);
    let firstPlay = true;

    function goTo(index) {
      current = (index + images.length) % images.length;
      images.forEach((img, i) => img.classList.toggle("is-active", i === current));
      stepButtons.forEach((btn, i) => btn.classList.toggle("is-active", i === current));
    }

    function next() {
      goTo(current + 1);
    }

    function scheduleNext(delay) {
      stop();
      timer = setTimeout(() => {
        next();
        firstPlay = false;
        scheduleNext(INTERVAL_MS);
      }, delay);
    }

    function start() {
      scheduleNext(firstPlay ? FIRST_SWITCH_MS : INTERVAL_MS);
    }

    function stop() {
      if (timer) clearTimeout(timer);
      timer = null;
    }





    let touchStartX = null;
    let touchStartY = null;
    const SWIPE_THRESHOLD = 40;

    root.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length !== 1) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      },
      { passive: true }
    );

    root.addEventListener(
      "touchend",
      (e) => {
        if (touchStartX === null) return;
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        touchStartX = null;
        touchStartY = null;
        if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) < Math.abs(deltaY)) return;
        if (deltaX < 0) {
          next();
        } else {
          goTo(current - 1);
        }
        start();
      },
      { passive: true }
    );

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);

    const prevBtn = createNavButton("prev", "上一張");
    const nextBtn = createNavButton("next", "下一張");
    prevBtn.addEventListener("click", () => {
      goTo(current - 1);
      start();
    });
    nextBtn.addEventListener("click", () => {
      next();
      start();
    });
    root.appendChild(prevBtn);
    root.appendChild(nextBtn);

    stepButtons.forEach((btn, i) => {
      btn.addEventListener("click", () => {
        goTo(i);
        start();
      });
    });

    start();
  });
})();
