








































(function () {
  var INTERVAL_MS = 4500;




  var FIRST_FRAME_MS = 1800;

  function initGallery(root) {
    var frames = Array.prototype.slice.call(
      root.querySelectorAll("[data-gallery-frame]")
    );
    var thumbs = Array.prototype.slice.call(
      root.querySelectorAll("[data-gallery-thumb]")
    );
    var thumbsWrap = root.querySelector("[data-gallery-thumbs]");
    if (frames.length < 2 || thumbs.length < 1) return;





    var frameToThumb = [];
    var thumbStartFrame = [];
    var thumbSubFrames = [];
    var cursor = 0;
    thumbs.forEach(function (thumb, tIdx) {
      var count = parseInt(thumb.getAttribute("data-gallery-thumb-count") || "1", 10);
      thumbStartFrame[tIdx] = cursor;
      var subFrames = Array.prototype.slice.call(
        thumb.querySelectorAll("[data-gallery-thumb-frame]")
      );
      thumbSubFrames[tIdx] = subFrames.length ? subFrames : null;
      for (var k = 0; k < count; k++) {
        frameToThumb[cursor] = tIdx;
        cursor++;
      }
    });



    if (cursor !== frames.length) return;

    var index = 0;
    var timer = null;

    var galleryInView = true;
    var prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;




    function syncVideoPlayback() {
      frames.forEach(function (f, i) {
        if (f.tagName !== "VIDEO") return;
        if (i === index && galleryInView && !document.hidden) {
          f.play().catch(function () {});
        } else {
          f.pause();
        }
      });
    }








    function isVertical() {
      return (
        root.classList.contains("work__gallery--thumbs-left") &&
        window.matchMedia("(min-width: 1024px)").matches
      );
    }

    function scrollThumbIntoView(thumbIdx) {








      var thumb = thumbs[thumbIdx];
      var wrapRect = thumbsWrap.getBoundingClientRect();
      var thumbRect = thumb.getBoundingClientRect();
      if (isVertical()) {
        var deltaY = (thumbRect.top + thumbRect.height / 2) - (wrapRect.top + wrapRect.height / 2);
        thumbsWrap.scrollBy({ top: deltaY, behavior: "smooth" });
      } else {
        var deltaX = (thumbRect.left + thumbRect.width / 2) - (wrapRect.left + wrapRect.width / 2);
        thumbsWrap.scrollBy({ left: deltaX, behavior: "smooth" });
      }
    }

    function setActive(idx, scrollThumb) {
      index = idx;
      frames.forEach(function (f, i) {
        f.classList.toggle("is-active", i === idx);
      });
      var activeThumbIdx = frameToThumb[idx];
      thumbs.forEach(function (t, i) {
        t.classList.toggle("is-active", i === activeThumbIdx);
      });


      var subFrames = thumbSubFrames[activeThumbIdx];
      if (subFrames) {
        var localIdx = idx - thumbStartFrame[activeThumbIdx];
        subFrames.forEach(function (img, i) {
          img.classList.toggle("is-active", i === localIdx);
        });
      }
      if (scrollThumb) {
        scrollThumbIntoView(activeThumbIdx);
      }

      var upcoming = frames[(idx + 1) % frames.length];
      if (upcoming.tagName === "VIDEO" && upcoming.preload === "none") { upcoming.preload = "auto"; upcoming.load(); }
      syncVideoPlayback();
    }

    function pauseAutoplay() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    }

    function resumeAutoplay() {
      if (prefersReducedMotion || document.hidden) return;
      pauseAutoplay();
      var grouped = thumbSubFrames[frameToThumb[index]];
      var duration = grouped ? FIRST_FRAME_MS : (frames[index].tagName === "VIDEO" ? 8000 : INTERVAL_MS);
      timer = setTimeout(function () {
        setActive((index + 1) % frames.length, true);
        resumeAutoplay();
      }, duration);
    }

    function restartAutoplayAfterInteraction() {
      pauseAutoplay();
      resumeAutoplay();
    }

    thumbs.forEach(function (thumb, i) {
      thumb.addEventListener("click", function () {
        setActive(thumbStartFrame[i], true);
        restartAutoplayAfterInteraction();
      });
    });

    root.querySelectorAll("[data-gallery-nav]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        restartAutoplayAfterInteraction();
        var dir = parseInt(btn.getAttribute("data-gallery-nav"), 10);
        if (isVertical()) {
          thumbsWrap.scrollBy({ top: dir * 110, behavior: "smooth" });
        } else {
          thumbsWrap.scrollBy({ left: dir * 140, behavior: "smooth" });
        }
      });
    });

    thumbsWrap.addEventListener("pointerdown", restartAutoplayAfterInteraction);
    root.addEventListener("mouseenter", function () { if (window.matchMedia("(hover: hover)").matches) pauseAutoplay(); });
    root.addEventListener("mouseleave", resumeAutoplay);




    if (frames.some(function (f) { return f.tagName === "VIDEO"; })) {
      var visibilityObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            galleryInView = entry.isIntersecting;
            syncVideoPlayback();
          });
        },
        { threshold: 0.1 }
      );
      visibilityObserver.observe(root);
    }


    let swipeStart = null;
    root.querySelector("[data-gallery-main]").addEventListener("touchstart", (e) => {
      swipeStart = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
    }, { passive: true });
    root.querySelector("[data-gallery-main]").addEventListener("touchcancel", () => { swipeStart = null; }, { passive: true });
    root.querySelector("[data-gallery-main]").addEventListener("touchend", (e) => {
      if (!swipeStart || !e.changedTouches.length) return;
      const dx = e.changedTouches[0].clientX - swipeStart.x;
      const dy = e.changedTouches[0].clientY - swipeStart.y;
      swipeStart = null;
      if (Math.abs(dx) < 40 || Math.abs(dx) <= Math.abs(dy)) return;
      setActive((index + (dx < 0 ? 1 : -1) + frames.length) % frames.length, true); resumeAutoplay();
    }, { passive: true });
    document.addEventListener("visibilitychange", function () { syncVideoPlayback(); if (document.hidden) pauseAutoplay(); else resumeAutoplay(); });
    window.addEventListener("pageshow", function () { syncVideoPlayback(); resumeAutoplay(); });
    setActive(0, false);
    resumeAutoplay();
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-gallery]").forEach(initGallery);
  });
})();
