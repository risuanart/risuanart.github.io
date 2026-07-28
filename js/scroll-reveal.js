// 捲動淡入：跟母頁（products/index.html）同一套 .fade-in／.is-visible
// 動效語言，套用在 .fade-in 元素上，捲進畫面時才淡入＋位移歸位。
(function () {
  const els = document.querySelectorAll(".fade-in");
  if (!els.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.15 }
  );

  els.forEach((el) => observer.observe(el));
})();
