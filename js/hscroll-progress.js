







(function () {
  const tracks = document.querySelectorAll("[data-hscroll]");

  tracks.forEach((track) => {
    const progress = track.nextElementSibling;
    if (!progress || !progress.hasAttribute("data-hscroll-progress")) return;
    const bar = progress.querySelector(".hscroll-progress__bar");
    if (!bar) return;

    function update() {
      const trackWidth = track.clientWidth;
      const scrollWidth = track.scrollWidth;
      const maxScroll = scrollWidth - trackWidth;
      const progressWidth = progress.clientWidth;



      if (maxScroll <= 0) {
        bar.style.width = progressWidth + "px";
        bar.style.transform = "translateX(0)";
        return;
      }

      const visibleRatio = Math.min(1, trackWidth / scrollWidth);
      const barWidth = progressWidth * visibleRatio;
      const scrollRatio = track.scrollLeft / maxScroll;
      const travel = progressWidth - barWidth;

      bar.style.width = barWidth + "px";
      bar.style.transform = `translateX(${travel * scrollRatio}px)`;
    }

    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  });
})();
